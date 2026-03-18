import type { Args } from './schema'
import { existsSync } from 'node:fs'
import { extname } from 'node:path'
import process from 'node:process'
import { parseArgs } from 'node:util'
import { GoogleGenAI } from '@google/genai'
import pkg from '../package.json'
import { generateImage } from './generate'
import { GroupedProgress, Progress } from './progress'
import { removeBackground } from './remove-bg'
import { ASPECT_RATIO_VALUES, ConfigSchema, FORMAT_VALUES, MODEL_VALUES, OptionsSchema, RESOLUTION_VALUES } from './schema'
import { ensureDir, isUrl, log } from './utils'

export type { Args }

const { values, positionals } = parseArgs({
  args: Bun.argv.slice(2),
  options: {
    // cli args
    'version': { type: 'boolean', short: 'v', default: false },
    'config': { type: 'string', short: 'c' },

    // direct genai options
    'output': { type: 'string', short: 'o' },
    'aspect-ratio': { type: 'string', short: 'a' },
    'resolution': { type: 'string', short: 'r' },
    'format': { type: 'string', short: 'f' },

    // remove background of output image
    'remove-background': { type: 'boolean', short: 'b' },

    'image': { type: 'string', short: 'i', multiple: true },

    // concurrent generations
    'count': { type: 'string', short: 'n' },

    // model selection
    'model': { type: 'string', short: 'm' },
  },
  allowPositionals: true,
})

if (values.version) {
  console.log(`imagegen v${pkg.version}`)
  process.exit(0)
}

function printUsage(): void {
  console.error('Usage: imagegen <prompt> [options]')
  console.error('       imagegen --config <file|-> [options]')
  console.error('')
  console.error('Options:')
  console.error('  -c, --config <file|->    JSON config file (use - for stdin)')
  console.error('  -n, --count <n>          Number of images (default: 1)')
  console.error(`  -a, --aspect-ratio <r>   ${ASPECT_RATIO_VALUES.join(', ')} (default: 1:1)`)
  console.error(`  -r, --resolution <res>   ${RESOLUTION_VALUES.join(', ')} (default: 1K)`)
  console.error(`  -f, --format <fmt>       ${FORMAT_VALUES.join(', ')} (default: png)`)
  console.error('  -i, --image <path>       Reference image (repeatable)')
  console.error('  -o, --output <path>      Output directory or file (default: outputs/)')
  console.error(`  -m, --model <model>      ${MODEL_VALUES.join(', ')} (default: gemini-3-pro-image-preview)`)
  console.error('  -b, --remove-background  Remove background after generation')
  console.error('')
  console.error('When using --config, <prompt> is optional. Each entry in the JSON')
  console.error('array requires a "prompt" and can override any CLI option.')
  process.exit(1)
}

// Validate CLI options as defaults (strip CLI-only keys that aren't in the options schema)
const { version: _, config: _config, ...optionValues } = values
const validated = OptionsSchema.safeParse(optionValues)
if (!validated.success) {
  for (const issue of validated.error.issues) {
    console.error(`Error: --${issue.path[0] as string}: ${issue.message}`)
  }
  process.exit(1)
}

const cliDefaults = validated.data

// Build overrides containing only explicitly-provided CLI args
const cliOverrides: Partial<Args> = {}
if (values.output !== undefined)
  cliOverrides.outputDir = cliDefaults.outputDir
if (values['aspect-ratio'] !== undefined)
  cliOverrides.aspectRatio = cliDefaults.aspectRatio
if (values.resolution !== undefined)
  cliOverrides.resolution = cliDefaults.resolution
if (values.format !== undefined)
  cliOverrides.outputFormat = cliDefaults.outputFormat
if (values['remove-background'] !== undefined)
  cliOverrides.removeBg = cliDefaults.removeBg
if (values.image !== undefined)
  cliOverrides.imagePaths = cliDefaults.imagePaths
if (values.count !== undefined)
  cliOverrides.count = cliDefaults.count
if (values.model !== undefined)
  cliOverrides.model = cliDefaults.model

type GenRequest = Args & { prompt: string, outputFile?: string }

function expandEnvVars(str: string): string {
  return str.replace(/\$\{(\w+)\}|\$(\w+)/g, (_, braced, plain) => {
    const name = braced ?? plain
    return process.env[name] ?? ''
  })
}

function resolveOutput(rawOutputDir: string): { outputDir: string, outputFile?: string } {
  const outputExt = extname(rawOutputDir).toLowerCase()
  if (outputExt === '.png' || outputExt === '.jpg' || outputExt === '.jpeg') {
    return {
      outputFile: rawOutputDir,
      outputDir: rawOutputDir.replace(/[/\\][^/\\]+$/, '') || '.',
    }
  }
  return { outputDir: rawOutputDir }
}

let genRequests: GenRequest[]

if (values.config) {
  let rawConfig: unknown

  if (values.config === '-') {
    // Read from stdin
    const input = await Bun.stdin.text()
    try {
      rawConfig = JSON.parse(input)
    }
    catch {
      console.error('Error: Failed to parse stdin as JSON')
      process.exit(1)
    }
  }
  else {
    // Batch mode: load config file
    const configFile = Bun.file(values.config)

    if (!await configFile.exists()) {
      console.error(`Error: Config file not found: ${values.config}`)
      process.exit(1)
    }

    try {
      rawConfig = await configFile.json()
    }
    catch {
      console.error(`Error: Failed to parse config file as JSON: ${values.config}`)
      process.exit(1)
    }
  }

  const configResult = ConfigSchema.safeParse(rawConfig)
  if (!configResult.success) {
    for (const issue of configResult.error.issues) {
      console.error(`Error in config: [${issue.path.join('.')}] ${issue.message}`)
    }
    process.exit(1)
  }

  genRequests = configResult.data.map((entry) => {
    const configValues: Partial<Args> = {
      ...(entry.count != null && { count: entry.count }),
      ...(entry['aspect-ratio'] && { aspectRatio: entry['aspect-ratio'] }),
      ...(entry.resolution && { resolution: entry.resolution }),
      ...(entry.format && { outputFormat: entry.format }),
      ...(entry.image && { imagePaths: entry.image.map(expandEnvVars) }),
      ...(entry['remove-background'] != null && { removeBg: entry['remove-background'] }),
      ...(entry.model && { model: entry.model }),
    }

    // Merge: defaults < config < explicit CLI args
    const merged = { ...cliDefaults, ...configValues, ...cliOverrides }

    // Output path: CLI override > config entry > default
    const rawOutput = cliOverrides.outputDir
      ?? (entry.output ? expandEnvVars(entry.output) : merged.outputDir)
    const { outputDir, outputFile } = resolveOutput(rawOutput)

    return {
      ...merged,
      prompt: entry.prompt,
      outputDir,
      outputFile,
    }
  })
}
else {
  // Single prompt mode
  const prompt = positionals[0]
  if (!prompt)
    printUsage()

  const { outputDir, outputFile } = resolveOutput(cliDefaults.outputDir)
  genRequests = [{ ...cliDefaults, prompt, outputDir, outputFile }]
}

// Validate required env vars
const anyRemoveBg = genRequests.some(r => r.removeBg)
const requiredEnv: Record<string, string | undefined> = {
  GOOGLE_CLOUD_API_KEY: process.env.GOOGLE_CLOUD_API_KEY,
  ...(anyRemoveBg && { REPLICATE_API_TOKEN: process.env.REPLICATE_API_TOKEN }),
}
const missing = Object.entries(requiredEnv).filter(([, v]) => !v).map(([k]) => k)
if (missing.length) {
  console.error(`Error: Missing environment variable(s): ${missing.join(', ')}`)
  process.exit(1)
}

const ai = new GoogleGenAI({
  vertexai: true,
  apiKey: process.env.GOOGLE_CLOUD_API_KEY,
})

// Validate all jobs up front
for (const genRequest of genRequests) {
  ensureDir(genRequest.outputDir)
  if (genRequest.imagePaths) {
    for (const img of genRequest.imagePaths) {
      if (!isUrl(img) && !existsSync(img)) {
        console.error(`Error: Image file not found: ${img}`)
        process.exit(1)
      }
    }
  }
}

const totalRequested = genRequests.reduce((sum, r) => sum + r.count, 0)
const isBatch = genRequests.length > 1

// Print header
if (isBatch)
  log.header(`imagegen v${pkg.version} — Generating ${totalRequested} image(s) across ${genRequests.length} jobs`)
else
  log.header(`imagegen v${pkg.version} — Generating ${genRequests[0].count} image(s)`)

for (let gi = 0; gi < genRequests.length; gi++) {
  const genRequest = genRequests[gi]
  if (isBatch)
    log.info(`[${gi + 1}/${genRequests.length}]`, genRequest.prompt)
  else
    log.info('Prompt:', genRequest.prompt)
  log.info('Settings:', `${genRequest.model} · ${genRequest.aspectRatio} · ${genRequest.resolution} · ${genRequest.outputFormat}`)
  if (genRequest.imagePaths?.length)
    log.info('Refs:', `${genRequest.imagePaths.length} image(s)`)
  log.info('Output:', genRequest.outputFile ?? `${genRequest.outputDir}/`)
  if (isBatch && gi < genRequests.length - 1)
    log.blank()
}
log.separator()

// Generate all images concurrently
interface ImageResult { gen: import('./utils').Result, bg?: import('./utils').Result }
interface JobResult { genRequest: GenRequest, groupIndex: number, results: ImageResult[] }

if (isBatch) {
  // Grouped progress for batch mode
  const groupedProgress = new GroupedProgress(
    genRequests.map((r, i) => ({
      header: `[${i + 1}/${genRequests.length}] ${r.prompt.length > 40 ? `${r.prompt.slice(0, 40)}…` : r.prompt} (${r.count} image${r.count > 1 ? 's' : ''})`,
      count: r.count,
    })),
  )

  const jobResults: JobResult[] = await Promise.all(
    genRequests.map(async (genRequest, gi) => {
      const results = await Promise.all(
        Array.from({ length: genRequest.count }, async (_, i) => {
          const gen = await generateImage(ai, {
            prompt: genRequest.prompt,
            index: i,
            count: genRequest.count,
            outputDir: genRequest.outputDir,
            aspectRatio: genRequest.aspectRatio,
            resolution: genRequest.resolution,
            outputFormat: genRequest.outputFormat,
            imagePaths: genRequest.imagePaths,
            outputFile: genRequest.outputFile,
            model: genRequest.model,
            groupIndex: gi,
          }, groupedProgress)
          let bg: import('./utils').Result | undefined
          if ('path' in gen && genRequest.removeBg)
            bg = await removeBackground(gen.path, genRequest.outputDir)
          return { gen, bg } satisfies ImageResult
        }),
      )
      return { genRequest, groupIndex: gi, results }
    }),
  )

  groupedProgress.finish()

  // Print results grouped by job
  let totalGenerated = 0
  let totalBgRemoved = 0
  let totalBgAttempted = 0

  for (const { genRequest, groupIndex, results } of jobResults) {
    log.header(`[${groupIndex + 1}/${genRequests.length}] ${genRequest.prompt}`)
    let jobGenerated = 0
    for (let i = 0; i < results.length; i++) {
      const { gen, bg } = results[i]
      if ('path' in gen) {
        log.success(`[${i + 1}/${genRequest.count}] ${gen.path}`)
        jobGenerated++
        if (bg) {
          totalBgAttempted++
          if ('path' in bg) {
            log.success(`  └─ bg removed: ${bg.path}`)
            totalBgRemoved++
          }
          else {
            log.error(`  └─ bg removal failed (${bg.error})`)
          }
        }
      }
      else {
        log.error(`[${i + 1}/${genRequest.count}] failed (${gen.error})`)
      }
    }
    totalGenerated += jobGenerated
    log.done(`${jobGenerated}/${genRequest.count} images generated`)
  }

  log.blank()
  if (totalBgAttempted > 0)
    log.header(`Total: ${totalGenerated}/${totalRequested} images generated, ${totalBgRemoved}/${totalBgAttempted} backgrounds removed across ${genRequests.length} jobs`)
  else
    log.header(`Total: ${totalGenerated}/${totalRequested} images generated across ${genRequests.length} jobs`)
}
else {
  // Single job — use simple Progress
  const genRequest = genRequests[0]
  const progress = new Progress(genRequest.count)
  const results: ImageResult[] = await Promise.all(
    Array.from({ length: genRequest.count }, async (_, i) => {
      const gen = await generateImage(ai, {
        prompt: genRequest.prompt,
        index: i,
        count: genRequest.count,
        outputDir: genRequest.outputDir,
        aspectRatio: genRequest.aspectRatio,
        resolution: genRequest.resolution,
        outputFormat: genRequest.outputFormat,
        imagePaths: genRequest.imagePaths,
        outputFile: genRequest.outputFile,
        model: genRequest.model,
      }, progress)
      let bg: import('./utils').Result | undefined
      if ('path' in gen && genRequest.removeBg)
        bg = await removeBackground(gen.path, genRequest.outputDir)
      return { gen, bg } satisfies ImageResult
    }),
  )

  progress.finish()
  let successCount = 0
  let bgAttempted = 0
  let bgRemoved = 0
  for (let i = 0; i < results.length; i++) {
    const { gen, bg } = results[i]
    if ('path' in gen) {
      log.success(`[${i + 1}/${genRequest.count}] ${gen.path}`)
      successCount++
      if (bg) {
        bgAttempted++
        if ('path' in bg) {
          log.success(`  └─ bg removed: ${bg.path}`)
          bgRemoved++
        }
        else {
          log.error(`  └─ bg removal failed (${bg.error})`)
        }
      }
    }
    else {
      log.error(`[${i + 1}/${genRequest.count}] failed (${gen.error})`)
    }
  }

  log.separator()
  log.done(`Done: ${successCount}/${genRequest.count} images generated`)
  if (bgAttempted > 0)
    log.done(`Done: ${bgRemoved}/${bgAttempted} backgrounds removed`)
}

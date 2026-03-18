import { existsSync, mkdirSync } from 'node:fs'
import { basename, dirname, extname, join } from 'node:path'
import pc from 'picocolors'

export const RETRY_DELAY = 1000
export const MAX_RETRIES = 3

export type Result = { path: string } | { error: string }

export const log = {
  header: (s: string) => console.log(s),
  info: (label: string, value: string) => console.log(`  ${pc.dim(label.padEnd(12))} ${value}`),
  separator: () => console.log(pc.dim('─'.repeat(40))),
  success: (s: string) => console.log(`  ${pc.green('✓')} ${s}`),
  error: (s: string) => console.log(`  ${pc.red('✗')} ${s}`),
  done: (s: string) => console.log(`  ${s}`),
  blank: () => console.log(),
}

export const MIME_TYPES: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
}

const NON_WORD_RE = /[^\w\s-]/g
const WHITESPACE_RE = /\s+/g

export function sanitizeFilename(prompt: string, maxLength = 50): string {
  const clean = prompt
    .toLowerCase()
    .replace(NON_WORD_RE, '')
    .trim()
    .replace(WHITESPACE_RE, '_')
  return clean.slice(0, maxLength)
}

export function timestamp(): string {
  const now = new Date()
  const pad = (n: number): string => String(n).padStart(2, '0')
  return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`
}

export function getMimeType(filePath: string): string {
  return MIME_TYPES[extname(filePath).toLowerCase()] ?? 'image/png'
}

export interface OutputPathOptions {
  outputFile?: string
  outputDir: string
  prompt: string
  index: number
  count: number
  outputFormat: string
}

export function resolveOutputPath(opts: OutputPathOptions): string {
  if (opts.outputFile) {
    const dir = dirname(opts.outputFile)
    const ext = extname(opts.outputFile)
    const stem = basename(opts.outputFile, ext)

    // For multiple images, append _N suffix
    let outputPath = opts.count > 1
      ? join(dir, `${stem}_${opts.index + 1}${ext}`)
      : opts.outputFile

    // Avoid overwriting existing files
    if (existsSync(outputPath)) {
      let counter = 1
      const baseStem = opts.count > 1 ? `${stem}_${opts.index + 1}` : stem
      while (existsSync(outputPath)) {
        outputPath = join(dir, `${baseStem}_${counter}${ext}`)
        counter++
      }
    }
    return outputPath
  }

  const ext = opts.outputFormat === 'png' ? 'png' : 'jpg'
  const ts = timestamp()
  const base = sanitizeFilename(opts.prompt)
  return join(opts.outputDir, `${ts}_${base}_${opts.index + 1}.${ext}`)
}

export function isUrl(path: string): boolean {
  return path.startsWith('http://') || path.startsWith('https://')
}

export function ensureDir(dir: string): void {
  mkdirSync(dir, { recursive: true })
}

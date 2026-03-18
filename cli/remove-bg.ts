import type { Result } from './utils'
import { basename, extname, join } from 'node:path'
import Replicate from 'replicate'
import { getMimeType } from './utils'

const MODEL = '851-labs/background-remover:a029dff38972b5fda4ec5d75d7d1cd25aeff621d2cf4946a41055d7db66b80bc' as const

const replicate = new Replicate()

export async function removeBackground(imagePath: string, outputDir: string): Promise<Result> {
  try {
    const bytes = await Bun.file(imagePath).bytes()
    const mimeType = getMimeType(imagePath)
    const input = new Blob([bytes], { type: mimeType })

    const output = await replicate.run(MODEL, { input: { image: input } })

    // Output is a FileOutput (extends ReadableStream) or array of FileOutput
    const fileOutput = Array.isArray(output) ? output[0] : output

    if (!fileOutput || typeof fileOutput !== 'object' || !('blob' in fileOutput))
      return { error: 'unexpected output type' }

    const blob = await (fileOutput as { blob: () => Promise<Blob> }).blob()
    const stem = basename(imagePath, extname(imagePath))
    const outPath = join(outputDir, `${stem}.nobg.png`)

    await Bun.write(outPath, blob)
    return { path: outPath }
  }
  catch (e) {
    return { error: String(e) }
  }
}

import type { ContentListUnion, GoogleGenAI, Part } from '@google/genai'
import type { Args } from './index'
import type { GroupedProgress, Progress } from './progress'
import type { Result } from './utils'
import { Buffer } from 'node:buffer'
import { ApiError, HarmBlockThreshold, HarmCategory } from '@google/genai'
import pc from 'picocolors'
import { getMimeType, isUrl, MAX_RETRIES, resolveOutputPath, RETRY_DELAY } from './utils'

export type GenerateOptions = Pick<Args, 'aspectRatio' | 'resolution' | 'outputFormat' | 'imagePaths' | 'model'> & {
  prompt: string
  index: number
  count: number
  outputDir: string
  outputFile?: string
  groupIndex?: number
}

export async function generateImage(ai: GoogleGenAI, opts: GenerateOptions, progress: Progress | GroupedProgress): Promise<Result> {
  const { prompt, index, count, outputDir, aspectRatio, resolution, outputFormat, imagePaths, outputFile, groupIndex, model } = opts

  function updateProgress(text: string, spinning = false): void {
    if (groupIndex != null) {
      (progress as GroupedProgress).update(groupIndex, index, text, spinning)
    }
    else {
      (progress as Progress).update(index, text, spinning)
    }
  }

  // Build content parts
  const parts: ContentListUnion = []

  if (imagePaths) {
    for (const imgPath of imagePaths) {
      if (isUrl(imgPath)) {
        const response = await fetch(imgPath)
        if (!response.ok)
          throw new Error(`Failed to fetch image: ${imgPath} (${response.status})`)
        const data = Buffer.from(await response.arrayBuffer()).toString('base64')
        const contentType = response.headers.get('content-type') ?? 'image/png'
        parts.push({ inlineData: { data, mimeType: contentType } } satisfies Part)
      }
      else {
        const data = Buffer.from(await Bun.file(imgPath).bytes()).toString('base64')
        const mimeType = getMimeType(imgPath)
        parts.push({ inlineData: { data, mimeType } } satisfies Part)
      }
    }
  }

  parts.push(prompt)

  const outputMimeType = outputFormat === 'png' ? 'image/png' : 'image/jpeg'

  const safetyOff = [
    HarmCategory.HARM_CATEGORY_UNSPECIFIED,
    HarmCategory.HARM_CATEGORY_HARASSMENT,
    HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    HarmCategory.HARM_CATEGORY_CIVIC_INTEGRITY,
    HarmCategory.HARM_CATEGORY_IMAGE_HATE,
    HarmCategory.HARM_CATEGORY_IMAGE_DANGEROUS_CONTENT,
    HarmCategory.HARM_CATEGORY_IMAGE_HARASSMENT,
    HarmCategory.HARM_CATEGORY_IMAGE_SEXUALLY_EXPLICIT,
    HarmCategory.HARM_CATEGORY_JAILBREAK,
  ].map(category => ({ category, threshold: HarmBlockThreshold.OFF }))

  const label = `[${index + 1}/${count}]`
  let failures = 0
  let retries = 0

  while (true) {
    try {
      updateProgress(`${label} requesting${retries > 0 ? ` (attempt ${retries + 1})` : ''}...`, true)
      const response = await ai.models.generateContent({
        model,
        contents: parts,
        config: {
          temperature: 1,
          topP: 0.95,
          maxOutputTokens: 32768,
          responseModalities: ['IMAGE'],
          safetySettings: safetyOff,
          imageConfig: {
            aspectRatio,
            imageSize: resolution,
            outputMimeType,
          },
        },
      })

      const candidate = response.candidates?.[0]
      const finishReason = candidate?.finishReason
      const imagePart = candidate?.content?.parts?.find(p => p.inlineData?.data)

      if (!imagePart?.inlineData?.data) {
        failures++
        const reason = !response.candidates?.length
          ? 'no candidates in response'
          : !candidate?.content?.parts?.length
              ? `no content parts (finishReason: ${finishReason ?? 'unknown'})`
              : 'no image data in response'

        if (failures >= MAX_RETRIES) {
          updateProgress(`${pc.red('✗')} ${label} failed (${reason})`)
          return { error: reason }
        }
        updateProgress(`${pc.red('✗')} ${label} ${reason} — retry #${failures}...`)
        await Bun.sleep(RETRY_DELAY)
        continue
      }

      const imageBuffer = Buffer.from(imagePart.inlineData.data, 'base64')
      const outputPath = resolveOutputPath({ outputFile, outputDir, prompt, index, count, outputFormat })

      await Bun.write(outputPath, imageBuffer)
      updateProgress(`${pc.green('✓')} ${label} ${outputPath}`)
      return { path: outputPath }
    }
    catch (e) {
      const isRetryable = e instanceof ApiError && (e.status === 429 || e.status === 503 || e.status >= 500)

      if (isRetryable) {
        retries++
        const prefix = `${label} ${e.status} — retry #${retries}`
        const step = 100
        for (let ms = RETRY_DELAY; ms > 0; ms -= step) {
          updateProgress(`${pc.red('✗')} ${prefix} in ${(ms / 1000).toFixed(1)}s...`)
          await Bun.sleep(step)
        }
      }
      else {
        failures++
        if (failures >= MAX_RETRIES) {
          updateProgress(`${pc.red('✗')} ${label} failed (${String(e)})`)
          return { error: `failed after ${MAX_RETRIES} retries: ${String(e)}` }
        }
        updateProgress(`${pc.red('✗')} ${label} error — retry #${failures}...`)
        await Bun.sleep(RETRY_DELAY)
      }
    }
  }
}

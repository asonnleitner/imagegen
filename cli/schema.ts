import * as z from 'zod'

export const ASPECT_RATIO_VALUES = ['1:1', '2:3', '3:2', '3:4', '4:3', '4:5', '5:4', '9:16', '16:9', '21:9'] as const
export const RESOLUTION_VALUES = ['1K', '2K', '4K'] as const
export const FORMAT_VALUES = ['png', 'jpg'] as const
export const MODEL_VALUES = ['gemini-3-pro-image-preview', 'gemini-3.1-flash-image-preview'] as const

export const OptionsShape = z.object({
  'output': z
    .string()
    .min(1)
    .default('outputs')
    .describe('Output directory or file path'),
  'aspect-ratio': z
    .enum(ASPECT_RATIO_VALUES)
    .default('1:1')
    .describe('Aspect ratio of the generated image'),
  'resolution': z
    .enum(RESOLUTION_VALUES)
    .default('1K')
    .describe('Output image resolution'),
  'format': z
    .enum(FORMAT_VALUES)
    .default('png')
    .describe('Output image file format'),
  'remove-background': z
    .boolean()
    .default(false)
    .describe('Remove the background from the generated image'),
  'image': z
    .array(z.string())
    .optional()
    .describe('Paths to reference images to guide the generation'),
  'count': z
    .coerce
    .number()
    .int()
    .min(1)
    .default(1)
    .describe('How many images to generate for this job'),
  'model': z
    .enum(MODEL_VALUES)
    .default('gemini-3-pro-image-preview')
    .describe('Image generation model'),
}).strict()

export const OptionsSchema = OptionsShape.transform(({
  'aspect-ratio': aspectRatio,
  'remove-background': removeBg,
  'image': imagePaths,
  'output': outputDir,
  'format': outputFormat,
  ...rest
}) => ({ ...rest, aspectRatio, removeBg, imagePaths, outputDir, outputFormat }))

export type Args = z.output<typeof OptionsSchema>

export const ConfigEntrySchema = OptionsShape
  .partial()
  .extend({
    prompt: z.string().min(1).describe('Text prompt describing the image to generate'),
  })

export const ConfigSchema = z
  .array(ConfigEntrySchema)
  .min(1)
  .describe('Batch configuration: an array of image generation jobs')

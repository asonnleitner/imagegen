# imagegen

CLI tool for generating images using Google Gemini AI models, with batch processing, reference images, background removal, and more.

## Features

- Generate images from text prompts using Google Gemini models
- Batch processing via JSON config files
- Reference image support (local files and URLs)
- Background removal via Replicate API
- Multiple aspect ratios, resolutions, and output formats
- Concurrent image generation with progress indicators
- Configurable output paths with environment variable expansion
- Automatic retry with exponential backoff on rate limits and server errors
- JSON Schema for config file validation and IDE autocompletion

## Prerequisites

- [Bun](https://bun.sh) runtime
- A [Google Cloud API key](https://console.cloud.google.com/) with Gemini API access
- (Optional) A [Replicate API token](https://replicate.com/) for background removal

## Installation

```bash
git clone <repo-url>
cd imagegen
bun install
bun run compile
```

The `compile` script builds a standalone binary to `bin/imagegen` and symlinks it to `~/.local/bin/imagegen`.

## Configuration

Copy `.env.example` to `.env` and fill in your API keys:

```bash
GOOGLE_CLOUD_API_KEY=your-google-api-key
REPLICATE_API_TOKEN=your-replicate-token  # only needed for --remove-background
```

## Usage

```
imagegen <prompt> [options]
imagegen --config <file|-> [options]
```

### Options

| Flag | Short | Type | Default | Description |
|------|-------|------|---------|-------------|
| `--config <file\|->` | `-c` | `string` | — | JSON config file (use `-` for stdin) |
| `--count <n>` | `-n` | `number` | `1` | Number of images to generate |
| `--aspect-ratio <r>` | `-a` | `string` | `1:1` | Aspect ratio (see below) |
| `--resolution <res>` | `-r` | `string` | `1K` | Output resolution (`1K`, `2K`, `4K`) |
| `--format <fmt>` | `-f` | `string` | `png` | Output format (`png`, `jpg`) |
| `--image <path>` | `-i` | `string[]` | — | Reference image path or URL (repeatable) |
| `--output <path>` | `-o` | `string` | `outputs/` | Output directory or file path |
| `--model <model>` | `-m` | `string` | `gemini-3-pro-image-preview` | Model to use (see below) |
| `--remove-background` | `-b` | `boolean` | `false` | Remove background after generation |
| `--version` | `-v` | `boolean` | — | Print version and exit |

### Aspect Ratios

`1:1`, `2:3`, `3:2`, `3:4`, `4:3`, `4:5`, `5:4`, `9:16`, `16:9`, `21:9`

## Examples

Generate a single image:

```bash
imagegen "a cat sitting on a rainbow"
```

Generate 4 images in 16:9 at 4K resolution:

```bash
imagegen "mountain landscape at sunset" -n 4 -a 16:9 -r 4K
```

Use a reference image:

```bash
imagegen "make this image look like a watercolor painting" -i photo.jpg
```

Use multiple reference images (local and URL):

```bash
imagegen "combine these styles" -i style.png -i https://example.com/ref.jpg
```

Custom output path:

```bash
imagegen "logo design" -o ./my-logos/logo.png
```

Generate with background removal:

```bash
imagegen "product photo of a sneaker" -b
```

## Batch Mode

Pass a JSON config file with `--config` (or `-c`). Each entry requires a `prompt` and can override any option. CLI arguments override config values.

**Config precedence:** defaults < config file < CLI arguments

```bash
imagegen --config batch.json
imagegen --config batch.json -r 4K          # override resolution for all jobs
cat batch.json | imagegen --config -         # read config from stdin
```

### Batch Config Example

```json
[
  {
    "prompt": "a futuristic cityscape",
    "count": 3,
    "aspect-ratio": "16:9",
    "resolution": "4K",
    "format": "png"
  },
  {
    "prompt": "a serene mountain lake",
    "output": "${HOME}/pictures/lake.png",
    "remove-background": true,
    "image": ["reference.jpg"]
  },
  {
    "prompt": "abstract art",
    "model": "gemini-3.1-flash-image-preview",
    "count": 2
  }
]
```

### Environment Variable Expansion

Output paths in config files support `${VAR}` and `$VAR` syntax for environment variable expansion:

```json
{
  "prompt": "photo",
  "output": "${HOME}/pictures/photo.png"
}
```

## Models

| Model | Description |
|-------|-------------|
| `gemini-3-pro-image-preview` | Default. Higher quality image generation. |
| `gemini-3.1-flash-image-preview` | Faster generation with the Flash model. |

## Output

**Directory output (default):** Files are named `{TIMESTAMP}_{SANITIZED_PROMPT}_{INDEX}.{FORMAT}` and saved to the output directory (default: `outputs/`).

```
outputs/20260318_143022_a_cat_sitting_on_a_rainbow_1.png
```

**File output:** When `--output` points to a `.png`/`.jpg`/`.jpeg` file, that exact path is used. For multiple images (`--count > 1`), a `_N` suffix is appended before the extension. Existing files are never overwritten — an auto-incrementing counter is added instead.

## Background Removal

When `--remove-background` (or `-b`) is enabled, each generated image is sent to the [851-labs/background-remover](https://replicate.com/851-labs/background-remover) model on Replicate. The result is saved alongside the original as `{stem}.nobg.png`.

Requires the `REPLICATE_API_TOKEN` environment variable.

## JSON Schema

A `schema.json` file is included for batch config validation. Add it to your config file for IDE autocompletion:

```json
{
  "$schema": "./schema.json"
}
```

Or reference it in your editor's JSON schema settings.

## Development

```bash
bun install              # install dependencies
bun run compile          # build standalone binary
bun run bundle           # build bundled JS (no compile)
bun run test             # run tests with vitest
bun run lint             # lint with eslint
bun run lint:fix         # lint and auto-fix
bun run typecheck        # type-check with tsc
bun run schema           # regenerate schema.json
bun run bump             # bump patch version
```

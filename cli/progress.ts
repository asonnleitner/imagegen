import process from 'node:process'
import pc from 'picocolors'

const SPINNER_FRAMES = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']

// Strip ANSI escape codes to get visible character length
function stripAnsi(str: string): string {
  return str.replace(/\x1B\[[0-9;]*m/g, '')
}

// Truncate a string (which may contain ANSI codes) to fit within a visible width
function truncateToWidth(str: string, maxWidth: number): string {
  const visible = stripAnsi(str)
  if (visible.length <= maxWidth)
    return str

  // Walk through the original string, tracking visible char count
  let visibleCount = 0
  let i = 0
  while (i < str.length && visibleCount < maxWidth - 1) {
    if (str[i] === '\x1B') {
      // Skip ANSI escape sequence
      const end = str.indexOf('m', i)
      if (end !== -1) {
        i = end + 1
        continue
      }
    }
    visibleCount++
    i++
  }
  return `${str.slice(0, i)}…\x1B[0m`
}

export class Progress {
  private readonly lines: string[]
  private readonly spinning: boolean[]
  private written = false
  private frame = 0
  private timer: Timer | null = null

  constructor(count: number) {
    this.lines = Array.from({ length: count }).fill('') as string[]
    this.spinning = Array.from({ length: count }).fill(false) as boolean[]
  }

  /** Update a specific line by index */
  update(index: number, text: string, spinning = false): void {
    this.lines[index] = text
    this.spinning[index] = spinning

    if (spinning && !this.timer) {
      this.timer = setInterval(() => {
        this.frame++
        this.render()
      }, 80)
    }
    else if (!this.spinning.includes(true) && this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }

    this.render()
  }

  /** Finalize: clear all progress lines and let caller print final output */
  finish(): void {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }
    if (this.written) {
      // Move up to first line and clear all lines
      process.stdout.write(`\x1B[${this.lines.length}A`)
      for (let i = 0; i < this.lines.length; i++) {
        process.stdout.write('\x1B[2K')
        if (i < this.lines.length - 1)
          process.stdout.write('\n')
      }
      // Move back up to first line
      if (this.lines.length > 1)
        process.stdout.write(`\x1B[${this.lines.length - 1}A`)
      process.stdout.write('\r')
    }
  }

  private render(): void {
    if (this.written) {
      // Move cursor up to first line
      process.stdout.write(`\x1B[${this.lines.length}A`)
    }
    for (let i = 0; i < this.lines.length; i++) {
      const spinner = this.spinning[i]
        ? `${pc.yellow(SPINNER_FRAMES[this.frame % SPINNER_FRAMES.length])} `
        : ''
      const cols = process.stdout.columns || 80
      const line = truncateToWidth(`  ${spinner}${this.lines[i]}`, cols)
      process.stdout.write(`\x1B[2K${line}\n`)
    }
    this.written = true
  }
}

export interface GroupDef {
  header: string
  count: number
}

export class GroupedProgress {
  private readonly groups: GroupDef[]
  private readonly lines: string[][]
  private readonly spinning: boolean[][]
  private written = false
  private frame = 0
  private timer: Timer | null = null

  constructor(groups: GroupDef[]) {
    this.groups = groups
    this.lines = groups.map(g => Array.from({ length: g.count }).fill('') as string[])
    this.spinning = groups.map(g => Array.from({ length: g.count }).fill(false) as boolean[])
  }

  private get totalRenderedLines(): number {
    return this.groups.reduce((sum, g) => sum + 1 + g.count, 0)
  }

  update(groupIndex: number, imageIndex: number, text: string, spinning = false): void {
    this.lines[groupIndex][imageIndex] = text
    this.spinning[groupIndex][imageIndex] = spinning

    const anySpinning = this.spinning.some(g => g.includes(true))

    if (spinning && !this.timer) {
      this.timer = setInterval(() => {
        this.frame++
        this.render()
      }, 80)
    }
    else if (!anySpinning && this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }

    this.render()
  }

  finish(): void {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }
    const total = this.totalRenderedLines
    if (this.written) {
      process.stdout.write(`\x1B[${total}A`)
      for (let i = 0; i < total; i++) {
        process.stdout.write('\x1B[2K')
        if (i < total - 1)
          process.stdout.write('\n')
      }
      if (total > 1)
        process.stdout.write(`\x1B[${total - 1}A`)
      process.stdout.write('\r')
    }
  }

  private render(): void {
    const total = this.totalRenderedLines
    if (this.written) {
      process.stdout.write(`\x1B[${total}A`)
    }
    for (let gi = 0; gi < this.groups.length; gi++) {
      const cols = process.stdout.columns || 80
      const header = truncateToWidth(`  ${pc.dim(this.groups[gi].header)}`, cols)
      process.stdout.write(`\x1B[2K${header}\n`)
      for (let ii = 0; ii < this.groups[gi].count; ii++) {
        const spinner = this.spinning[gi][ii]
          ? `${pc.yellow(SPINNER_FRAMES[this.frame % SPINNER_FRAMES.length])} `
          : ''
        const line = truncateToWidth(`    ${spinner}${this.lines[gi][ii]}`, cols)
        process.stdout.write(`\x1B[2K${line}\n`)
      }
    }
    this.written = true
  }
}

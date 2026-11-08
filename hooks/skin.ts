import type { SkinSlot } from '../types'

// Shapes shared by the skins and the row builders.

// What a tool call is, by colour. `other` only shows in group rows.
export type Kind = 'read' | 'write' | 'run' | 'search' | 'web' | 'mcp' | 'other'

// The kinds a skin draws a tool row for; the rest keep Claude Code's own row.
export type ToolKind = Exclude<Kind, 'other'>

export type Slot = SkinSlot

// The slots a skin may leave out: the typed prompt's outline, text and fill.
export type OptionalSlot = 'border' | 'promptFg' | 'promptBg'

// The slots every skin fills.
export type ColourSlot = Exclude<Slot, OptionalSlot>

// Every slot but the optional ones is filled by every skin; those are only there when a skin sets them.
export type Palette = Readonly<Record<ColourSlot, string>> & { readonly [S in OptionalSlot]?: string }

// What an unset optional slot follows. `promptBg` follows nothing: no fill.
const FOLLOWS: Readonly<Partial<Record<Slot, ColourSlot>>> = { border: 'muted', promptFg: 'fg' }

// The colour a slot paints: `border` follows `muted` and `promptFg` follows `fg` until a skin
// sets them; `promptBg` is undefined until it does.
export function colourOf(palette: Palette, slot: Exclude<Slot, 'promptBg'>): string
export function colourOf(palette: Palette, slot: Slot): string | undefined
export function colourOf(palette: Palette, slot: Slot): string | undefined {
  const own = palette[slot]
  const follows = FOLLOWS[slot]

  return own ?? (follows === undefined ? undefined : palette[follows])
}

export type Skin = {
  readonly name: string
  readonly label: string
  readonly palette: Palette
  // Gerunds for the spinner, and past-tense words for the turn footer.
  readonly spinner: readonly string[]
  readonly done: readonly string[]
  // Its own palette for a light background; without one, light.ts derives it.
  readonly light?: Palette
  readonly ansi?: Palette
}

export type IconSet = 'unicode' | 'ascii'

export type Icons = Readonly<
  Record<'running' | 'ok' | 'err' | 'interrupted' | 'done' | 'rail' | 'branch' | 'prompt', string>
> & { readonly frames: readonly string[] }

// Single-cell glyphs with no emoji presentation; each status has its own shape, not only a colour.
export const ICONS: Readonly<Record<IconSet, Icons>> = {
  unicode: {
    running: '○',
    ok: '●',
    err: '✕',
    interrupted: '◌',
    done: '◆',
    rail: '┃',
    branch: '─',
    prompt: '▍',
    frames: ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'],
  },
  ascii: {
    running: 'o',
    ok: '*',
    err: 'x',
    interrupted: '-',
    done: '>',
    rail: '|',
    branch: '-',
    prompt: '>',
    frames: ['|', '/', '-', '\\'],
  },
}

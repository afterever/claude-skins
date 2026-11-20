import type { Skin } from '../skin'

// Apple's system colours on near-black. The light palette is derived.
const skin: Skin = {
  name: 'cupertino',
  label: 'Cupertino',
  palette: {
    read: '#3cd3fe',
    write: '#ff9230',
    run: '#ffd600',
    search: '#ff6165',
    web: '#6d7cff',
    mcp: '#b78a66',
    other: '#aeaeb2',
    user: '#0091ff',
    fg: '#ffffff',
    muted: '#8e8e93',
    surface: '#2c2c2e',
    zebra: '#1c1c1e',
    ok: '#30d158',
    err: '#ff4245',
    warn: '#ff6a00',
  },
  spinner: ['Thinking', 'Working', 'Composing', 'Considering', 'Weighing'],
  done: ['Done', 'Finished', 'Settled'],
}

export default skin

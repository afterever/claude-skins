import type { EngineInterface } from 'claude-code'

import type { Prefs } from '../types'
import { DEFAULT_PREFS } from './command'

// afterever's fork: what a store with no saved prefs starts from, so a fresh install on
// another machine looks like this one. `DEFAULT_PREFS` stays the upstream reference, and
// a saved record still falls back to it key by key.
export const FIRST_RUN_PREFS: Prefs = {
  ...DEFAULT_PREFS,
  skin: 'cupertino',
  words: 'claude',
  rail: false,
  shimmer: false,
  band: false,
  fold: false,
  expand: true,
  compact: false,
}

// Written once, before the first load, and only when nothing was ever saved: a store that
// already holds prefs, even stale ones, is left alone. A store that cannot be written only
// costs the seed, never the session's start.
export async function seedFirstRun($: Pick<EngineInterface, 'store'>): Promise<void> {
  try {
    if ((await $.store.get('prefs')) === undefined) {
      await $.store.set('prefs', FIRST_RUN_PREFS)
    }
  } catch {
    // The look stays upstream's until the first /skin change saves prefs.
  }
}

import { expect, test } from 'claude-code/testing'

import { DEFAULT_PREFS, parsePrefs } from '../hooks/command'
import { skinNames } from '../hooks/custom'
import { FIRST_RUN_PREFS, seedFirstRun } from '../hooks/first-run'
import { SKINS } from '../hooks/themes'

const storeOf = (initial: Record<string, unknown>) => {
  const data = new Map(Object.entries(initial))

  return {
    data,
    store: {
      get: async (key: string) => data.get(key),
      set: async (key: string, value: unknown) => {
        data.set(key, value)
      },
    },
  }
}

test('the fork look is a whole, valid prefs record on a built-in skin', async () => {
  const names = skinNames({})

  expect(names).toContain('cupertino')
  expect(parsePrefs(FIRST_RUN_PREFS, names)).toEqual(FIRST_RUN_PREFS)
  expect(Object.keys(FIRST_RUN_PREFS).sort()).toEqual(Object.keys(DEFAULT_PREFS).sort())
  expect(SKINS.some(skin => skin.name === FIRST_RUN_PREFS.skin)).toBe(true)
  // A saved record with keys missing still reads the upstream default for them.
  expect(parsePrefs({ skin: 'noir' }, names)).toEqual(DEFAULT_PREFS)
})

test('an empty store is seeded once with the fork look; a store holding prefs is left alone', async () => {
  const empty = storeOf({})
  await seedFirstRun(empty as never)
  expect(empty.data.get('prefs')).toEqual(FIRST_RUN_PREFS)

  const saved = storeOf({ prefs: { ...DEFAULT_PREFS, skin: 'nord' } })
  await seedFirstRun(saved as never)
  expect(saved.data.get('prefs')).toEqual({ ...DEFAULT_PREFS, skin: 'nord' })
})

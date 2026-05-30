import { describe, expect, it, beforeEach, afterEach } from 'vitest'
import { saveGame, loadGame, deepClone, exportSave, importSave } from '../../store/persistence'
import { initialSaveState, SAVE_KEY } from '../../store/initial-state'
import type { SaveState } from '../../types/game'

const store: Record<string, string> = {}
const localStorageMock = {
  getItem: (key: string) => store[key] ?? null,
  setItem: (key: string, value: string) => { store[key] = value },
  removeItem: (key: string) => { delete store[key] },
}

beforeEach(() => {
  Object.assign(globalThis, { localStorage: localStorageMock })
  Object.keys(store).forEach(k => delete store[k])
})

afterEach(() => {
  Object.keys(store).forEach(k => delete store[k])
})

describe('deepClone', () => {
  it('produces a value equal to the original', () => {
    const clone = deepClone(initialSaveState)
    expect(clone).toEqual(initialSaveState)
  })

  it('produces a distinct object reference', () => {
    const clone = deepClone(initialSaveState)
    expect(clone).not.toBe(initialSaveState)
    expect(clone.player.stats).not.toBe(initialSaveState.player.stats)
  })
})

describe('saveGame / loadGame round-trip', () => {
  it('round-trips the full save state', () => {
    const state: SaveState = deepClone(initialSaveState)
    state.player.name = 'Bazza'
    state.player.archetype = 'unit'
    state.season.week = 5
    state.season.tier = 2
    saveGame(state)
    const loaded = loadGame()
    expect(loaded?.player.name).toBe('Bazza')
    expect(loaded?.player.archetype).toBe('unit')
    expect(loaded?.season.week).toBe(5)
    expect(loaded?.season.tier).toBe(2)
  })

  it('returns null when nothing is saved', () => {
    expect(loadGame()).toBeNull()
  })

  it('preserves hall of fame entries including job and signatureTrait', () => {
    const state: SaveState = deepClone(initialSaveState)
    state.hallOfFame = [{
      name: 'Smudger',
      archetype: 'winger',
      job: 'delivery',
      title: 'Pub Hero',
      date: 1000000,
      seasons: 2,
      goals: 12,
      points: 24,
      cupWon: false,
      finalTier: 2,
      signatureTrait: 'Electric Pace',
      achievements: [],
    }]
    saveGame(state)
    const loaded = loadGame()
    expect(loaded?.hallOfFame.length).toBe(1)
    expect(loaded?.hallOfFame[0].name).toBe('Smudger')
    expect(loaded?.hallOfFame[0].job).toBe('delivery')
    expect(loaded?.hallOfFame[0].signatureTrait).toBe('Electric Pace')
  })

  it('preserves player stats and states', () => {
    const state: SaveState = deepClone(initialSaveState)
    state.player.stats.strike = 17
    state.player.states.confidence = 73
    state.player.traits = ['Aerial Threat', 'Hold-Up Artist']
    saveGame(state)
    const loaded = loadGame()
    expect(loaded?.player.stats.strike).toBe(17)
    expect(loaded?.player.states.confidence).toBe(73)
    expect(loaded?.player.traits).toEqual(['Aerial Threat', 'Hold-Up Artist'])
  })

  it('preserves the hangoverPending context modifier', () => {
    const state: SaveState = deepClone(initialSaveState)
    state.contextModifiers.hangoverPending = true
    saveGame(state)
    const loaded = loadGame()
    expect(loaded?.contextModifiers.hangoverPending).toBe(true)
  })
})

describe('migrate: legacy save recovery', () => {
  it('migrates a minimal v1-style save with no traits', () => {
    const legacyData = {
      version: 1,
      seed: 9999,
      player: { name: 'Gazza', archetype: 'organiser', job: 'teacher', position: 'CM', stats: { touch: 12, strike: 10, pass: 15, engine: 14, graft: 12, head: 11, pace: 10, vibes: 13 }, states: { form: 0, fitness: 90, fatigue: 10, confidence: 55, injuryRisk: 5, managerTrust: 60, teamChemistry: 55, localFame: 5, refereeRep: 50 } },
      club: 'dog-and-duck',
      season: { number: 1, tier: 3, week: 3, results: [], aiTable: [], cupExited: false, cupWon: false },
      npcs: { pete: { relationshipScore: 60, events: [] } },
    }
    store['sll_save_v1'] = JSON.stringify(legacyData)
    const loaded = loadGame()
    expect(loaded).not.toBeNull()
    expect(loaded?.player.name).toBe('Gazza')
    expect(loaded?.player.traits).toEqual([])
    expect(loaded?.version).toBe(initialSaveState.version)
    expect(store[SAVE_KEY]).toBeDefined()
    expect(store['sll_save_v1']).toBeUndefined()
  })

  it('migrates a v2 save and removes the old key', () => {
    const v2Data = deepClone(initialSaveState)
    v2Data.version = 2
    v2Data.player.name = 'Chappers'
    v2Data.season.week = 7
    store['sll_save_v2'] = JSON.stringify(v2Data)
    const loaded = loadGame()
    expect(loaded?.player.name).toBe('Chappers')
    expect(loaded?.season.week).toBe(7)
    expect(loaded?.version).toBe(initialSaveState.version)
    expect(store['sll_save_v2']).toBeUndefined()
    expect(store[SAVE_KEY]).toBeDefined()
  })

  it('migrates a v3 save and fills in hangoverPending', () => {
    const v3Data = { ...deepClone(initialSaveState), version: 3 }
    v3Data.player.name = 'Tangerine Machine'
    v3Data.contextModifiers = { oppositionScouted: true, setPieceReady: false } as never
    store['sll_save_v3'] = JSON.stringify(v3Data)
    const loaded = loadGame()
    expect(loaded?.version).toBe(initialSaveState.version)
    expect(loaded?.contextModifiers.hangoverPending).toBe(false)
    expect(loaded?.contextModifiers.oppositionScouted).toBe(true)
    expect(store['sll_save_v3']).toBeUndefined()
  })

  it('dedupes traits during migration', () => {
    const data = deepClone(initialSaveState)
    data.player.name = 'Stevo'
    data.player.traits = ['Vocal Leader', 'Engine Room', 'Vocal Leader']
    store[SAVE_KEY] = JSON.stringify(data)
    const loaded = loadGame()
    expect(loaded?.player.traits).toEqual(['Vocal Leader', 'Engine Room'])
  })

  it('defaults missing job and signatureTrait on legacy hall of fame entries', () => {
    const data = deepClone(initialSaveState)
    data.player.name = 'Bazza'
    const legacyEntry = { name: 'Smudger', archetype: 'unit', title: 'Pub Hero', date: 1, seasons: 1, goals: 5, points: 12, cupWon: false, finalTier: 3 }
    data.hallOfFame = [legacyEntry as never]
    store[SAVE_KEY] = JSON.stringify(data)
    const loaded = loadGame()
    expect(loaded?.hallOfFame[0].job).toBe('')
    expect(loaded?.hallOfFame[0].signatureTrait).toBeUndefined()
  })
})

describe('migrate: partial / corrupted saves', () => {
  it('returns null for a completely invalid value', () => {
    store[SAVE_KEY] = 'not-json{'
    expect(loadGame()).toBeNull()
  })

  it('fills missing fields with defaults for a partial save', () => {
    const partial = { version: 3, seed: 42, player: { name: 'Stevo' } }
    store[SAVE_KEY] = JSON.stringify(partial)
    const loaded = loadGame()
    expect(loaded).not.toBeNull()
    expect(loaded?.player.name).toBe('Stevo')
    expect(loaded?.season.week).toBe(initialSaveState.season.week)
    expect(loaded?.hallOfFame).toEqual([])
  })

  it('defaults new v5 settings and daily-challenge state for an older save', () => {
    const partial = { version: 3, seed: 7, player: { name: 'Smudger' }, settings: { soundEnabled: false } }
    store[SAVE_KEY] = JSON.stringify(partial)
    const loaded = loadGame()
    expect(loaded?.settings.soundEnabled).toBe(false)
    expect(loaded?.settings.difficulty).toBe('normal')
    expect(loaded?.settings.inputMode).toBe('drag')
    expect(loaded?.settings.tutorialSeen).toBe(false)
    expect(loaded?.dailyChallenge).toEqual({ history: [] })
  })

  it('preserves a newer-version save instead of downgrading it', () => {
    const future = { ...deepClone(initialSaveState), version: 99, futureField: 'keep-me' }
    future.player.name = 'TimeTraveller'
    store[SAVE_KEY] = JSON.stringify(future)
    const loaded = loadGame() as (SaveState & { futureField?: string }) | null
    expect(loaded?.version).toBe(99)
    expect(loaded?.futureField).toBe('keep-me')
  })
})

describe('exportSave / importSave', () => {
  it('round-trips a career through export and import', () => {
    const state = deepClone(initialSaveState)
    state.player.name = 'Gaz-Two-Pints'
    state.season.week = 9
    state.dailyChallenge.history.push({ date: '2026-05-30', score: 17, goals: 3 })
    const text = exportSave(state)
    const imported = importSave(text)
    expect(imported?.player.name).toBe('Gaz-Two-Pints')
    expect(imported?.season.week).toBe(9)
    expect(imported?.dailyChallenge.history[0]).toEqual({ date: '2026-05-30', score: 17, goals: 3 })
  })

  it('returns null for text that is not a valid save', () => {
    expect(importSave('definitely not json')).toBeNull()
  })
})

import type { SaveState } from '../types/game'
import { SAVE_KEY, LEGACY_KEYS, initialSaveState } from './initial-state'

export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj))
}

export function saveGame(state: SaveState): void {
  try {
    const toSave: SaveState = { ...state, savedAt: Date.now() }
    localStorage.setItem(SAVE_KEY, JSON.stringify(toSave))
  } catch (e) {
    console.warn('Save failed', e)
  }
}

function migrate(raw: unknown): SaveState | null {
  if (!raw || typeof raw !== 'object') return null
  const data = raw as Partial<SaveState> & Record<string, unknown>

  const base = deepClone(initialSaveState)
  base.version = 3

  if (data.player) base.player = {
    ...base.player,
    ...data.player,
    stats: { ...base.player.stats, ...(data.player.stats ?? {}) },
    states: { ...base.player.states, ...(data.player.states ?? {}) },
    traits: Array.isArray(data.player.traits) ? data.player.traits : base.player.traits,
  }
  if (typeof data.seed === 'number') base.seed = data.seed
  if (typeof data.club === 'string') base.club = data.club
  if (data.season) {
    base.season = {
      ...base.season,
      ...(data.season as Partial<SaveState['season']>),
      number: (data.season as { number?: number }).number ?? 1,
      tier: ((data.season as { tier?: 1 | 2 | 3 }).tier) ?? 3,
      week: (data.season as { week?: number }).week ?? 1,
      results: ((data.season as { results?: SaveState['season']['results'] }).results ?? []).map(r => ({
        week: r.week,
        competition: r.competition ?? 'league',
        ourGoals: r.ourGoals,
        theirGoals: r.theirGoals,
        rating: r.rating,
        stats: r.stats ?? { shots: 0, goals: 0, passes: 0, passSuccess: 0, tackles: 0, tackleSuccess: 0 },
        opponentId: r.opponentId ?? '',
        cupRound: r.cupRound,
        cupExit: r.cupExit,
        cupWin: r.cupWin,
      })),
      aiTable: (data.season as { aiTable?: SaveState['season']['aiTable'] }).aiTable ?? [],
      cupExited: (data.season as { cupExited?: boolean }).cupExited ?? false,
      cupWon: (data.season as { cupWon?: boolean }).cupWon ?? false,
    }
  }
  if (data.npcs) {
    base.npcs = { ...base.npcs }
    Object.entries(data.npcs as Record<string, { relationshipScore: number; events?: string[] }>).forEach(([k, v]) => {
      base.npcs[k] = { relationshipScore: v.relationshipScore ?? 50, events: v.events ?? [] }
    })
  }
  if (Array.isArray(data.careerEvents)) base.careerEvents = data.careerEvents as SaveState['careerEvents']
  if (Array.isArray(data.groupChatLog)) base.groupChatLog = data.groupChatLog as SaveState['groupChatLog']
  if (Array.isArray(data.chaosCardHistory)) base.chaosCardHistory = data.chaosCardHistory as SaveState['chaosCardHistory']
  if (Array.isArray(data.hallOfFame)) {
    base.hallOfFame = (data.hallOfFame as Partial<SaveState['hallOfFame'][number]>[]).map(h => ({
      name: h.name ?? 'Unknown',
      archetype: h.archetype ?? '',
      title: h.title ?? 'Local Legend',
      date: h.date ?? Date.now(),
      seasons: h.seasons ?? 1,
      goals: h.goals ?? 0,
      points: h.points ?? 0,
      cupWon: h.cupWon ?? false,
      finalTier: (h.finalTier ?? 3) as 1 | 2 | 3,
    }))
  }
  if (data.settings) {
    base.settings = {
      reducedMotion: !!(data.settings as Partial<SaveState['settings']>).reducedMotion,
      soundEnabled: (data.settings as Partial<SaveState['settings']>).soundEnabled ?? true,
      textSize: ((data.settings as Partial<SaveState['settings']>).textSize ?? 'normal') as SaveState['settings']['textSize'],
      inputSensitivity: ((data.settings as Partial<SaveState['settings']>).inputSensitivity ?? 'normal') as SaveState['settings']['inputSensitivity'],
    }
  }
  if (Array.isArray((data as { subplots?: SaveState['subplots'] }).subplots)) {
    base.subplots = (data as { subplots: SaveState['subplots'] }).subplots
  }
  if ((data as { contextModifiers?: SaveState['contextModifiers'] }).contextModifiers) {
    base.contextModifiers = (data as { contextModifiers: SaveState['contextModifiers'] }).contextModifiers
  }

  return base
}

export function loadGame(): SaveState | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY)
    if (raw) return migrate(JSON.parse(raw))
    for (const key of LEGACY_KEYS) {
      const legacy = localStorage.getItem(key)
      if (legacy) {
        const migrated = migrate(JSON.parse(legacy))
        if (migrated) {
          localStorage.setItem(SAVE_KEY, JSON.stringify(migrated))
          localStorage.removeItem(key)
        }
        return migrated
      }
    }
    return null
  } catch {
    return null
  }
}

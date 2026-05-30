import type { SaveState } from '../types/game'
import { SAVE_KEY, LEGACY_KEYS, initialSaveState } from './initial-state'
import { TRAIT_REGISTRY } from '../engine/traits'

export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj))
}

export function saveGame(state: SaveState): boolean {
  try {
    const toSave: SaveState = { ...state, savedAt: Date.now() }
    localStorage.setItem(SAVE_KEY, JSON.stringify(toSave))
    return true
  } catch {
    return false
  }
}

function uniqueStrings(values: unknown): string[] | null {
  if (!Array.isArray(values)) return null
  const seen = new Set<string>()
  const out: string[] = []
  for (const v of values) {
    if (typeof v !== 'string') continue
    if (seen.has(v)) continue
    seen.add(v)
    out.push(v)
  }
  return out
}

function migrate(raw: unknown): SaveState | null {
  if (!raw || typeof raw !== 'object') return null
  const data = raw as Partial<SaveState> & Record<string, unknown>

  const base = deepClone(initialSaveState)
  base.version = 4

  if (data.player) {
    const dedupedTraits = uniqueStrings(data.player.traits)
    const validTraits = (dedupedTraits ?? base.player.traits).filter(t => TRAIT_REGISTRY[t] !== undefined)
    base.player = {
      ...base.player,
      ...data.player,
      stats: { ...base.player.stats, ...(data.player.stats ?? {}) },
      states: { ...base.player.states, ...(data.player.states ?? {}) },
      traits: validTraits,
    }
  }
  if (typeof data.seed === 'number') base.seed = data.seed
  if (typeof data.club === 'string') base.club = data.club
  if (data.season) {
    const rawSeason = data.season as Partial<SaveState['season']> & Record<string, unknown>
    base.season = {
      ...base.season,
      ...rawSeason,
      number: rawSeason.number ?? 1,
      tier: (rawSeason.tier as 1 | 2 | 3) ?? 3,
      week: rawSeason.week ?? 1,
      results: ((rawSeason.results ?? []) as SaveState['season']['results']).map(r => ({
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
      aiTable: (rawSeason.aiTable as SaveState['season']['aiTable']) ?? [],
      cupExited: rawSeason.cupExited ?? false,
      cupWon: rawSeason.cupWon ?? false,
      nemesisOpponentId: (rawSeason.nemesisOpponentId as string | null) ?? null,
      achievements: Array.isArray(rawSeason.achievements) ? (rawSeason.achievements as string[]) : [],
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
      job: h.job ?? '',
      title: h.title ?? 'Local Legend',
      date: h.date ?? Date.now(),
      seasons: h.seasons ?? 1,
      goals: h.goals ?? 0,
      points: h.points ?? 0,
      cupWon: h.cupWon ?? false,
      finalTier: (h.finalTier ?? 3) as 1 | 2 | 3,
      signatureTrait: h.signatureTrait,
      achievements: Array.isArray(h.achievements) ? h.achievements : [],
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
  const persistedCtx = (data as { contextModifiers?: Partial<SaveState['contextModifiers']> }).contextModifiers
  if (persistedCtx) {
    base.contextModifiers = { ...base.contextModifiers, ...persistedCtx }
  }

  const persistedObj = (data as { objectives?: Partial<SaveState['objectives']> }).objectives
  if (persistedObj) {
    base.objectives = {
      short: persistedObj.short ?? null,
      medium: persistedObj.medium ?? null,
      long: persistedObj.long ?? null,
      completedThisSeason: Array.isArray(persistedObj.completedThisSeason)
        ? persistedObj.completedThisSeason
        : [],
    }
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

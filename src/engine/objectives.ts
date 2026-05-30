import type { SaveState } from '../types/game'
import {
  SHORT_OBJECTIVES,
  MEDIUM_OBJECTIVES,
  LONG_OBJECTIVES,
  type ObjectiveDefinition,
} from '../data/objectives'
import { mulberry32 } from './rng'

function pickUnused(pool: ObjectiveDefinition[], completed: string[], seed: number): string | null {
  const available = pool.filter(o => !completed.includes(o.id))
  if (available.length === 0) return null
  const rng = mulberry32(seed)
  return available[Math.floor(rng() * available.length)].id
}

export function assignInitialObjectives(state: SaveState): void {
  const { completedThisSeason } = state.objectives
  const seed = state.seed + state.season.number * 37

  if (!state.objectives.short || completedThisSeason.includes(state.objectives.short)) {
    state.objectives.short = pickUnused(SHORT_OBJECTIVES, completedThisSeason, seed)
  }
  if (!state.objectives.medium || completedThisSeason.includes(state.objectives.medium)) {
    state.objectives.medium = pickUnused(MEDIUM_OBJECTIVES, completedThisSeason, seed + 1)
  }
  if (!state.objectives.long || completedThisSeason.includes(state.objectives.long)) {
    state.objectives.long = pickUnused(LONG_OBJECTIVES, completedThisSeason, seed + 2)
  }
}

export function rotateShortObjective(state: SaveState): void {
  const { completedThisSeason } = state.objectives
  const seed = state.seed + state.season.week * 13
  state.objectives.short = pickUnused(SHORT_OBJECTIVES, completedThisSeason, seed)
}

export interface ObjectiveCheckResult {
  completedId: string
  definition: ObjectiveDefinition
}

export function checkObjectivesAfterMatch(state: SaveState): ObjectiveCheckResult[] {
  const completed: ObjectiveCheckResult[] = []
  const results = state.season.results
  if (results.length === 0) return completed

  const last = results[results.length - 1]
  const allSeason = results

  const seasonGoals = allSeason.reduce((acc, r) => acc + (r.stats?.goals ?? 0), 0)
  const leagueResults = allSeason.filter(r => r.competition === 'league')
  const lastN = (n: number) => leagueResults.slice(-n)
  // "Win 3 consecutive matches" counts any competition, so streaks span all results.
  const lastNAll = (n: number) => allSeason.slice(-n)

  const checkMap: Record<string, () => boolean> = {
    'win-this-week':  () => last.ourGoals > last.theirGoals,
    'score-this-week': () => (last.stats?.goals ?? 0) > 0,
    'rating-7-plus':  () => (last.rating ?? 0) >= 7,
    'clean-sheet':    () => last.theirGoals === 0,
    'pass-master':    () => {
      const passes = last.stats?.passes ?? 0
      const success = last.stats?.passSuccess ?? 0
      return passes >= 5 && (success / passes) >= 0.7
    },
    'tackle-win':     () => (last.stats?.tackleSuccess ?? 0) >= 2,
    'win-streak-3':   () => lastNAll(3).length === 3 && lastNAll(3).every(r => r.ourGoals > r.theirGoals),
    'score-5-season': () => seasonGoals >= 5,
    'unbeaten-5':     () => leagueResults.length >= 5 && lastN(5).every(r => r.ourGoals >= r.theirGoals),
    'high-chemistry': () => state.player.states.teamChemistry >= 80,
  }

  const activeIds = [state.objectives.short, state.objectives.medium].filter(Boolean) as string[]

  for (const id of activeIds) {
    if (state.objectives.completedThisSeason.includes(id)) continue
    const check = checkMap[id]
    if (!check) continue
    if (check()) {
      const def = [...SHORT_OBJECTIVES, ...MEDIUM_OBJECTIVES].find(o => o.id === id)
      if (def) completed.push({ completedId: id, definition: def })
    }
  }

  return completed
}

export function checkLongObjectiveAtSeasonEnd(state: SaveState, position: number, totalTeams: number): ObjectiveCheckResult | null {
  const longId = state.objectives.long
  if (!longId || state.objectives.completedThisSeason.includes(longId)) return null

  const def = LONG_OBJECTIVES.find(o => o.id === longId)
  if (!def) return null

  const checkMap: Record<string, () => boolean> = {
    'finish-top-2':       () => position <= 2,
    'win-the-cup':        () => state.season.cupWon,
    'reach-cup-final':    () => state.season.cupWon || state.season.results.some(r => r.cupRound === 'final'),
    'finish-top-half':    () => position <= Math.floor(totalTeams / 2),
    'survive-relegation': () => position > Math.floor(totalTeams / 2) && position < totalTeams - 1,
  }

  const check = checkMap[longId]
  if (!check || !check()) return null
  return { completedId: longId, definition: def }
}

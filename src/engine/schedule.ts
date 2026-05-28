import type { Opponent } from '../types/game'
import { getLeagueOpponents } from '../data/opponents'
import { CUP_OPPONENTS, CUP_WEEKS } from '../data/cup'

export type FixtureKind = 'league' | 'cup'
export type CupRound = 'quarter-final' | 'semi-final' | 'final'

export interface Fixture {
  week: number
  kind: FixtureKind
  opponent: Opponent
  leagueIndex?: number
  cupRound?: CupRound
}

export const TOTAL_WEEKS = 15

// 12 league fixtures interleaved with up to 3 cup ties.
// Cup weeks are 4 (QF), 8 (SF), 15 (Final). League fixtures fill the remaining 12 weeks.
const LEAGUE_WEEKS: number[] = [1, 2, 3, 5, 6, 7, 9, 10, 11, 12, 13, 14]

export function getFixture(
  week: number,
  tier: 1 | 2 | 3,
  cupExited: boolean,
): Fixture | null {
  if (week < 1 || week > TOTAL_WEEKS) return null

  if (CUP_WEEKS[week]) {
    if (cupExited) return getLeagueFixtureFallback(week, tier)
    const round = CUP_WEEKS[week]
    return { week, kind: 'cup', opponent: CUP_OPPONENTS[round], cupRound: round }
  }

  const idx = LEAGUE_WEEKS.indexOf(week)
  if (idx === -1) return null
  const opponents = getLeagueOpponents(tier)
  const opponent = opponents[idx % opponents.length]
  return { week, kind: 'league', opponent, leagueIndex: idx }
}

// When a player has been knocked out of the cup, give them a league-style "friendly"
// against a tier opponent on what was a cup week, so they still have something to play.
function getLeagueFixtureFallback(week: number, tier: 1 | 2 | 3): Fixture {
  const opponents = getLeagueOpponents(tier)
  const idx = (week - 1) % opponents.length
  return { week, kind: 'league', opponent: opponents[idx], leagueIndex: undefined }
}

export function isFinalWeek(week: number): boolean {
  return week >= TOTAL_WEEKS
}

export function nextWeekNumber(week: number): number {
  return Math.min(TOTAL_WEEKS, week + 1)
}

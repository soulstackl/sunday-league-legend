import type { AiTeamRecord, MatchResult } from '../types/game'
import { getLeagueOpponents } from '../data/opponents'
import { mulberry32, poissonSample } from './rng'

const CLUB_NAME = 'Dog & Duck FC'

export function initialTable(tier: 1 | 2 | 3): AiTeamRecord[] {
  return getLeagueOpponents(tier).map(o => ({
    opponentId: o.id,
    played: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    points: 0,
  }))
}

interface StandingsRow {
  id: string
  name: string
  played: number
  won: number
  drawn: number
  lost: number
  goalsFor: number
  goalsAgainst: number
  goalDifference: number
  points: number
  isUs: boolean
}

// Deterministic per-week simulation of the AI matches. We pair opponents
// against each other using a rotation so that every team plays roughly the
// same number of matches as we progress.
export function advanceAiTable(
  table: AiTeamRecord[],
  tier: 1 | 2 | 3,
  weekIndex: number,
  seed: number,
): AiTeamRecord[] {
  const opponents = getLeagueOpponents(tier)
  const rng = mulberry32(seed + weekIndex * 9301)
  const next = table.map(r => ({ ...r }))

  const n = opponents.length
  // Round-robin pairing using the standard scheduling algorithm
  const half = n / 2
  const pairings: [number, number][] = []
  for (let i = 0; i < half; i++) {
    const home = (weekIndex + i) % (n - 1)
    const away = (n - 1 - i + weekIndex) % (n - 1)
    const a = i === 0 ? n - 1 : home
    const b = away
    if (a !== b) pairings.push([a, b])
  }

  for (const [a, b] of pairings) {
    const homeOpp = opponents[a]
    const awayOpp = opponents[b]
    if (!homeOpp || !awayOpp) continue

    const homeStrength = homeOpp.difficulty + 0.6
    const awayStrength = awayOpp.difficulty
    const homeGoals = poissonSample(Math.max(0.2, homeStrength * 0.22), rng)
    const awayGoals = poissonSample(Math.max(0.2, awayStrength * 0.2), rng)

    const homeRow = next.find(r => r.opponentId === homeOpp.id)
    const awayRow = next.find(r => r.opponentId === awayOpp.id)
    if (!homeRow || !awayRow) continue

    homeRow.played += 1
    awayRow.played += 1
    homeRow.goalsFor += homeGoals
    homeRow.goalsAgainst += awayGoals
    awayRow.goalsFor += awayGoals
    awayRow.goalsAgainst += homeGoals
    if (homeGoals > awayGoals) {
      homeRow.won += 1
      homeRow.points += 3
      awayRow.lost += 1
    } else if (homeGoals < awayGoals) {
      awayRow.won += 1
      awayRow.points += 3
      homeRow.lost += 1
    } else {
      homeRow.drawn += 1
      awayRow.drawn += 1
      homeRow.points += 1
      awayRow.points += 1
    }
  }

  return next
}

export function buildStandings(
  table: AiTeamRecord[],
  tier: 1 | 2 | 3,
  results: MatchResult[],
): StandingsRow[] {
  const opponents = getLeagueOpponents(tier)
  const rows: StandingsRow[] = opponents.map(o => {
    const r = table.find(t => t.opponentId === o.id)
    return {
      id: o.id,
      name: o.name,
      played: r?.played ?? 0,
      won: r?.won ?? 0,
      drawn: r?.drawn ?? 0,
      lost: r?.lost ?? 0,
      goalsFor: r?.goalsFor ?? 0,
      goalsAgainst: r?.goalsAgainst ?? 0,
      goalDifference: (r?.goalsFor ?? 0) - (r?.goalsAgainst ?? 0),
      points: r?.points ?? 0,
      isUs: false,
    }
  })

  // Our team
  const leagueResults = results.filter(r => r.competition === 'league')
  let played = 0, won = 0, drawn = 0, lost = 0, gf = 0, ga = 0, pts = 0
  for (const r of leagueResults) {
    played += 1
    gf += r.ourGoals
    ga += r.theirGoals
    if (r.ourGoals > r.theirGoals) { won += 1; pts += 3 }
    else if (r.ourGoals === r.theirGoals) { drawn += 1; pts += 1 }
    else lost += 1
  }
  rows.push({
    id: 'us',
    name: CLUB_NAME,
    played, won, drawn, lost,
    goalsFor: gf, goalsAgainst: ga,
    goalDifference: gf - ga,
    points: pts,
    isUs: true,
  })

  rows.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points
    if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference
    if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor
    return a.name.localeCompare(b.name)
  })

  return rows
}

export function ourLeaguePosition(rows: StandingsRow[]): number {
  const idx = rows.findIndex(r => r.isUs)
  return idx === -1 ? rows.length : idx + 1
}

export interface PromotionOutcome {
  newTier: 1 | 2 | 3
  movement: 'promoted' | 'relegated' | 'stayed'
  position: number
}

export function resolvePromotionRelegation(
  position: number,
  totalTeams: number,
  currentTier: 1 | 2 | 3,
): PromotionOutcome {
  // Top two promoted, bottom two relegated.
  const top = position <= 2
  const bottom = position >= totalTeams - 1

  if (top && currentTier > 1) {
    return { newTier: (currentTier - 1) as 1 | 2 | 3, movement: 'promoted', position }
  }
  if (bottom && currentTier < 3) {
    return { newTier: (currentTier + 1) as 1 | 2 | 3, movement: 'relegated', position }
  }
  return { newTier: currentTier, movement: 'stayed', position }
}

export type { StandingsRow }

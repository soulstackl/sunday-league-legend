import type { SaveState } from '../types/game'

export function checkAchievementsAfterMatch(state: SaveState, chaosCardCount: number): string[] {
  const results = state.season.results
  if (results.length === 0) return []

  const last = results[results.length - 1]
  const all = results
  const leagueResults = all.filter(r => r.competition === 'league')
  const existing = state.season.achievements

  const unlocked: string[] = []

  const award = (id: string) => {
    if (!existing.includes(id) && !unlocked.includes(id)) unlocked.push(id)
  }

  const seasonGoals = all.reduce((acc, r) => acc + (r.stats?.goals ?? 0), 0)
  const lastGoals = last.stats?.goals ?? 0
  const lastRating = last.rating ?? 0

  if (all.length === 1) award('first-match')
  if (last.ourGoals > last.theirGoals && !existing.includes('first-win')) award('first-win')

  const totalGoals = all.reduce((acc, r) => acc + (r.stats?.goals ?? 0), 0)
  if (totalGoals > 0 && !existing.includes('first-goal')) award('first-goal')

  if (lastGoals >= 2) award('brace')
  if (lastGoals >= 3) award('hat-trick')
  if (seasonGoals >= 10) award('top-scorer')

  if (lastRating === 10) award('perfect-10')

  const last5 = leagueResults.slice(-5)
  if (last5.length === 5 && last5.every(r => r.rating >= 7)) award('consistent')

  if (last.ourGoals - last.theirGoals >= 3) award('big-win')

  const last5all = leagueResults.slice(-5)
  if (last5all.length === 5 && last5all.every(r => r.ourGoals >= r.theirGoals)) award('unbeaten-run')

  if (last.competition === 'cup' && last.cupRound === 'final') award('cup-finalist')
  if (last.competition === 'cup' && last.cupRound === 'final' && last.ourGoals > last.theirGoals) award('cup-winner')

  if (state.player.states.teamChemistry >= 80) award('team-player')
  if (state.player.states.managerTrust >= 90) award('gaffer-trust')
  if (state.player.states.localFame >= 75) award('local-legend')

  if (chaosCardCount >= 3) award('chaos-survivor')

  return unlocked
}

export function checkAchievementsAtSeasonEnd(state: SaveState, position: number, totalTeams: number): string[] {
  const existing = state.season.achievements
  const unlocked: string[] = []

  const award = (id: string) => {
    if (!existing.includes(id) && !unlocked.includes(id)) unlocked.push(id)
  }

  if (position <= 2) award('promoted')
  if (position >= totalTeams - 1) award('relegated')
  if (state.season.number >= 3) award('veteran')

  return unlocked
}

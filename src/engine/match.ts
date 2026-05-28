import type { PlayerStates, Opponent, MatchReport } from '../types/game'
import { poissonSample } from './rng'

export function calculateTeamStrength(states: PlayerStates): number {
  const chemBonus = ((states.teamChemistry - 50) / 50) * 2
  const trustBonus = ((states.managerTrust - 50) / 50) * 1.5
  const confidenceBonus = ((states.confidence - 50) / 50) * 1.5
  return Math.max(1, 5 + chemBonus + trustBonus + confidenceBonus)
}

export function simulateMatch(
  playerMomentResults: Array<{ value?: number }>,
  preMatchState: PlayerStates,
  chaosModifiers: Array<{ teamStrengthMod?: number }>,
  opponent: Opponent,
  rng: () => number
): MatchReport {
  const teamBaseStrength = calculateTeamStrength(preMatchState)
  const opponentStrength = opponent.difficulty
  const chaosAdjustment = chaosModifiers.reduce((acc, c) => acc + (c.teamStrengthMod ?? 0), 0)

  const playerContribution =
    playerMomentResults.length > 0
      ? playerMomentResults.reduce((acc, r) => acc + (r.value ?? 0), 0) / playerMomentResults.length
      : 0.5

  const ourxG = Math.max(
    0.1,
    (teamBaseStrength + playerContribution * 4 + chaosAdjustment + (rng() - 0.5) * 2) * 0.25
  )
  const theirxG = Math.max(
    0.1,
    (opponentStrength - chaosAdjustment * 0.5 + (rng() - 0.5) * 2) * 0.22
  )

  const ourGoals = poissonSample(ourxG, rng)
  const theirGoals = poissonSample(theirxG, rng)

  return {
    ourGoals,
    theirGoals,
    ourxG: parseFloat(ourxG.toFixed(2)),
    theirxG: parseFloat(theirxG.toFixed(2)),
  }
}

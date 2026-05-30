import type { PlayerStates, Opponent, MatchReport, GameSettings } from '../types/game'
import { poissonSample } from './rng'

export type Difficulty = GameSettings['difficulty']

// Expected-goals multipliers per difficulty. Easy tilts toward the player; hard against.
// Shared by the scoreline sim here and the interactive arena so the two stay coherent.
export function difficultyXgScale(difficulty: Difficulty): { ours: number; theirs: number } {
  switch (difficulty) {
    case 'easy': return { ours: 1.18, theirs: 0.82 }
    case 'hard': return { ours: 0.85, theirs: 1.20 }
    default:     return { ours: 1, theirs: 1 }
  }
}

// Additive accuracy nudge applied to interactive arena moments per difficulty.
export function difficultyAccuracyMod(difficulty: Difficulty): number {
  switch (difficulty) {
    case 'easy': return 0.08
    case 'hard': return -0.08
    default:     return 0
  }
}

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
  rng: () => number,
  difficulty: Difficulty = 'normal'
): MatchReport {
  const teamBaseStrength = calculateTeamStrength(preMatchState)
  const opponentStrength = opponent.difficulty
  const chaosAdjustment = chaosModifiers.reduce((acc, c) => acc + (c.teamStrengthMod ?? 0), 0)
  const scale = difficultyXgScale(difficulty)

  const playerContribution =
    playerMomentResults.length > 0
      ? playerMomentResults.reduce((acc, r) => acc + (r.value ?? 0), 0) / playerMomentResults.length
      : 0.5

  const ourxG = Math.max(
    0.1,
    (teamBaseStrength + playerContribution * 4 + chaosAdjustment + (rng() - 0.5) * 2) * 0.25 * scale.ours
  )
  const theirxG = Math.max(
    0.1,
    (opponentStrength - chaosAdjustment * 0.5 + (rng() - 0.5) * 2) * 0.22 * scale.theirs
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

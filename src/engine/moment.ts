import type { PlayerStats, PlayerStates, DragVector, MomentResult } from '../types/game'

interface ContextMod {
  value: number
}

export function resolveMoment(
  momentType: string,
  dragVector: DragVector,
  playerStats: PlayerStats,
  playerStates: PlayerStates,
  contextMods: ContextMod[],
  rng: () => number
): MomentResult {
  const inputAccuracy = dragVector.accuracy
  const inputPower = dragVector.power
  const inputScore = inputAccuracy * 0.7 + inputPower * 0.3

  const statMap: Record<string, keyof PlayerStats> = {
    shot: 'strike',
    pass: 'pass',
    touch: 'touch',
    tackle: 'graft',
    header: 'head',
    penalty: 'strike',
    freekick: 'strike',
    corner: 'pass',
  }

  const statKey = statMap[momentType] ?? 'touch'
  const statScore = (playerStats[statKey] ?? 10) / 20

  const fatiguePenalty = Math.max(0.5, 1 - playerStates.fatigue / 150)
  const confidenceBonus = ((playerStates.confidence - 50) / 100) * 0.1
  const formBonus = (playerStates.form ?? 0) * 0.03

  const stateMultiplier = fatiguePenalty + confidenceBonus + formBonus
  const contextScore = contextMods.reduce((acc, mod) => acc + mod.value, 0)
  const luck = (rng() - 0.5) * 0.2

  const total = inputScore * 0.55 + statScore * 0.25 + contextScore * 0.1 + luck
  const clamped = Math.max(0, Math.min(1, total * stateMultiplier))

  let outcome = 'FAIL'
  let details = ''

  if (momentType === 'shot' || momentType === 'penalty') {
    if (clamped > 0.75) {
      outcome = 'GOAL'
      details = 'You absolute beauty! Absolute thunderbolt right in the top bin!'
    } else if (clamped > 0.55) {
      outcome = 'SAVED'
      details = 'Good effort, but their keeper tipped it wide with a fine finger-tip save.'
    } else if (clamped > 0.40) {
      outcome = 'WOODWORK'
      details = 'So close! It rattled the crossbar and bounced out.'
    } else {
      outcome = 'MISS'
      details = 'You completely shanked it. Pete is rubbing his temples in despair.'
    }
  } else if (momentType === 'pass') {
    if (clamped > 0.55) {
      outcome = 'SUCCESS'
      details = "Beautiful ball right into Gav's path, cutting their back-line in two."
    } else if (clamped > 0.35) {
      outcome = 'BLOCKED'
      details = 'The defender stuck out a muddy leg and deflected it.'
    } else {
      outcome = 'INTERCEPTED'
      details = 'Right to their midfielder. Taz is tracking back shouting absolute obscenities.'
    }
  } else if (momentType === 'touch') {
    if (clamped > 0.55) {
      outcome = 'SUCCESS'
      details = 'Velvet control. You brought it down clean and have space to breathe.'
    } else {
      outcome = 'FAIL'
      details = 'It bounced off your shin like a trampoline. The crowd is laughing.'
    }
  } else if (momentType === 'tackle') {
    if (clamped > 0.60) {
      outcome = 'SUCCESS'
      details = 'Crunch! A perfectly timed sliding challenge. Pure grass and grit.'
    } else if (clamped > 0.35) {
      outcome = 'FOUL'
      details = 'Missed the ball, caught the ankles. Clive has his hand in his pocket.'
    } else {
      outcome = 'BYPASSED'
      details = 'They did a simple drop of the shoulder and left you in the mud.'
    }
  } else if (momentType === 'header') {
    if (clamped > 0.60) {
      outcome = 'SUCCESS'
      details = 'Rising like a majestic salmon. You powered the header goalward.'
    } else {
      outcome = 'FAIL'
      details = 'You mistimed the jump. The ball grazed your hair and went out.'
    }
  }

  return {
    clampedValue: clamped,
    outcome,
    details,
  }
}

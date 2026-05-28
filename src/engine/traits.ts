import type { SaveState } from '../types/game'

export type MomentType =
  | 'shot'
  | 'pass'
  | 'touch'
  | 'tackle'
  | 'header'
  | 'penalty'
  | 'freekick'
  | 'corner'

export type TraitSource = 'archetype' | 'job'

export interface TraitDefinition {
  id: string
  name: string
  source: TraitSource
  description: string
  momentBonus?: Partial<Record<MomentType, number>>
  weeklyTick?: {
    fatigue?: number
    fitness?: number
    teamChemistry?: number
    confidence?: number
  }
  trainingExtraStat?: boolean
  pubFatigueReduction?: number
  pubHangoverImmune?: boolean
  tackleEngineBonus?: number
  extraMatchMoments?: number
  overtimeFatigueReduction?: number
  paceRecoveryBonus?: number
}

export const TRAIT_REGISTRY: Record<string, TraitDefinition> = {
  'Aerial Threat': {
    id: 'aerial-threat',
    name: 'Aerial Threat',
    source: 'archetype',
    description: 'Wins more headers, sharper in the mixer at corners.',
    momentBonus: { header: 0.10, corner: 0.05 },
  },
  'Hold-Up Artist': {
    id: 'hold-up-artist',
    name: 'Hold-Up Artist',
    source: 'archetype',
    description: 'Calmer first touch, tidier link-up play.',
    momentBonus: { touch: 0.08, pass: 0.04 },
  },
  'Electric Pace': {
    id: 'electric-pace',
    name: 'Electric Pace',
    source: 'archetype',
    description: 'Quicker on the burst. Bigger threat from wide, better recovery on tackles.',
    momentBonus: { shot: 0.05, corner: 0.05 },
    paceRecoveryBonus: 0.15,
  },
  'Ball Magnet': {
    id: 'ball-magnet',
    name: 'Ball Magnet',
    source: 'archetype',
    description: 'Sees one extra moment of action every match.',
    extraMatchMoments: 1,
  },
  'Vocal Leader': {
    id: 'vocal-leader',
    name: 'Vocal Leader',
    source: 'archetype',
    description: 'The lads listen. Team chemistry creeps up each week.',
    weeklyTick: { teamChemistry: 1 },
  },
  'Engine Room': {
    id: 'engine-room',
    name: 'Engine Room',
    source: 'archetype',
    description: 'Recovers faster between matches. Fatigue drops quicker each week.',
    weeklyTick: { fatigue: -2 },
  },
  'Early Riser': {
    id: 'early-riser',
    name: 'Early Riser',
    source: 'job',
    description: 'Training sessions give an extra stat point.',
    trainingExtraStat: true,
  },
  'Iron Lungs': {
    id: 'iron-lungs',
    name: 'Iron Lungs',
    source: 'job',
    description: 'Recovers fitness faster every week.',
    weeklyTick: { fitness: 2 },
  },
  'Five-a-side Regular': {
    id: 'five-a-side',
    name: 'Five-a-side Regular',
    source: 'job',
    description: 'Sharper touch and tidier passing from constant indoor games.',
    momentBonus: { touch: 0.05, pass: 0.03 },
  },
  'Always Moving': {
    id: 'always-moving',
    name: 'Always Moving',
    source: 'job',
    description: 'On your feet all day. Tackles bite harder.',
    tackleEngineBonus: 0.08,
  },
  'Cheap Round': {
    id: 'cheap-round',
    name: 'Cheap Round',
    source: 'job',
    description: 'Pub sessions cost less fatigue. No hangovers, ever.',
    pubFatigueReduction: 6,
    pubHangoverImmune: true,
  },
  'Flexible Schedule': {
    id: 'flexible-schedule',
    name: 'Flexible Schedule',
    source: 'job',
    description: 'Overtime is less brutal on your legs.',
    overtimeFatigueReduction: 4,
  },
}

export function describeTrait(trait: string): string {
  return TRAIT_REGISTRY[trait]?.description ?? 'A personal quirk that shapes how you play.'
}

export function getMomentAccuracyBonus(traits: string[], moment: MomentType): number {
  let sum = 0
  for (const t of traits) {
    const bonus = TRAIT_REGISTRY[t]?.momentBonus?.[moment]
    if (bonus) sum += bonus
  }
  return sum
}

export function getExtraMatchMoments(traits: string[]): number {
  return traits.reduce((acc, t) => acc + (TRAIT_REGISTRY[t]?.extraMatchMoments ?? 0), 0)
}

export function getTrainingExtraStat(traits: string[]): boolean {
  return traits.some(t => TRAIT_REGISTRY[t]?.trainingExtraStat === true)
}

export function getPubFatigueReduction(traits: string[]): number {
  return traits.reduce((acc, t) => acc + (TRAIT_REGISTRY[t]?.pubFatigueReduction ?? 0), 0)
}

export function getPubHangoverImmune(traits: string[]): boolean {
  return traits.some(t => TRAIT_REGISTRY[t]?.pubHangoverImmune === true)
}

export function getTackleEngineBonus(traits: string[]): number {
  return traits.reduce((acc, t) => acc + (TRAIT_REGISTRY[t]?.tackleEngineBonus ?? 0), 0)
}

export function getOvertimeFatigueReduction(traits: string[]): number {
  return traits.reduce((acc, t) => acc + (TRAIT_REGISTRY[t]?.overtimeFatigueReduction ?? 0), 0)
}

export function getPaceRecoveryBonus(traits: string[]): number {
  return traits.reduce((acc, t) => acc + (TRAIT_REGISTRY[t]?.paceRecoveryBonus ?? 0), 0)
}

export interface WeeklyTickDelta {
  fatigue: number
  fitness: number
  teamChemistry: number
  confidence: number
}

export function aggregateWeeklyTick(traits: string[]): WeeklyTickDelta {
  const delta: WeeklyTickDelta = { fatigue: 0, fitness: 0, teamChemistry: 0, confidence: 0 }
  for (const t of traits) {
    const tick = TRAIT_REGISTRY[t]?.weeklyTick
    if (!tick) continue
    delta.fatigue += tick.fatigue ?? 0
    delta.fitness += tick.fitness ?? 0
    delta.teamChemistry += tick.teamChemistry ?? 0
    delta.confidence += tick.confidence ?? 0
  }
  return delta
}

const clamp = (v: number, lo: number, hi: number): number => Math.max(lo, Math.min(hi, v))

export function applyWeeklyTraitTick(state: SaveState): void {
  const delta = aggregateWeeklyTick(state.player.traits)
  state.player.states.fatigue = clamp(state.player.states.fatigue + delta.fatigue, 0, 100)
  state.player.states.fitness = clamp(state.player.states.fitness + delta.fitness, 0, 100)
  state.player.states.teamChemistry = clamp(state.player.states.teamChemistry + delta.teamChemistry, 0, 100)
  state.player.states.confidence = clamp(state.player.states.confidence + delta.confidence, 0, 100)
}

export function pickSignatureTrait(traits: string[]): string | undefined {
  const archetypeTrait = traits.find(t => TRAIT_REGISTRY[t]?.source === 'archetype')
  return archetypeTrait ?? traits[0]
}

import type { StatKey } from '../types/game'

export type ObjectiveType = 'short' | 'medium' | 'long'

export interface ObjectiveReward {
  stat?: StatKey
  confidence?: number
  teamChemistry?: number
  label: string
}

export interface ObjectiveDefinition {
  id: string
  type: ObjectiveType
  title: string
  description: string
  reward: ObjectiveReward
}

export const SHORT_OBJECTIVES: ObjectiveDefinition[] = [
  {
    id: 'win-this-week',
    type: 'short',
    title: 'Three Points',
    description: 'Win this week\'s match',
    reward: { confidence: 10, label: '+10 Confidence' },
  },
  {
    id: 'score-this-week',
    type: 'short',
    title: 'Get On The Scoresheet',
    description: 'Score at least one goal',
    reward: { stat: 'strike', label: '+1 Strike' },
  },
  {
    id: 'rating-7-plus',
    type: 'short',
    title: 'Solid Performance',
    description: 'Earn a 7/10 match rating or better',
    reward: { confidence: 8, label: '+8 Confidence' },
  },
  {
    id: 'clean-sheet',
    type: 'short',
    title: 'Nothing Gets Past',
    description: 'Keep a clean sheet this match',
    reward: { stat: 'graft', label: '+1 Graft' },
  },
  {
    id: 'pass-master',
    type: 'short',
    title: 'Conductor',
    description: 'Complete 70%+ of your passes this match',
    reward: { stat: 'pass', label: '+1 Pass' },
  },
  {
    id: 'tackle-win',
    type: 'short',
    title: 'Hard Ground',
    description: 'Win at least 2 tackles this match',
    reward: { teamChemistry: 5, label: '+5 Team Chemistry' },
  },
]

export const MEDIUM_OBJECTIVES: ObjectiveDefinition[] = [
  {
    id: 'win-streak-3',
    type: 'medium',
    title: 'On A Roll',
    description: 'Win 3 consecutive matches',
    reward: { stat: 'engine', label: '+1 Engine' },
  },
  {
    id: 'score-5-season',
    type: 'medium',
    title: 'Five And Counting',
    description: 'Score 5 goals this season',
    reward: { stat: 'strike', label: '+1 Strike' },
  },
  {
    id: 'unbeaten-5',
    type: 'medium',
    title: 'Unbreakable',
    description: 'Go 5 matches without a defeat',
    reward: { stat: 'graft', label: '+1 Graft' },
  },
  {
    id: 'high-chemistry',
    type: 'medium',
    title: 'Band of Brothers',
    description: 'Reach 80+ team chemistry',
    reward: { stat: 'vibes', label: '+1 Vibes' },
  },
]

export const LONG_OBJECTIVES: ObjectiveDefinition[] = [
  {
    id: 'finish-top-2',
    type: 'long',
    title: 'Going Up',
    description: 'Finish in the top 2 (promotion zone)',
    reward: { stat: 'pace', label: '+1 Pace' },
  },
  {
    id: 'win-the-cup',
    type: 'long',
    title: 'Tankard Glory',
    description: 'Win the Sunday Tankard',
    reward: { stat: 'head', label: '+1 Head' },
  },
  {
    id: 'reach-cup-final',
    type: 'long',
    title: 'Final Day',
    description: 'Reach the Tankard final',
    reward: { confidence: 15, label: '+15 Confidence' },
  },
  {
    id: 'finish-top-half',
    type: 'long',
    title: 'Mid-Table Comfort',
    description: 'Finish in the top half of the table',
    reward: { stat: 'pass', label: '+1 Pass' },
  },
  {
    id: 'survive-relegation',
    type: 'long',
    title: 'Great Escape',
    description: 'Avoid relegation when finishing below mid-table',
    reward: { stat: 'graft', label: '+1 Graft' },
  },
]

export const ALL_OBJECTIVES: ObjectiveDefinition[] = [
  ...SHORT_OBJECTIVES,
  ...MEDIUM_OBJECTIVES,
  ...LONG_OBJECTIVES,
]

export function findObjective(id: string): ObjectiveDefinition | undefined {
  return ALL_OBJECTIVES.find(o => o.id === id)
}

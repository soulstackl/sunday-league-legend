import type { Opponent } from '../types/game'

// The Tankard, the local Sunday League cup. Three rounds in the season:
// quarter-final (week 4), semi-final (week 8), final (week 15).
// Cup ties replace the league fixture that week.
export const CUP_OPPONENTS: Record<'quarter-final' | 'semi-final' | 'final', Opponent> = {
  'quarter-final': {
    id: 'cup-bramble-rovers',
    name: 'Bramble Rovers',
    difficulty: 6,
    style: 'Lower-division underdogs with nothing to lose',
    notes: 'Cup quarter-final. The Bramble lot fancy a giant-killing.',
  },
  'semi-final': {
    id: 'cup-hop-and-anchor',
    name: 'Hop and Anchor FC',
    difficulty: 8,
    style: 'Two divisions above, properly drilled',
    notes: 'Cup semi-final. They have already done the double on you in friendlies.',
  },
  final: {
    id: 'cup-magpie-tavern',
    name: 'Magpie Tavern',
    difficulty: 9,
    style: 'Cup specialists, three Tankards in the last decade',
    notes: 'Cup final at the County Ground. Career-defining stuff.',
  },
}

export const CUP_WEEKS: Record<number, 'quarter-final' | 'semi-final' | 'final'> = {
  4: 'quarter-final',
  8: 'semi-final',
  15: 'final',
}

export function cupRoundLabel(round: 'quarter-final' | 'semi-final' | 'final'): string {
  if (round === 'quarter-final') return 'Tankard Quarter-Final'
  if (round === 'semi-final') return 'Tankard Semi-Final'
  return 'Tankard Final'
}

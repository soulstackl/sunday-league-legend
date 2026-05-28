import type { Archetype } from '../types/game'

export const ARCHETYPES: Archetype[] = [
  {
    id: 'unit',
    name: 'The Unit',
    stats: { touch: 10, strike: 14, pass: 9, engine: 11, graft: 13, head: 16, pace: 8, vibes: 9 },
    traits: ['Aerial Threat', 'Hold-Up Artist'],
    description:
      "You're built like a garden shed and about as subtle. Headers, hold-up play and the occasional crunching tackle are your bread and butter. Sharp turns are someone else's problem.",
  },
  {
    id: 'winger',
    name: 'The Winger',
    stats: { touch: 15, strike: 11, pass: 11, engine: 12, graft: 8, head: 7, pace: 17, vibes: 11 },
    traits: ['Electric Pace', 'Ball Magnet'],
    description:
      'Quick, skilful, occasionally infuriating. You can beat three men and then lose it to the corner flag. Defensively you\'re basically a suggestion.',
  },
  {
    id: 'organiser',
    name: 'The Midfield Organiser',
    stats: { touch: 12, strike: 10, pass: 15, engine: 14, graft: 12, head: 11, pace: 10, vibes: 13 },
    traits: ['Vocal Leader', 'Engine Room'],
    description:
      'You see the game two seconds before everyone else and communicate it loudly enough that everyone knows. Less explosive than the other two, more reliable than any of them.',
  },
]

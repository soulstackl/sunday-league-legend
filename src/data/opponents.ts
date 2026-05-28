import type { Opponent } from '../types/game'

export const OPPONENTS: Opponent[] = [
  { id: 'anchor-athletic',    name: 'Anchor Athletic',      difficulty: 7, style: 'Physical, set-piece heavy',          notes: 'Your main rivals. Extra chaos card when playing them.' },
  { id: 'swan-fc',            name: 'Swan FC',              difficulty: 5, style: 'Pacy wingers, quick counter',         notes: 'Young squad, inconsistent.' },
  { id: 'royal-oak-rovers',   name: 'Royal Oak Rovers',     difficulty: 6, style: 'Well-organised, hard to break down',  notes: 'Their keeper is exceptional.' },
  { id: 'wanderers-fc',       name: 'Wanderers FC',         difficulty: 4, style: 'Long ball merchants',                 notes: 'Bottom half regular but always competitive.' },
  { id: 'village-united',     name: 'Village United',       difficulty: 3, style: 'Friendly but limited',               notes: 'Part-time squad, easy early fixture.' },
  { id: 'crown-fc',           name: 'Crown FC',             difficulty: 8, style: 'Former semi-pros, technically gifted', notes: 'Hardest team in the league.' },
  { id: 'market-athletic',    name: 'Market Athletic',      difficulty: 5, style: 'High pressing, tires in second half', notes: 'Strong start, fade late.' },
  { id: 'ferryman-fc',        name: 'Ferryman FC',          difficulty: 6, style: 'Dirty. Properly dirty.',              notes: 'Ref always has his hands full.' },
  { id: 'locomotive-sports',  name: 'Locomotive Sports',    difficulty: 7, style: 'Corporate team, matching kit, genuinely good', notes: 'Annoying to lose to.' },
  { id: 'rising-sun-fc',      name: 'Rising Sun FC',        difficulty: 4, style: 'Chaotic, unpredictable',              notes: 'Could beat anyone, could also lose 8-0.' },
  { id: 'civic-park-rangers', name: 'Civic Park Rangers',   difficulty: 6, style: 'Experienced veterans, slow but smart', notes: "They've won this league three times." },
  { id: 'crossroads-utd',     name: 'Crossroads United',    difficulty: 5, style: 'Technical midfield, weak at the back', notes: 'Mid-table certainty.' },
]

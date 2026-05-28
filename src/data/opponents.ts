import type { Opponent } from '../types/game'

// Tier 3 (entry tier): Sunday League Division Three
export const TIER_3_OPPONENTS: Opponent[] = [
  { id: 'anchor-athletic',    name: 'Anchor Athletic',      difficulty: 7, style: 'Physical, set-piece heavy',          notes: 'Your main rivals. Extra chaos card when playing them.' },
  { id: 'swan-fc',            name: 'Swan FC',              difficulty: 5, style: 'Pacy wingers, quick counter',         notes: 'Young squad, inconsistent.' },
  { id: 'royal-oak-rovers',   name: 'Royal Oak Rovers',     difficulty: 6, style: 'Well-organised, hard to break down',  notes: 'Their keeper is exceptional.' },
  { id: 'wanderers-fc',       name: 'Wanderers FC',         difficulty: 4, style: 'Long ball merchants',                 notes: 'Bottom half regular but always competitive.' },
  { id: 'village-united',     name: 'Village United',       difficulty: 3, style: 'Friendly but limited',                notes: 'Part-time squad, easy early fixture.' },
  { id: 'crown-fc',           name: 'Crown FC',             difficulty: 8, style: 'Former semi-pros, technically gifted', notes: 'Hardest team in the league.' },
  { id: 'market-athletic',    name: 'Market Athletic',      difficulty: 5, style: 'High pressing, tires in second half', notes: 'Strong start, fade late.' },
  { id: 'ferryman-fc',        name: 'Ferryman FC',          difficulty: 6, style: 'Dirty. Properly dirty.',              notes: 'Ref always has his hands full.' },
  { id: 'locomotive-sports',  name: 'Locomotive Sports',    difficulty: 7, style: 'Corporate team, matching kit, genuinely good', notes: 'Annoying to lose to.' },
  { id: 'rising-sun-fc',      name: 'Rising Sun FC',        difficulty: 4, style: 'Chaotic, unpredictable',              notes: 'Could beat anyone, could also lose 8-0.' },
  { id: 'civic-park-rangers', name: 'Civic Park Rangers',   difficulty: 6, style: 'Experienced veterans, slow but smart', notes: "They've won this league three times." },
  { id: 'crossroads-utd',     name: 'Crossroads United',    difficulty: 5, style: 'Technical midfield, weak at the back', notes: 'Mid-table certainty.' },
]

// Tier 2: Sunday League Division Two (promoted up)
export const TIER_2_OPPONENTS: Opponent[] = [
  { id: 'oakwood-rangers',    name: 'Oakwood Rangers',      difficulty: 7, style: 'Disciplined, defensive backbone',     notes: 'Hard to score against.' },
  { id: 'red-lion-fc',        name: 'Red Lion FC',          difficulty: 6, style: 'Direct, target-man focused',          notes: 'Old-school long ball.' },
  { id: 'parkside-utd',       name: 'Parkside United',      difficulty: 8, style: 'Technical, fluid passing',             notes: 'Best passers in the division.' },
  { id: 'kingsway-athletic',  name: 'Kingsway Athletic',    difficulty: 7, style: 'Physical and pacey',                   notes: 'Will out-run you if you let them.' },
  { id: 'queens-arms-fc',     name: 'Queens Arms FC',       difficulty: 6, style: 'Counter-attack specialists',           notes: 'Lethal on the break.' },
  { id: 'westbridge-utd',     name: 'Westbridge United',    difficulty: 8, style: 'Former Northern League side',          notes: 'Genuine pedigree, watch out.' },
  { id: 'forge-fc',           name: 'Forge FC',             difficulty: 6, style: 'Steel town grit',                      notes: 'Will not stop running.' },
  { id: 'spencers-arms',      name: 'Spencers Arms',        difficulty: 5, style: 'Sloppy but creative',                  notes: 'Either brilliant or a shambles.' },
  { id: 'harbour-fc',         name: 'Harbour FC',           difficulty: 7, style: 'Set-piece machine',                    notes: 'Their corners are a nightmare.' },
  { id: 'eastfield-rovers',   name: 'Eastfield Rovers',     difficulty: 6, style: 'Veteran-heavy, smart positioning',     notes: 'Average age: 38.' },
  { id: 'mariners-fc',        name: 'Mariners FC',          difficulty: 5, style: 'High line, high risk',                 notes: 'Exploit the space behind.' },
  { id: 'thorn-tree-fc',      name: 'Thorn Tree FC',        difficulty: 7, style: 'Tough, no-nonsense',                   notes: 'Earned promotion last year.' },
]

// Tier 1: Sunday League Premier Division
export const TIER_1_OPPONENTS: Opponent[] = [
  { id: 'phoenix-utd',         name: 'Phoenix United',       difficulty: 8, style: 'Aggressive press, brutal transitions', notes: 'Reigning champions.' },
  { id: 'castle-park-fc',      name: 'Castle Park FC',       difficulty: 9, style: 'Ex-academy lads, properly drilled',   notes: 'Half their lads played semi-pro.' },
  { id: 'royal-george',        name: 'Royal George',         difficulty: 8, style: 'Possession football',                 notes: 'Will keep the ball for forty minutes.' },
  { id: 'old-mill-fc',         name: 'Old Mill FC',          difficulty: 8, style: 'Long ball, target man',               notes: 'Six-foot-four striker. Be warned.' },
  { id: 'avenue-rangers',      name: 'Avenue Rangers',       difficulty: 7, style: 'Fluid 4-3-3',                         notes: 'Move the ball brilliantly.' },
  { id: 'tradesmen-fc',        name: 'Tradesmen FC',         difficulty: 9, style: 'Hardest team in three divisions',     notes: 'Even the warm-ups are violent.' },
  { id: 'highbury-village',    name: 'Highbury Village',     difficulty: 7, style: 'Patient build-up',                    notes: 'Frustrate you out of the game.' },
  { id: 'pier-head-athletic',  name: 'Pier Head Athletic',   difficulty: 8, style: 'Pace and power',                      notes: 'Will overload your full-backs.' },
  { id: 'crown-and-anchor',    name: 'Crown and Anchor',     difficulty: 8, style: 'Set-piece masters',                   notes: 'Their delivery is genuinely top-tier.' },
  { id: 'cathedral-rovers',    name: 'Cathedral Rovers',     difficulty: 7, style: 'Direct, no nonsense',                 notes: 'Old-fashioned but effective.' },
  { id: 'bridgegate-fc',       name: 'Bridgegate FC',        difficulty: 9, style: 'Total football imitators',            notes: 'Genuinely good. Annoyingly so.' },
  { id: 'station-arms-utd',    name: 'Station Arms United',  difficulty: 8, style: 'Counter-attack on a knife edge',      notes: 'Hit you on the break every time.' },
]

export function getLeagueOpponents(tier: 1 | 2 | 3): Opponent[] {
  if (tier === 1) return TIER_1_OPPONENTS
  if (tier === 2) return TIER_2_OPPONENTS
  return TIER_3_OPPONENTS
}

export const TIER_NAMES: Record<1 | 2 | 3, string> = {
  1: 'Premier Division',
  2: 'Division Two',
  3: 'Division Three',
}

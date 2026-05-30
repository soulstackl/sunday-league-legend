export interface AchievementDefinition {
  id: string
  title: string
  description: string
  emoji: string
}

export const ACHIEVEMENTS: AchievementDefinition[] = [
  // First-time milestones
  { id: 'first-match',    title: 'Off The Bench',      description: 'Play your first match.',                        emoji: '👟' },
  { id: 'first-win',      title: 'First Three Points', description: 'Win your first match.',                         emoji: '✅' },
  { id: 'first-goal',     title: 'Scenes At The Rec',  description: 'Score your first goal.',                        emoji: '⚽' },

  // Scoring
  { id: 'brace',          title: 'Two For The Road',   description: 'Score 2+ goals in a single match.',             emoji: '🔥' },
  { id: 'hat-trick',      title: 'Match Ball',         description: 'Score 3+ goals in a single match.',             emoji: '🎩' },
  { id: 'top-scorer',     title: 'Boot Room Legend',   description: 'Score 10+ goals in a single season.',           emoji: '👢' },

  // Ratings & performance
  { id: 'perfect-10',     title: 'Maradona Of The Rec',description: 'Earn a 10/10 match rating.',                   emoji: '💎' },
  { id: 'consistent',     title: 'Week In Week Out',   description: 'Rate 7+ in five consecutive matches.',          emoji: '📈' },

  // Match results
  { id: 'big-win',        title: 'Route One Football', description: 'Win by 3+ goals.',                             emoji: '🏋️' },
  { id: 'unbeaten-run',   title: 'Unbeaten',           description: 'Go 5 matches without losing.',                  emoji: '🛡️' },

  // Cup glory
  { id: 'cup-finalist',   title: 'Cup Final Day',      description: 'Reach the Tankard final.',                     emoji: '🥈' },
  { id: 'cup-winner',     title: 'Tankard Champion',   description: 'Win the Sunday Tankard.',                       emoji: '🏆' },

  // Season outcomes
  { id: 'promoted',       title: 'Going Up',           description: 'Earn promotion to a higher division.',          emoji: '⬆️' },
  { id: 'relegated',      title: 'We Go Again',        description: 'Suffer relegation. Character building.',        emoji: '⬇️' },

  // Team & social
  { id: 'team-player',    title: 'One Of The Lads',    description: 'Reach 80+ team chemistry.',                    emoji: '🤝' },
  { id: 'gaffer-trust',   title: 'Pete\'s Favourite',  description: 'Reach 90+ manager trust.',                     emoji: '👔' },
  { id: 'local-legend',   title: 'Local Legend',       description: 'Reach 75+ local fame.',                        emoji: '🌟' },

  // Longevity
  { id: 'veteran',        title: 'Veteran',            description: 'Play 3 or more seasons.',                      emoji: '📅' },
  { id: 'chaos-survivor', title: 'Chaos Merchant',     description: 'Survive 3+ chaos cards in a single match.',    emoji: '🃏' },
]

export function findAchievement(id: string): AchievementDefinition | undefined {
  return ACHIEVEMENTS.find(a => a.id === id)
}

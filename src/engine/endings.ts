import type { SaveState, Ending } from '../types/game'
import { ENDINGS } from '../data/endings'
import { buildStandings, ourLeaguePosition, resolvePromotionRelegation } from './league'

export function resolveCareerEnding(store: SaveState): Ending {
  const standings = buildStandings(store.season.aiTable, store.season.tier, store.season.results)
  const position = ourLeaguePosition(standings)
  const promo = resolvePromotionRelegation(position, standings.length, store.season.tier)
  const points = standings.find(r => r.isUs)?.points ?? 0
  const goals = store.season.results.reduce((acc, r) => acc + (r.stats?.goals ?? 0), 0)
  const trust = store.player.states.managerTrust
  const refRep = store.player.states.refereeRep
  const cupWon = store.season.cupWon
  const cupFinalLost = store.season.results.some(r => r.competition === 'cup' && r.cupRound === 'final' && !r.cupWin)
  const archetype = store.player.archetype

  const find = (id: string): Ending => ENDINGS.find(e => e.id === id) ?? ENDINGS[0]

  if (cupWon && promo.movement === 'promoted') return find('saviour')
  if (cupWon) return find('club-legend')
  if (cupFinalLost) return find('cup-bottler')
  if (refRep < 25) return find('testimonial')
  if (archetype === 'winger' && goals >= 6) return find('cantona')
  if (promo.movement === 'promoted') return find('club-legend')
  if (goals >= 8) return find('coulda-gone-pro')
  if (trust >= 80 && points >= 18) return find('pub-hero')
  if (promo.movement === 'relegated') return find('one-season-wonder')
  return find('pub-hero')
}

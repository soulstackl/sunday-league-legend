import { describe, expect, it } from 'vitest'
import { resolveCareerEnding } from '../endings'
import type { SaveState } from '../../types/game'
import { initialSaveState } from '../../store/initial-state'
import { deepClone } from '../../store/persistence'
import { initialTable } from '../league'

function makeStore(overrides: Partial<SaveState> = {}): SaveState {
  const s = deepClone(initialSaveState)
  s.season.aiTable = initialTable(3)
  return { ...s, ...overrides }
}

describe('resolveCareerEnding', () => {
  it('returns saviour when cup is won and team is promoted', () => {
    const store = makeStore()
    store.season.cupWon = true
    // Finish top with wins to trigger promotion
    for (let i = 0; i < 12; i++) {
      store.season.results.push({
        week: i + 1,
        competition: 'league',
        ourGoals: 3,
        theirGoals: 0,
        rating: 8,
        opponentId: `opp-${i}`,
        stats: { shots: 5, goals: 2, passes: 20, passSuccess: 16, tackles: 3, tackleSuccess: 2 },
      })
    }
    const ending = resolveCareerEnding(store)
    expect(ending.id).toBe('saviour')
  })

  it('returns club-legend when cup is won without promotion', () => {
    const store = makeStore()
    store.season.cupWon = true
    // Stay mid-table so no promotion
    const ending = resolveCareerEnding(store)
    expect(ending.id).toBe('club-legend')
  })

  it('returns cup-bottler when reaching the final and losing', () => {
    const store = makeStore()
    store.season.results.push({
      week: 15,
      competition: 'cup',
      ourGoals: 0,
      theirGoals: 1,
      rating: 6,
      opponentId: 'cup-magpie-tavern',
      cupRound: 'final',
      cupExit: true,
      cupWin: false,
      stats: { shots: 2, goals: 0, passes: 10, passSuccess: 7, tackles: 4, tackleSuccess: 3 },
    })
    const ending = resolveCareerEnding(store)
    expect(ending.id).toBe('cup-bottler')
  })

  it('returns testimonial when referee reputation is very low', () => {
    const store = makeStore()
    store.player.states.refereeRep = 10
    const ending = resolveCareerEnding(store)
    expect(ending.id).toBe('testimonial')
  })

  it('returns cantona for a winger with 6+ goals', () => {
    const store = makeStore()
    store.player.archetype = 'winger'
    for (let i = 0; i < 6; i++) {
      store.season.results.push({
        week: i + 1,
        competition: 'league',
        ourGoals: 1,
        theirGoals: 0,
        rating: 8,
        opponentId: `opp-${i}`,
        stats: { shots: 3, goals: 1, passes: 10, passSuccess: 8, tackles: 2, tackleSuccess: 2 },
      })
    }
    const ending = resolveCareerEnding(store)
    expect(ending.id).toBe('cantona')
  })

  it('always returns an ending with a non-empty title and text', () => {
    const store = makeStore()
    const ending = resolveCareerEnding(store)
    expect(ending.title.length).toBeGreaterThan(0)
    expect(ending.text.length).toBeGreaterThan(0)
  })

  it('returns aerial-titan for a Unit with elite head and goals', () => {
    const store = makeStore()
    store.player.archetype = 'unit'
    store.player.stats.head = 18
    for (let i = 0; i < 4; i++) {
      store.season.results.push({
        week: i + 1,
        competition: 'league',
        ourGoals: 1,
        theirGoals: 0,
        rating: 7,
        opponentId: `opp-${i}`,
        stats: { shots: 2, goals: 1, passes: 5, passSuccess: 4, tackles: 1, tackleSuccess: 1 },
      })
    }
    expect(resolveCareerEnding(store).id).toBe('aerial-titan')
  })

  it('returns gaffer-in-waiting for an Organiser with high trust and passing', () => {
    const store = makeStore()
    store.player.archetype = 'organiser'
    store.player.states.managerTrust = 90
    store.player.stats.pass = 17
    expect(resolveCareerEnding(store).id).toBe('gaffer-in-waiting')
  })

  it('returns local-hero for a Builder with two seasons under their belt', () => {
    const store = makeStore()
    store.player.job = 'builder'
    store.season.number = 2
    expect(resolveCareerEnding(store).id).toBe('local-hero')
  })
})

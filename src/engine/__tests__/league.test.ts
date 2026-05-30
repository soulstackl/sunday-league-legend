import { describe, expect, it } from 'vitest'
import { initialTable, advanceAiTable, buildStandings, ourLeaguePosition, resolvePromotionRelegation } from '../league'
import type { MatchResult } from '../../types/game'

describe('league engine', () => {
  it('initialises a table with one row per opponent in the tier', () => {
    const table = initialTable(3)
    expect(table.length).toBeGreaterThan(0)
    expect(table.every(r => r.played === 0 && r.points === 0)).toBe(true)
  })

  it('advances the table deterministically with the same seed', () => {
    const a = advanceAiTable(initialTable(3), 3, 0, 123)
    const b = advanceAiTable(initialTable(3), 3, 0, 123)
    expect(a).toEqual(b)
  })

  it('plays a balanced full season where every club plays the same number of games', () => {
    let table = initialTable(3)
    const n = table.length
    for (let round = 0; round < n; round++) {
      table = advanceAiTable(table, 3, round, 999)
    }
    // Every club features in every round, so all play the same number of games.
    const counts = new Set(table.map(r => r.played))
    expect(counts.size).toBe(1)
    expect(table.every(r => r.played === n)).toBe(true)
  })

  it('does not park the last club at home every round (home/away balance)', () => {
    // Round 0 and the wrap-around round (n-1) share the same pairings; with the
    // home/away parity fix the wrap-around is the reverse fixture, not an identical
    // replay, so the two rounds must produce different records.
    const n = initialTable(3).length
    const round0 = advanceAiTable(initialTable(3), 3, 0, 555)
    const wrap = advanceAiTable(initialTable(3), 3, n - 1, 555)
    expect(wrap).not.toEqual(round0)
  })

  it('builds standings with our team included and sorted by points', () => {
    const table = advanceAiTable(initialTable(3), 3, 0, 50)
    const results: MatchResult[] = [
      {
        week: 1, competition: 'league', ourGoals: 3, theirGoals: 1, rating: 8,
        opponentId: 'anchor-athletic',
        stats: { shots: 5, goals: 3, passes: 30, passSuccess: 25, tackles: 4, tackleSuccess: 3 },
      },
    ]
    const rows = buildStandings(table, 3, results)
    const us = rows.find(r => r.isUs)
    expect(us).toBeTruthy()
    expect(us?.points).toBe(3)
    expect(us?.goalsFor).toBe(3)
    expect(us?.goalsAgainst).toBe(1)
    expect(ourLeaguePosition(rows)).toBeGreaterThan(0)
  })

  it('promotes from tier 2 to tier 1 when finishing in the top two', () => {
    const promo = resolvePromotionRelegation(1, 13, 2)
    expect(promo.movement).toBe('promoted')
    expect(promo.newTier).toBe(1)
  })

  it('relegates from tier 3 stays as tier 3 (no fourth division)', () => {
    const promo = resolvePromotionRelegation(13, 13, 3)
    expect(promo.movement).toBe('stayed')
    expect(promo.newTier).toBe(3)
  })

  it('keeps mid-table teams in the same tier', () => {
    const promo = resolvePromotionRelegation(6, 13, 2)
    expect(promo.movement).toBe('stayed')
    expect(promo.newTier).toBe(2)
  })
})

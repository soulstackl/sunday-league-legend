import { describe, expect, it } from 'vitest'
import { getFixture, TOTAL_WEEKS } from '../schedule'

describe('schedule', () => {
  it('returns a cup fixture on weeks 4, 8 and 15 when the cup is alive', () => {
    expect(getFixture(4, 3, false)?.kind).toBe('cup')
    expect(getFixture(8, 3, false)?.kind).toBe('cup')
    expect(getFixture(15, 3, false)?.kind).toBe('cup')
  })

  it('falls back to a league-style fixture on cup weeks once the cup is exited', () => {
    const fx = getFixture(4, 3, true)
    expect(fx?.kind).toBe('league')
  })

  it('returns null beyond the total season length', () => {
    expect(getFixture(TOTAL_WEEKS + 1, 3, false)).toBeNull()
    expect(getFixture(0, 3, false)).toBeNull()
  })

  it('maps weeks 1-3 to league fixtures for any tier', () => {
    expect(getFixture(1, 1, false)?.kind).toBe('league')
    expect(getFixture(2, 2, false)?.kind).toBe('league')
    expect(getFixture(3, 3, false)?.kind).toBe('league')
  })
})

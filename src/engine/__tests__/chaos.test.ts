import { describe, expect, it } from 'vitest'
import { getChaosModifiers } from '../chaos'
import type { ChaosCard } from '../../types/game'

const card = (id: string, type = 'Weather'): ChaosCard => ({
  id, type, title: id, desc: '', effects: '', tip: '',
})

describe('getChaosModifiers', () => {
  it('returns zero modifiers for no cards', () => {
    const mods = getChaosModifiers([])
    expect(mods.accuracyPenalty).toBe(0)
    expect(mods.powerPenalty).toBe(0)
    expect(mods.keeperBonus).toBe(0)
  })

  it('applies rain accuracy and power penalties', () => {
    const mods = getChaosModifiers([card('rain')])
    expect(mods.accuracyPenalty).toBeGreaterThan(0)
    expect(mods.powerPenalty).toBeGreaterThan(0)
  })

  it('sunshine reduces keeper save rating (negative bonus)', () => {
    const mods = getChaosModifiers([card('sunshine')])
    expect(mods.keeperBonus).toBeLessThan(0)
  })

  it('clamps accumulated penalties to a sensible range', () => {
    const mods = getChaosModifiers([
      card('rain'), card('frozen'), card('fog'), card('hail'), card('mudbox'), card('double'),
    ])
    expect(mods.accuracyPenalty).toBeLessThanOrEqual(0.3)
    expect(mods.powerPenalty).toBeLessThanOrEqual(0.25)
  })

  it('horses card gives an accuracy boost (negative penalty)', () => {
    const mods = getChaosModifiers([card('horses', 'Work/Life')])
    expect(mods.accuracyPenalty).toBeLessThan(0)
  })
})

import { describe, expect, it } from 'vitest'
import { mulberry32, poissonSample } from '../rng'

describe('mulberry32', () => {
  it('produces deterministic sequences for the same seed', () => {
    const a = mulberry32(42)
    const b = mulberry32(42)
    for (let i = 0; i < 10; i++) expect(a()).toEqual(b())
  })

  it('produces different sequences for different seeds', () => {
    const a = mulberry32(1)
    const b = mulberry32(2)
    const samplesA = Array.from({ length: 5 }, () => a())
    const samplesB = Array.from({ length: 5 }, () => b())
    expect(samplesA).not.toEqual(samplesB)
  })

  it('returns values in [0, 1)', () => {
    const r = mulberry32(123)
    for (let i = 0; i < 100; i++) {
      const v = r()
      expect(v).toBeGreaterThanOrEqual(0)
      expect(v).toBeLessThan(1)
    }
  })
})

describe('poissonSample', () => {
  it('returns non-negative integers', () => {
    const r = mulberry32(7)
    for (let i = 0; i < 20; i++) {
      const k = poissonSample(2.5, r)
      expect(k).toBeGreaterThanOrEqual(0)
      expect(Number.isInteger(k)).toBe(true)
    }
  })

  it('approximates the lambda mean across many samples', () => {
    const r = mulberry32(99)
    const samples = Array.from({ length: 2000 }, () => poissonSample(2, r))
    const mean = samples.reduce((acc, v) => acc + v, 0) / samples.length
    expect(mean).toBeGreaterThan(1.6)
    expect(mean).toBeLessThan(2.4)
  })
})

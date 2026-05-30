import { describe, expect, it } from 'vitest'
import { calculateTeamStrength, simulateMatch } from '../match'
import type { PlayerStates, Opponent } from '../../types/game'
import { mulberry32 } from '../rng'

const baseStates: PlayerStates = {
  form: 0,
  fitness: 100,
  fatigue: 0,
  confidence: 50,
  injuryRisk: 0,
  injuryWeeksRemaining: 0,
  managerTrust: 50,
  teamChemistry: 50,
  localFame: 0,
  refereeRep: 50,
}

const opponent: Opponent = {
  id: 'test-opp',
  name: 'Test FC',
  difficulty: 5,
  style: 'Balanced',
  notes: '',
}

describe('calculateTeamStrength', () => {
  it('returns the neutral baseline when all states are at 50', () => {
    const strength = calculateTeamStrength(baseStates)
    expect(strength).toBeCloseTo(5, 5)
  })

  it('increases strength when chemistry, trust, and confidence are high', () => {
    const highStates: PlayerStates = { ...baseStates, teamChemistry: 100, managerTrust: 100, confidence: 100 }
    expect(calculateTeamStrength(highStates)).toBeGreaterThan(calculateTeamStrength(baseStates))
  })

  it('decreases strength when chemistry, trust, and confidence are low', () => {
    const lowStates: PlayerStates = { ...baseStates, teamChemistry: 0, managerTrust: 0, confidence: 0 }
    expect(calculateTeamStrength(lowStates)).toBeLessThan(calculateTeamStrength(baseStates))
  })

  it('never returns below 1', () => {
    const worstStates: PlayerStates = { ...baseStates, teamChemistry: 0, managerTrust: 0, confidence: 0 }
    expect(calculateTeamStrength(worstStates)).toBeGreaterThanOrEqual(1)
  })
})

describe('simulateMatch', () => {
  it('returns non-negative integer goals for both teams', () => {
    const rng = mulberry32(42)
    const result = simulateMatch([], baseStates, [], opponent, rng)
    expect(result.ourGoals).toBeGreaterThanOrEqual(0)
    expect(result.theirGoals).toBeGreaterThanOrEqual(0)
    expect(Number.isInteger(result.ourGoals)).toBe(true)
    expect(Number.isInteger(result.theirGoals)).toBe(true)
  })

  it('is deterministic for the same seed', () => {
    const rngA = mulberry32(99)
    const rngB = mulberry32(99)
    const a = simulateMatch([], baseStates, [], opponent, rngA)
    const b = simulateMatch([], baseStates, [], opponent, rngB)
    expect(a.ourGoals).toBe(b.ourGoals)
    expect(a.theirGoals).toBe(b.theirGoals)
  })

  it('a highly successful player performance pushes xG up', () => {
    const rng = mulberry32(7)
    const goodMoments = Array.from({ length: 5 }, () => ({ value: 1.0 }))
    const result = simulateMatch(goodMoments, baseStates, [], opponent, rng)
    expect(result.ourxG).toBeGreaterThan(0)
  })

  it('a very hard opponent reduces our xG advantage vs average', () => {
    const rngA = mulberry32(11)
    const rngB = mulberry32(11)
    const hardOpp: Opponent = { ...opponent, difficulty: 9 }
    const resultEasy = simulateMatch([], baseStates, [], opponent, rngA)
    const resultHard = simulateMatch([], baseStates, [], hardOpp, rngB)
    expect(resultHard.theirxG!).toBeGreaterThan(resultEasy.theirxG!)
  })

  it('a positive chaos modifier improves our xG', () => {
    const rngA = mulberry32(55)
    const rngB = mulberry32(55)
    const noCards = simulateMatch([], baseStates, [], opponent, rngA)
    const withBoost = simulateMatch([], baseStates, [{ teamStrengthMod: 2 }], opponent, rngB)
    expect(withBoost.ourxG!).toBeGreaterThan(noCards.ourxG!)
  })
})

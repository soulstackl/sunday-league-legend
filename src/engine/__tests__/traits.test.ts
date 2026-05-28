import { describe, expect, it } from 'vitest'
import {
  TRAIT_REGISTRY,
  getMomentAccuracyBonus,
  getExtraMatchMoments,
  getTrainingExtraStat,
  getPubFatigueReduction,
  getPubHangoverImmune,
  getTackleEngineBonus,
  getOvertimeFatigueReduction,
  getPaceRecoveryBonus,
  aggregateWeeklyTick,
  applyWeeklyTraitTick,
  pickSignatureTrait,
} from '../traits'
import { initialSaveState } from '../../store/initial-state'
import { deepClone } from '../../store/persistence'

describe('TRAIT_REGISTRY', () => {
  it('covers every archetype and job trait shipped in data files', () => {
    const expected = [
      'Aerial Threat', 'Hold-Up Artist',
      'Electric Pace', 'Ball Magnet',
      'Vocal Leader', 'Engine Room',
      'Early Riser', 'Iron Lungs', 'Five-a-side Regular',
      'Always Moving', 'Cheap Round', 'Flexible Schedule',
    ]
    for (const t of expected) {
      expect(TRAIT_REGISTRY[t]).toBeDefined()
    }
  })
})

describe('moment accuracy bonus', () => {
  it('sums bonuses across multiple traits', () => {
    const bonus = getMomentAccuracyBonus(['Aerial Threat', 'Electric Pace'], 'corner')
    expect(bonus).toBeCloseTo(0.10)
  })

  it('returns zero when no matching trait', () => {
    expect(getMomentAccuracyBonus(['Iron Lungs'], 'shot')).toBe(0)
  })

  it('ignores unknown traits gracefully', () => {
    expect(getMomentAccuracyBonus(['Nonsense', 'Aerial Threat'], 'header')).toBeCloseTo(0.10)
  })
})

describe('discrete trait flags', () => {
  it('detects training extra stat', () => {
    expect(getTrainingExtraStat(['Early Riser'])).toBe(true)
    expect(getTrainingExtraStat(['Iron Lungs'])).toBe(false)
  })

  it('detects pub hangover immunity', () => {
    expect(getPubHangoverImmune(['Cheap Round'])).toBe(true)
    expect(getPubHangoverImmune(['Engine Room'])).toBe(false)
  })

  it('reads pub fatigue reduction', () => {
    expect(getPubFatigueReduction(['Cheap Round'])).toBe(6)
    expect(getPubFatigueReduction([])).toBe(0)
  })

  it('reads overtime fatigue reduction', () => {
    expect(getOvertimeFatigueReduction(['Flexible Schedule'])).toBe(4)
  })

  it('reads tackle engine bonus', () => {
    expect(getTackleEngineBonus(['Always Moving'])).toBeCloseTo(0.08)
  })

  it('reads pace recovery bonus', () => {
    expect(getPaceRecoveryBonus(['Electric Pace'])).toBeCloseTo(0.15)
  })

  it('reads extra match moments', () => {
    expect(getExtraMatchMoments(['Ball Magnet'])).toBe(1)
    expect(getExtraMatchMoments(['Engine Room'])).toBe(0)
  })
})

describe('aggregateWeeklyTick', () => {
  it('sums weekly tick deltas across traits', () => {
    const delta = aggregateWeeklyTick(['Vocal Leader', 'Engine Room', 'Iron Lungs'])
    expect(delta.teamChemistry).toBe(1)
    expect(delta.fatigue).toBe(-2)
    expect(delta.fitness).toBe(2)
  })

  it('returns zeroes for an empty trait list', () => {
    const delta = aggregateWeeklyTick([])
    expect(delta).toEqual({ fatigue: 0, fitness: 0, teamChemistry: 0, confidence: 0 })
  })
})

describe('applyWeeklyTraitTick', () => {
  it('mutates the player state and clamps to bounds', () => {
    const s = deepClone(initialSaveState)
    s.player.traits = ['Iron Lungs', 'Engine Room', 'Vocal Leader']
    s.player.states.fitness = 99
    s.player.states.fatigue = 1
    s.player.states.teamChemistry = 50
    applyWeeklyTraitTick(s)
    expect(s.player.states.fitness).toBe(100)
    expect(s.player.states.fatigue).toBe(0)
    expect(s.player.states.teamChemistry).toBe(51)
  })
})

describe('pickSignatureTrait', () => {
  it('prefers an archetype trait when one is present', () => {
    expect(pickSignatureTrait(['Iron Lungs', 'Aerial Threat'])).toBe('Aerial Threat')
  })

  it('falls back to the first trait if no archetype trait exists', () => {
    expect(pickSignatureTrait(['Iron Lungs'])).toBe('Iron Lungs')
  })

  it('returns undefined for an empty trait list', () => {
    expect(pickSignatureTrait([])).toBeUndefined()
  })
})

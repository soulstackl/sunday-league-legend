import { describe, expect, it } from 'vitest'
import { applyJobWeeklyTick } from '../jobs-weekly'
import { initialSaveState } from '../../store/initial-state'
import { deepClone } from '../../store/persistence'

function makeStateWithJob(jobId: string, week: number) {
  const s = deepClone(initialSaveState)
  s.player.job = jobId
  s.season.week = week
  return s
}

describe('applyJobWeeklyTick', () => {
  it('is a no-op for an unrecognised job', () => {
    const s = makeStateWithJob('astronaut', 4)
    const before = JSON.stringify(s)
    applyJobWeeklyTick(s)
    expect(JSON.stringify(s)).toBe(before)
  })

  it('is a no-op for week 1', () => {
    const s = makeStateWithJob('builder', 1)
    const before = JSON.stringify(s)
    applyJobWeeklyTick(s)
    expect(JSON.stringify(s)).toBe(before)
  })

  it('fires the builder long-shift on week 4', () => {
    const s = makeStateWithJob('builder', 4)
    const baseFatigue = s.player.states.fatigue
    const baseConfidence = s.player.states.confidence
    applyJobWeeklyTick(s)
    expect(s.player.states.fatigue).toBe(baseFatigue + 5)
    expect(s.player.states.confidence).toBe(baseConfidence + 3)
    expect(s.groupChatLog.length).toBe(1)
  })

  it('fires nurse night-shift fitness drop on a multiple of three', () => {
    const s = makeStateWithJob('nurse', 6)
    const baseFitness = s.player.states.fitness
    applyJobWeeklyTick(s)
    expect(s.player.states.fitness).toBe(baseFitness - 10)
  })

  it('clamps stat changes to legal bounds', () => {
    const s = makeStateWithJob('student', 6)
    s.player.stats.vibes = 1
    applyJobWeeklyTick(s)
    expect(s.player.stats.vibes).toBe(1)
  })

  it('does nothing on an off week for delivery', () => {
    const s = makeStateWithJob('delivery', 5)
    const before = JSON.stringify(s)
    applyJobWeeklyTick(s)
    expect(JSON.stringify(s)).toBe(before)
  })

  it('applies self-employed confidence bump every third week', () => {
    const s = makeStateWithJob('selfemployed', 3)
    const baseConfidence = s.player.states.confidence
    applyJobWeeklyTick(s)
    expect(s.player.states.confidence).toBe(baseConfidence + 3)
  })
})

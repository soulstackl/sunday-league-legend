/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ArenaScenario, MomentType } from '../../data/arenaScenarios'
import { COMMENTARY, pickLine, type GoalQuality } from '../../data/arenaCommentary'

/**
 * Physics families. New moment types map onto the existing physics paths
 * so the arena simulation stays compact while the catalogue grows.
 */
export type PhysicsType =
  | 'shot' | 'pass' | 'touch' | 'tackle'
  | 'header' | 'penalty' | 'freekick' | 'corner'

const PHYSICS_MAP: Record<MomentType, PhysicsType> = {
  shot: 'shot',
  pass: 'pass',
  touch: 'touch',
  tackle: 'tackle',
  header: 'header',
  penalty: 'penalty',
  freekick: 'freekick',
  corner: 'corner',

  // New types map onto an existing family with their own tuning + copy.
  volley: 'header',
  oneVone: 'shot',
  tapIn: 'touch',
  cutback: 'pass',
  longRange: 'shot',
  block: 'tackle',
  clearance: 'shot',
  goallineClearance: 'tackle',
  throwIn: 'pass',
  nutmeg: 'pass',
  skillMove: 'tackle',
  panenka: 'penalty',
  rabona: 'pass',
  bicycle: 'header',
  keeperSave: 'tackle',
}

export function getPhysicsType(scenario: ArenaScenario): PhysicsType {
  return PHYSICS_MAP[scenario.type]
}

export function isShotPhysics(p: PhysicsType): boolean {
  return p === 'shot' || p === 'penalty' || p === 'freekick' || p === 'header'
}

export function isPassPhysics(p: PhysicsType): boolean {
  return p === 'pass' || p === 'corner'
}

function pickRange(range?: [number, number], fallback?: number): number {
  if (range) return range[0] + Math.random() * (range[1] - range[0])
  return fallback ?? 0
}

export interface ResolvedSetup {
  ball: {
    x: number; y: number; z: number;
    vx: number; vy: number; vz: number;
    active: boolean;
  }
  actors: any[]
  wall?: { count: 2 | 3 | 4 | 5; xCentre: number; y: number; jumpsOnCommand: boolean }
  visualHint?: string
  chainHint?: MomentType
}

const NAME_FALLBACKS = ['Gav', 'Callum', 'Big Taz', 'Skinny Liam']

export function applyScenarioSetup(scenario: ArenaScenario): ResolvedSetup {
  const s = scenario.setup
  const ball = {
    x: s.ball?.fixedX ?? pickRange(s.ball?.xRange, 200),
    y: s.ball?.fixedY ?? pickRange(s.ball?.yRange, 320),
    z: s.ball?.z ?? 0,
    vx: s.ball?.vx ?? 0,
    vy: s.ball?.vy ?? 0,
    vz: s.ball?.vz ?? 0,
    active: !!s.ball?.incomingFromSide,
  }

  const actors: any[] = (s.actors || []).map((a, i) => {
    const out: any = {
      type: a.role,
      name: a.name ?? (a.role === 'teammate' ? NAME_FALLBACKS[i % NAME_FALLBACKS.length] : undefined),
      x: a.fixedX ?? pickRange(a.xRange, 200),
      y: a.fixedY ?? pickRange(a.yRange, 150),
      vx: a.vx ?? 0,
      vy: a.vy ?? 0,
      radius: a.radius ?? (a.role === 'defender' ? 15 : 13),
      z: 0,
      jumping: false,
      jumpVz: 0,
    }
    if (a.role === 'attacker') {
      out.hasBall = true
    }
    return out
  })

  return {
    ball,
    actors,
    wall: s.wall ? {
      count: s.wall.count,
      xCentre: s.wall.xCentre ?? 195,
      y: s.wall.y ?? 150,
      jumpsOnCommand: s.wall.jumpsOnCommand ?? true,
    } : undefined,
    visualHint: s.visualHint,
    chainHint: s.chainHint,
  }
}

/**
 * Expand the wall spec into defender actors with the right spacing.
 */
export function buildWallActors(wall: { count: number; xCentre: number; y: number }): any[] {
  const spacing = 35
  const start = wall.xCentre - ((wall.count - 1) * spacing) / 2
  const arr: any[] = []
  for (let i = 0; i < wall.count; i++) {
    arr.push({
      type: 'defender',
      x: start + i * spacing,
      y: wall.y,
      vx: 0,
      radius: 15,
      z: 0,
      jumping: false,
      jumpVz: 0,
      isWall: true,
    })
  }
  return arr
}

export type OutcomeKey =
  | 'goal' | 'success'
  | 'saved' | 'woodwork' | 'crossbar' | 'nearMiss' | 'wide'
  | 'intercepted' | 'overhit' | 'cleared'
  | 'mistimed' | 'tooEarly' | 'tooLate' | 'beaten'
  | 'poorTouch' | 'bobbled'

export function commentaryFor(
  scenario: ArenaScenario,
  outcome: OutcomeKey,
  goalQuality?: GoalQuality,
): string {
  const pack = COMMENTARY[scenario.commentaryKey]
  if (!pack) return ''
  if (outcome === 'goal') {
    const lines = (goalQuality && pack.goal[goalQuality])
      || pack.goal.standard
      || Object.values(pack.goal).flat()
    return pickLine(lines as string[]) || 'GOAL!'
  }
  switch (outcome) {
    case 'success':       return pickLine(pack.success) || 'Nicely done.'
    case 'saved':         return pickLine(pack.saved) || 'Saved by the keeper.'
    case 'woodwork':      return pickLine(pack.woodwork) || 'Off the woodwork.'
    case 'crossbar':      return pickLine(pack.crossbar) || 'Off the bar.'
    case 'nearMiss':      return pickLine(pack.nearMiss) || 'So close.'
    case 'wide':          return pickLine(pack.nearMiss) || 'Drifted wide.'
    case 'intercepted':   return pickLine(pack.intercepted) || 'Intercepted.'
    case 'overhit':       return pickLine(pack.overhit) || 'Too much on it.'
    case 'cleared':       return pickLine(pack.cleared) || 'Cleared.'
    case 'mistimed':      return pickLine(pack.mistimed) || 'Mistimed.'
    case 'tooEarly':      return pickLine(pack.tooEarly) || 'Too early.'
    case 'tooLate':       return pickLine(pack.tooLate) || 'Too late.'
    case 'beaten':        return pickLine(pack.beaten) || 'Beaten.'
    case 'poorTouch':     return pickLine(pack.poorTouch) || 'Poor touch.'
    case 'bobbled':       return pickLine(pack.bobbled) || 'Bobbled it.'
  }
  return ''
}

/**
 * Tuning helpers — pull values from scenario tuning with sane defaults.
 */
export function tuningMul(scenario: ArenaScenario, key: keyof NonNullable<ArenaScenario['tuning']>, fallback = 1): number {
  const v = scenario.tuning?.[key]
  return typeof v === 'number' ? v : fallback
}

export function tuningVal(scenario: ArenaScenario, key: keyof NonNullable<ArenaScenario['tuning']>, fallback: number): number {
  const v = scenario.tuning?.[key]
  return typeof v === 'number' ? v : fallback
}

export function tuningFlag(scenario: ArenaScenario, key: keyof NonNullable<ArenaScenario['tuning']>): boolean {
  return !!scenario.tuning?.[key]
}

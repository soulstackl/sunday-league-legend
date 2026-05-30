import type { Player, PlayerStats, ContextModifiers, ChaosCard } from '../types/game'
import type { Fixture } from './schedule'
import {
  ARENA_SCENARIOS,
  type ArenaScenario,
  type MomentType,
  type Rarity,
} from '../data/arenaScenarios'

export interface SelectionContext {
  player: Player
  fixture: Fixture
  ctx: ContextModifiers
  activeCards: ChaosCard[]
  momentum: number
  prevTypes: MomentType[]
  // Seeded RNG so a match's scenario sequence is reproducible from the save seed,
  // consistent with the rest of the engine. Falls back to Math.random if omitted.
  rng?: () => number
}

const RARITY_WEIGHT: Record<Rarity, number> = {
  common: 1.0,
  uncommon: 0.55,
  rare: 0.18,
  hero: 0.05,
}

function statsMeet(player: Player, min?: Partial<PlayerStats>): boolean {
  if (!min) return true
  for (const k of Object.keys(min) as (keyof PlayerStats)[]) {
    const required = min[k]
    if (required === undefined) continue
    if ((player.stats[k] || 0) < required) return false
  }
  return true
}

function gateAllowed(scenario: ArenaScenario, sctx: SelectionContext): boolean {
  const g = scenario.gates
  if (!g) return true

  if (!statsMeet(sctx.player, g.minStat)) return false
  if (g.minMomentum !== undefined && sctx.momentum < g.minMomentum) return false
  if (g.maxMomentum !== undefined && sctx.momentum > g.maxMomentum) return false

  if (g.fixtureKindIn && !g.fixtureKindIn.includes(sctx.fixture.kind)) return false
  if (g.cupRoundIn && (!sctx.fixture.cupRound || !g.cupRoundIn.includes(sctx.fixture.cupRound))) return false

  if (g.oppositionScouted !== undefined && g.oppositionScouted !== sctx.ctx.oppositionScouted) return false
  if (g.setPieceReady !== undefined && g.setPieceReady !== sctx.ctx.setPieceReady) return false

  const diff = sctx.fixture.opponent.difficulty || 5
  if (g.oppositionDifficultyMin !== undefined && diff < g.oppositionDifficultyMin) return false
  if (g.oppositionDifficultyMax !== undefined && diff > g.oppositionDifficultyMax) return false

  const weather = sctx.activeCards.find(c => c.type === 'Weather')?.id || 'clear'
  const pitch = sctx.activeCards.find(c => c.type === 'Pitch')?.id || 'clear'
  if (g.weatherIn && !g.weatherIn.includes(weather)) return false
  if (g.pitchIn && !g.pitchIn.includes(pitch)) return false

  if (g.prevTypeIn) {
    const last = sctx.prevTypes[sctx.prevTypes.length - 1]
    if (!last || !g.prevTypeIn.includes(last)) return false
  }

  if (g.archetypeIn && !g.archetypeIn.includes(sctx.player.archetype)) return false
  if (g.traitsAny && !g.traitsAny.some(t => sctx.player.traits.includes(t))) return false

  return true
}

function scenarioWeight(scenario: ArenaScenario, sctx: SelectionContext): number {
  let w = scenario.baseWeight * RARITY_WEIGHT[scenario.rarity]

  // Stat bias: scenarios on the player's strongest stat appear more.
  const statVal = sctx.player.stats[scenario.statKey] || 10
  w *= 1 + Math.max(-0.4, Math.min(0.6, (statVal - 10) / 18))

  // Momentum lift for hero rarities when ramping up.
  if (scenario.rarity === 'hero' && sctx.momentum > 70) w *= 1.6
  if (scenario.rarity === 'rare' && sctx.momentum > 60) w *= 1.3

  // Context: scouted opposition slightly favours pass/through-ball variants.
  if (sctx.ctx.oppositionScouted && (scenario.type === 'pass' || scenario.flavour === 'through-ball')) w *= 1.2

  // Set-piece-ready favours set pieces.
  if (sctx.ctx.setPieceReady && (scenario.type === 'freekick' || scenario.type === 'corner' || scenario.type === 'penalty')) w *= 1.25

  return w
}

function pickWeighted<T>(items: { item: T; weight: number }[], rng: () => number = Math.random): T | null {
  const total = items.reduce((s, x) => s + Math.max(0, x.weight), 0)
  if (total <= 0) return null
  let r = rng() * total
  for (const x of items) {
    r -= Math.max(0, x.weight)
    if (r <= 0) return x.item
  }
  return items[items.length - 1].item
}

function pickScenarioForType(type: MomentType, sctx: SelectionContext): ArenaScenario | null {
  const candidates = ARENA_SCENARIOS.filter(s => s.type === type && gateAllowed(s, sctx))
  if (candidates.length === 0) return null
  return pickWeighted(candidates.map(s => ({ item: s, weight: scenarioWeight(s, sctx) })), sctx.rng)
}

/**
 * Build a sequence of scenarios for the upcoming match.
 *
 * Sequence shape (4 moments for league, 5 for cup):
 *   1. Attacking moment (shot family or header)
 *   2. Build-up moment (pass family, touch, corner)
 *   3. Defensive moment (tackle, block, clearance, goalline)
 *   4. Set-piece or special (penalty, freekick, longRange, oneVone)
 *   5. (cup only) Hero or rare moment if gated, else a strong attacking moment
 */
export function buildScenarioSequence(sctx: SelectionContext): ArenaScenario[] {
  const sequence: ArenaScenario[] = []
  const pickedTypes: MomentType[] = []

  const groups: Record<string, MomentType[]> = {
    attack: ['shot', 'header', 'volley', 'tapIn', 'longRange', 'oneVone'],
    build: ['pass', 'touch', 'corner', 'cutback', 'throwIn'],
    defend: ['tackle', 'block', 'clearance', 'goallineClearance'],
    setPiece: ['penalty', 'freekick', 'panenka'],
    heroPool: ['nutmeg', 'skillMove', 'rabona', 'bicycle', 'keeperSave', 'volley'],
  }

  const ordered: { group: string; types: MomentType[] }[] = [
    { group: 'attack', types: groups.attack },
    { group: 'build', types: groups.build },
    { group: 'defend', types: groups.defend },
    { group: 'setPiece', types: [...groups.setPiece, 'longRange', 'shot'] },
  ]

  for (const slot of ordered) {
    const liveCtx: SelectionContext = { ...sctx, prevTypes: pickedTypes }
    const weightedTypes = slot.types
      .map(t => {
        const cands = ARENA_SCENARIOS.filter(s => s.type === t && gateAllowed(s, liveCtx))
        const w = cands.reduce((sum, s) => sum + scenarioWeight(s, liveCtx), 0)
        return { item: t, weight: w }
      })
      .filter(x => x.weight > 0)
    const type = pickWeighted(weightedTypes, sctx.rng)
    if (!type) continue
    const scenario = pickScenarioForType(type, liveCtx)
    if (!scenario) continue
    sequence.push(scenario)
    pickedTypes.push(scenario.type)
  }

  if (sctx.fixture.kind === 'cup') {
    const liveCtx: SelectionContext = { ...sctx, prevTypes: pickedTypes }
    const heroTypes = groups.heroPool
    const heroCandidates = ARENA_SCENARIOS.filter(s => heroTypes.includes(s.type) && gateAllowed(s, liveCtx))
    if (heroCandidates.length > 0) {
      const hero = pickWeighted(heroCandidates.map(s => ({ item: s, weight: scenarioWeight(s, liveCtx) })), sctx.rng)
      if (hero) sequence.push(hero)
    } else {
      // fallback: pick another attacking scenario
      const fallbackType = pickWeighted(groups.attack.map(t => {
        const cands = ARENA_SCENARIOS.filter(s => s.type === t && gateAllowed(s, liveCtx))
        const w = cands.reduce((sum, s) => sum + scenarioWeight(s, liveCtx), 0)
        return { item: t, weight: w }
      }).filter(x => x.weight > 0), sctx.rng)
      if (fallbackType) {
        const fallback = pickScenarioForType(fallbackType, liveCtx)
        if (fallback) sequence.push(fallback)
      }
    }
  }

  // Safety net: if any slot failed, fall back to common scenarios so the match always has moments.
  while (sequence.length < (sctx.fixture.kind === 'cup' ? 5 : 4)) {
    const fallback = ARENA_SCENARIOS.find(s => s.rarity === 'common' && !sequence.includes(s))
    if (!fallback) break
    sequence.push(fallback)
  }

  return sequence
}

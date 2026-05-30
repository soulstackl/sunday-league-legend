import type { SaveState } from '../types/game'

export const SAVE_KEY = 'sll_save_v4'
const LEGACY_SAVE_KEYS = ['sll_save_v3', 'sll_save_v2', 'sll_save_v1'] as const

export const LEGACY_KEYS = LEGACY_SAVE_KEYS

export const initialSaveState: SaveState = {
  version: 4,
  seed: 12345,
  player: {
    name: '',
    archetype: '',
    job: '',
    position: 'CM',
    stats: { touch: 10, strike: 10, pass: 10, engine: 10, graft: 10, head: 10, pace: 10, vibes: 10 },
    states: { form: 0, fitness: 100, fatigue: 0, confidence: 50, injuryRisk: 0, injuryWeeksRemaining: 0, managerTrust: 50, teamChemistry: 50, localFame: 0, refereeRep: 50 },
    traits: [],
  },
  club: 'dog-and-duck',
  season: {
    number: 1,
    tier: 3,
    week: 1,
    results: [],
    aiTable: [],
    cupExited: false,
    cupWon: false,
    nemesisOpponentId: null,
    achievements: [],
  },
  npcs: {
    pete:       { relationshipScore: 50, events: [] },
    deano:      { relationshipScore: 50, events: [] },
    gav:        { relationshipScore: 50, events: [] },
    bigtaz:     { relationshipScore: 50, events: [] },
    callum:     { relationshipScore: 50, events: [] },
    clive:      { relationshipScore: 40, events: [] },
    shaz:       { relationshipScore: 50, events: [] },
    dazza:      { relationshipScore: 50, events: [] },
    garyNephew: { relationshipScore: 50, events: [] },
    bev:        { relationshipScore: 55, events: [] },
  },
  careerEvents: [],
  groupChatLog: [],
  chaosCardHistory: [],
  hallOfFame: [],
  settings: {
    reducedMotion: false,
    soundEnabled: true,
    textSize: 'normal',
    inputSensitivity: 'normal',
  },
  subplots: [],
  contextModifiers: {
    oppositionScouted: false,
    setPieceReady: false,
    hangoverPending: false,
  },
  objectives: {
    short: null,
    medium: null,
    long: null,
    completedThisSeason: [],
  },
}

import type { SaveState } from '../types/game'

export const SAVE_KEY = 'sll_save_v5'
const LEGACY_SAVE_KEYS = ['sll_save_v4', 'sll_save_v3', 'sll_save_v2', 'sll_save_v1'] as const

export const LEGACY_KEYS = LEGACY_SAVE_KEYS

// Cap on the persisted career-event history so a long career cannot grow the save
// without bound. A separate monotonic counter (careerEventCount) is used for RNG
// seeding so trimming this array does not affect determinism.
export const MAX_CAREER_EVENTS = 200

// Cap on stored daily-challenge results (a rolling local history / leaderboard).
export const MAX_DAILY_HISTORY = 60

export const initialSaveState: SaveState = {
  version: 5,
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
  careerEventCount: 0,
  groupChatLog: [],
  chaosCardHistory: [],
  hallOfFame: [],
  settings: {
    reducedMotion: false,
    soundEnabled: true,
    textSize: 'normal',
    inputSensitivity: 'normal',
    difficulty: 'normal',
    inputMode: 'drag',
    tutorialSeen: false,
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
  dailyChallenge: {
    history: [],
  },
}

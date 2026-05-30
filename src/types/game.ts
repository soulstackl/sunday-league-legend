export interface PlayerStats {
  touch: number
  strike: number
  pass: number
  engine: number
  graft: number
  head: number
  pace: number
  vibes: number
}

export type StatKey = keyof PlayerStats

export interface PlayerStates {
  form: number
  fitness: number
  fatigue: number
  confidence: number
  injuryRisk: number
  managerTrust: number
  teamChemistry: number
  localFame: number
  refereeRep: number
}

export interface Player {
  name: string
  archetype: string
  job: string
  position: string
  stats: PlayerStats
  states: PlayerStates
  traits: string[]
}

export interface NPC {
  id: string
  name: string
  role: string
  position: string | null
  avatar: string
  bg: string
  strength: string
  flaw: string
  temperament: string
  storyArc?: string
  catchphrases: string[]
}

export interface Archetype {
  id: string
  name: string
  stats: PlayerStats
  traits: string[]
  description: string
}

export interface StatModifier {
  touch?: number
  strike?: number
  pass?: number
  engine?: number
  graft?: number
  head?: number
  pace?: number
  vibes?: number
}

export interface Job {
  id: string
  name: string
  modifier: StatModifier
  trait: string
  text: string
}

export interface Opponent {
  id: string
  name: string
  difficulty: number
  style: string
  notes: string
}

export interface Ending {
  id: string
  title: string
  text: string
}

export interface MidweekActionEffects {
  fatigue?: number
  fitness?: number
  managerTrust?: number
  confidence?: number
  teamChemistry?: number
  vibes?: number
  injuryRisk?: number
  statBoost?: 'random'
  statBoostOptions?: StatKey[]
  targetRelationship?: number
  hangoverRisk?: boolean
  contextModifier?: 'opposition-scouted' | 'set-piece-ready'
  specialModifier?: string
  strike?: number
}

export interface MidweekAction {
  id: string
  name: string
  icon: string
  description: string
  effects: MidweekActionEffects
  groupChatTrigger: string | null
  npcTarget?: boolean
  statChoice?: boolean
}

export interface ChaosCardChoice {
  text: string
  effect: {
    relationship?: Record<string, number>
    confidence?: number
    refereeRep?: number
    teamChemistry?: number
    strike?: number
    vibes?: number
    fatigue?: number
  }
  outcome: string
}

export interface ChaosCard {
  id: string
  type: string
  title: string
  desc: string
  effects: string
  tip: string
  teamStrengthMod?: number
  choices?: ChaosCardChoice[]
}

export interface ChatChoice {
  text: string
  effect: {
    relationship?: Record<string, number>
    vibes?: number
    confidence?: number
  }
}

export interface ChatMessage {
  sender: string
  text: string
  time: string
  choices?: ChatChoice[]
}

export interface NpcState {
  relationshipScore: number
  events: string[]
}

export interface MatchStats {
  shots: number
  goals: number
  passes: number
  passSuccess: number
  tackles: number
  tackleSuccess: number
}

export interface MatchResult {
  week: number
  competition: 'league' | 'cup'
  ourGoals: number
  theirGoals: number
  rating: number
  stats: MatchStats
  opponentId: string
  cupRound?: 'quarter-final' | 'semi-final' | 'final'
  cupExit?: boolean
  cupWin?: boolean
}

export interface CareerEvent {
  type: string
  action?: string
  week?: number
  result?: string
  pts?: number
  subplotId?: string
  outcome?: string
}

export interface AiTeamRecord {
  opponentId: string
  played: number
  won: number
  drawn: number
  lost: number
  goalsFor: number
  goalsAgainst: number
  points: number
}

export interface Season {
  number: number
  tier: 1 | 2 | 3
  week: number
  results: MatchResult[]
  aiTable: AiTeamRecord[]
  cupExited: boolean
  cupWon: boolean
  nemesisOpponentId: string | null
  achievements: string[]
}

export interface ObjectiveState {
  short: string | null
  medium: string | null
  long: string | null
  completedThisSeason: string[]
}

export interface SubplotProgress {
  id: string
  stage: number
  startedWeek: number
  resolved: boolean
  outcome?: string
}

export interface ContextModifiers {
  oppositionScouted: boolean
  setPieceReady: boolean
  hangoverPending: boolean
}

export interface GameSettings {
  reducedMotion: boolean
  soundEnabled: boolean
  textSize: 'small' | 'normal' | 'large'
  inputSensitivity: 'low' | 'normal' | 'high'
}

export interface HallOfFameEntry {
  name: string
  archetype: string
  job: string
  title: string
  date: number
  seasons: number
  goals: number
  points: number
  cupWon: boolean
  finalTier: 1 | 2 | 3
  signatureTrait?: string
  achievements: string[]
}

export interface SaveState {
  version: number
  seed: number
  savedAt?: number
  player: Player
  club: string
  season: Season
  npcs: Record<string, NpcState>
  careerEvents: CareerEvent[]
  groupChatLog: ChatMessage[]
  chaosCardHistory: { id: string; week: number }[]
  hallOfFame: HallOfFameEntry[]
  settings: GameSettings
  subplots: SubplotProgress[]
  contextModifiers: ContextModifiers
  objectives: ObjectiveState
}

export interface MatchReport {
  ourGoals: number
  theirGoals: number
  ourxG?: number
  theirxG?: number
  rating?: number
  stats?: MatchStats
}

export interface MomentResult {
  type?: string
  value?: number
  outcome: string
  details?: string
  clampedValue?: number
}

export interface DragVector {
  accuracy: number
  power: number
}

export interface ChaosModifiers {
  accuracyPenalty: number
  powerPenalty: number
  keeperBonus: number
}

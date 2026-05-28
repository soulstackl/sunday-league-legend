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
  statBoost?: string
  statBoostOptions?: string[]
  targetRelationship?: number
  hangoverRisk?: boolean
  contextModifier?: string
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

export interface MatchResult {
  week: number
  ourGoals: number
  theirGoals: number
  rating: number
  stats: MatchStats
}

export interface MatchStats {
  shots: number
  goals: number
  passes: number
  passSuccess: number
  tackles: number
  tackleSuccess: number
}

export interface CareerEvent {
  type: string
  action?: string
  week?: number
  result?: string
  pts?: number
}

export interface Season {
  week: number
  fixtures: string[]
  results: MatchResult[]
  leagueTable: unknown[]
}

export interface GameSettings {
  reducedMotion: boolean
  soundEnabled: boolean
  textSize: string
}

export interface HallOfFameEntry {
  name: string
  archetype: string
  title: string
  date: number
}

export interface SaveState {
  version: number
  seed: number
  rngState: number
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

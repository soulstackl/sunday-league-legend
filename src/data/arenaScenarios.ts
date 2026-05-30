import type { StatKey, PlayerStats } from '../types/game'

export type MomentType =
  | 'shot' | 'pass' | 'touch' | 'tackle' | 'header'
  | 'penalty' | 'freekick' | 'corner'
  | 'volley' | 'oneVone' | 'tapIn' | 'cutback' | 'longRange'
  | 'block' | 'clearance' | 'goallineClearance' | 'throwIn'
  | 'nutmeg' | 'skillMove' | 'panenka' | 'rabona' | 'bicycle' | 'keeperSave'

export type Rarity = 'common' | 'uncommon' | 'rare' | 'hero'
export type DistanceBand = 'close' | 'mid' | 'long'
export type SideOfPitch = 'left' | 'centre' | 'right'

export interface ArenaGate {
  minStat?: Partial<PlayerStats>
  minMomentum?: number
  maxMomentum?: number
  weatherIn?: string[]
  pitchIn?: string[]
  oppositionDifficultyMin?: number
  oppositionDifficultyMax?: number
  oppositionScouted?: boolean
  setPieceReady?: boolean
  fixtureKindIn?: ('league' | 'cup')[]
  cupRoundIn?: ('quarter-final' | 'semi-final' | 'final')[]
  prevTypeIn?: MomentType[]
  archetypeIn?: string[]
  traitsAny?: string[]
}

export interface ScenarioActorSpec {
  role: 'teammate' | 'defender' | 'attacker' | 'keeper'
  name?: string
  xRange?: [number, number]
  yRange?: [number, number]
  fixedX?: number
  fixedY?: number
  vx?: number
  vy?: number
  radius?: number
}

export interface ScenarioOption {
  id: string
  label: string
  hint: string
  resultType: MomentType
}

export interface ArenaScenarioSetup {
  ball?: {
    xRange?: [number, number]
    yRange?: [number, number]
    fixedX?: number
    fixedY?: number
    z?: number
    vx?: number
    vy?: number
    vz?: number
    incomingFromSide?: boolean
  }
  actors?: ScenarioActorSpec[]
  wall?: { count: 2 | 3 | 4 | 5; xCentre?: number; y?: number; jumpsOnCommand?: boolean }
  distanceBand?: DistanceBand
  side?: SideOfPitch
  visualHint?: string
  prePromptOptions?: ScenarioOption[]
  chainHint?: MomentType
}

export interface ArenaScenarioTuning {
  powerCapMul?: number
  powerFloorMul?: number
  curlMul?: number
  goalWidthFactor?: number
  keeperReachMul?: number
  keeperReactionMul?: number
  keeperReadMul?: number
  touchWindowMul?: number
  touchSpeedMul?: number
  tackleTimingSpeedMul?: number
  tackleWindowLo?: number
  tackleWindowHi?: number
  headerZoneLo?: number
  headerZoneHi?: number
  headerSweetLo?: number
  headerSweetHi?: number
  passConeRad?: number
  postOddsMul?: number
  defenderJumpRise?: number
  resolveDelayMs?: number
  panenkaMode?: boolean
  driveOnlyMode?: boolean
  weakFoot?: boolean
  spinShot?: boolean
}

export type CommentaryKey =
  | 'shotOpenPlay' | 'shotLongRange' | 'shotCloseRange' | 'shotWeakFoot'
  | 'shotFirstTime' | 'shotOnTheTurn' | 'shotNarrowAngle'
  | 'passThroughBall' | 'passSwitch' | 'passSquare' | 'passKiller' | 'passTrivela'
  | 'touchControl' | 'touchChest' | 'touchSpin' | 'touchCushion'
  | 'tackleSlide' | 'tackleBlockBody' | 'tackleShoulder' | 'tackleInterception'
  | 'headerAttacking' | 'headerBackPost' | 'headerDefensive' | 'headerFlickOn' | 'headerBullet'
  | 'penaltyStandard' | 'penaltyPanenka' | 'penaltyDownMiddle'
  | 'freekickDirect' | 'freekickLong' | 'freekickNarrow' | 'freekickShort' | 'freekickBullet'
  | 'cornerInswinger' | 'cornerOutswinger' | 'cornerShort' | 'cornerFarPost' | 'cornerNearPost'
  | 'volleyHalf' | 'volleyScissor' | 'oneVone' | 'tapIn' | 'cutback' | 'longRange'
  | 'block' | 'clearance' | 'goallineClearance' | 'throwInLong'
  | 'nutmeg' | 'skillMove' | 'rabona' | 'bicycle' | 'keeperSave'

export interface ArenaScenario {
  id: string
  type: MomentType
  flavour: string
  title: string
  instruction: string
  statKey: StatKey
  statLabel: string
  rarity: Rarity
  baseWeight: number
  gates?: ArenaGate
  setup: ArenaScenarioSetup
  tuning?: ArenaScenarioTuning
  commentaryKey: CommentaryKey
}

// ---------------------------------------------------------------------------
// CATALOGUE
// Each entry is a flavour of a moment type with distinct geometry, tuning,
// and copy. Selection logic in src/engine/arenaSelection.ts narrows by gates
// and weights, so populating broadly here yields more variety per match.
// ---------------------------------------------------------------------------

export const ARENA_SCENARIOS: ArenaScenario[] = [
  // ============ SHOT (open play) ============
  {
    id: 'shot-mid-central',
    type: 'shot', flavour: 'mid-central',
    title: 'OPEN PLAY STRIKE',
    instruction: 'Drag back, curve the path for spin. Release to shoot.',
    statKey: 'strike', statLabel: 'STRIKE',
    rarity: 'common', baseWeight: 10,
    setup: { ball: { xRange: [180, 220], yRange: [285, 320] }, distanceBand: 'mid', side: 'centre',
             actors: [{ role: 'defender', xRange: [160, 240], fixedY: 120, vx: 1.5, radius: 15 }] },
    commentaryKey: 'shotOpenPlay',
  },
  {
    id: 'shot-close-range',
    type: 'shot', flavour: 'close',
    title: 'POACHER\'S CHANCE',
    instruction: 'Inside the six-yard box. Pick a corner, keep it down.',
    statKey: 'strike', statLabel: 'STRIKE',
    rarity: 'common', baseWeight: 6,
    setup: { ball: { xRange: [175, 225], yRange: [55, 85] }, distanceBand: 'close', side: 'centre',
             actors: [
               { role: 'defender', fixedX: 165, fixedY: 50, vx: 0, radius: 14 },
               { role: 'defender', fixedX: 235, fixedY: 50, vx: 0, radius: 14 },
             ] },
    tuning: { powerCapMul: 0.85, keeperReachMul: 1.15, keeperReactionMul: 0.7 },
    commentaryKey: 'shotCloseRange',
  },
  {
    id: 'shot-narrow-left',
    type: 'shot', flavour: 'narrow-left',
    title: 'TIGHT ANGLE',
    instruction: 'Near the byline on the left. Try the near post or square it back.',
    statKey: 'strike', statLabel: 'STRIKE',
    rarity: 'uncommon', baseWeight: 4,
    setup: { ball: { xRange: [80, 110], yRange: [80, 110] }, distanceBand: 'close', side: 'left',
             actors: [{ role: 'defender', fixedX: 130, fixedY: 80, radius: 14 }] },
    tuning: { goalWidthFactor: 0.7, curlMul: 1.2 },
    commentaryKey: 'shotNarrowAngle',
  },
  {
    id: 'shot-narrow-right',
    type: 'shot', flavour: 'narrow-right',
    title: 'TIGHT ANGLE',
    instruction: 'Hugging the right touchline. Hit the near post or look for the cutback.',
    statKey: 'strike', statLabel: 'STRIKE',
    rarity: 'uncommon', baseWeight: 4,
    setup: { ball: { xRange: [290, 320], yRange: [80, 110] }, distanceBand: 'close', side: 'right',
             actors: [{ role: 'defender', fixedX: 270, fixedY: 80, radius: 14 }] },
    tuning: { goalWidthFactor: 0.7, curlMul: 1.2 },
    commentaryKey: 'shotNarrowAngle',
  },
  {
    id: 'shot-weak-foot',
    type: 'shot', flavour: 'weak-foot',
    title: 'WEAK FOOT EFFORT',
    instruction: 'On your wrong foot. Less power, less curl, more luck.',
    statKey: 'strike', statLabel: 'STRIKE',
    rarity: 'uncommon', baseWeight: 3,
    setup: { ball: { xRange: [160, 240], yRange: [220, 270] }, distanceBand: 'mid' },
    tuning: { powerCapMul: 0.75, curlMul: 0.5, weakFoot: true },
    commentaryKey: 'shotWeakFoot',
  },
  {
    id: 'shot-on-the-turn',
    type: 'shot', flavour: 'turn',
    title: 'ON THE TURN',
    instruction: 'Spin and hit. Less power, but the keeper is wrong-footed.',
    statKey: 'strike', statLabel: 'STRIKE',
    rarity: 'uncommon', baseWeight: 3,
    gates: { minStat: { touch: 11 } },
    setup: { ball: { xRange: [170, 230], yRange: [180, 230] }, distanceBand: 'mid' },
    tuning: { powerCapMul: 0.8, keeperReactionMul: 1.4, keeperReadMul: 0.7, spinShot: true },
    commentaryKey: 'shotOnTheTurn',
  },
  {
    id: 'shot-first-time',
    type: 'shot', flavour: 'first-time',
    title: 'FIRST-TIME STRIKE',
    instruction: 'Ball is rolling in. Time it, hit it sweet.',
    statKey: 'strike', statLabel: 'STRIKE',
    rarity: 'uncommon', baseWeight: 3,
    setup: { ball: { fixedX: 50, fixedY: 200, vx: 3.0, vy: 0, z: 0, incomingFromSide: true }, distanceBand: 'mid' },
    tuning: { powerCapMul: 1.1, keeperReactionMul: 0.85 },
    commentaryKey: 'shotFirstTime',
  },

  // ============ LONG RANGE (Phase 2 new type, but lives in shot family) ============
  {
    id: 'longrange-thunderbastard',
    type: 'longRange', flavour: 'thunderbastard',
    title: 'FROM RANGE',
    instruction: '30 yards out. Lace it. Pray.',
    statKey: 'strike', statLabel: 'STRIKE',
    rarity: 'uncommon', baseWeight: 4,
    gates: { minStat: { strike: 11 } },
    setup: { ball: { xRange: [170, 230], yRange: [340, 380] }, distanceBand: 'long', side: 'centre',
             actors: [
               { role: 'defender', xRange: [160, 240], fixedY: 200, vx: 1.0, radius: 15 },
               { role: 'defender', xRange: [160, 240], fixedY: 250, vx: 1.0, radius: 15 },
             ] },
    tuning: { goalWidthFactor: 0.6, keeperReachMul: 1.25, keeperReadMul: 1.1, postOddsMul: 1.4, powerCapMul: 1.15 },
    commentaryKey: 'longRange',
  },

  // ============ PASS ============
  {
    id: 'pass-simple',
    type: 'pass', flavour: 'simple',
    title: 'CLINICAL PASS',
    instruction: 'Drag toward your man. Curve the path to bend the ball.',
    statKey: 'pass', statLabel: 'PASS',
    rarity: 'common', baseWeight: 10,
    setup: { ball: { fixedX: 200, fixedY: 350 },
             actors: [
               { role: 'teammate', name: 'Gav', xRange: [70, 110], yRange: [130, 170] },
               { role: 'teammate', name: 'Callum', xRange: [270, 310], yRange: [160, 200] },
               { role: 'defender', xRange: [170, 230], yRange: [200, 230], vx: 1.0, radius: 15 },
               { role: 'defender', xRange: [220, 260], yRange: [170, 200], vx: 1.0, radius: 15 },
             ] },
    commentaryKey: 'passSquare',
  },
  {
    id: 'pass-through-ball',
    type: 'pass', flavour: 'through-ball',
    title: 'KILLER THROUGH BALL',
    instruction: 'Single runner. Thread the needle past the back line.',
    statKey: 'pass', statLabel: 'PASS',
    rarity: 'uncommon', baseWeight: 5,
    gates: { minStat: { pass: 11 } },
    setup: { ball: { fixedX: 200, fixedY: 320 },
             actors: [
               { role: 'teammate', name: 'Gav', xRange: [180, 220], yRange: [80, 110] },
               { role: 'defender', fixedX: 160, fixedY: 160, vx: 0.6, radius: 14 },
               { role: 'defender', fixedX: 200, fixedY: 160, vx: 0.6, radius: 14 },
               { role: 'defender', fixedX: 240, fixedY: 160, vx: 0.6, radius: 14 },
             ] },
    tuning: { passConeRad: Math.PI / 12 },
    commentaryKey: 'passThroughBall',
  },
  {
    id: 'pass-switch',
    type: 'pass', flavour: 'switch-play',
    title: 'SWITCH IT',
    instruction: 'Big diagonal. Pick out the runner on the far side.',
    statKey: 'pass', statLabel: 'PASS',
    rarity: 'uncommon', baseWeight: 4,
    setup: { ball: { fixedX: 80, fixedY: 300 },
             actors: [
               { role: 'teammate', name: 'Skinny Liam', xRange: [310, 340], yRange: [120, 160] },
               { role: 'defender', fixedX: 180, fixedY: 200, vx: 1.0, radius: 15 },
               { role: 'defender', fixedX: 230, fixedY: 240, vx: 1.0, radius: 15 },
             ] },
    tuning: { passConeRad: Math.PI / 5 },
    commentaryKey: 'passSwitch',
  },
  {
    id: 'pass-trivela',
    type: 'pass', flavour: 'trivela',
    title: 'OUTSIDE OF THE BOOT',
    instruction: 'Bend it round with the outside of your foot.',
    statKey: 'pass', statLabel: 'PASS',
    rarity: 'rare', baseWeight: 2,
    gates: { minStat: { pass: 13 }, minMomentum: 55 },
    setup: { ball: { fixedX: 200, fixedY: 340 },
             actors: [
               { role: 'teammate', name: 'Gav', xRange: [80, 110], yRange: [120, 150] },
               { role: 'defender', fixedX: 150, fixedY: 200, vx: 0.6, radius: 14 },
               { role: 'defender', fixedX: 200, fixedY: 200, vx: 0.6, radius: 14 },
               { role: 'defender', fixedX: 250, fixedY: 200, vx: 0.6, radius: 14 },
             ] },
    tuning: { curlMul: 1.6, passConeRad: Math.PI / 8 },
    commentaryKey: 'passTrivela',
  },
  {
    id: 'pass-killer',
    type: 'pass', flavour: 'killer-ball',
    title: 'KILLER BALL',
    instruction: 'One chance. Two defenders close. Find the runner.',
    statKey: 'pass', statLabel: 'PASS',
    rarity: 'rare', baseWeight: 2,
    gates: { minStat: { pass: 12 } },
    setup: { ball: { fixedX: 200, fixedY: 320 },
             actors: [
               { role: 'teammate', name: 'Skinny Liam', xRange: [160, 240], yRange: [70, 100] },
               { role: 'defender', fixedX: 170, fixedY: 190, vx: 0, radius: 16 },
               { role: 'defender', fixedX: 230, fixedY: 190, vx: 0, radius: 16 },
             ] },
    tuning: { passConeRad: Math.PI / 14 },
    commentaryKey: 'passKiller',
  },

  // ============ TOUCH ============
  {
    id: 'touch-control',
    type: 'touch', flavour: 'control',
    title: 'FIRST TOUCH',
    instruction: 'Release when the needle hits the green zone.',
    statKey: 'touch', statLabel: 'TOUCH',
    rarity: 'common', baseWeight: 10,
    setup: { ball: { fixedX: 60, fixedY: 200, z: 20, vx: 2.8, vy: 2.5, vz: 1.5, incomingFromSide: true } },
    commentaryKey: 'touchControl',
  },
  {
    id: 'touch-chest',
    type: 'touch', flavour: 'chest',
    title: 'CHEST IT DOWN',
    instruction: 'High ball, big window. Cushion it.',
    statKey: 'touch', statLabel: 'TOUCH',
    rarity: 'common', baseWeight: 4,
    setup: { ball: { fixedX: 200, fixedY: 100, z: 90, vx: 0, vy: 2.5, vz: -1.0 } },
    tuning: { touchWindowMul: 1.4, touchSpeedMul: 0.85 },
    commentaryKey: 'touchChest',
  },
  {
    id: 'touch-spin',
    type: 'touch', flavour: 'spin',
    title: 'TOUCH AND SPIN',
    instruction: 'Quick. Smaller window than usual.',
    statKey: 'touch', statLabel: 'TOUCH',
    rarity: 'uncommon', baseWeight: 3,
    gates: { minStat: { touch: 11 } },
    setup: { ball: { fixedX: 340, fixedY: 200, z: 15, vx: -3.5, vy: 2.5, vz: 1.2, incomingFromSide: true } },
    tuning: { touchWindowMul: 0.75, touchSpeedMul: 1.25 },
    commentaryKey: 'touchSpin',
  },
  {
    id: 'touch-cushion',
    type: 'touch', flavour: 'cushion',
    title: 'CUSHION IT',
    instruction: 'Soft touch into space.',
    statKey: 'touch', statLabel: 'TOUCH',
    rarity: 'common', baseWeight: 3,
    setup: { ball: { fixedX: 60, fixedY: 230, z: 30, vx: 2.4, vy: 1.5, vz: 1.0, incomingFromSide: true } },
    tuning: { touchWindowMul: 1.1, touchSpeedMul: 0.9 },
    commentaryKey: 'touchCushion',
  },

  // ============ TACKLE ============
  {
    id: 'tackle-slide',
    type: 'tackle', flavour: 'slide',
    title: 'LAST-MAN TACKLE',
    instruction: 'Swipe when the timing circle turns green.',
    statKey: 'engine', statLabel: 'ENGINE',
    rarity: 'common', baseWeight: 8,
    setup: { actors: [{ role: 'attacker', xRange: [140, 260], fixedY: -20, vy: 3.0 }] },
    commentaryKey: 'tackleSlide',
  },
  {
    id: 'tackle-block-body',
    type: 'tackle', flavour: 'block-body',
    title: 'PUT YOUR BODY ON IT',
    instruction: 'Stand him up. Wider timing window.',
    statKey: 'graft', statLabel: 'GRAFT',
    rarity: 'common', baseWeight: 4,
    setup: { actors: [{ role: 'attacker', xRange: [140, 260], fixedY: -20, vy: 2.5 }] },
    tuning: { tackleWindowLo: 0.5, tackleWindowHi: 0.85, tackleTimingSpeedMul: 0.9 },
    commentaryKey: 'tackleBlockBody',
  },
  {
    id: 'tackle-shoulder-charge',
    type: 'tackle', flavour: 'shoulder',
    title: 'SHOULDER TO SHOULDER',
    instruction: 'Lean into him. Time it right or it\'s a free kick.',
    statKey: 'graft', statLabel: 'GRAFT',
    rarity: 'uncommon', baseWeight: 3,
    setup: { actors: [{ role: 'attacker', xRange: [140, 260], fixedY: -20, vy: 2.8 }] },
    tuning: { tackleWindowLo: 0.58, tackleWindowHi: 0.74 },
    commentaryKey: 'tackleShoulder',
  },
  {
    id: 'tackle-interception',
    type: 'tackle', flavour: 'interception',
    title: 'READ THE PASS',
    instruction: 'Step in front. Reading is everything.',
    statKey: 'engine', statLabel: 'ENGINE',
    rarity: 'uncommon', baseWeight: 3,
    gates: { minStat: { engine: 11 } },
    setup: { actors: [{ role: 'attacker', xRange: [140, 260], fixedY: -20, vy: 3.4 }] },
    tuning: { tackleTimingSpeedMul: 1.15, tackleWindowLo: 0.55, tackleWindowHi: 0.78 },
    commentaryKey: 'tackleInterception',
  },

  // ============ HEADER ============
  {
    id: 'header-attacking',
    type: 'header', flavour: 'attacking',
    title: 'AERIAL THREAT',
    instruction: 'Drag when the ball enters the heading zone. Aim for goal.',
    statKey: 'head', statLabel: 'HEAD',
    rarity: 'common', baseWeight: 6,
    setup: { ball: { fixedX: 200, fixedY: 100, z: 130, vy: 0.8, vz: -1.2 } },
    commentaryKey: 'headerAttacking',
  },
  {
    id: 'header-back-post',
    type: 'header', flavour: 'back-post',
    title: 'BACK POST HEADER',
    instruction: 'Cross loops to the far post. Power it down.',
    statKey: 'head', statLabel: 'HEAD',
    rarity: 'uncommon', baseWeight: 4,
    setup: { ball: { fixedX: 270, fixedY: 110, z: 140, vy: 0.6, vz: -1.0 } },
    tuning: { headerSweetLo: 45, headerSweetHi: 90 },
    commentaryKey: 'headerBackPost',
  },
  {
    id: 'header-defensive',
    type: 'header', flavour: 'defensive',
    title: 'HEAD IT CLEAR',
    instruction: 'Get height. Get distance. Hoof it.',
    statKey: 'head', statLabel: 'HEAD',
    rarity: 'common', baseWeight: 4,
    setup: { ball: { fixedX: 200, fixedY: 320, z: 130, vy: -1.0, vz: -1.2 } },
    tuning: { headerZoneLo: 20, headerZoneHi: 120 },
    commentaryKey: 'headerDefensive',
  },
  {
    id: 'header-flick-on',
    type: 'header', flavour: 'flick-on',
    title: 'FLICK IT ON',
    instruction: 'Small window, glance it on for the runner.',
    statKey: 'head', statLabel: 'HEAD',
    rarity: 'uncommon', baseWeight: 3,
    gates: { minStat: { head: 11 } },
    setup: { ball: { fixedX: 200, fixedY: 160, z: 120, vy: -0.5, vz: -1.0 } },
    tuning: { headerSweetLo: 55, headerSweetHi: 75 },
    commentaryKey: 'headerFlickOn',
  },
  {
    id: 'header-bullet',
    type: 'header', flavour: 'bullet',
    title: 'BULLET HEADER',
    instruction: 'Power it. From the corner. Make it count.',
    statKey: 'head', statLabel: 'HEAD',
    rarity: 'rare', baseWeight: 2,
    gates: { minStat: { head: 13 } },
    setup: { ball: { fixedX: 200, fixedY: 110, z: 135, vy: 0.4, vz: -1.1 } },
    tuning: { headerSweetLo: 50, headerSweetHi: 85, powerCapMul: 1.15 },
    commentaryKey: 'headerBullet',
  },

  // ============ PENALTY ============
  {
    id: 'penalty-standard',
    type: 'penalty', flavour: 'standard',
    title: 'SPOT KICK',
    instruction: 'Pick your corner. Curve for finesse.',
    statKey: 'strike', statLabel: 'STRIKE',
    rarity: 'common', baseWeight: 10,
    setup: { ball: { fixedX: 200, fixedY: 250 } },
    commentaryKey: 'penaltyStandard',
  },
  {
    id: 'penalty-panenka',
    type: 'panenka', flavour: 'panenka',
    title: 'PANENKA',
    instruction: 'Cheeky chip down the middle. Pray he\'s gone.',
    statKey: 'strike', statLabel: 'STRIKE',
    rarity: 'hero', baseWeight: 1,
    gates: { minStat: { strike: 13, vibes: 11 }, minMomentum: 70 },
    setup: { ball: { fixedX: 200, fixedY: 250 } },
    tuning: { panenkaMode: true, powerCapMul: 0.55, curlMul: 0 },
    commentaryKey: 'penaltyPanenka',
  },
  {
    id: 'penalty-down-middle',
    type: 'penalty', flavour: 'down-middle',
    title: 'BANG IT DOWN THE MIDDLE',
    instruction: 'Just smash it. He has to commit.',
    statKey: 'strike', statLabel: 'STRIKE',
    rarity: 'uncommon', baseWeight: 2,
    setup: { ball: { fixedX: 200, fixedY: 250 } },
    tuning: { driveOnlyMode: true, powerCapMul: 1.1 },
    commentaryKey: 'penaltyDownMiddle',
  },

  // ============ FREEKICK ============
  {
    id: 'freekick-direct-25y',
    type: 'freekick', flavour: 'direct-25y',
    title: 'DEAD-BALL SPECIAL',
    instruction: 'Bend it into the corner. Watch the wall.',
    statKey: 'strike', statLabel: 'STRIKE',
    rarity: 'common', baseWeight: 6,
    setup: { ball: { fixedX: 200, fixedY: 290 }, wall: { count: 3, xCentre: 195, y: 150, jumpsOnCommand: true } },
    commentaryKey: 'freekickDirect',
  },
  {
    id: 'freekick-long-30y',
    type: 'freekick', flavour: 'long-30y',
    title: 'LONG-RANGE FREE KICK',
    instruction: '30 yards. Bigger wall. Pick your spot.',
    statKey: 'strike', statLabel: 'STRIKE',
    rarity: 'uncommon', baseWeight: 3,
    setup: { ball: { fixedX: 200, fixedY: 350 }, wall: { count: 4, xCentre: 195, y: 160, jumpsOnCommand: true } },
    tuning: { goalWidthFactor: 0.75, keeperReachMul: 1.2, powerCapMul: 1.1, curlMul: 1.1 },
    commentaryKey: 'freekickLong',
  },
  {
    id: 'freekick-narrow-angle',
    type: 'freekick', flavour: 'narrow',
    title: 'WHIP IT IN OR BEND IT?',
    instruction: 'Tight angle on the left. Bend it round or whip it across.',
    statKey: 'strike', statLabel: 'STRIKE',
    rarity: 'uncommon', baseWeight: 3,
    setup: { ball: { fixedX: 90, fixedY: 200 }, wall: { count: 2, xCentre: 130, y: 130, jumpsOnCommand: true } },
    tuning: { curlMul: 1.4, goalWidthFactor: 0.8 },
    commentaryKey: 'freekickNarrow',
  },
  {
    id: 'freekick-short',
    type: 'freekick', flavour: 'short',
    title: 'TRAINING-GROUND ROUTINE',
    instruction: 'Lay it off, then strike. Pass first to your man.',
    statKey: 'pass', statLabel: 'PASS',
    rarity: 'rare', baseWeight: 2,
    gates: { setPieceReady: true },
    setup: { ball: { fixedX: 200, fixedY: 290 },
             actors: [{ role: 'teammate', name: 'Gav', fixedX: 240, fixedY: 270 }],
             chainHint: 'shot' },
    commentaryKey: 'freekickShort',
  },
  {
    id: 'freekick-bullet',
    type: 'freekick', flavour: 'bullet',
    title: 'DRIVE IT THROUGH',
    instruction: 'Low, hard, through the wall. They\'ll jump.',
    statKey: 'strike', statLabel: 'STRIKE',
    rarity: 'uncommon', baseWeight: 3,
    setup: { ball: { fixedX: 200, fixedY: 290 }, wall: { count: 3, xCentre: 195, y: 150, jumpsOnCommand: true } },
    tuning: { driveOnlyMode: true, powerCapMul: 1.2, defenderJumpRise: 14 },
    commentaryKey: 'freekickBullet',
  },

  // ============ CORNER ============
  {
    id: 'corner-inswinger-left',
    type: 'corner', flavour: 'inswinger-left',
    title: 'INSWINGING CORNER',
    instruction: 'Whip it in toward goal.',
    statKey: 'pass', statLabel: 'PASS',
    rarity: 'common', baseWeight: 5,
    setup: { ball: { fixedX: 20, fixedY: 40 }, side: 'left',
             actors: [
               { role: 'teammate', name: 'Gav', fixedX: 180, fixedY: 110 },
               { role: 'teammate', name: 'Big Taz', fixedX: 240, fixedY: 145 },
               { role: 'defender', fixedX: 150, fixedY: 130, radius: 15 },
               { role: 'defender', fixedX: 250, fixedY: 130, radius: 15 },
             ] },
    tuning: { curlMul: 1.3 },
    commentaryKey: 'cornerInswinger',
  },
  {
    id: 'corner-outswinger-left',
    type: 'corner', flavour: 'outswinger-left',
    title: 'OUTSWINGING CORNER',
    instruction: 'Curl it away from the keeper for the late runner.',
    statKey: 'pass', statLabel: 'PASS',
    rarity: 'common', baseWeight: 4,
    setup: { ball: { fixedX: 20, fixedY: 40 }, side: 'left',
             actors: [
               { role: 'teammate', name: 'Skinny Liam', fixedX: 210, fixedY: 160 },
               { role: 'teammate', name: 'Big Taz', fixedX: 250, fixedY: 130 },
               { role: 'defender', fixedX: 170, fixedY: 120, radius: 15 },
               { role: 'defender', fixedX: 230, fixedY: 145, radius: 15 },
             ] },
    tuning: { curlMul: -1.3 },
    commentaryKey: 'cornerOutswinger',
  },
  {
    id: 'corner-inswinger-right',
    type: 'corner', flavour: 'inswinger-right',
    title: 'INSWINGING CORNER',
    instruction: 'Whip it in toward goal.',
    statKey: 'pass', statLabel: 'PASS',
    rarity: 'common', baseWeight: 5,
    setup: { ball: { fixedX: 380, fixedY: 40 }, side: 'right',
             actors: [
               { role: 'teammate', name: 'Gav', fixedX: 220, fixedY: 110 },
               { role: 'teammate', name: 'Big Taz', fixedX: 160, fixedY: 145 },
               { role: 'defender', fixedX: 250, fixedY: 130, radius: 15 },
               { role: 'defender', fixedX: 150, fixedY: 130, radius: 15 },
             ] },
    tuning: { curlMul: 1.3 },
    commentaryKey: 'cornerInswinger',
  },
  {
    id: 'corner-short',
    type: 'corner', flavour: 'short',
    title: 'SHORT CORNER',
    instruction: 'Play it short, work an angle.',
    statKey: 'pass', statLabel: 'PASS',
    rarity: 'uncommon', baseWeight: 2,
    setup: { ball: { fixedX: 20, fixedY: 40 }, side: 'left',
             actors: [
               { role: 'teammate', name: 'Skinny Liam', fixedX: 60, fixedY: 80 },
               { role: 'defender', fixedX: 90, fixedY: 60, radius: 15 },
             ], chainHint: 'cutback' },
    commentaryKey: 'cornerShort',
  },
  {
    id: 'corner-far-post',
    type: 'corner', flavour: 'far-post',
    title: 'TARGET THE BIG MAN',
    instruction: 'Aerial route one. Big Taz at the back post.',
    statKey: 'pass', statLabel: 'PASS',
    rarity: 'common', baseWeight: 3,
    setup: { ball: { fixedX: 20, fixedY: 40 }, side: 'left',
             actors: [
               { role: 'teammate', name: 'Big Taz', fixedX: 260, fixedY: 100 },
               { role: 'defender', fixedX: 230, fixedY: 120, radius: 15 },
               { role: 'defender', fixedX: 180, fixedY: 130, radius: 15 },
             ] },
    commentaryKey: 'cornerFarPost',
  },
  {
    id: 'corner-near-post-flick',
    type: 'corner', flavour: 'near-post',
    title: 'NEAR POST FLICK',
    instruction: 'Whip it in low and hard for the near-post run.',
    statKey: 'pass', statLabel: 'PASS',
    rarity: 'uncommon', baseWeight: 2,
    setup: { ball: { fixedX: 20, fixedY: 40 }, side: 'left',
             actors: [
               { role: 'teammate', name: 'Gav', fixedX: 150, fixedY: 80 },
               { role: 'defender', fixedX: 180, fixedY: 110, radius: 15 },
             ] },
    tuning: { curlMul: 1.4, powerCapMul: 1.05 },
    commentaryKey: 'cornerNearPost',
  },

  // ============ VOLLEY (Phase 2) ============
  {
    id: 'volley-half',
    type: 'volley', flavour: 'half-volley',
    title: 'HALF-VOLLEY',
    instruction: 'Ball drops. Time the strike on the bounce.',
    statKey: 'strike', statLabel: 'STRIKE',
    rarity: 'uncommon', baseWeight: 3,
    gates: { minStat: { strike: 11, touch: 10 } },
    setup: { ball: { fixedX: 200, fixedY: 220, z: 110, vz: -1.5, vy: 0 } },
    tuning: { headerZoneLo: 15, headerZoneHi: 75, headerSweetLo: 25, headerSweetHi: 55, powerCapMul: 1.1 },
    commentaryKey: 'volleyHalf',
  },
  {
    id: 'volley-scissor',
    type: 'volley', flavour: 'scissor',
    title: 'SCISSOR KICK',
    instruction: 'Acrobatic. Hero or zero.',
    statKey: 'strike', statLabel: 'STRIKE',
    rarity: 'rare', baseWeight: 1,
    gates: { minStat: { strike: 13, touch: 12 }, minMomentum: 60 },
    setup: { ball: { fixedX: 200, fixedY: 180, z: 100, vz: -1.2, vy: -0.5 } },
    tuning: { headerZoneLo: 30, headerZoneHi: 75, headerSweetLo: 45, headerSweetHi: 60, powerCapMul: 1.2 },
    commentaryKey: 'volleyScissor',
  },

  // ============ 1v1 (Phase 2) ============
  {
    id: 'one-v-one',
    type: 'oneVone', flavour: 'standard',
    title: 'ONE-ON-ONE',
    instruction: 'Just you and the keeper. Pick your finish.',
    statKey: 'strike', statLabel: 'STRIKE',
    rarity: 'uncommon', baseWeight: 4,
    setup: { ball: { fixedX: 200, fixedY: 130 } },
    tuning: { keeperReachMul: 1.3, keeperReactionMul: 0.55, goalWidthFactor: 1.15 },
    commentaryKey: 'oneVone',
  },

  // ============ TAP-IN (Phase 2) ============
  {
    id: 'tap-in',
    type: 'tapIn', flavour: 'far-post',
    title: 'TAP-IN',
    instruction: 'Cross arrives. Don\'t miss this.',
    statKey: 'touch', statLabel: 'TOUCH',
    rarity: 'uncommon', baseWeight: 3,
    gates: { prevTypeIn: ['corner', 'cutback', 'pass'] },
    setup: { ball: { fixedX: 60, fixedY: 100, z: 30, vx: 5, vy: 0.5, vz: 0.5, incomingFromSide: true } },
    tuning: { touchWindowMul: 1.6, touchSpeedMul: 0.8, keeperReachMul: 0.85 },
    commentaryKey: 'tapIn',
  },

  // ============ CUTBACK (Phase 2) ============
  {
    id: 'cutback',
    type: 'cutback', flavour: 'byline',
    title: 'CUTBACK',
    instruction: 'On the byline. Pull it back to the runner.',
    statKey: 'pass', statLabel: 'PASS',
    rarity: 'uncommon', baseWeight: 3,
    setup: { ball: { fixedX: 90, fixedY: 80 }, side: 'left',
             actors: [
               { role: 'teammate', name: 'Skinny Liam', fixedX: 200, fixedY: 200 },
               { role: 'teammate', name: 'Callum', fixedX: 235, fixedY: 175 },
               { role: 'defender', fixedX: 180, fixedY: 140, radius: 15 },
             ], chainHint: 'shot' },
    commentaryKey: 'cutback',
  },

  // ============ BLOCK (Phase 2) ============
  {
    id: 'block',
    type: 'block', flavour: 'shot-block',
    title: 'BLOCK IT!',
    instruction: 'Get in the way. Time the swipe.',
    statKey: 'graft', statLabel: 'GRAFT',
    rarity: 'uncommon', baseWeight: 3,
    setup: { actors: [{ role: 'attacker', xRange: [150, 250], fixedY: -10, vy: 2.4 }] },
    tuning: { tackleWindowLo: 0.55, tackleWindowHi: 0.82 },
    commentaryKey: 'block',
  },

  // ============ CLEARANCE (Phase 2) ============
  {
    id: 'clearance',
    type: 'clearance', flavour: 'hoof',
    title: 'CLEAR IT',
    instruction: 'Hoof it. Distance over precision.',
    statKey: 'graft', statLabel: 'GRAFT',
    rarity: 'common', baseWeight: 3,
    setup: { ball: { xRange: [160, 240], yRange: [60, 110] } },
    tuning: { powerCapMul: 1.15, curlMul: 0.3 },
    commentaryKey: 'clearance',
  },

  // ============ GOAL-LINE CLEARANCE (Phase 2) ============
  {
    id: 'goalline-clearance',
    type: 'goallineClearance', flavour: 'last-ditch',
    title: 'OFF THE LINE!',
    instruction: 'Last-ditch swipe. Tiny window.',
    statKey: 'pace', statLabel: 'PACE',
    rarity: 'rare', baseWeight: 1,
    gates: { minStat: { pace: 11 } },
    setup: { actors: [{ role: 'attacker', xRange: [170, 230], fixedY: -25, vy: 4.5 }] },
    tuning: { tackleWindowLo: 0.66, tackleWindowHi: 0.78, tackleTimingSpeedMul: 1.4 },
    commentaryKey: 'goallineClearance',
  },

  // ============ THROW-IN (Phase 2) ============
  {
    id: 'throw-in-long',
    type: 'throwIn', flavour: 'long',
    title: 'LONG THROW',
    instruction: 'Reach the box. Pick out your big man.',
    statKey: 'graft', statLabel: 'GRAFT',
    rarity: 'uncommon', baseWeight: 2,
    setup: { ball: { fixedX: 20, fixedY: 200 }, side: 'left',
             actors: [
               { role: 'teammate', name: 'Big Taz', fixedX: 200, fixedY: 120 },
               { role: 'defender', fixedX: 180, fixedY: 130, radius: 15 },
             ] },
    tuning: { powerCapMul: 1.1, curlMul: 0.2 },
    commentaryKey: 'throwInLong',
  },

  // ============ NUTMEG (Phase 3 hero) ============
  {
    id: 'nutmeg',
    type: 'nutmeg', flavour: 'classic',
    title: 'NUTMEG?!',
    instruction: 'Thread it between his legs.',
    statKey: 'touch', statLabel: 'TOUCH',
    rarity: 'hero', baseWeight: 1,
    gates: { minStat: { touch: 13 }, minMomentum: 60 },
    setup: { ball: { fixedX: 200, fixedY: 300 },
             actors: [{ role: 'defender', fixedX: 200, fixedY: 220, radius: 22 }] },
    tuning: { passConeRad: Math.PI / 36 },
    commentaryKey: 'nutmeg',
  },

  // ============ SKILL MOVE (Phase 3 hero) ============
  {
    id: 'skill-move',
    type: 'skillMove', flavour: 'stepover',
    title: 'TURN HIM INSIDE OUT',
    instruction: 'Drag right then sharply left to feint.',
    statKey: 'touch', statLabel: 'TOUCH',
    rarity: 'hero', baseWeight: 1,
    gates: { minStat: { touch: 12, pace: 11 }, minMomentum: 55 },
    setup: { ball: { fixedX: 200, fixedY: 280 },
             actors: [{ role: 'defender', fixedX: 200, fixedY: 200, radius: 18 }] },
    commentaryKey: 'skillMove',
  },

  // ============ RABONA (Phase 3 hero) ============
  {
    id: 'rabona',
    type: 'rabona', flavour: 'cross',
    title: 'RABONA',
    instruction: 'Wrap your leg round. Only the brave try this.',
    statKey: 'strike', statLabel: 'STRIKE',
    rarity: 'hero', baseWeight: 1,
    gates: { minStat: { strike: 14, vibes: 12 }, minMomentum: 75 },
    setup: { ball: { fixedX: 100, fixedY: 200 }, side: 'left',
             actors: [{ role: 'teammate', name: 'Big Taz', fixedX: 230, fixedY: 110 }] },
    tuning: { curlMul: 1.5, powerCapMul: 0.9 },
    commentaryKey: 'rabona',
  },

  // ============ BICYCLE (Phase 3 hero) ============
  {
    id: 'bicycle',
    type: 'bicycle', flavour: 'overhead',
    title: 'OVERHEAD KICK!',
    instruction: 'Back to goal. Athleticism over technique.',
    statKey: 'strike', statLabel: 'STRIKE',
    rarity: 'hero', baseWeight: 1,
    gates: { minStat: { strike: 14, head: 12 }, minMomentum: 70 },
    setup: { ball: { fixedX: 200, fixedY: 170, z: 95, vz: -1.0, vy: 0.3 } },
    tuning: { headerZoneLo: 30, headerZoneHi: 70, headerSweetLo: 45, headerSweetHi: 60, powerCapMul: 1.25 },
    commentaryKey: 'bicycle',
  },

  // ============ KEEPER SAVE (Phase 3 hero, rare swap) ============
  {
    id: 'keeper-save',
    type: 'keeperSave', flavour: 'dive',
    title: 'DEANO\'S DOWN!',
    instruction: 'You\'ve been thrown in goal. Predict the shot.',
    statKey: 'engine', statLabel: 'ENGINE',
    rarity: 'hero', baseWeight: 1,
    gates: { fixtureKindIn: ['cup'] },
    setup: { ball: { fixedX: 200, fixedY: 200 } },
    commentaryKey: 'keeperSave',
  },

  // ============ VOLLEY (additional) ============
  {
    id: 'volley-driven',
    type: 'volley', flavour: 'driven',
    title: 'DRIVEN VOLLEY',
    instruction: 'Ball drops at knee height. Drive it low and hard.',
    statKey: 'strike', statLabel: 'STRIKE',
    rarity: 'uncommon', baseWeight: 3,
    gates: { minStat: { strike: 10 } },
    setup: { ball: { fixedX: 200, fixedY: 240, z: 55, vz: -1.2, vy: 0 } },
    tuning: { headerZoneLo: 10, headerZoneHi: 55, headerSweetLo: 20, headerSweetHi: 45, powerCapMul: 1.05 },
    commentaryKey: 'volleyHalf',
  },

  // ============ 1v1 (additional) ============
  {
    id: 'one-v-one-rounding',
    type: 'oneVone', flavour: 'rounding',
    title: 'ROUND THE KEEPER',
    instruction: 'Keeper rushing out. Drag to one side and finish.',
    statKey: 'touch', statLabel: 'TOUCH',
    rarity: 'uncommon', baseWeight: 3,
    gates: { minStat: { pace: 10 } },
    setup: { ball: { fixedX: 200, fixedY: 160 },
             actors: [{ role: 'attacker', fixedX: 200, fixedY: 60, vy: 3.5, radius: 20 }] },
    tuning: { keeperReachMul: 0.75, keeperReactionMul: 0.65, goalWidthFactor: 1.2 },
    commentaryKey: 'oneVone',
  },
  {
    id: 'one-v-one-chip',
    type: 'oneVone', flavour: 'chip',
    title: 'CHIP THE KEEPER',
    instruction: 'Keeper off his line. Lift it over him.',
    statKey: 'touch', statLabel: 'TOUCH',
    rarity: 'rare', baseWeight: 1,
    gates: { minStat: { touch: 12 }, minMomentum: 50 },
    setup: { ball: { fixedX: 200, fixedY: 140 } },
    tuning: { keeperReachMul: 0.6, keeperReactionMul: 0.4, goalWidthFactor: 0.9, powerCapMul: 0.65 },
    commentaryKey: 'oneVone',
  },

  // ============ TAP-IN (additional) ============
  {
    id: 'tap-in-center',
    type: 'tapIn', flavour: 'center',
    title: 'EASY HEADER',
    instruction: 'Cross finds you unmarked at the back post. Head it down.',
    statKey: 'head', statLabel: 'HEAD',
    rarity: 'uncommon', baseWeight: 3,
    gates: { prevTypeIn: ['corner', 'cutback', 'pass'] },
    setup: { ball: { fixedX: 220, fixedY: 90, z: 45, vx: 2.5, vy: 0.4, vz: 0.3, incomingFromSide: true } },
    tuning: { touchWindowMul: 1.8, touchSpeedMul: 0.7, keeperReachMul: 0.8, headerZoneLo: 5, headerZoneHi: 70, headerSweetLo: 20, headerSweetHi: 55 },
    commentaryKey: 'tapIn',
  },
  {
    id: 'tap-in-scramble',
    type: 'tapIn', flavour: 'scramble',
    title: 'SCRAMBLE IT IN',
    instruction: 'Rebound off the keeper. Get a touch on it.',
    statKey: 'graft', statLabel: 'GRAFT',
    rarity: 'common', baseWeight: 4,
    setup: { ball: { fixedX: 165, fixedY: 70, z: 10, vx: 4, vy: 0.8, vz: 0, incomingFromSide: true } },
    tuning: { touchWindowMul: 2.0, touchSpeedMul: 1.2, keeperReachMul: 0.7 },
    commentaryKey: 'tapIn',
  },

  // ============ CUTBACK (additional) ============
  {
    id: 'cutback-right',
    type: 'cutback', flavour: 'byline-right',
    title: 'CUTBACK FROM THE RIGHT',
    instruction: 'Round the full back on the right. Cut it back across goal.',
    statKey: 'pass', statLabel: 'PASS',
    rarity: 'uncommon', baseWeight: 3,
    setup: { ball: { fixedX: 310, fixedY: 80 }, side: 'right',
             actors: [
               { role: 'teammate', name: 'Dazza',        fixedX: 200, fixedY: 195 },
               { role: 'teammate', name: 'Gav Two Yards', fixedX: 170, fixedY: 175 },
               { role: 'defender', fixedX: 220, fixedY: 140, radius: 15 },
             ], chainHint: 'shot' },
    commentaryKey: 'cutback',
  },
  {
    id: 'cutback-low-cross',
    type: 'cutback', flavour: 'driven-low',
    title: 'LOW DRIVEN CROSS',
    instruction: 'Drive it low across the six-yard box.',
    statKey: 'pass', statLabel: 'PASS',
    rarity: 'uncommon', baseWeight: 2,
    gates: { minStat: { pass: 11 } },
    setup: { ball: { fixedX: 85, fixedY: 75 }, side: 'left',
             actors: [
               { role: 'teammate', name: 'Callum', fixedX: 215, fixedY: 145 },
               { role: 'defender', fixedX: 190, fixedY: 130, radius: 14 },
             ], chainHint: 'shot' },
    tuning: { powerCapMul: 1.1, curlMul: 0.4 },
    commentaryKey: 'cutback',
  },

  // ============ LONG RANGE (additional) ============
  {
    id: 'long-range-strike',
    type: 'longRange', flavour: 'driven',
    title: 'HIT FROM DISTANCE',
    instruction: 'Thirty yards. No one is closing. Let it fly.',
    statKey: 'strike', statLabel: 'STRIKE',
    rarity: 'uncommon', baseWeight: 4,
    gates: { minStat: { strike: 11 } },
    setup: { ball: { xRange: [170, 230], yRange: [340, 380] }, distanceBand: 'long' },
    tuning: { powerCapMul: 1.2, keeperReactionMul: 0.9, postOddsMul: 1.2 },
    commentaryKey: 'longRange',
  },
  {
    id: 'long-range-dipping',
    type: 'longRange', flavour: 'dipping',
    title: 'DIPPING DRIVE',
    instruction: 'Get up and over the wall, dip under the bar.',
    statKey: 'strike', statLabel: 'STRIKE',
    rarity: 'rare', baseWeight: 1,
    gates: { minStat: { strike: 13, vibes: 10 }, minMomentum: 50 },
    setup: { ball: { xRange: [155, 245], yRange: [360, 400] }, distanceBand: 'long',
             wall: { count: 3, xCentre: 200, y: 240 } },
    tuning: { powerCapMul: 1.25, curlMul: 1.3, keeperReachMul: 0.85 },
    commentaryKey: 'longRange',
  },

  // ============ BLOCK (additional) ============
  {
    id: 'block-header',
    type: 'block', flavour: 'header-block',
    title: 'HEAD IT CLEAR!',
    instruction: 'Cross coming in. Get up and block before it reaches the striker.',
    statKey: 'head', statLabel: 'HEAD',
    rarity: 'uncommon', baseWeight: 2,
    setup: { ball: { fixedX: 200, fixedY: 100, z: 60, vz: -1.0, vy: 0.5, incomingFromSide: true } },
    tuning: { headerZoneLo: 25, headerZoneHi: 75, headerSweetLo: 40, headerSweetHi: 65 },
    commentaryKey: 'block',
  },

  // ============ CLEARANCE (additional) ============
  {
    id: 'clearance-header',
    type: 'clearance', flavour: 'headed',
    title: 'HEADED CLEARANCE',
    instruction: 'Ball dropping into the box. Win it in the air.',
    statKey: 'head', statLabel: 'HEAD',
    rarity: 'uncommon', baseWeight: 2,
    setup: { ball: { xRange: [160, 240], yRange: [60, 100], z: 70, vz: -1.1 } },
    tuning: { headerZoneLo: 20, headerZoneHi: 80, headerSweetLo: 35, headerSweetHi: 65, powerCapMul: 1.1 },
    commentaryKey: 'clearance',
  },

  // ============ GOAL-LINE CLEARANCE (additional) ============
  {
    id: 'goalline-header',
    type: 'goallineClearance', flavour: 'header',
    title: 'HEADER OFF THE LINE!',
    instruction: 'Looping ball goal-bound. Get your head on it.',
    statKey: 'head', statLabel: 'HEAD',
    rarity: 'rare', baseWeight: 1,
    gates: { minStat: { head: 11 } },
    setup: { ball: { xRange: [175, 225], fixedY: -15, z: 45, vz: -0.9 } },
    tuning: { headerZoneLo: 35, headerZoneHi: 80, headerSweetLo: 50, headerSweetHi: 70, tackleWindowLo: 0.60, tackleWindowHi: 0.82 },
    commentaryKey: 'goallineClearance',
  },

  // ============ THROW-IN (additional) ============
  {
    id: 'throw-in-short',
    type: 'throwIn', flavour: 'short',
    title: 'SHORT THROW',
    instruction: 'Quick throw to feet. Keep it simple.',
    statKey: 'pass', statLabel: 'PASS',
    rarity: 'common', baseWeight: 3,
    setup: { ball: { fixedX: 20, fixedY: 280 }, side: 'left',
             actors: [
               { role: 'teammate', name: 'Deano', fixedX: 80, fixedY: 250 },
               { role: 'defender', fixedX: 105, fixedY: 235, radius: 13 },
             ] },
    tuning: { powerCapMul: 0.7, curlMul: 0.1 },
    commentaryKey: 'throwInLong',
  },

  // ============ NUTMEG (additional) ============
  {
    id: 'nutmeg-running',
    type: 'nutmeg', flavour: 'running',
    title: 'THROUGH HIS LEGS!',
    instruction: 'Defender coming to block. Thread it through while running.',
    statKey: 'touch', statLabel: 'TOUCH',
    rarity: 'hero', baseWeight: 1,
    gates: { minStat: { touch: 12, pace: 11 }, minMomentum: 55 },
    setup: { ball: { fixedX: 175, fixedY: 260 },
             actors: [{ role: 'defender', fixedX: 200, fixedY: 180, radius: 20 }] },
    tuning: { passConeRad: Math.PI / 30 },
    commentaryKey: 'nutmeg',
  },
  {
    id: 'nutmeg-pressure',
    type: 'nutmeg', flavour: 'under-pressure',
    title: 'MEGS UNDER PRESSURE',
    instruction: 'Two defenders. Tight space. Find the gap.',
    statKey: 'touch', statLabel: 'TOUCH',
    rarity: 'hero', baseWeight: 1,
    gates: { minStat: { touch: 14 }, minMomentum: 70 },
    setup: { ball: { fixedX: 200, fixedY: 300 },
             actors: [
               { role: 'defender', fixedX: 185, fixedY: 215, radius: 19 },
               { role: 'defender', fixedX: 218, fixedY: 210, radius: 17 },
             ] },
    tuning: { passConeRad: Math.PI / 40 },
    commentaryKey: 'nutmeg',
  },

  // ============ SKILL MOVE (additional) ============
  {
    id: 'skill-move-heel',
    type: 'skillMove', flavour: 'heel-flick',
    title: 'HEEL FLICK',
    instruction: 'Back to goal. Flick it past him with your heel.',
    statKey: 'touch', statLabel: 'TOUCH',
    rarity: 'hero', baseWeight: 1,
    gates: { minStat: { touch: 13 }, minMomentum: 60 },
    setup: { ball: { fixedX: 200, fixedY: 250 },
             actors: [{ role: 'defender', fixedX: 200, fixedY: 200, radius: 18 }] },
    commentaryKey: 'skillMove',
  },
  {
    id: 'skill-move-elastico',
    type: 'skillMove', flavour: 'elastico',
    title: 'ELASTICO',
    instruction: 'Outside then snap inside. Read your own feet.',
    statKey: 'touch', statLabel: 'TOUCH',
    rarity: 'hero', baseWeight: 1,
    gates: { minStat: { touch: 14, pace: 12 }, minMomentum: 65 },
    setup: { ball: { fixedX: 200, fixedY: 270 },
             actors: [{ role: 'defender', fixedX: 200, fixedY: 195, radius: 17 }] },
    commentaryKey: 'skillMove',
  },

  // ============ RABONA (additional) ============
  {
    id: 'rabona-shot',
    type: 'rabona', flavour: 'shot',
    title: 'RABONA SHOT',
    instruction: 'Wrong foot, wrong angle, all heart.',
    statKey: 'strike', statLabel: 'STRIKE',
    rarity: 'hero', baseWeight: 1,
    gates: { minStat: { strike: 13, vibes: 13 }, minMomentum: 70 },
    setup: { ball: { fixedX: 105, fixedY: 170 }, side: 'left' },
    tuning: { curlMul: 1.6, powerCapMul: 0.85, goalWidthFactor: 0.95 },
    commentaryKey: 'rabona',
  },

  // ============ BICYCLE (additional) ============
  {
    id: 'bicycle-low',
    type: 'bicycle', flavour: 'low-overhead',
    title: 'BICYCLE KICK!',
    instruction: 'Ball dropping at chest height. Fling yourself at it.',
    statKey: 'strike', statLabel: 'STRIKE',
    rarity: 'hero', baseWeight: 1,
    gates: { minStat: { strike: 13, head: 11 }, minMomentum: 65 },
    setup: { ball: { fixedX: 200, fixedY: 185, z: 70, vz: -0.9, vy: 0.2 } },
    tuning: { headerZoneLo: 25, headerZoneHi: 68, headerSweetLo: 40, headerSweetHi: 58, powerCapMul: 1.15 },
    commentaryKey: 'bicycle',
  },

  // ============ KEEPER SAVE (additional) ============
  {
    id: 'keeper-save-penalty',
    type: 'keeperSave', flavour: 'penalty-stop',
    title: 'PENALTY SAVE!',
    instruction: 'Thrown in goal for a penalty shootout. Pick your corner.',
    statKey: 'engine', statLabel: 'ENGINE',
    rarity: 'hero', baseWeight: 1,
    gates: { fixtureKindIn: ['cup'], cupRoundIn: ['semi-final', 'final'] },
    setup: { ball: { fixedX: 200, fixedY: 200 } },
    tuning: { keeperReachMul: 1.15 },
    commentaryKey: 'keeperSave',
  },
  {
    id: 'keeper-save-header',
    type: 'keeperSave', flavour: 'header-tip',
    title: "DEANO'S DOWN!",
    instruction: 'Lace your fingers and tip it over.',
    statKey: 'head', statLabel: 'HEAD',
    rarity: 'hero', baseWeight: 1,
    gates: { fixtureKindIn: ['cup'] },
    setup: { ball: { fixedX: 200, fixedY: 150, z: 55, vz: -1.3 } },
    tuning: { headerZoneLo: 30, headerZoneHi: 85, headerSweetLo: 50, headerSweetHi: 75 },
    commentaryKey: 'keeperSave',
  },
]

export const SCENARIOS_BY_ID: Record<string, ArenaScenario> = Object.fromEntries(
  ARENA_SCENARIOS.map(s => [s.id, s]),
)

export function scenariosForType(t: MomentType): ArenaScenario[] {
  return ARENA_SCENARIOS.filter(s => s.type === t)
}

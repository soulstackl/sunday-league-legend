/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import type { SaveState, ChaosCard, MomentResult, MatchStats } from '../../types/game'
import type { Fixture } from '../../engine/schedule'
import { ScreenContainer } from '../../components/shared/ScreenContainer'
import { getChaosModifiers } from '../../engine/chaos'
import { AudioManager } from '../../audio/AudioManager'

export type ArenaMatchStats = MatchStats

interface ArenaScreenProps {
  store: SaveState
  fixture: Fixture
  activeCards: ChaosCard[]
  onCompleteMatch: (results: MomentResult[], stats: ArenaMatchStats) => void
}

const statBoost = (stat: number, neutral = 10): number =>
  Math.max(-0.4, Math.min(0.5, (stat - neutral) / 20))

const MOMENT_INFO: Record<string, { title: string; instruction: string; stat: string; statLabel: string }> = {
  shot:     { title: 'OPEN PLAY STRIKE',    instruction: 'Drag back, curve the path for spin. Release to shoot.',       stat: 'strike', statLabel: 'STRIKE' },
  pass:     { title: 'CLINICAL PASS',       instruction: 'Drag toward your man. Curve the path to bend the ball.',      stat: 'pass',   statLabel: 'PASS' },
  touch:    { title: 'FIRST TOUCH',         instruction: 'Release when the needle hits the green zone.',                 stat: 'touch',  statLabel: 'TOUCH' },
  tackle:   { title: 'LAST-MAN TACKLE',     instruction: 'Swipe when the timing circle turns green.',                   stat: 'engine', statLabel: 'ENGINE' },
  header:   { title: 'AERIAL THREAT',       instruction: 'Drag when the ball enters the heading zone. Aim for goal.',   stat: 'head',   statLabel: 'HEAD' },
  penalty:  { title: 'SPOT KICK',           instruction: 'Pick your corner. Curve for finesse.',                        stat: 'strike', statLabel: 'STRIKE' },
  freekick: { title: 'DEAD-BALL SPECIAL',   instruction: 'Bend it into the corner. Watch the wall.',                    stat: 'strike', statLabel: 'STRIKE' },
  corner:   { title: 'IN THE MIXER',        instruction: 'Whip it in. Outswing or inswing.',                            stat: 'pass',   statLabel: 'PASS' },
}

const GOAL_LINES: Record<string, string[]> = {
  topcorner: ['TOP BINS! Absolute screamer!', 'Top corner, keeper had no chance!', 'Postage stamp! What a finish!'],
  chip:      ['Chipped him! Audacious!', 'Dinked over the keeper, class!', 'Coolly chipped, pick that out!'],
  tucked:    ['Tucked away! Cold-blooded.', 'Slotted neatly inside the post.', 'Side-footed home like a pro.'],
  rising:    ['Rising rocket, back of the net!', 'Lashed it home off the underside!', 'Power finish! Get in!'],
  standard:  ['Pick that out!', 'Get in! Back of the net.', 'Goal, well done lad.', 'Worldie. Pure worldie.'],
}

const NEARMISS_LINES = [
  'Inches wide of the post!',
  "Crowd ooh'd, that whistled past the post!",
  "So close, keeper's heart skipped a beat.",
  'Curled just over the bar!',
]

type ShotVariant = 'chip' | 'driven' | 'finesse' | 'lofted' | 'standard'

function computeCurl(path: { x: number; y: number }[]): number {
  if (path.length < 3) return 0
  const start = path[0]
  const end = path[path.length - 1]
  const dx = end.x - start.x
  const dy = end.y - start.y
  const chordLen = Math.sqrt(dx * dx + dy * dy)
  if (chordLen < 1) return 0
  let signedArea = 0
  for (const p of path) {
    const ox = p.x - start.x
    const oy = p.y - start.y
    signedArea += (dx * oy - dy * ox) / chordLen
  }
  signedArea /= path.length
  return Math.max(-1, Math.min(1, signedArea / 40))
}

function getReleaseVelocity(path: { x: number; y: number; t: number }[]): { vx: number; vy: number } {
  const now = Date.now()
  const recent = path.filter(p => now - p.t < 80).slice(-5)
  if (recent.length < 2) return { vx: 0, vy: 0 }
  const first = recent[0], last = recent[recent.length - 1]
  const dt = Math.max(1, last.t - first.t)
  return { vx: (last.x - first.x) / dt, vy: (last.y - first.y) / dt }
}

function classifyShot(length: number, releaseSpeed: number, curlAbs: number, dragDY: number, isShotType: boolean): ShotVariant {
  if (!isShotType) return 'standard'
  if (length < 35 && dragDY > 15) return 'chip'
  if (releaseSpeed > 1.8) return 'driven'
  if (curlAbs > 0.25 && releaseSpeed < 1.4) return 'finesse'
  if (length > 90 && dragDY > 40) return 'lofted'
  return 'standard'
}

function previewArc(bx: number, by: number, bz: number, vx: number, vy: number, vz: number, curl: number, steps = 10): { x: number; y: number; alpha: number }[] {
  const pts: { x: number; y: number; alpha: number }[] = []
  let x = bx, y = by, z = bz
  let pvx = vx, pvy = vy, pvz = vz
  for (let i = 0; i < steps; i++) {
    pts.push({ x, y: y - z, alpha: 1 - i / steps })
    if (z > 0) pvz -= 0.5
    else { z = 0; pvz *= -0.35 }
    const speed = Math.sqrt(pvx * pvx + pvy * pvy)
    if (speed > 0.5 && curl !== 0) {
      const cf = curl * 0.04 * (speed / 15)
      pvx += -pvy / speed * cf
      pvy += pvx / speed * cf
    }
    x += pvx; y += pvy; z += pvz
    pvx *= 0.99; pvy *= 0.99
  }
  return pts
}

const VARIANT_VZ: Record<ShotVariant, number>       = { chip: 14, driven: 3,   finesse: 5,   lofted: 11, standard: 6   }
const VARIANT_VY: Record<ShotVariant, number>       = { chip: 0.4, driven: 1.0, finesse: 0.85, lofted: 0.7, standard: 1.0 }
const VARIANT_POWER_CAP: Record<ShotVariant, number> = { chip: 0.65, driven: 1.15, finesse: 0.9, lofted: 1.0, standard: 1.0 }
const VARIANT_CURL_MULT: Record<ShotVariant, number> = { chip: 0, driven: 0.5, finesse: 1.0, lofted: 0.7, standard: 1.0 }

export function ArenaScreen({ store, fixture, activeCards, onCompleteMatch }: ArenaScreenProps) {
  const opponent = fixture.opponent
  const playerStats = store.player.stats
  const ctx = store.contextModifiers
  const reducedMotion = store.settings.reducedMotion

  const keeperProfile = useMemo(() => {
    const d = opponent.difficulty || 5
    let reach = 28 + d * 2
    let reaction = 380 - d * 22
    let readSkill = 0.4 + d * 0.05
    if (opponent.id === 'royal-oak-rovers') { reach += 6; readSkill += 0.1; reaction -= 50 }
    if (opponent.id === 'crown-fc') { readSkill += 0.1; reach += 3 }
    if (opponent.id === 'village-united') { readSkill -= 0.15; reach -= 4 }
    return { reach, reaction, readSkill, name: opponent.name }
  }, [opponent.id, opponent.difficulty, opponent.name])

  const [momentIndex, setMomentIndex] = useState(0)
  const [momentResults, setMomentResults] = useState<MomentResult[]>([])
  const [currentOutcome, setCurrentOutcome] = useState<{ outcome: string; details: string; clampedValue: number } | null>(null)
  const [momentum, setMomentum] = useState(50)
  const [energy, setEnergy] = useState(100)
  const [matchStats, setMatchStats] = useState<ArenaMatchStats>({ shots: 0, goals: 0, passes: 0, passSuccess: 0, tackles: 0, tackleSuccess: 0 })

  const screenShakeRef = useRef<number>(0)

  const [readyPhase, setReadyPhase] = useState('intro')
  const readyPhaseRef = useRef('intro')
  useEffect(() => { readyPhaseRef.current = readyPhase }, [readyPhase])

  const [showTutorial, setShowTutorial] = useState(() => {
    try { return !localStorage.getItem('sll-tutorial-seen-v1') } catch (_) { return false }
  })
  const showTutorialRef = useRef(false)
  useEffect(() => { showTutorialRef.current = showTutorial }, [showTutorial])

  const currentOutcomeRef = useRef<{ outcome: string; details: string; clampedValue: number } | null>(null)

  const goalFlashRef = useRef(0)
  const timeScaleRef = useRef(1)
  const hitStopRef = useRef(0)

  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const requestRef = useRef<number | null>(null)
  const dprRef = useRef(1)

  const weather = activeCards.find(c => c.type === 'Weather')?.id || 'clear'
  const pitch = activeCards.find(c => c.type === 'Pitch')?.id || 'clear'
  const weatherParticles = useRef<any[]>([])
  const [crowdSeed] = useState(() => Math.floor(Math.random() * 1000))
  const crowdSeedRef = useRef(crowdSeed)
  const ballTrail = useRef<{ x: number; y: number; z: number }[]>([])
  const postParticles = useRef<any[]>([])

  const dragPath = useRef<{ x: number; y: number; t: number }[]>([])
  const shotVariantRef = useRef<ShotVariant>('standard')
  const deadZoneCrossed = useRef(false)

  const touchNeedleRef = useRef(0)
  const touchNeedleDirRef = useRef(1)
  const touchWindowRef = useRef({ lo: 0.4, hi: 0.65 })
  const touchNeedleSpeedRef = useRef(0.012)

  const tackleTimingRef = useRef(0)
  const tackleTimingActiveRef = useRef(false)

  const penaltyHistoryRef = useRef<number[]>([])
  const wallJumpedRef = useRef(false)

  const totalMoments = fixture.kind === 'cup' ? 5 : 4
  const [matchMoments] = useState<string[]>(() => {
    const pickOne = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)]
    const seq = [
      pickOne(['shot', 'header']),
      pickOne(['pass', 'touch', 'corner']),
      pickOne(['tackle', 'touch']),
      pickOne(['penalty', 'freekick', 'shot', 'corner']),
    ]
    if (fixture.kind === 'cup') seq.push(pickOne(['shot', 'header', 'freekick']))
    const pool = ['shot', 'pass', 'touch', 'tackle', 'header', 'penalty', 'freekick', 'corner']
    const seen = new Set<string>()
    return seq.map(m => {
      if (!seen.has(m)) { seen.add(m); return m }
      const alt = pool.find(p => !seen.has(p)) ?? m
      seen.add(alt); return alt
    })
  })

  const activeMomentType = matchMoments[Math.min(momentIndex, matchMoments.length - 1)]

  const dragStart = useRef<{ x: number; y: number } | null>(null)
  const dragCurrent = useRef<{ x: number; y: number } | null>(null)
  const isDragging = useRef(false)
  const simulationFinished = useRef(false)

  const ball = useRef<any>({
    x: 200, y: 320, z: 0,
    vx: 0, vy: 0, vz: 0,
    radius: 8,
    active: false,
    inGoal: false,
    saved: false,
    curl: 0,
    spinAngle: 0,
  })

  const keeper = useRef<any>({
    x: 200, y: 45, z: 0,
    targetX: 200,
    state: 'idle',
    diveX: 0, diveY: 0,
    reach: 40,
    predictedX: 200,
    committed: false,
  })

  const fieldNPCs = useRef<any[]>([])
  const particles = useRef<any[]>([])
  const pendingTimeouts = useRef<number[]>([])
  const lastDragVector = useRef<{ angle: number; power: number; accuracy: number } | null>(null)

  const scheduleMomentTimeout = useCallback((fn: () => void, ms: number): number => {
    const id = window.setTimeout(() => {
      pendingTimeouts.current = pendingTimeouts.current.filter(t => t !== id)
      if (simulationFinished.current) return
      fn()
    }, ms)
    pendingTimeouts.current.push(id)
    return id
  }, [])

  const clearMomentTimeouts = useCallback(() => {
    pendingTimeouts.current.forEach(clearTimeout)
    pendingTimeouts.current = []
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const parent = canvas.parentElement
    if (!parent) return
    const applyDpr = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const cssW = Math.max(1, parent.getBoundingClientRect().width)
      canvas.width = cssW * dpr
      canvas.height = cssW * dpr
      canvas.style.width = `${cssW}px`
      canvas.style.height = `${cssW}px`
      const c = canvas.getContext('2d')
      if (c) c.setTransform(dpr, 0, 0, dpr, 0, 0)
      dprRef.current = dpr
    }
    applyDpr()
    const ro = new ResizeObserver(applyDpr)
    ro.observe(parent)
    return () => ro.disconnect()
  }, [])

  const resetSimulation = useCallback(() => {
    clearMomentTimeouts()
    simulationFinished.current = false
    particles.current = []
    postParticles.current = []
    ballTrail.current = []
    weatherParticles.current = []
    isDragging.current = false
    dragStart.current = null
    dragCurrent.current = null
    dragPath.current = []
    lastDragVector.current = null
    deadZoneCrossed.current = false
    shotVariantRef.current = 'standard'
    goalFlashRef.current = 0
    timeScaleRef.current = 1
    hitStopRef.current = 0
    wallJumpedRef.current = false
    tackleTimingActiveRef.current = false
    tackleTimingRef.current = 0

    ball.current = {
      x: 200, y: 320, z: 0,
      vx: 0, vy: 0, vz: 0,
      radius: 8,
      active: false,
      inGoal: false,
      saved: false,
      reachedTeammate: null,
      intercepted: false,
      hitPost: false,
      hitBar: false,
      spawnedAt: Date.now(),
      curl: 0,
      spinAngle: 0,
    }
    keeper.current = {
      x: 200, y: 45, z: 0,
      targetX: 200,
      state: 'idle',
      diveX: 0, diveY: 0,
      reach: keeperProfile.reach,
      reaction: keeperProfile.reaction,
      readSkill: keeperProfile.readSkill,
      predictedX: 200,
      committed: false,
    }

    if (activeMomentType === 'shot') {
      ball.current.x = 150 + Math.random() * 100
      ball.current.y = 280 + Math.random() * 60
      fieldNPCs.current = [
        { x: (Math.random() < 0.5 ? 165 : 235), y: 120, type: 'defender', radius: 15, vx: (Math.random() - 0.5) * 1.5 },
      ]
    } else if (activeMomentType === 'pass') {
      ball.current.x = 200; ball.current.y = 350
      const gavX = 70 + Math.random() * 40
      const callX = 270 + Math.random() * 40
      fieldNPCs.current = [
        { x: gavX,  y: 130 + Math.random() * 40, type: 'teammate', name: 'Gav' },
        { x: callX, y: 160 + Math.random() * 40, type: 'teammate', name: 'Callum' },
        { x: 170 + Math.random() * 60, y: 200 + Math.random() * 30, type: 'defender', radius: 15, vx: (Math.random() - 0.5) * 1 },
        { x: 220 + Math.random() * 40, y: 170 + Math.random() * 30, type: 'defender', radius: 15, vx: (Math.random() - 0.5) * 1 },
      ]
    } else if (activeMomentType === 'touch') {
      const fromLeft = Math.random() < 0.5
      ball.current.x = fromLeft ? 60 : 340
      ball.current.y = 200
      ball.current.z = 20
      ball.current.active = true
      ball.current.vx = fromLeft ? 2.8 : -2.8
      ball.current.vy = 2.5
      ball.current.vz = 1.5
      const touchStatMod = statBoost(playerStats.touch)
      const winWidth = 0.20 + touchStatMod * 0.15
      const centre = 0.5 + (Math.random() - 0.5) * 0.2
      touchWindowRef.current = { lo: centre - winWidth / 2, hi: centre + winWidth / 2 }
      touchNeedleRef.current = 0
      touchNeedleDirRef.current = 1
      touchNeedleSpeedRef.current = 0.009 + Math.abs(ball.current.vx) * 0.0015
      fieldNPCs.current = []
    } else if (activeMomentType === 'tackle') {
      ball.current.active = false
      const attackerSpeed = 3.0 + (opponent.difficulty - 5) * 0.15
      fieldNPCs.current = [
        { x: 140 + Math.random() * 120, y: -20, vy: attackerSpeed, type: 'attacker', hasBall: true },
      ]
      tackleTimingActiveRef.current = true
      tackleTimingRef.current = 0
    } else if (activeMomentType === 'header') {
      ball.current.x = 200; ball.current.y = 100; ball.current.z = 120
      ball.current.active = true; ball.current.vz = -1.2; ball.current.vy = 0.8
      fieldNPCs.current = []
    } else if (activeMomentType === 'penalty') {
      ball.current.x = 200; ball.current.y = 250
      fieldNPCs.current = []
      keeper.current.reach = keeperProfile.reach + 8
    } else if (activeMomentType === 'freekick') {
      ball.current.x = 200; ball.current.y = 290
      fieldNPCs.current = [
        { x: 160, y: 150, type: 'defender', radius: 15, vx: 0, z: 0, jumpVz: 0, jumping: false },
        { x: 195, y: 150, type: 'defender', radius: 15, vx: 0, z: 0, jumpVz: 0, jumping: false },
        { x: 230, y: 150, type: 'defender', radius: 15, vx: 0, z: 0, jumpVz: 0, jumping: false },
      ]
    } else if (activeMomentType === 'corner') {
      const fromLeft = Math.random() < 0.5
      ball.current.x = fromLeft ? 20 : 380; ball.current.y = 40
      fieldNPCs.current = [
        { x: 180, y: 110, type: 'teammate', name: 'Gav' },
        { x: 220, y: 145, type: 'teammate', name: 'Big Taz' },
        { x: 150, y: 130, type: 'defender', radius: 15, vx: 0 },
        { x: 250, y: 130, type: 'defender', radius: 15, vx: 0 },
      ]
    }
  }, [activeMomentType, clearMomentTimeouts, keeperProfile, opponent.difficulty, playerStats.touch])

  useEffect(() => {
    resetSimulation()
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentOutcome(null)
    currentOutcomeRef.current = null
    setReadyPhase('intro')
    readyPhaseRef.current = 'intro'
    const introDuration = momentIndex === 0 && showTutorialRef.current ? 1300 : 800
    const timer = setTimeout(() => {
      setReadyPhase('live')
      readyPhaseRef.current = 'live'
    }, introDuration)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [momentIndex])

  useEffect(() => { currentOutcomeRef.current = currentOutcome }, [currentOutcome])

  useEffect(() => {
    const murmur = () => { try { AudioManager.playCrowdMurmur(0.04) } catch (_) {} }
    const id = setInterval(murmur, 2400)
    return () => clearInterval(id)
  }, [])

  const resolveSimulationOutcome = useCallback((manualOutcome: { outcome: string; details: string } | null = null) => {
    if (simulationFinished.current) return
    simulationFinished.current = true

    const b = ball.current
    let outcome = manualOutcome?.outcome || 'MISS'
    let details = manualOutcome?.details || 'Into the stands, son. Have a look at yourself.'

    const isShotMoment = ['shot', 'penalty', 'freekick', 'header'].includes(activeMomentType)
    if (isShotMoment) setMatchStats(s => ({ ...s, shots: s.shots + 1 }))
    else if (['pass', 'corner'].includes(activeMomentType)) setMatchStats(s => ({ ...s, passes: s.passes + 1 }))
    else if (activeMomentType === 'tackle') setMatchStats(s => ({ ...s, tackles: s.tackles + 1 }))

    if (b.inGoal) {
      const sv = shotVariantRef.current
      const quality = sv === 'chip' ? 'chip' : (b.goalQuality || 'standard')
      const lines = GOAL_LINES[quality] || GOAL_LINES.standard
      if (quality === 'topcorner') outcome = 'TOP CORNER'
      else if (quality === 'chip') outcome = 'CHIPPED HIM'
      else if (quality === 'tucked') outcome = 'TUCKED AWAY'
      else if (quality === 'rising') outcome = 'BANGER'
      else outcome = 'GOAL'
      details = lines[Math.floor(Math.random() * lines.length)]
      AudioManager.playGoal()
      navigator.vibrate?.([40, 20, 80])
      if (!reducedMotion) screenShakeRef.current = 14
      setMatchStats(s => ({ ...s, goals: s.goals + 1 }))
    } else if (b.hitBar) {
      outcome = 'CROSSBAR'
      details = 'Cannons off the bar! Inches from a goal!'
      AudioManager.playOoh()
      navigator.vibrate?.([20, 10, 20])
    } else if (b.hitPost) {
      outcome = 'WOODWORK'
      details = 'Off the post! Agony, could have been a worldie.'
      AudioManager.playOoh()
      navigator.vibrate?.([20, 10, 20])
    } else if (b.saved) {
      outcome = 'SAVED'
      if (b.struck?.basePower > 0.85) details = 'Their keeper somehow gets a glove on it. Great save.'
      else if (opponent.id === 'royal-oak-rovers') details = "Their keeper's a brick wall today, held easily."
      else details = 'Keeper holds it. Decent shot, better save.'
      AudioManager.playGroan()
      navigator.vibrate?.([15])
    } else if (b.intercepted && !manualOutcome) {
      outcome = 'INTERCEPTED'
      details = activeMomentType === 'corner' ? 'Cleared by the first man. Bobbins delivery.' : 'Cut out by their defender. Hospital ball.'
      AudioManager.playMiss()
    } else if (b.reachedTeammate && !manualOutcome) {
      outcome = 'SUCCESS'
      const who = b.reachedTeammate.name || 'your man'
      details = activeMomentType === 'corner'
        ? `Whipped in beautifully, ${who} rose highest!`
        : `Spot on. Right to ${who}'s feet.`
      AudioManager.playPing()
      setMatchStats(s => ({ ...s, passSuccess: s.passSuccess + 1 }))
    } else if (!manualOutcome) {
      if (isShotMoment && b.nearMiss) {
        outcome = 'NEAR MISS'
        details = NEARMISS_LINES[Math.floor(Math.random() * NEARMISS_LINES.length)]
        AudioManager.playOoh()
      } else if (activeMomentType === 'pass') {
        outcome = 'OVERHIT'
        details = 'Too much on it. Sailed past everyone.'
        AudioManager.playMiss()
      } else if (activeMomentType === 'corner') {
        outcome = 'CLEARED'
        details = 'Easy take for the keeper. Have another go.'
        AudioManager.playMiss()
      } else {
        AudioManager.playMiss()
      }
    } else {
      if (['SUCCESS', 'GOAL'].includes(outcome)) AudioManager.playPing()
      else AudioManager.playMiss()
    }

    if (activeMomentType === 'tackle' && outcome === 'SUCCESS') {
      setMatchStats(s => ({ ...s, tackleSuccess: s.tackleSuccess + 1 }))
    }

    let clampedValue = 0.2
    if (['GOAL', 'TOP CORNER', 'CHIPPED HIM', 'TUCKED AWAY', 'BANGER', 'SUCCESS'].includes(outcome)) clampedValue = 1
    else if (['WOODWORK', 'CROSSBAR'].includes(outcome)) clampedValue = 0.55
    else if (['NEAR MISS', 'SAVED'].includes(outcome)) clampedValue = 0.4

    if (clampedValue >= 0.9) setMomentum(m => Math.min(100, m + 15))
    else if (clampedValue >= 0.4) setMomentum(m => Math.max(0, m - 3))
    else setMomentum(m => Math.max(0, m - 10))

    setCurrentOutcome({ outcome, details, clampedValue })
  }, [activeMomentType, opponent.id, reducedMotion])

  const handleInput = useCallback((accuracy: number, power: number, angle: number, curl: number, variant: ShotVariant) => {
    if (simulationFinished.current) return
    if (readyPhaseRef.current !== 'live') return
    AudioManager.init()

    if (showTutorial) {
      try { localStorage.setItem('sll-tutorial-seen-v1', '1') } catch (_) {}
      setShowTutorial(false)
    }

    navigator.vibrate?.([12])

    const info = MOMENT_INFO[activeMomentType]
    const relevantStat = (playerStats as any)[info.stat] || 10
    const statMod = statBoost(relevantStat)
    const vibesMod = statBoost(playerStats.vibes || 10) * 0.5
    const momentumBoost = (momentum - 50) / 500
    const energyPenalty = (100 - energy) / 500
    const chaosMods = getChaosModifiers(activeCards)
    const scoutBonus = ctx.oppositionScouted ? 0.05 : 0
    const setPieceBonus = ctx.setPieceReady && (activeMomentType === 'penalty' || activeMomentType === 'freekick') ? 0.08 : 0
    const sensitivity = store.settings.inputSensitivity === 'high' ? 1.08 : store.settings.inputSensitivity === 'low' ? 0.94 : 1
    const effectiveAccuracy = Math.max(0, Math.min(1.15, (accuracy + statMod + momentumBoost + vibesMod - energyPenalty - chaosMods.accuracyPenalty + scoutBonus + setPieceBonus) * sensitivity))
    const effectivePower = Math.max(0.2, Math.min(1.15, (power + statMod * 0.4 - chaosMods.powerPenalty + setPieceBonus * 0.5) * sensitivity))
    lastDragVector.current = { angle, power: effectivePower, accuracy: effectiveAccuracy }

    if (activeMomentType === 'tackle') {
      setEnergy(e => Math.max(0, e - (10 - Math.round(statBoost(playerStats.graft) * 10))))
      const attacker = fieldNPCs.current.find((n: any) => n.type === 'attacker')
      if (!attacker) {
        resolveSimulationOutcome({ outcome: 'BEATEN', details: 'He skipped past you.' })
        return
      }
      const tr = tackleTimingRef.current
      const timingOk = tr >= 0.56 && tr <= 0.80
      const aimAngle = Math.atan2(attacker.y - 320, attacker.x - 200)
      const angularAlignment = Math.cos(angle - aimAngle)
      const dirTolerance = 0.22 + statBoost(playerStats.graft) * 0.2
      const aimOk = angularAlignment > (0.3 - dirTolerance)
      if (timingOk && aimOk) {
        AudioManager.playKick('strike')
        navigator.vibrate?.([25])
        if (!reducedMotion) { screenShakeRef.current = 6; hitStopRef.current = 4 }
        resolveSimulationOutcome({ outcome: 'SUCCESS', details: 'Crunching tackle, ball won cleanly.' })
      } else if (tr < 0.56) {
        navigator.vibrate?.([8])
        resolveSimulationOutcome({ outcome: 'EARLY', details: "Dived in too early. He's gone past you." })
      } else if (tr > 0.80) {
        navigator.vibrate?.([8])
        resolveSimulationOutcome({ outcome: 'LATE', details: "A split-second late, he's away." })
      } else {
        navigator.vibrate?.([8])
        resolveSimulationOutcome({ outcome: 'BEATEN', details: "Wrong angle. He's just nutmegged you." })
      }
      return
    }

    if (ball.current.active && activeMomentType !== 'touch' && activeMomentType !== 'header') return

    setEnergy(e => Math.max(0, e - 5))

    if (['pass', 'corner'].includes(activeMomentType)) AudioManager.playKick('pass')
    else if (activeMomentType === 'header') AudioManager.playKick('header')
    else AudioManager.playKick('strike')

    ball.current.active = true
    ball.current.struck = { type: activeMomentType, basePower: effectivePower, accuracy: effectiveAccuracy }

    const curlStatMod = 0.3 + statBoost(relevantStat) * 1.4
    const finalCurl = curl * curlStatMod

    scheduleMomentTimeout(() => {
      if (simulationFinished.current) return
      ball.current.active = false
      const b = ball.current
      if (['shot', 'penalty', 'freekick', 'header'].includes(activeMomentType) && b.y < 90 && b.x > 80 && b.x < 320) {
        b.nearMiss = true
        AudioManager.playOoh()
      }
      resolveSimulationOutcome()
    }, 4500)

    if (activeMomentType === 'shot' || activeMomentType === 'penalty') {
      const p = Math.min(effectivePower, VARIANT_POWER_CAP[variant])
      ball.current.vx = Math.cos(angle) * p * 16
      ball.current.vy = Math.sin(angle) * p * 16 * VARIANT_VY[variant]
      ball.current.vz = p * VARIANT_VZ[variant]
      ball.current.curl = finalCurl * VARIANT_CURL_MULT[variant]
      penaltyHistoryRef.current = [...penaltyHistoryRef.current.slice(-1), ball.current.x + Math.cos(angle) * 100]
    } else if (activeMomentType === 'header') {
      const b = ball.current
      const headStatMod = statBoost(playerStats.head)
      const winLow = 15 - headStatMod * 15
      const winHigh = 110 + headStatMod * 20
      if (b.z <= winLow || b.z >= winHigh) {
        b.active = false
        resolveSimulationOutcome({ outcome: 'MISTIMED', details: 'Mistimed your jump, ball squirms over your head.' })
        return
      }
      navigator.vibrate?.([8, 20, 15])
      const sweetLow = 40 - headStatMod * 10
      const sweetHigh = 80 + headStatMod * 15
      const sweetSpot = b.z > sweetLow && b.z < sweetHigh
      const headerPower = sweetSpot ? effectivePower : effectivePower * 0.7
      b.vx = Math.cos(angle) * headerPower * 16
      b.vy = Math.sin(angle) * headerPower * 16
      b.vz = -headerPower * 2.5
      b.curl = finalCurl
    } else if (activeMomentType === 'freekick') {
      const p = Math.min(effectivePower, VARIANT_POWER_CAP[variant])
      ball.current.vx = Math.cos(angle) * p * 16
      ball.current.vy = Math.sin(angle) * p * 16 * VARIANT_VY[variant]
      ball.current.vz = p * VARIANT_VZ[variant]
      ball.current.curl = finalCurl * VARIANT_CURL_MULT[variant]
      wallJumpedRef.current = false
    } else if (activeMomentType === 'pass') {
      ball.current.vx = Math.cos(angle) * effectivePower * 11
      ball.current.vy = Math.sin(angle) * effectivePower * 11
      ball.current.vz = effectivePower * 1.5
      ball.current.curl = finalCurl * 0.5
      const coneHalf = Math.PI / 4
      let hasTarget = false
      for (const n of fieldNPCs.current) {
        if (n.type !== 'teammate') continue
        const ta = Math.atan2(n.y - ball.current.y, n.x - ball.current.x)
        const diff = Math.abs(Math.atan2(Math.sin(angle - ta), Math.cos(angle - ta)))
        if (diff < coneHalf) { hasTarget = true; break }
      }
      if (!hasTarget) {
        scheduleMomentTimeout(() => resolveSimulationOutcome({ outcome: 'OVERHIT', details: "Into no-man's-land. No one on the end of that." }), 1200)
      }
    } else if (activeMomentType === 'corner') {
      ball.current.vx = Math.cos(angle) * effectivePower * 12
      ball.current.vy = Math.sin(angle) * effectivePower * 12
      ball.current.vz = effectivePower * 6
      ball.current.curl = finalCurl
    } else if (activeMomentType === 'touch') {
      ball.current.vx = ball.current.vx * 0.2 + Math.cos(angle) * effectivePower * 4
      ball.current.vy = ball.current.vy * 0.2 + Math.sin(angle) * effectivePower * 4
      ball.current.vz *= 0.1
      const needle = touchNeedleRef.current
      const win = touchWindowRef.current
      const cushioned = needle >= win.lo && needle <= win.hi
      const tooEarly = needle < win.lo
      scheduleMomentTimeout(() => {
        if (cushioned) resolveSimulationOutcome({ outcome: 'SUCCESS', details: 'Beautiful first touch, glued to your boot.' })
        else if (tooEarly) resolveSimulationOutcome({ outcome: 'POOR TOUCH', details: 'Bounces off your shin. Wasted it.' })
        else resolveSimulationOutcome({ outcome: 'BOBBLED', details: 'Too heavy. Ball ran away from you.' })
      }, 450)
    }

    const isShotType = ['shot', 'penalty', 'header', 'freekick'].includes(activeMomentType)
    if (isShotType) {
      const isPenalty = activeMomentType === 'penalty'
      const baseDelay = isPenalty ? 130 : (activeMomentType === 'freekick' ? 230 : keeperProfile.reaction)
      scheduleMomentTimeout(() => {
        const k = keeper.current
        if (k.state !== 'idle') return
        k.state = 'reading'
        const b = ball.current
        if (Math.abs(b.vy) > 0.1) {
          const frames = (45 - b.y) / b.vy
          k.predictedX = Math.max(130, Math.min(270, b.x + b.vx * frames + (b.curl || 0) * 15))
        } else {
          k.predictedX = 200
        }
        if (isPenalty && penaltyHistoryRef.current.length >= 2) {
          const lastAimX = penaltyHistoryRef.current[penaltyHistoryRef.current.length - 1]
          const biasRight = lastAimX > 200 ? 0.65 : 0.35
          k.predictedX = Math.random() < biasRight ? 240 : 160
        }
        if (Math.random() < (1 - keeperProfile.readSkill) * 0.35) {
          k.predictedX = 400 - k.predictedX
        }
        k.targetX = k.predictedX
      }, baseDelay)
      scheduleMomentTimeout(() => {
        const k = keeper.current
        if (k.state === 'reading') {
          k.state = 'diving'
          k.committed = true
          k.diveX = k.targetX
        }
      }, baseDelay + 250)
    }
  }, [activeMomentType, activeCards, energy, momentum, playerStats, keeperProfile, resolveSimulationOutcome, scheduleMomentTimeout, showTutorial, ctx.oppositionScouted, ctx.setPieceReady, store.settings.inputSensitivity, reducedMotion])

  const updateSimulation = useCallback(() => {
    const b = ball.current
    const k = keeper.current

    if (hitStopRef.current > 0) { hitStopRef.current -= 1; return }

    if (screenShakeRef.current > 0) screenShakeRef.current = Math.max(0, screenShakeRef.current - 0.5)
    if (goalFlashRef.current > 0) goalFlashRef.current = Math.max(0, goalFlashRef.current - 0.04)
    if (timeScaleRef.current < 1) timeScaleRef.current = Math.min(1, timeScaleRef.current + 0.015)

    const ts = timeScaleRef.current

    let airFriction = 0.985
    let groundFriction = 0.95
    let bounceCoeff = -0.35
    let windX = 0
    if (weather === 'rain') { groundFriction = 0.92; bounceCoeff = -0.25 }
    if (weather === 'wind') { windX = 0.12 * (Math.sin(Date.now() / 800) - 0.3) }
    if (weather === 'sunshine') { airFriction = 0.992 }
    if (pitch === 'boggy') { groundFriction = 0.88; bounceCoeff = -0.15; airFriction = 0.982 }
    if (pitch === 'frozen') { groundFriction = 0.98; bounceCoeff = -0.55 }

    if (activeMomentType === 'touch' && !simulationFinished.current && readyPhaseRef.current === 'live') {
      touchNeedleRef.current += touchNeedleSpeedRef.current * touchNeedleDirRef.current * ts
      if (touchNeedleRef.current >= 1) { touchNeedleRef.current = 1; touchNeedleDirRef.current = -1 }
      if (touchNeedleRef.current <= 0) { touchNeedleRef.current = 0; touchNeedleDirRef.current = 1 }
    }

    if (activeMomentType === 'tackle' && tackleTimingActiveRef.current && !simulationFinished.current) {
      const engineMod = statBoost(playerStats.engine)
      tackleTimingRef.current = Math.min(1, tackleTimingRef.current + (0.012 + engineMod * 0.004) * ts)
    }

    for (let i = postParticles.current.length - 1; i >= 0; i--) {
      const p = postParticles.current[i]
      p.x += p.vx; p.y += p.vy; p.vy += 0.12; p.life -= 0.06
      if (p.life <= 0) postParticles.current.splice(i, 1)
    }

    if (b.active) {
      ballTrail.current.push({ x: b.x, y: b.y, z: b.z })
      if (ballTrail.current.length > 14) ballTrail.current.shift()

      b.vx += windX * ts

      if (b.curl !== 0 && (Math.abs(b.vx) + Math.abs(b.vy)) > 0.5) {
        const speed = Math.sqrt(b.vx * b.vx + b.vy * b.vy)
        const curlForce = b.curl * 0.04 * (speed / 15)
        b.vx += -b.vy / speed * curlForce
        b.vy += b.vx / speed * curlForce
      }

      b.x += b.vx * ts
      b.y += b.vy * ts
      b.z += b.vz * ts

      if (b.z > 0) {
        b.vz -= 0.5 * ts
      } else {
        b.z = 0
        b.vz *= bounceCoeff
        b.vx *= groundFriction; b.vy *= groundFriction
        if (Math.abs(b.vz) < 0.5) b.vz = 0
        if (Math.abs(b.vz) > 1.2) {
          for (let i = 0; i < 3; i++) {
            particles.current.push({ x: b.x, y: b.y, vx: (Math.random() - 0.5) * 3, vy: -Math.random() * 2, colour: '#4a7c3a', life: 0.5 })
          }
        }
      }

      b.vx *= airFriction; b.vy *= airFriction

      if (activeMomentType === 'freekick' && !wallJumpedRef.current && b.y < 155 && b.y > 145) {
        wallJumpedRef.current = true
        for (const n of fieldNPCs.current) {
          if (n.type === 'defender') {
            // eslint-disable-next-line react-hooks/immutability
            n.jumping = true; n.jumpVz = 8
          }
        }
        if (b.z < 15) {
          if (b.struck) b.struck.accuracy = Math.min(1.15, (b.struck.accuracy || 0) + 0.05)
        }
      }
      if (activeMomentType === 'freekick') {
        for (const n of fieldNPCs.current) {
          if (n.jumping) {
            n.z = (n.z || 0) + n.jumpVz * ts
            n.jumpVz -= 1 * ts
            if ((n.z || 0) <= 0) { n.z = 0; n.jumping = false }
          }
        }
      }

      const isPassType = ['pass', 'corner'].includes(activeMomentType)
      const isShotType = ['shot', 'penalty', 'header', 'freekick'].includes(activeMomentType)

      if (isPassType) {
        for (const n of fieldNPCs.current) {
          if (n.type !== 'teammate') continue
          const d = Math.sqrt((b.x - n.x) ** 2 + (b.y - n.y) ** 2)
          if (d < 30 && b.z < 60) {
            b.active = false; b.reachedTeammate = n
            AudioManager.playPing()
            resolveSimulationOutcome()
            return
          }
        }
        for (const n of fieldNPCs.current) {
          if (n.type !== 'defender') continue
          const d = Math.sqrt((b.x - n.x) ** 2 + (b.y - n.y) ** 2)
          if (d < (n.radius || 15) && b.z < 25) {
            b.active = false; b.intercepted = true
            resolveSimulationOutcome()
            return
          }
        }
      }

      if (isShotType && b.y < 12 && b.y > -10 && b.z < 80) {
        if (Math.abs(b.x - 130) < 4) {
          b.vx = -Math.abs(b.vx) * 0.68
          b.vy = Math.abs(b.vy) * 0.4
          b.hitPost = true
          AudioManager.playPost()
          navigator.vibrate?.([20, 10, 20])
          if (!reducedMotion) { screenShakeRef.current = 5; hitStopRef.current = 3 }
          for (let i = 0; i < 4; i++) {
            postParticles.current.push({ x: 130, y: 10, vx: (Math.random() - 0.5) * 4, vy: -Math.random() * 3 - 1, life: 1.0, colour: '#F59E0B' })
          }
        } else if (Math.abs(b.x - 270) < 4) {
          b.vx = Math.abs(b.vx) * 0.68
          b.vy = Math.abs(b.vy) * 0.4
          b.hitPost = true
          AudioManager.playPost()
          navigator.vibrate?.([20, 10, 20])
          if (!reducedMotion) { screenShakeRef.current = 5; hitStopRef.current = 3 }
          for (let i = 0; i < 4; i++) {
            postParticles.current.push({ x: 270, y: 10, vx: (Math.random() - 0.5) * 4, vy: -Math.random() * 3 - 1, life: 1.0, colour: '#F59E0B' })
          }
        }
      }
      if (isShotType && b.y < 8 && b.z > 43 && b.z < 58 && b.x > 130 && b.x < 270) {
        b.vy = Math.abs(b.vy) * 0.45
        b.vz = -Math.abs(b.vz) * 0.4
        b.hitBar = true
        AudioManager.playPost()
        navigator.vibrate?.([20, 10, 20])
        if (!reducedMotion) { screenShakeRef.current = 6; hitStopRef.current = 3 }
      }

      if (isShotType && b.y < 45 && b.x > 132 && b.x < 268 && b.z < 48) {
        b.inGoal = true
        const inTopThird = b.z > 25
        const inSideThird = b.x < 165 || b.x > 235
        if (inTopThird && inSideThird) b.goalQuality = 'topcorner'
        else if (inSideThird) b.goalQuality = 'tucked'
        else if (inTopThird) b.goalQuality = 'rising'
        else b.goalQuality = 'standard'
        if (!reducedMotion) {
          timeScaleRef.current = 0.25
          goalFlashRef.current = 1.2
          hitStopRef.current = 8
          screenShakeRef.current = 14
          for (let i = 0; i < 100; i++) {
            particles.current.push({
              x: b.x, y: b.y,
              vx: (Math.random() - 0.5) * 16,
              vy: -(2 + Math.random() * 10),
              colour: ['#fff', '#F59E0B', '#DC2626', '#16A34A', '#FEF3C7'][Math.floor(Math.random() * 5)],
              life: 1.0,
            })
          }
        }
        b.active = false
        resolveSimulationOutcome()
        return
      }

      if (b.y < -25 || b.y > 450 || b.x < -25 || b.x > 425) {
        if (['shot', 'penalty', 'header', 'freekick'].includes(activeMomentType)) {
          if (b.y < 30 && b.x > 80 && b.x < 320) { b.nearMiss = true; AudioManager.playOoh() }
        }
        b.active = false
        resolveSimulationOutcome()
        return
      }

      if (b.z === 0 && Math.abs(b.vx) < 0.15 && Math.abs(b.vy) < 0.15) {
        b.active = false
        resolveSimulationOutcome()
        return
      }

      if (['shot', 'penalty', 'header', 'freekick'].includes(activeMomentType) && b.y < 80) {
        const reach = k.state === 'saved' ? k.reach * 1.45 : (k.state === 'diving' ? k.reach * 1.30 : k.reach)
        const dx = b.x - k.x
        const dz = b.z - (k.z || 0)
        const elliptical = (dx / reach) ** 2 + (dz / (reach * 0.6)) ** 2
        if (elliptical < 1 && !b.inGoal) {
          b.saved = true; b.active = false; k.state = 'saved'
          navigator.vibrate?.([15])
          if (!reducedMotion) { hitStopRef.current = 3; screenShakeRef.current = 4 }
          resolveSimulationOutcome()
          return
        }
      }
    }

    if (k.state === 'reading') {
      const speed = 3.5 * (0.3 + keeperProfile.readSkill) * ts
      const diff = k.predictedX - k.x
      k.x += Math.sign(diff) * Math.min(Math.abs(diff), speed)
    } else if (k.state === 'diving') {
      k.x += (k.diveX - k.x) * 0.18 * ts
    } else if (k.state === 'idle') {
      k.x += (k.targetX - k.x) * 0.05 * ts
    }

    fieldNPCs.current.forEach((n: any) => {
      if (n.type === 'defender') {
        n.x += n.vx * ts
        if (n.x < 100 || n.x > 300) n.vx *= -1
        if (b.active) {
          const dist = Math.sqrt((b.x - n.x) ** 2 + (b.y - n.y) ** 2)
          if (dist < (n.radius || 15) && b.z < 15) {
            b.vx *= -0.5; b.vy *= 0.8; b.active = false; b.intercepted = true
            resolveSimulationOutcome()
          }
        }
      } else if (n.type === 'attacker') {
        n.y += n.vy * ts
        if (n.y > 330) {
          resolveSimulationOutcome({ outcome: 'BEATEN', details: "He's gone past you. Absolute embarrassment." })
        }
      }
    })
  }, [activeMomentType, pitch, weather, resolveSimulationOutcome, reducedMotion, keeperProfile.readSkill, playerStats.engine])

  const drawHumanoid = (
    c: CanvasRenderingContext2D,
    x: number,
    y: number,
    opts: { bodyColor?: string; headColor?: string; size?: number; posture?: string } = {}
  ) => {
    const { bodyColor = '#F59E0B', headColor = '#FBBF24', size = 1, posture = 'idle' } = opts
    const r = 9 * size
    c.fillStyle = bodyColor
    c.beginPath()
    if (posture === 'diving') c.ellipse(x, y - r * 0.2, r * 1.6, r * 0.85, 0, 0, Math.PI * 2)
    else c.ellipse(x, y - r * 0.2, r * 0.95, r * 1.1, 0, 0, Math.PI * 2)
    c.fill()
    c.strokeStyle = 'rgba(0,0,0,0.4)'; c.lineWidth = 1.2; c.stroke()
    c.fillStyle = headColor
    c.beginPath(); c.arc(x, y - r * 1.2, r * 0.6, 0, Math.PI * 2); c.fill()
    c.strokeStyle = 'rgba(0,0,0,0.4)'; c.stroke()
  }

  const MIN_DRAG_LENGTH = 10

  const drawFrame = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const c = canvas.getContext('2d')
    if (!c) return
    const b = ball.current
    const k = keeper.current

    c.setTransform(dprRef.current, 0, 0, dprRef.current, 0, 0)
    updateSimulation()
    const shake = reducedMotion ? 0 : screenShakeRef.current
    if (shake > 0) c.translate((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake)

    const grass = c.createLinearGradient(0, 0, 0, 400)
    grass.addColorStop(0, '#3a6e2f')
    grass.addColorStop(0.6, '#2d5a27')
    grass.addColorStop(1, '#1f4a1c')
    c.fillStyle = grass
    c.fillRect(0, 0, 400, 400)

    c.fillStyle = 'rgba(0,0,0,0.07)'
    for (let i = 0; i < 400; i += 40) {
      if ((i / 40) % 2 === 0) c.fillRect(0, i, 400, 20)
    }

    c.fillStyle = '#1c1917'
    c.fillRect(0, -25, 400, 18)
    const seed = crowdSeedRef.current
    for (let i = 0; i < 60; i++) {
      const cx2 = (i * 7 + seed * 3) % 400
      const sway = Math.sin((Date.now() / 400) + i * 0.3) * 0.6
      const cy2 = -22 + (i % 3) * 5 + sway
      const colors = ['#7c2d12', '#1e3a8a', '#7f1d1d', '#3f3f46', '#854d0e', '#365314']
      c.fillStyle = colors[(i + seed) % colors.length]
      c.fillRect(cx2, cy2, 4, 4)
    }

    c.strokeStyle = 'rgba(255,255,255,0.55)'
    c.lineWidth = 2
    c.strokeRect(40, -10, 320, 150)
    c.strokeRect(120, -10, 160, 50)
    c.beginPath(); c.arc(200, 300, 4, 0, Math.PI * 2); c.stroke()
    c.beginPath(); c.arc(200, 140, 35, Math.PI * 0.15, Math.PI - Math.PI * 0.15, true); c.stroke()

    c.fillStyle = 'rgba(255,255,255,0.06)'
    c.fillRect(130, 0, 140, 45)
    c.strokeStyle = 'rgba(255,255,255,0.35)'; c.lineWidth = 0.7
    for (let x = 130; x <= 270; x += 8) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, 45); c.stroke() }
    for (let y = 0; y <= 45; y += 7) { c.beginPath(); c.moveTo(130, y); c.lineTo(270, y); c.stroke() }
    c.strokeStyle = '#fff'; c.lineWidth = 3
    c.beginPath(); c.moveTo(130, 0); c.lineTo(130, 45); c.stroke()
    c.beginPath(); c.moveTo(270, 0); c.lineTo(270, 45); c.stroke()
    c.beginPath(); c.moveTo(128, 0); c.lineTo(272, 0); c.stroke()

    c.fillStyle = 'rgba(0,0,0,0.32)'
    const shadowSize = Math.max(2, b.radius - b.z / 20)
    c.beginPath(); c.arc(b.x, b.y, shadowSize, 0, Math.PI * 2); c.fill()
    c.beginPath(); c.ellipse(k.x, k.y + 10, 16, 6, 0, 0, Math.PI * 2); c.fill()
    fieldNPCs.current.forEach((n: any) => {
      c.beginPath(); c.ellipse(n.x, n.y + 10, 13, 5, 0, 0, Math.PI * 2); c.fill()
    })
    if (!['corner', 'freekick'].includes(activeMomentType)) {
      c.beginPath(); c.ellipse(200, 330, 14, 5, 0, 0, Math.PI * 2); c.fill()
    }

    if (ballTrail.current.length > 1) {
      for (let i = 0; i < ballTrail.current.length - 1; i++) {
        const p = ballTrail.current[i]
        c.fillStyle = `rgba(255,255,255,${(i / ballTrail.current.length) * 0.45})`
        c.beginPath(); c.arc(p.x, p.y - p.z, Math.max(1, b.radius * 0.6 * (i / ballTrail.current.length)), 0, Math.PI * 2); c.fill()
      }
    }

    for (let i = particles.current.length - 1; i >= 0; i--) {
      const p = particles.current[i]
      c.fillStyle = p.colour || p.color
      c.globalAlpha = Math.max(0, p.life)
      c.fillRect(p.x, p.y, 4, 4)
      p.x += p.vx; p.y += p.vy; p.vy += 0.15; p.life -= 0.02
      if (p.life <= 0) particles.current.splice(i, 1)
    }
    c.globalAlpha = 1.0

    for (let i = postParticles.current.length - 1; i >= 0; i--) {
      const p = postParticles.current[i]
      c.fillStyle = p.colour; c.globalAlpha = Math.max(0, p.life)
      c.beginPath(); c.arc(p.x, p.y, 3, 0, Math.PI * 2); c.fill()
    }
    c.globalAlpha = 1.0

    if (weather === 'rain') {
      if (Math.random() > 0.5) weatherParticles.current.push({ x: Math.random() * 400, y: -10, vy: 9 + Math.random() * 4, vx: 2, life: 1 })
    } else if (weather === 'fog') {
      if (weatherParticles.current.length < 20 && Math.random() > 0.9) {
        weatherParticles.current.push({ x: -50, y: Math.random() * 400, vx: 0.5 + Math.random(), vy: (Math.random() - 0.5) * 0.2, size: 40 + Math.random() * 40, life: 0.4 + Math.random() * 0.4 })
      }
    } else if (weather === 'hail') {
      for (let i = 0; i < 3; i++) {
        weatherParticles.current.push({ x: Math.random() * 400, y: -10, vy: 11 + Math.random() * 5, vx: (Math.random() - 0.5) * 3, life: 0.8, isHail: true })
      }
    }
    for (let i = weatherParticles.current.length - 1; i >= 0; i--) {
      const p = weatherParticles.current[i]
      if (p.isHail) {
        c.fillStyle = 'rgba(220,240,255,0.85)'; c.globalAlpha = Math.max(0, p.life)
        c.beginPath(); c.arc(p.x, p.y, 3, 0, Math.PI * 2); c.fill()
        p.x += p.vx; p.y += p.vy; p.life -= 0.06
        if (p.y > 400 || p.life <= 0) weatherParticles.current.splice(i, 1)
      } else if (weather === 'rain') {
        c.strokeStyle = 'rgba(255,255,255,0.55)'; c.lineWidth = 1
        c.beginPath(); c.moveTo(p.x, p.y); c.lineTo(p.x + 2, p.y + 10); c.stroke()
        p.x += p.vx; p.y += p.vy
        if (p.y > 400) weatherParticles.current.splice(i, 1)
      } else if (weather === 'fog') {
        c.fillStyle = 'rgba(255,255,255,0.1)'; c.globalAlpha = Math.max(0, p.life)
        c.beginPath(); c.arc(p.x, p.y, p.size, 0, Math.PI * 2); c.fill()
        p.x += p.vx; p.y += p.vy
        if (p.x > 450) weatherParticles.current.splice(i, 1)
      }
    }
    c.globalAlpha = 1.0

    // Pass aim cone
    if (activeMomentType === 'pass' && isDragging.current && dragStart.current && dragCurrent.current) {
      const pdx = dragCurrent.current.x - dragStart.current.x
      const pdy = dragCurrent.current.y - dragStart.current.y
      if (Math.sqrt(pdx * pdx + pdy * pdy) >= MIN_DRAG_LENGTH) {
        const pAngle = Math.atan2(pdy, pdx)
        c.strokeStyle = 'rgba(255,255,255,0.2)'; c.lineWidth = 1; c.setLineDash([4, 4])
        c.beginPath()
        c.moveTo(b.x, b.y)
        c.lineTo(b.x + Math.cos(pAngle - Math.PI / 8) * 160, b.y + Math.sin(pAngle - Math.PI / 8) * 160)
        c.moveTo(b.x, b.y)
        c.lineTo(b.x + Math.cos(pAngle + Math.PI / 8) * 160, b.y + Math.sin(pAngle + Math.PI / 8) * 160)
        c.stroke(); c.setLineDash([])
      }
    }

    fieldNPCs.current.forEach((n: any) => {
      const nz = n.z || 0
      if (n.type === 'teammate') {
        const pulse = 16 + Math.sin(Date.now() / 250) * 3
        c.fillStyle = 'rgba(34,197,94,0.22)'
        c.beginPath(); c.arc(n.x, n.y, pulse, 0, Math.PI * 2); c.fill()
        drawHumanoid(c, n.x, n.y, { bodyColor: '#DC2626', headColor: '#FBBF24' })
      } else {
        drawHumanoid(c, n.x, n.y - nz, { bodyColor: '#1e40af', headColor: '#FBBF24' })
      }
      if (n.name) {
        c.fillStyle = '#000'; c.font = 'bold 10px sans-serif'; c.textAlign = 'center'
        c.fillText(n.name, n.x + 1, n.y + 26)
        c.fillStyle = '#fff'; c.fillText(n.name, n.x, n.y + 25)
      }
      if (n.type === 'attacker') {
        const tr = tackleTimingRef.current
        const ringRadius = 20 + tr * 60
        const ringColor = tr < 0.45 ? '#9ca3af' : tr < 0.56 ? '#F59E0B' : tr < 0.80 ? '#16A34A' : '#DC2626'
        c.strokeStyle = ringColor; c.globalAlpha = tr < 0.50 ? 0.5 : 0.9; c.lineWidth = 3
        c.beginPath(); c.arc(n.x, n.y, ringRadius, 0, Math.PI * 2); c.stroke()
        c.globalAlpha = 1.0
        c.strokeStyle = 'rgba(255,255,255,0.7)'; c.lineWidth = 2
        c.beginPath()
        c.moveTo(n.x, n.y + 14); c.lineTo(n.x, n.y + 30); c.lineTo(n.x - 5, n.y + 24)
        c.moveTo(n.x, n.y + 30); c.lineTo(n.x + 5, n.y + 24)
        c.stroke()
      }
    })

    const keeperPosture = k.state === 'diving' ? 'diving' : 'idle'
    drawHumanoid(c, k.x, k.y - (k.z || 0), { bodyColor: k.state === 'saved' ? '#16A34A' : '#D97706', headColor: '#FBBF24', posture: keeperPosture })
    c.fillStyle = '#fff'
    const gloveSpread = keeperPosture === 'diving' ? 16 : 10
    c.beginPath(); c.arc(k.x - gloveSpread, k.y - 5, 4, 0, Math.PI * 2); c.fill()
    c.beginPath(); c.arc(k.x + gloveSpread, k.y - 5, 4, 0, Math.PI * 2); c.fill()

    if (!['corner', 'freekick'].includes(activeMomentType)) {
      drawHumanoid(c, 200, 320, { bodyColor: '#F59E0B', headColor: '#FBBF24', size: 1.2 })
    }

    if (activeMomentType === 'header' && b.active) {
      const headStatMod = statBoost(playerStats.head)
      const idealLo = 40 - headStatMod * 10
      const idealHi = 80 + headStatMod * 15
      const barX = 370, barY = 60, barH = 200, barW = 10
      c.fillStyle = 'rgba(0,0,0,0.5)'; c.fillRect(barX, barY, barW, barH)
      const zoneTop = barY + barH - (idealHi / 130) * barH
      const zoneH = ((idealHi - idealLo) / 130) * barH
      c.fillStyle = 'rgba(34,197,94,0.5)'; c.fillRect(barX, zoneTop, barW, zoneH)
      const ballZC = Math.max(0, Math.min(130, b.z))
      c.fillStyle = '#F59E0B'
      c.beginPath(); c.arc(barX + barW / 2, barY + barH - (ballZC / 130) * barH, 5, 0, Math.PI * 2); c.fill()
    }

    if (activeMomentType === 'touch' && !simulationFinished.current && readyPhaseRef.current === 'live') {
      const barX = 60, barY = 370, barW = 280, barH = 16
      c.fillStyle = 'rgba(0,0,0,0.65)'; c.fillRect(barX, barY, barW, barH)
      const win = touchWindowRef.current
      const pulse = Math.sin(Date.now() / 150) * 0.15 + 0.35
      c.fillStyle = `rgba(34,197,94,${pulse})`
      c.fillRect(barX + win.lo * barW, barY, (win.hi - win.lo) * barW, barH)
      c.fillStyle = '#fff'
      c.fillRect(barX + touchNeedleRef.current * barW - 2, barY - 3, 4, barH + 6)
      c.strokeStyle = '#fff'; c.lineWidth = 1.5; c.strokeRect(barX, barY, barW, barH)
      c.fillStyle = '#FEF3C7'; c.font = 'bold 9px sans-serif'; c.textAlign = 'center'
      c.fillText('FIRST TOUCH', barX + barW / 2, barY - 6)
    }

    const ballDrawRadius = b.radius + b.z / 15
    c.fillStyle = '#fff'
    c.beginPath(); c.arc(b.x, b.y - b.z, ballDrawRadius, 0, Math.PI * 2); c.fill()
    c.strokeStyle = '#000'; c.lineWidth = 1
    c.beginPath(); c.arc(b.x, b.y - b.z, ballDrawRadius, 0, Math.PI * 2); c.stroke()
    b.spinAngle = (b.spinAngle || 0) + (b.vx + b.vy) * 0.03
    c.save()
    c.translate(b.x, b.y - b.z)
    c.rotate(b.spinAngle)
    c.fillStyle = '#1c1917'
    c.beginPath(); c.arc(0, 0, ballDrawRadius * 0.3, 0, Math.PI * 2); c.fill()
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2
      c.beginPath(); c.arc(Math.cos(a) * ballDrawRadius * 0.55, Math.sin(a) * ballDrawRadius * 0.55, ballDrawRadius * 0.18, 0, Math.PI * 2); c.fill()
    }
    c.restore()

    if (b.active && Math.abs(b.curl || 0) > 0.05) {
      c.strokeStyle = `rgba(255,255,255,${0.4 + Math.abs(b.curl) * 0.5})`
      c.lineWidth = 1.5
      c.beginPath()
      c.arc(b.x, b.y - b.z, ballDrawRadius + 3, 0, Math.sign(b.curl) * Math.PI * 0.7)
      c.stroke()
    }

    if (isDragging.current && dragStart.current && dragCurrent.current && readyPhaseRef.current === 'live') {
      const ddx = dragCurrent.current.x - dragStart.current.x
      const ddy = dragCurrent.current.y - dragStart.current.y
      const length = Math.sqrt(ddx * ddx + ddy * ddy)

      if (length >= MIN_DRAG_LENGTH) {
        const isSlingshot = ['shot', 'penalty', 'header', 'freekick'].includes(activeMomentType)
        const power = Math.min(1, length / 120)
        const relV = getReleaseVelocity(dragPath.current)
        const relSpeed = Math.sqrt(relV.vx ** 2 + relV.vy ** 2)
        const curlLive = computeCurl(dragPath.current.map(p => ({ x: p.x, y: p.y })))
        const dragDY = dragStart.current.y - dragCurrent.current.y
        const variantLive = classifyShot(length, relSpeed, Math.abs(curlLive), dragDY, isSlingshot)

        if (isSlingshot) {
          const angle = Math.atan2(-ddy, -ddx)
          const p = Math.min(1, length / 120)
          const pvx = Math.cos(angle) * p * 16
          const pvy = Math.sin(angle) * p * 16 * VARIANT_VY[variantLive]
          const pvz = p * VARIANT_VZ[variantLive]
          const arcPts = previewArc(b.x, b.y, b.z, pvx, pvy, pvz, curlLive * VARIANT_CURL_MULT[variantLive])
          const arcColor = variantLive === 'driven' ? '#F59E0B' : variantLive === 'chip' || variantLive === 'lofted' ? '#60A5FA' : variantLive === 'finesse' ? '#34D399' : '#ffffff'
          for (const pt of arcPts) {
            c.fillStyle = arcColor; c.globalAlpha = pt.alpha * 0.7
            c.beginPath(); c.arc(pt.x, pt.y, 3, 0, Math.PI * 2); c.fill()
          }
          c.globalAlpha = 1.0
          const labelMap: Record<ShotVariant, string> = { chip: 'CHIP', driven: 'POWER', finesse: 'CURL', lofted: 'LOFTED', standard: '' }
          const label = labelMap[variantLive]
          if (label && ['shot', 'penalty', 'freekick'].includes(activeMomentType)) {
            const lx = b.x, ly = b.y - b.z - 24
            c.fillStyle = 'rgba(0,0,0,0.6)'; c.fillRect(lx - 24, ly - 12, 48, 16)
            c.fillStyle = '#FEF3C7'; c.font = 'bold 10px sans-serif'; c.textAlign = 'center'
            c.fillText(label, lx, ly)
          }
        } else if (activeMomentType === 'pass' || activeMomentType === 'corner') {
          const angle = Math.atan2(ddy, ddx)
          const previewX = b.x + Math.cos(angle) * 80
          const previewY = b.y + Math.sin(angle) * 80
          c.strokeStyle = power > 0.85 ? 'rgba(220,38,38,0.85)' : 'rgba(255,255,255,0.65)'
          c.lineWidth = 2; c.setLineDash([6, 4])
          c.beginPath(); c.moveTo(b.x, b.y - b.z); c.lineTo(previewX, previewY); c.stroke()
          c.setLineDash([])
          c.strokeStyle = power > 0.85 ? '#DC2626' : '#F59E0B'; c.lineWidth = 2
          c.beginPath(); c.arc(previewX, previewY, 8, 0, Math.PI * 2); c.stroke()
        }

        c.strokeStyle = '#F59E0B'; c.lineWidth = 3; c.setLineDash([4, 4])
        c.beginPath(); c.moveTo(dragStart.current.x, dragStart.current.y); c.lineTo(dragCurrent.current.x, dragCurrent.current.y); c.stroke()
        c.setLineDash([])

        if (activeMomentType !== 'touch') {
          const barW = 120, barH = 12, barX = 140, barY2 = 372
          c.fillStyle = 'rgba(0,0,0,0.6)'; c.fillRect(barX, barY2, barW, barH)
          c.fillStyle = 'rgba(34,197,94,0.4)'; c.fillRect(barX + barW * 0.6, barY2, barW * 0.25, barH)
          c.fillStyle = power > 0.85 ? '#DC2626' : (power > 0.6 ? '#16A34A' : '#F59E0B')
          c.fillRect(barX, barY2, barW * power, barH)
          c.strokeStyle = '#fff'; c.lineWidth = 1; c.strokeRect(barX, barY2, barW, barH)
          c.fillStyle = '#fff'; c.font = 'bold 9px sans-serif'; c.textAlign = 'center'
          c.fillText('POWER', barX + barW / 2, barY2 - 3)
        }
      }
    }

    if (showTutorialRef.current && !currentOutcomeRef.current && !isDragging.current && readyPhaseRef.current === 'live') {
      const t = Date.now() / 600
      const phase = (Math.sin(t) + 1) / 2
      const isSlingshot = ['shot', 'penalty', 'header', 'freekick'].includes(activeMomentType)
      c.strokeStyle = `rgba(255,255,255,${0.4 + phase * 0.45})`
      c.lineWidth = 3; c.setLineDash([6, 4])
      const dirY = isSlingshot ? 1 : -1
      const toY = b.y - b.z + 70 * dirY * phase
      c.beginPath(); c.moveTo(b.x, b.y - b.z); c.lineTo(b.x, toY); c.stroke()
      c.setLineDash([])
      c.beginPath()
      c.moveTo(b.x, toY)
      c.lineTo(b.x - 6, toY - 8 * dirY)
      c.lineTo(b.x + 6, toY - 8 * dirY)
      c.closePath()
      c.fillStyle = `rgba(255,255,255,${0.6 + phase * 0.3})`; c.fill()
      c.fillStyle = 'rgba(0,0,0,0.6)'
      c.fillRect(b.x - 80, b.y - b.z + (isSlingshot ? 80 : -40), 160, 18)
      c.fillStyle = '#fff'; c.font = 'bold 10px sans-serif'; c.textAlign = 'center'
      c.fillText(isSlingshot ? 'Drag back to power up' : 'Drag toward target', b.x, b.y - b.z + (isSlingshot ? 92 : -27))
    }

    if (weather === 'fog') {
      c.fillStyle = 'rgba(220,220,220,0.18)'; c.fillRect(0, 0, 400, 400)
    }

    if (goalFlashRef.current > 0) {
      c.fillStyle = `rgba(255,255,255,${Math.min(1, goalFlashRef.current) * 0.75})`
      c.fillRect(0, 0, 400, 400)
    }

    if (readyPhaseRef.current === 'intro') {
      c.fillStyle = 'rgba(28,25,23,0.55)'; c.fillRect(0, 0, 400, 400)
      const info = MOMENT_INFO[activeMomentType]
      c.fillStyle = '#F59E0B'; c.font = 'bold 26px serif'; c.textAlign = 'center'
      c.fillText(info.title, 200, 190)
      c.fillStyle = '#FEF3C7'; c.font = '12px sans-serif'
      c.fillText(`${info.statLabel}: ${(playerStats as any)[info.stat] || 10}`, 200, 215)
      c.fillStyle = `rgba(254,243,199,${0.4 + Math.sin(Date.now() / 200) * 0.3})`
      c.font = 'bold 11px sans-serif'; c.fillText('GET READY', 200, 240)
    }

    // eslint-disable-next-line react-hooks/immutability
    requestRef.current = requestAnimationFrame(drawFrame)
  }, [activeMomentType, weather, updateSimulation, playerStats, reducedMotion])

  const getCanvasPoint = (clientX: number, clientY: number) => {
    const rect = canvasRef.current!.getBoundingClientRect()
    return { x: (clientX - rect.left) * (400 / rect.width), y: (clientY - rect.top) * (400 / rect.height) }
  }

  const beginDrag = (clientX: number, clientY: number) => {
    if (currentOutcomeRef.current || simulationFinished.current) return
    const pt = getCanvasPoint(clientX, clientY)
    dragStart.current = pt
    dragCurrent.current = { ...pt }
    dragPath.current = [{ x: pt.x, y: pt.y, t: Date.now() }]
    isDragging.current = true
    deadZoneCrossed.current = false
  }

  const updateDrag = (clientX: number, clientY: number) => {
    if (!isDragging.current) return
    const pt = getCanvasPoint(clientX, clientY)
    dragCurrent.current = pt
    dragPath.current.push({ x: pt.x, y: pt.y, t: Date.now() })
    if (dragPath.current.length > 80) dragPath.current.shift()
    if (!deadZoneCrossed.current && dragStart.current) {
      const dx = pt.x - dragStart.current.x, dy = pt.y - dragStart.current.y
      if (Math.sqrt(dx * dx + dy * dy) > MIN_DRAG_LENGTH) {
        deadZoneCrossed.current = true
        navigator.vibrate?.([6])
      }
    }
  }

  const endDrag = () => {
    if (!isDragging.current) return
    isDragging.current = false
    if (!dragStart.current || !dragCurrent.current) return
    const ddx = dragCurrent.current.x - dragStart.current.x
    const ddy = dragCurrent.current.y - dragStart.current.y
    const length = Math.sqrt(ddx * ddx + ddy * ddy)
    if (length < MIN_DRAG_LENGTH) { dragStart.current = null; dragCurrent.current = null; return }
    const isSlingshot = ['shot', 'penalty', 'header', 'freekick'].includes(activeMomentType)
    const angle = isSlingshot ? Math.atan2(-ddy, -ddx) : Math.atan2(ddy, ddx)
    const power = Math.max(0.25, Math.min(1, length / 120))
    const lateral = isSlingshot ? Math.abs(ddx) : Math.abs(ddy)
    const accuracy = Math.max(0, 1 - lateral / 100)
    const relV = getReleaseVelocity(dragPath.current)
    const relSpeed = Math.sqrt(relV.vx ** 2 + relV.vy ** 2)
    const curl = computeCurl(dragPath.current.map(p => ({ x: p.x, y: p.y })))
    const dragDY = dragStart.current.y - dragCurrent.current.y
    const variant = classifyShot(length, relSpeed, Math.abs(curl), dragDY, isSlingshot)
    shotVariantRef.current = variant
    dragStart.current = null; dragCurrent.current = null
    handleInput(accuracy, power, angle, curl, variant)
  }

  const cancelDrag = () => {
    isDragging.current = false
    dragStart.current = null; dragCurrent.current = null; dragPath.current = []
  }

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return
    e.preventDefault()
    canvasRef.current?.setPointerCapture(e.pointerId)
    beginDrag(e.clientX, e.clientY)
  }
  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDragging.current) return
    e.preventDefault()
    updateDrag(e.clientX, e.clientY)
  }
  const onPointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDragging.current) return
    e.preventDefault()
    canvasRef.current?.releasePointerCapture(e.pointerId)
    endDrag()
  }
  const onPointerCancel = (e: React.PointerEvent<HTMLCanvasElement>) => {
    canvasRef.current?.releasePointerCapture(e.pointerId)
    cancelDrag()
  }

  useEffect(() => {
    requestRef.current = requestAnimationFrame(drawFrame)
    return () => {
      if (requestRef.current !== null) cancelAnimationFrame(requestRef.current)
      clearMomentTimeouts()
    }
  }, [momentIndex, drawFrame, clearMomentTimeouts])

  const info = MOMENT_INFO[activeMomentType]
  const relevantStatValue = (playerStats as any)[info.stat] || 10
  const isWin = currentOutcome && ['GOAL', 'TOP CORNER', 'CHIPPED HIM', 'TUCKED AWAY', 'BANGER', 'SUCCESS'].includes(currentOutcome.outcome)
  const isClose = currentOutcome && ['WOODWORK', 'CROSSBAR', 'NEAR MISS', 'SAVED'].includes(currentOutcome.outcome)

  return (
    <ScreenContainer>
      <div style={{ background: 'var(--charcoal)', color: 'var(--cream)', padding: '12px', borderRadius: '8px', marginBottom: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <div>
            <div style={{ fontSize: '10px', color: 'var(--kit-amber)', fontWeight: 'bold' }}>{fixture.kind === 'cup' ? 'TANKARD · ' : ''}MOMENT {momentIndex + 1}/{totalMoments} · vs {opponent.name.toUpperCase()}</div>
            <div style={{ fontWeight: 'bold', fontSize: '14px', fontFamily: 'var(--font-primary)' }}>{info.title}</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <div style={{ fontSize: '9px', color: 'var(--kit-amber)', fontWeight: 'bold' }}>{info.statLabel}</div>
            <div style={{ fontSize: '20px', fontWeight: 'bold', fontFamily: 'var(--font-primary)', lineHeight: 1 }}>{relevantStatValue}</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '9px', textTransform: 'uppercase', marginBottom: '2px', opacity: 0.8 }}>Momentum</div>
            <div style={{ height: '5px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{ width: `${momentum}%`, height: '100%', background: momentum > 65 ? 'var(--success)' : momentum < 35 ? 'var(--danger)' : 'var(--kit-amber)', transition: 'width 0.3s ease' }} />
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '9px', textTransform: 'uppercase', marginBottom: '2px', opacity: 0.8 }}>Stamina</div>
            <div style={{ height: '5px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{ width: `${energy}%`, height: '100%', background: energy < 30 ? 'var(--danger)' : 'var(--kit-amber)', transition: 'width 0.3s ease' }} />
            </div>
          </div>
        </div>
      </div>

      <div style={{ position: 'relative', width: '100%', maxWidth: '400px', margin: '0 auto' }}>
        <canvas
          ref={canvasRef}
          role="img"
          aria-label={`Match moment: ${info.title} vs ${opponent.name}`}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerCancel}
          onContextMenu={(e) => e.preventDefault()}
          style={{
            width: '100%',
            background: '#2d5a27',
            borderRadius: '12px',
            border: '4px solid var(--charcoal)',
            touchAction: 'none',
            userSelect: 'none',
            WebkitUserSelect: 'none',
            WebkitTouchCallout: 'none' as any,
            cursor: currentOutcome ? 'default' : 'crosshair',
            display: 'block',
          }}
        />

        {currentOutcome && (
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(28,25,23,0.92)', color: 'var(--cream)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            padding: '24px', textAlign: 'center', borderRadius: '8px', zIndex: 10,
            animation: 'sllFadeIn 0.4s ease-out',
          }}>
            <div style={{
              fontSize: isWin ? '34px' : '30px', fontWeight: 'bold',
              color: isWin ? 'var(--success)' : (isClose ? 'var(--kit-amber)' : 'var(--danger)'),
              marginBottom: '12px', textTransform: 'uppercase',
              textShadow: isWin ? '0 0 20px rgba(34,197,94,0.5)' : 'none', letterSpacing: '1px',
            }}>
              {currentOutcome.outcome}
            </div>
            <p style={{ fontSize: '15px', marginBottom: '24px', maxWidth: '320px', lineHeight: 1.4 }}>"{currentOutcome.details}"</p>
            <button
              aria-label="Continue to next moment"
              className="sll-btn"
              onClick={() => {
                const nextResults = [...momentResults, { type: activeMomentType, value: currentOutcome.clampedValue, outcome: currentOutcome.outcome, clampedValue: currentOutcome.clampedValue }]
                setMomentResults(nextResults)
                if (momentIndex < totalMoments - 1) setMomentIndex(momentIndex + 1)
                else onCompleteMatch(nextResults, matchStats)
              }}
              style={{ width: 'auto', padding: '12px 40px', minHeight: '44px' }}
            >
              CONTINUE
            </button>
          </div>
        )}

        <div style={{
          position: 'absolute', top: '15px', left: '15px',
          display: 'flex', alignItems: 'center', background: 'rgba(0,0,0,0.85)',
          border: '2px solid var(--charcoal)', borderRadius: '4px',
          fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#fff',
          overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.4)', zIndex: 5,
        }}>
          <div style={{ background: 'var(--kit-amber)', color: 'var(--charcoal)', padding: '4px 7px', fontWeight: '900' }}>W{store.season.week}</div>
          <div style={{ padding: '4px 7px', borderRight: '1px solid #444' }}>DUCK</div>
          <div style={{ padding: '4px 7px', fontWeight: 'bold', minWidth: '34px', textAlign: 'center' }}>{matchStats.goals}-?</div>
          <div style={{ padding: '4px 7px', borderLeft: '1px solid #444', background: 'rgba(255,255,255,0.06)' }}>{opponent.name.split(' ').map((w: string) => w[0]).join('').toUpperCase()}</div>
          <div style={{ background: '#333', padding: '4px 7px' }}>{Math.min(90, Math.round(((momentIndex + 1) / totalMoments) * 90))}'</div>
        </div>

        {weather !== 'clear' && (
          <div style={{
            position: 'absolute', top: '15px', right: '15px',
            background: 'rgba(0,0,0,0.8)', color: '#fff',
            fontSize: '10px', fontFamily: 'var(--font-mono)',
            padding: '4px 8px', borderRadius: '4px', zIndex: 5,
            border: '1px solid var(--charcoal)',
          }}>
            {weather === 'rain' ? '🌧 RAIN' : weather === 'fog' ? '🌫 FOG' : weather === 'sunshine' ? '☀ SUN' : weather === 'wind' ? '💨 WIND' : weather === 'hail' ? '🌨 HAIL' : weather.toUpperCase()}
          </div>
        )}
      </div>

      <div style={{ marginTop: '16px', fontSize: '14px', color: 'var(--charcoal)', textAlign: 'center', background: 'var(--cream)', padding: '12px', borderRadius: '8px', border: '2px solid var(--border)' }}>
        {!currentOutcome ? info.instruction : 'Moment complete.'}
      </div>
    </ScreenContainer>
  )
}

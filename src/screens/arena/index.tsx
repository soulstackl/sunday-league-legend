/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import type { SaveState, ChaosCard, MomentResult, MatchStats } from '../../types/game'
import { OPPONENTS } from '../../data/opponents'
import { ScreenContainer } from '../../components/shared/ScreenContainer'
import { getChaosModifiers } from '../../engine/chaos'
import { AudioManager } from '../../audio/AudioManager'

export interface ArenaMatchStats extends MatchStats {
  shots: number
  goals: number
  passes: number
  passSuccess: number
  tackles: number
  tackleSuccess: number
}

interface ArenaScreenProps {
  store: SaveState
  activeCards: ChaosCard[]
  onCompleteMatch: (results: MomentResult[], stats: ArenaMatchStats) => void
}

// Local stat helper: maps stat (0..20) to a modifier in roughly -0.5..+0.5 range
// Centred on 10 so an average player gets no bonus or penalty
const statBoost = (stat: number, neutral = 10): number =>
  Math.max(-0.4, Math.min(0.5, (stat - neutral) / 20))

// ---------- module-level constants (stable, no deps, safe outside component) ----------

const MOMENT_INFO: Record<string, { title: string; instruction: string; stat: string; statLabel: string }> = {
  shot:     { title: 'OPEN PLAY STRIKE',    instruction: 'Drag back to aim and set power. Release to unleash.',        stat: 'strike', statLabel: 'STRIKE' },
  pass:     { title: 'CLINICAL PASS',       instruction: 'Find your teammate. Drag from ball to target.',              stat: 'pass',   statLabel: 'PASS' },
  touch:    { title: 'FIRST TOUCH',         instruction: "Incoming! Cushion it — match the ball's speed.",             stat: 'touch',  statLabel: 'TOUCH' },
  tackle:   { title: 'LAST-MAN TACKLE',     instruction: 'Wait for him. Drag at the attacker.',                        stat: 'engine', statLabel: 'ENGINE' },
  header:   { title: 'AERIAL THREAT',       instruction: 'Wait for the drop — drag up to power it home.',             stat: 'head',   statLabel: 'HEAD' },
  penalty:  { title: 'SPOT KICK',           instruction: 'Pick a corner. Slingshot to shoot.',                        stat: 'strike', statLabel: 'STRIKE' },
  freekick: { title: 'DEAD-BALL SPECIAL',   instruction: 'Slingshot the ball over the wall and into the corner.',     stat: 'strike', statLabel: 'STRIKE' },
  corner:   { title: 'IN THE MIXER',        instruction: "Whip it onto a teammate's head.",                           stat: 'pass',   statLabel: 'PASS' },
}

const GOAL_LINES: Record<string, string[]> = {
  topcorner: ['TOP BINS! Absolute screamer!', 'Top corner — keeper had no chance!', 'Postage stamp! What a finish!'],
  chip:      ['Chipped him! Audacious!', 'Dinked over the keeper — class!', 'Coolly chipped — pick that out!'],
  tucked:    ['Tucked away! Cold-blooded.', 'Slotted neatly inside the post.', 'Side-footed home like a pro.'],
  rising:    ['Rising rocket — back of the net!', 'Lashed it home off the underside!', 'Power finish! Get in!'],
  standard:  ['Pick that out!', 'Get in! Back of the net.', 'Goal — well done lad.', 'Worldie. Pure worldie.'],
}

const NEARMISS_LINES = [
  'Inches wide of the post!',
  "Crowd ooh'd — that whistled past the post!",
  "So close — keeper's heart skipped a beat.",
  'Curled just over the bar!',
]

// --------------------------------------------------------------------------------------

export function ArenaScreen({ store, activeCards, onCompleteMatch }: ArenaScreenProps) {
  const opponent = OPPONENTS[(store.season.week - 1) % OPPONENTS.length]
  const playerStats = store.player.stats

  // Opponent's keeper profile — better keepers on harder teams.
  // Royal Oak Rovers explicitly note "Their keeper is exceptional".
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

  // Pre-moment "READY" overlay — prevents premature input, builds anticipation
  const [readyPhase, setReadyPhase] = useState('intro')
  const readyPhaseRef = useRef('intro')
  useEffect(() => { readyPhaseRef.current = readyPhase }, [readyPhase])

  // First-time tutorial hint
  const [showTutorial, setShowTutorial] = useState(() => {
    try { return !localStorage.getItem('sll-tutorial-seen-v1') } catch (_) { return false }
  })
  const showTutorialRef = useRef(false)
  useEffect(() => { showTutorialRef.current = showTutorial }, [showTutorial])

  const currentOutcomeRef = useRef<{ outcome: string; details: string; clampedValue: number } | null>(null)

  // Goal cinematic state
  const goalFlashRef = useRef(0)       // white-flash overlay (0..1, decays)
  const timeScaleRef = useRef(1)       // 1 = real-time, 0.35 = slow-mo
  const hitStopRef = useRef(0)         // frames of total freeze remaining

  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const requestRef = useRef<number | null>(null)

  const weather = activeCards.find(c => c.type === 'Weather')?.id || 'clear'
  const pitch = activeCards.find(c => c.type === 'Pitch')?.id || 'clear'
  const weatherParticles = useRef<any[]>([])
  // Stable random seed for the crowd — fixed on mount, not recalculated on every render
  const [crowdSeed] = useState(() => Math.floor(Math.random() * 1000))
  const crowdSeedRef = useRef(crowdSeed)
  // Ball trail (positions captured per frame) — gives motion a sense of curve/spin
  const ballTrail = useRef<{ x: number; y: number; z: number }[]>([])

  // Balanced 4-moment sequence per match: 1 open-play strike, 1 pass/touch, 1 defensive moment, 1 wildcard.
  // Fixed on mount so consecutive matches feel different and all 8 moment types eventually appear.
  const [matchMoments] = useState<string[]>(() => {
    const pickOne = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)]
    const seq = [
      pickOne(['shot', 'header']),
      pickOne(['pass', 'touch', 'corner']),
      pickOne(['tackle', 'touch']),
      pickOne(['penalty', 'freekick', 'shot', 'corner']),
    ]
    // Avoid duplicates within a single match by swapping in the underused types
    const pool = ['shot', 'pass', 'touch', 'tackle', 'header', 'penalty', 'freekick', 'corner']
    const seen = new Set<string>()
    return seq.map(m => {
      if (!seen.has(m)) { seen.add(m); return m }
      const alt = pool.find(p => !seen.has(p)) || m
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
  })

  const keeper = useRef<any>({
    x: 200, y: 45, z: 0,
    targetX: 200,
    state: 'idle', // idle, moving, diving, saved, beaten
    diveX: 0, diveY: 0,
    reach: 40,
  })

  const fieldNPCs = useRef<any[]>([]) // Defenders or teammates
  const particles = useRef<any[]>([])
  const pendingTimeouts = useRef<number[]>([]) // moment-scoped timeouts (cleared on reset/unmount)
  const lastDragVector = useRef<{ angle: number; power: number; accuracy: number } | null>(null) // for direction-based skill scoring (tackle)

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

  const resetSimulation = useCallback(() => {
    clearMomentTimeouts()
    simulationFinished.current = false
    particles.current = []
    ballTrail.current = []
    isDragging.current = false
    dragStart.current = null
    dragCurrent.current = null
    lastDragVector.current = null
    goalFlashRef.current = 0
    timeScaleRef.current = 1
    hitStopRef.current = 0
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
    }
    keeper.current = {
      x: 200, y: 45, z: 0,
      targetX: 200,
      state: 'idle',
      diveX: 0, diveY: 0,
      reach: keeperProfile.reach,
      reaction: keeperProfile.reaction,
      readSkill: keeperProfile.readSkill,
    }

    // Scenario setups
    if (activeMomentType === 'shot') {
      ball.current.x = 150 + Math.random() * 100
      ball.current.y = 280 + Math.random() * 60
      fieldNPCs.current = [
        { x: (Math.random() < 0.5 ? 165 : 235), y: 120, type: 'defender', radius: 15, vx: (Math.random() - 0.5) * 1.5 },
      ]
    } else if (activeMomentType === 'pass') {
      ball.current.x = 200; ball.current.y = 350
      const gavX = 90 + Math.random() * 40
      const callX = 270 + Math.random() * 50
      fieldNPCs.current = [
        { x: gavX, y: 130 + Math.random() * 40, type: 'teammate', name: 'Gav' },
        { x: callX, y: 160 + Math.random() * 40, type: 'teammate', name: 'Callum' },
      ]
    } else if (activeMomentType === 'touch') {
      const incomingFromLeft = Math.random() < 0.5
      ball.current.x = incomingFromLeft ? 80 : 320
      ball.current.y = 180
      ball.current.z = 30
      ball.current.active = true
      ball.current.vx = incomingFromLeft ? 2.5 : -2.5
      ball.current.vy = 4
      ball.current.vz = 2
      fieldNPCs.current = []
    } else if (activeMomentType === 'tackle') {
      ball.current.active = false
      const attackerSpeed = 3.0 + (opponent.difficulty - 5) * 0.15
      fieldNPCs.current = [
        { x: 140 + Math.random() * 120, y: -20, vy: attackerSpeed, type: 'attacker', hasBall: true },
      ]
    } else if (activeMomentType === 'header') {
      ball.current.x = 200; ball.current.y = 150; ball.current.z = 100
      ball.current.active = true; ball.current.vz = -1
      fieldNPCs.current = []
    } else if (activeMomentType === 'penalty') {
      ball.current.x = 200; ball.current.y = 250
      fieldNPCs.current = []
      keeper.current.reach = keeperProfile.reach + 8
    } else if (activeMomentType === 'freekick') {
      ball.current.x = 200; ball.current.y = 290
      fieldNPCs.current = [
        { x: 170, y: 150, type: 'defender', radius: 15, vx: 0 },
        { x: 200, y: 150, type: 'defender', radius: 15, vx: 0 },
        { x: 230, y: 150, type: 'defender', radius: 15, vx: 0 },
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
  }, [activeMomentType, clearMomentTimeouts, keeperProfile, opponent.difficulty])

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

  // Keep currentOutcomeRef synced for the rAF loop closure
  useEffect(() => { currentOutcomeRef.current = currentOutcome }, [currentOutcome])

  // Crowd murmur loop while in arena
  useEffect(() => {
    const murmur = () => {
      try { AudioManager.playCrowdMurmur(0.04) } catch (_) {}
    }
    const id = setInterval(murmur, 2400)
    return () => clearInterval(id)
  }, [])

  const resolveSimulationOutcome = useCallback((manualOutcome: { outcome: string; details: string } | null = null) => {
    if (simulationFinished.current) return
    simulationFinished.current = true

    const b = ball.current
    let outcome = manualOutcome?.outcome || 'MISS'
    let details = manualOutcome?.details || 'Into the stands, son. Have a look at yourself.'

    // Stats tracking
    if (activeMomentType === 'shot' || activeMomentType === 'penalty' || activeMomentType === 'freekick' || activeMomentType === 'header') {
      setMatchStats(s => ({ ...s, shots: s.shots + 1 }))
    } else if (activeMomentType === 'pass' || activeMomentType === 'corner') {
      setMatchStats(s => ({ ...s, passes: s.passes + 1 }))
    } else if (activeMomentType === 'tackle') {
      setMatchStats(s => ({ ...s, tackles: s.tackles + 1 }))
    }

    // Physics-driven outcomes (priority order)
    if (b.inGoal) {
      const quality = b.goalQuality || 'standard'
      const lines = GOAL_LINES[quality] || GOAL_LINES.standard
      if (quality === 'topcorner') outcome = 'TOP CORNER'
      else if (quality === 'chip') outcome = 'CHIPPED HIM'
      else if (quality === 'tucked') outcome = 'TUCKED AWAY'
      else if (quality === 'rising') outcome = 'BANGER'
      else outcome = 'GOAL'
      details = lines[Math.floor(Math.random() * lines.length)]
      AudioManager.playGoal()
      screenShakeRef.current = 12
      setMatchStats(s => ({ ...s, goals: s.goals + 1 }))
    } else if (b.hitBar) {
      outcome = 'CROSSBAR'
      details = 'Cannons off the bar! Inches from a goal!'
      AudioManager.playOoh()
    } else if (b.hitPost) {
      outcome = 'WOODWORK'
      details = 'Off the post! Agony — could\'ve been a worldie.'
      AudioManager.playOoh()
    } else if (b.saved) {
      outcome = 'SAVED'
      if (b.struck && b.struck.basePower > 0.85) details = 'Their keeper somehow gets a glove on it. Great save.'
      else if (opponent.id === 'royal-oak-rovers') details = "Their keeper's a brick wall today — held easily."
      else details = 'Keeper holds it. Decent shot, better save.'
      AudioManager.playGroan()
    } else if (b.intercepted && !manualOutcome) {
      outcome = 'INTERCEPTED'
      details = activeMomentType === 'corner' ? 'Cleared by the first man. Bobbins delivery.' : 'Cut out by their defender. Hospital ball.'
      AudioManager.playMiss()
    } else if (b.reachedTeammate && !manualOutcome) {
      outcome = 'SUCCESS'
      const who = b.reachedTeammate.name || 'your man'
      details = activeMomentType === 'corner'
        ? `Whipped in beautifully — ${who} rose highest!`
        : `Spot on. Right to ${who}'s feet.`
      AudioManager.playPing()
      setMatchStats(s => ({ ...s, passSuccess: s.passSuccess + 1 }))
    } else if (!manualOutcome) {
      const isShotType = activeMomentType === 'shot' || activeMomentType === 'penalty' || activeMomentType === 'freekick' || activeMomentType === 'header'
      if (isShotType && b.nearMiss) {
        outcome = 'NEAR MISS'
        details = NEARMISS_LINES[Math.floor(Math.random() * NEARMISS_LINES.length)]
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
      if (outcome === 'SUCCESS' || outcome === 'GOAL') AudioManager.playPing()
      else AudioManager.playMiss()
    }

    if (activeMomentType === 'tackle' && outcome === 'SUCCESS') {
      setMatchStats(s => ({ ...s, tackleSuccess: s.tackleSuccess + 1 }))
    }

    // Outcome scoring — goals & passes full credit, woodwork/near-miss partial credit
    let clampedValue = 0.2
    const winningOutcomes = ['GOAL', 'TOP CORNER', 'CHIPPED HIM', 'TUCKED AWAY', 'BANGER', 'SUCCESS']
    const partialOutcomes = ['WOODWORK', 'CROSSBAR']
    const closeOutcomes = ['NEAR MISS', 'SAVED']
    if (winningOutcomes.includes(outcome)) clampedValue = 1
    else if (partialOutcomes.includes(outcome)) clampedValue = 0.55
    else if (closeOutcomes.includes(outcome)) clampedValue = 0.4

    if (clampedValue >= 0.9) setMomentum(m => Math.min(100, m + 15))
    else if (clampedValue >= 0.4) setMomentum(m => Math.max(0, m - 3))
    else setMomentum(m => Math.max(0, m - 10))

    setCurrentOutcome({ outcome, details, clampedValue })
  }, [activeMomentType, opponent.id])

  const handleInput = useCallback((accuracy: number, power: number, angle: number) => {
    if (simulationFinished.current) return
    if (readyPhaseRef.current !== 'live') return
    AudioManager.init()

    if (showTutorial) {
      try { localStorage.setItem('sll-tutorial-seen-v1', '1') } catch (_) {}
      setShowTutorial(false)
    }

    const info = MOMENT_INFO[activeMomentType]
    const relevantStat = (playerStats as any)[info.stat] || 10
    const statMod = statBoost(relevantStat)
    const vibesMod = statBoost(playerStats.vibes || 10) * 0.5
    const momentumBoost = (momentum - 50) / 500
    const energyPenalty = (100 - energy) / 500
    const chaosMods = getChaosModifiers(activeCards)
    const effectiveAccuracy = Math.max(0, Math.min(1.15, accuracy + statMod + momentumBoost + vibesMod - energyPenalty - chaosMods.accuracyPenalty))
    const effectivePower = Math.max(0.2, Math.min(1.15, power + statMod * 0.4 - chaosMods.powerPenalty))
    lastDragVector.current = { angle, power: effectivePower, accuracy: effectiveAccuracy }

    // TACKLE — direction + timing both matter; ENGINE extends reach, PACE widens timing
    if (activeMomentType === 'tackle') {
      setEnergy(e => Math.max(0, e - (10 - Math.round(statBoost(playerStats.graft) * 10))))
      const attacker = fieldNPCs.current.find((n: any) => n.type === 'attacker')
      if (!attacker) {
        resolveSimulationOutcome({ outcome: 'BEATEN', details: 'He skipped past you.' })
        return
      }
      const distFromPlayer = Math.sqrt((attacker.x - 200) ** 2 + (attacker.y - 320) ** 2)
      const aimAngle = Math.atan2(attacker.y - 320, attacker.x - 200)
      const angularAlignment = Math.cos(angle - aimAngle)
      const engineReach = 75 + statBoost(playerStats.engine) * 60 + momentumBoost * 100
      const paceTolerance = 0.3 - statBoost(playerStats.pace) * 0.4
      const timingOk = distFromPlayer < engineReach
      const aimOk = angularAlignment > paceTolerance
      if (timingOk && aimOk) {
        AudioManager.playKick('strike')
        screenShakeRef.current = 6
        hitStopRef.current = 4
        resolveSimulationOutcome({ outcome: 'SUCCESS', details: 'Crunching tackle — ball won, cleanly.' })
      } else if (!timingOk && distFromPlayer > 110) {
        resolveSimulationOutcome({ outcome: 'EARLY', details: "Dived in too early. He's gone past you." })
      } else if (!timingOk) {
        resolveSimulationOutcome({ outcome: 'LATE', details: "A split-second late — he's away." })
      } else {
        resolveSimulationOutcome({ outcome: 'BEATEN', details: "Wrong angle. He's just nutmegged you." })
      }
      return
    }

    if (ball.current.active && activeMomentType !== 'touch' && activeMomentType !== 'header') return

    setEnergy(e => Math.max(0, e - 5))

    if (activeMomentType === 'pass' || activeMomentType === 'corner') AudioManager.playKick('pass')
    else if (activeMomentType === 'header') AudioManager.playKick('header')
    else AudioManager.playKick('strike')

    ball.current.active = true
    ball.current.struck = { type: activeMomentType, basePower: effectivePower, accuracy: effectiveAccuracy }

    scheduleMomentTimeout(() => {
      if (simulationFinished.current) return
      ball.current.active = false
      const b = ball.current
      const isShotType = activeMomentType === 'shot' || activeMomentType === 'penalty' || activeMomentType === 'freekick' || activeMomentType === 'header'
      if (isShotType && b.y < 90 && b.x > 80 && b.x < 320) {
        b.nearMiss = true
        AudioManager.playOoh()
      }
      resolveSimulationOutcome()
    }, 4500)

    if (activeMomentType === 'shot' || activeMomentType === 'penalty') {
      ball.current.vx = Math.cos(angle) * effectivePower * 18
      ball.current.vy = Math.sin(angle) * effectivePower * 18
      ball.current.vz = effectivePower * 6
      if (statMod > 0.1) ball.current.curl = { ax: 0, ay: -statMod * 0.15 }
    } else if (activeMomentType === 'header') {
      const z = ball.current.z
      const headStat = statBoost(playerStats.head)
      const winLow = 15 - headStat * 15
      const winHigh = 110 + headStat * 20
      const wellTimed = z > winLow && z < winHigh
      if (!wellTimed) {
        ball.current.active = false
        resolveSimulationOutcome({ outcome: 'MISTIMED', details: 'Mistimed your jump — ball squirms over your head.' })
        return
      }
      const sweetLow = 40 - headStat * 10
      const sweetHigh = 80 + headStat * 15
      const sweetSpot = z > sweetLow && z < sweetHigh
      const headerPower = sweetSpot ? effectivePower : effectivePower * 0.7
      ball.current.vx = Math.cos(angle) * headerPower * 16
      ball.current.vy = Math.sin(angle) * headerPower * 16
      ball.current.vz = -headerPower * 2.5
    } else if (activeMomentType === 'freekick') {
      ball.current.vx = Math.cos(angle) * effectivePower * 17
      ball.current.vy = Math.sin(angle) * effectivePower * 17
      ball.current.vz = effectivePower * 9
      const curl = statBoost(playerStats.pass) * 0.3
      ball.current.curl = { ax: curl * Math.sign(Math.cos(angle)) * 0.3, ay: 0 }
    } else if (activeMomentType === 'pass') {
      ball.current.vx = Math.cos(angle) * effectivePower * 12
      ball.current.vy = Math.sin(angle) * effectivePower * 12
      ball.current.vz = effectivePower * 1.5
    } else if (activeMomentType === 'corner') {
      ball.current.vx = Math.cos(angle) * effectivePower * 13
      ball.current.vy = Math.sin(angle) * effectivePower * 13
      ball.current.vz = effectivePower * 6
    } else if (activeMomentType === 'touch') {
      ball.current.vx = ball.current.vx * 0.2 + Math.cos(angle) * effectivePower * 4
      ball.current.vy = ball.current.vy * 0.2 + Math.sin(angle) * effectivePower * 4
      ball.current.vz *= 0.1
      const touchStat = statBoost(playerStats.touch)
      const minBand = 0.35 - touchStat * 0.2
      const maxBand = 0.95 + touchStat * 0.1
      const cushioned = effectiveAccuracy > minBand && effectivePower > 0.3 && effectivePower < maxBand
      scheduleMomentTimeout(() => {
        if (cushioned) {
          resolveSimulationOutcome({ outcome: 'SUCCESS', details: 'Beautiful first touch — glued to your boot.' })
        } else if (effectivePower >= maxBand) {
          resolveSimulationOutcome({ outcome: 'BOBBLED', details: 'Too heavy. Ball ran away from you.' })
        } else {
          resolveSimulationOutcome({ outcome: 'POOR TOUCH', details: 'Bounces off your shin. Wasted it.' })
        }
      }, 450)
    }

    const isShotType = activeMomentType === 'shot' || activeMomentType === 'penalty' || activeMomentType === 'header' || activeMomentType === 'freekick'
    if (isShotType) {
      const baseDelay = activeMomentType === 'penalty' ? 130 : (activeMomentType === 'freekick' ? 230 : keeperProfile.reaction)
      scheduleMomentTimeout(() => {
        if (keeper.current.state === 'idle') {
          keeper.current.state = 'diving'
          const wrongWayChance = (1 - keeperProfile.readSkill) * 0.45
          const sign = Math.random() < wrongWayChance ? -1 : 1
          const magnitude = (1 - keeperProfile.readSkill) * 70 + (1 - effectiveAccuracy) * 50 + Math.random() * 40
          keeper.current.diveX = ball.current.x + sign * magnitude
          keeper.current.diveY = 45
        }
      }, baseDelay)
    }
  }, [activeMomentType, activeCards, energy, momentum, playerStats, keeperProfile, resolveSimulationOutcome, scheduleMomentTimeout, showTutorial])

  const updateSimulation = useCallback(() => {
    const b = ball.current
    const k = keeper.current

    if (hitStopRef.current > 0) { hitStopRef.current -= 1; return }

    if (screenShakeRef.current > 0) screenShakeRef.current = Math.max(0, screenShakeRef.current - 0.5)
    if (goalFlashRef.current > 0) goalFlashRef.current = Math.max(0, goalFlashRef.current - 0.04)
    if (timeScaleRef.current < 1) timeScaleRef.current = Math.min(1, timeScaleRef.current + 0.015)

    const ts = timeScaleRef.current

    let airFriction = 0.99
    let groundFriction = 0.95
    let bounceCoeff = -0.4
    let windX = 0
    if (weather === 'rain') { groundFriction = 0.92; bounceCoeff = -0.25 }
    if (weather === 'wind') { windX = 0.12 * (Math.sin(Date.now() / 800) - 0.3) }
    if (weather === 'sunshine') { airFriction = 0.995 }
    if (pitch === 'boggy') { groundFriction = 0.88; bounceCoeff = -0.15; airFriction = 0.985 }
    if (pitch === 'frozen') { groundFriction = 0.98; bounceCoeff = -0.55 }

    if (b.active) {
      ballTrail.current.push({ x: b.x, y: b.y, z: b.z })
      if (ballTrail.current.length > 14) ballTrail.current.shift()

      if (b.curl) { b.vx += b.curl.ax * ts; b.vy += b.curl.ay * ts }
      b.vx += windX * ts

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

      const isPassType = activeMomentType === 'pass' || activeMomentType === 'corner'
      const isShotType = activeMomentType === 'shot' || activeMomentType === 'penalty' || activeMomentType === 'header' || activeMomentType === 'freekick'

      if (isPassType) {
        for (const n of fieldNPCs.current) {
          if (n.type !== 'teammate') continue
          const d = Math.sqrt((b.x - n.x) ** 2 + (b.y - n.y) ** 2)
          if (d < 30 && b.z < 60) {
            b.active = false
            b.reachedTeammate = n
            AudioManager.playPing()
            resolveSimulationOutcome()
            return
          }
        }
        for (const n of fieldNPCs.current) {
          if (n.type !== 'defender') continue
          const d = Math.sqrt((b.x - n.x) ** 2 + (b.y - n.y) ** 2)
          if (d < (n.radius || 15) && b.z < 25) {
            b.active = false
            b.intercepted = true
            resolveSimulationOutcome()
            return
          }
        }
      }

      // Woodwork (posts at x=130 and x=270, crossbar at z=45..50)
      if (isShotType && b.y < 12 && b.y > -10 && b.z < 80) {
        if (Math.abs(b.x - 130) < 4) {
          b.vx = -Math.abs(b.vx) * 0.5
          b.vy = Math.abs(b.vy) * 0.4
          b.hitPost = true
          AudioManager.playPost()
          screenShakeRef.current = 5
          hitStopRef.current = 3
        } else if (Math.abs(b.x - 270) < 4) {
          b.vx = Math.abs(b.vx) * 0.5
          b.vy = Math.abs(b.vy) * 0.4
          b.hitPost = true
          AudioManager.playPost()
          screenShakeRef.current = 5
          hitStopRef.current = 3
        }
      }
      if (isShotType && b.y < 8 && b.z > 43 && b.z < 58 && b.x > 130 && b.x < 270) {
        b.vy = Math.abs(b.vy) * 0.45
        b.vz = -Math.abs(b.vz) * 0.4
        b.hitBar = true
        AudioManager.playPost()
        screenShakeRef.current = 6
        hitStopRef.current = 3
      }

      // GOAL detection
      if (isShotType && b.y < 45 && b.x > 132 && b.x < 268 && b.z < 48) {
        b.inGoal = true
        const inTopThird = b.z > 25
        const inSideThird = b.x < 165 || b.x > 235
        const isChipped = (b.struck && b.struck.basePower < 0.55) && b.vy > -8
        if (inTopThird && inSideThird) b.goalQuality = 'topcorner'
        else if (isChipped) b.goalQuality = 'chip'
        else if (inSideThird) b.goalQuality = 'tucked'
        else if (inTopThird) b.goalQuality = 'rising'
        else b.goalQuality = 'standard'
        timeScaleRef.current = 0.35
        goalFlashRef.current = 1.0
        hitStopRef.current = 6
        screenShakeRef.current = 12
        b.active = false
        for (let i = 0; i < 80; i++) {
          particles.current.push({
            x: b.x, y: b.y,
            vx: (Math.random() - 0.5) * 14,
            vy: -(2 + Math.random() * 9),
            colour: ['#fff', '#F59E0B', '#DC2626', '#16A34A', '#FEF3C7'][Math.floor(Math.random() * 5)],
            life: 1.0,
          })
        }
        resolveSimulationOutcome()
        return
      }

      // Out of bounds / Miss
      if (b.y < -25 || b.y > 450 || b.x < -25 || b.x > 425) {
        if (activeMomentType === 'shot' || activeMomentType === 'penalty' || activeMomentType === 'header' || activeMomentType === 'freekick') {
          const nearGoal = b.y < 30 && b.x > 80 && b.x < 320
          if (nearGoal) { b.nearMiss = true; AudioManager.playOoh() }
        }
        b.active = false
        resolveSimulationOutcome()
        return
      }

      // Ball at rest
      if (b.z === 0 && Math.abs(b.vx) < 0.3 && Math.abs(b.vy) < 0.3 && Math.abs(b.vz) < 0.3) {
        b.active = false
        resolveSimulationOutcome()
        return
      }

      // Keeper collision
      if (activeMomentType === 'shot' || activeMomentType === 'penalty' || activeMomentType === 'header' || activeMomentType === 'freekick') {
        const distToKeeper = Math.sqrt((b.x - k.x) ** 2 + (b.y - k.y) ** 2)
        if (distToKeeper < k.reach && b.z < 55 && !b.inGoal) {
          b.saved = true
          b.active = false
          k.state = 'saved'
          hitStopRef.current = 3
          screenShakeRef.current = 4
          resolveSimulationOutcome()
          return
        }
      }
    }

    // Keeper behaviour
    if (k.state === 'diving') {
      k.x += (k.diveX - k.x) * 0.18 * ts
    } else if (k.state === 'idle') {
      k.x += (k.targetX - k.x) * 0.05 * ts
    }

    // NPCs
    fieldNPCs.current.forEach((n: any) => {
      if (n.type === 'defender') {
        n.x += n.vx * ts
        if (n.x < 100 || n.x > 300) n.vx *= -1
        const dist = Math.sqrt((b.x - n.x) ** 2 + (b.y - n.y) ** 2)
        if (dist < n.radius && b.z < 15 && b.active) {
          b.vx *= -0.5; b.vy *= 0.8
          b.active = false
          b.intercepted = true
          resolveSimulationOutcome()
        }
      } else if (n.type === 'attacker') {
        n.y += n.vy * ts
        if (n.y > 330) {
          resolveSimulationOutcome({ outcome: 'BEATEN', details: "He's gone past you. Absolute embarrassment." })
        }
      }
    })
  }, [activeMomentType, pitch, weather, resolveSimulationOutcome])

  // Humanoid drawing helper (head + body) — kept inline as per spec
  const drawHumanoid = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    opts: { bodyColor?: string; headColor?: string; size?: number; posture?: string } = {}
  ) => {
    const { bodyColor = '#F59E0B', headColor = '#FBBF24', size = 1, posture = 'idle' } = opts
    const r = 9 * size
    ctx.fillStyle = bodyColor
    ctx.beginPath()
    if (posture === 'diving') ctx.ellipse(x, y - r * 0.2, r * 1.6, r * 0.85, 0, 0, Math.PI * 2)
    else ctx.ellipse(x, y - r * 0.2, r * 0.95, r * 1.1, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = 'rgba(0,0,0,0.4)'; ctx.lineWidth = 1.2; ctx.stroke()
    ctx.fillStyle = headColor
    ctx.beginPath(); ctx.arc(x, y - r * 1.2, r * 0.6, 0, Math.PI * 2); ctx.fill()
    ctx.strokeStyle = 'rgba(0,0,0,0.4)'; ctx.stroke()
  }

  const MIN_DRAG_LENGTH = 14

  const drawFrame = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const b = ball.current
    const k = keeper.current

    updateSimulation()

    ctx.setTransform(1, 0, 0, 1, 0, 0)
    const shake = screenShakeRef.current
    if (shake > 0) ctx.translate((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake)

    // Pitch gradient
    const grass = ctx.createLinearGradient(0, 0, 0, 400)
    grass.addColorStop(0, '#3a6e2f')
    grass.addColorStop(0.6, '#2d5a27')
    grass.addColorStop(1, '#1f4a1c')
    ctx.fillStyle = grass
    ctx.fillRect(0, 0, 400, 400)

    // Mowed stripes
    ctx.fillStyle = 'rgba(0,0,0,0.07)'
    for (let i = 0; i < 400; i += 40) {
      if ((i / 40) % 2 === 0) ctx.fillRect(0, i, 400, 20)
    }

    // Crowd terrace behind goal
    ctx.fillStyle = '#1c1917'
    ctx.fillRect(0, -25, 400, 18)
    const seed = crowdSeedRef.current
    for (let i = 0; i < 60; i++) {
      const cx = (i * 7 + seed * 3) % 400
      const sway = Math.sin((Date.now() / 400) + i * 0.3) * 0.6
      const cy = -22 + (i % 3) * 5 + sway
      const colors = ['#7c2d12', '#1e3a8a', '#7f1d1d', '#3f3f46', '#854d0e', '#365314']
      ctx.fillStyle = colors[(i + seed) % colors.length]
      ctx.fillRect(cx, cy, 4, 4)
    }

    // Pitch markings
    ctx.strokeStyle = 'rgba(255,255,255,0.55)'
    ctx.lineWidth = 2
    ctx.strokeRect(40, -10, 320, 150)
    ctx.strokeRect(120, -10, 160, 50)
    ctx.beginPath(); ctx.arc(200, 300, 4, 0, Math.PI * 2); ctx.stroke()
    ctx.beginPath(); ctx.arc(200, 140, 35, Math.PI * 0.15, Math.PI - Math.PI * 0.15, true); ctx.stroke()

    // Goal & net
    ctx.fillStyle = 'rgba(255,255,255,0.06)'
    ctx.fillRect(130, 0, 140, 45)
    ctx.strokeStyle = 'rgba(255,255,255,0.35)'
    ctx.lineWidth = 0.7
    for (let x = 130; x <= 270; x += 8) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 45); ctx.stroke()
    }
    for (let y = 0; y <= 45; y += 7) {
      ctx.beginPath(); ctx.moveTo(130, y); ctx.lineTo(270, y); ctx.stroke()
    }
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 3
    ctx.beginPath(); ctx.moveTo(130, 0); ctx.lineTo(130, 45); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(270, 0); ctx.lineTo(270, 45); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(128, 0); ctx.lineTo(272, 0); ctx.stroke()

    // Shadows
    ctx.fillStyle = 'rgba(0,0,0,0.32)'
    const shadowSize = Math.max(2, b.radius - b.z / 20)
    ctx.beginPath(); ctx.arc(b.x, b.y, shadowSize, 0, Math.PI * 2); ctx.fill()
    ctx.beginPath(); ctx.ellipse(k.x, k.y + 10, 16, 6, 0, 0, Math.PI * 2); ctx.fill()
    fieldNPCs.current.forEach((n: any) => {
      ctx.beginPath(); ctx.ellipse(n.x, n.y + 10, 13, 5, 0, 0, Math.PI * 2); ctx.fill()
    })
    if (activeMomentType !== 'corner' && activeMomentType !== 'freekick') {
      ctx.beginPath(); ctx.ellipse(200, 330, 14, 5, 0, 0, Math.PI * 2); ctx.fill()
    }

    // Ball trail (motion blur)
    if (ballTrail.current.length > 1) {
      for (let i = 0; i < ballTrail.current.length - 1; i++) {
        const p = ballTrail.current[i]
        const alpha = (i / ballTrail.current.length) * 0.45
        ctx.fillStyle = `rgba(255,255,255,${alpha})`
        const radius = Math.max(1, b.radius * 0.6 * (i / ballTrail.current.length))
        ctx.beginPath(); ctx.arc(p.x, p.y - p.z, radius, 0, Math.PI * 2); ctx.fill()
      }
    }

    // Particles
    for (let i = particles.current.length - 1; i >= 0; i--) {
      const p = particles.current[i]
      ctx.fillStyle = p.colour || p.color
      ctx.globalAlpha = Math.max(0, p.life)
      ctx.fillRect(p.x, p.y, 4, 4)
      p.x += p.vx; p.y += p.vy
      p.vy += 0.15
      p.life -= 0.02
      if (p.life <= 0) particles.current.splice(i, 1)
    }
    ctx.globalAlpha = 1.0

    // Weather
    if (weather === 'rain') {
      if (Math.random() > 0.5) weatherParticles.current.push({ x: Math.random() * 400, y: -10, vy: 9 + Math.random() * 4, vx: 2, life: 1 })
    } else if (weather === 'fog') {
      if (weatherParticles.current.length < 20 && Math.random() > 0.9) {
        weatherParticles.current.push({ x: -50, y: Math.random() * 400, vx: 0.5 + Math.random(), vy: (Math.random() - 0.5) * 0.2, size: 40 + Math.random() * 40, life: 0.4 + Math.random() * 0.4 })
      }
    }
    for (let i = weatherParticles.current.length - 1; i >= 0; i--) {
      const p = weatherParticles.current[i]
      if (weather === 'rain') {
        ctx.strokeStyle = 'rgba(255,255,255,0.55)'
        ctx.lineWidth = 1
        ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x + 2, p.y + 10); ctx.stroke()
        p.x += p.vx; p.y += p.vy
        if (p.y > 400) weatherParticles.current.splice(i, 1)
      } else if (weather === 'fog') {
        ctx.fillStyle = 'rgba(255,255,255,0.1)'
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill()
        p.x += p.vx; p.y += p.vy
        if (p.x > 450) weatherParticles.current.splice(i, 1)
      }
    }
    ctx.globalAlpha = 1.0

    // NPCs
    fieldNPCs.current.forEach((n: any) => {
      if (n.type === 'teammate') {
        const pulse = 16 + Math.sin(Date.now() / 250) * 3
        ctx.fillStyle = 'rgba(34,197,94,0.22)'
        ctx.beginPath(); ctx.arc(n.x, n.y, pulse, 0, Math.PI * 2); ctx.fill()
        drawHumanoid(ctx, n.x, n.y, { bodyColor: '#DC2626', headColor: '#FBBF24' })
      } else {
        drawHumanoid(ctx, n.x, n.y, { bodyColor: '#1e40af', headColor: '#FBBF24' })
      }
      if (n.name) {
        ctx.fillStyle = '#000'; ctx.font = 'bold 10px sans-serif'; ctx.textAlign = 'center'
        ctx.fillText(n.name, n.x + 1, n.y + 26)
        ctx.fillStyle = '#fff'
        ctx.fillText(n.name, n.x, n.y + 25)
      }
      if (n.type === 'attacker' && n.vy) {
        ctx.strokeStyle = 'rgba(255,255,255,0.7)'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(n.x, n.y + 14)
        ctx.lineTo(n.x, n.y + 30)
        ctx.lineTo(n.x - 5, n.y + 24)
        ctx.moveTo(n.x, n.y + 30)
        ctx.lineTo(n.x + 5, n.y + 24)
        ctx.stroke()
      }
    })

    // Keeper
    const keeperPosture = k.state === 'diving' ? 'diving' : 'idle'
    const keeperColor = k.state === 'saved' ? '#16A34A' : '#D97706'
    drawHumanoid(ctx, k.x, k.y - k.z, { bodyColor: keeperColor, headColor: '#FBBF24', posture: keeperPosture })
    ctx.fillStyle = '#fff'
    const gloveSpread = keeperPosture === 'diving' ? 16 : 10
    ctx.beginPath(); ctx.arc(k.x - gloveSpread, k.y - 5, 4, 0, Math.PI * 2); ctx.fill()
    ctx.beginPath(); ctx.arc(k.x + gloveSpread, k.y - 5, 4, 0, Math.PI * 2); ctx.fill()

    // Player
    if (activeMomentType !== 'corner' && activeMomentType !== 'freekick') {
      drawHumanoid(ctx, 200, 320, { bodyColor: '#F59E0B', headColor: '#FBBF24', size: 1.2 })
    }

    // Ball
    const ballDrawRadius = b.radius + b.z / 15
    ctx.fillStyle = '#fff'
    ctx.beginPath(); ctx.arc(b.x, b.y - b.z, ballDrawRadius, 0, Math.PI * 2); ctx.fill()
    ctx.strokeStyle = '#000'; ctx.lineWidth = 1
    ctx.beginPath(); ctx.arc(b.x, b.y - b.z, ballDrawRadius, 0, Math.PI * 2); ctx.stroke()
    b.spinAngle = (b.spinAngle || 0) + (b.vx + b.vy) * 0.025
    ctx.save()
    ctx.translate(b.x, b.y - b.z)
    ctx.rotate(b.spinAngle)
    ctx.fillStyle = '#1c1917'
    ctx.beginPath(); ctx.arc(0, 0, ballDrawRadius * 0.3, 0, Math.PI * 2); ctx.fill()
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2
      const px = Math.cos(a) * ballDrawRadius * 0.55
      const py = Math.sin(a) * ballDrawRadius * 0.55
      ctx.beginPath(); ctx.arc(px, py, ballDrawRadius * 0.18, 0, Math.PI * 2); ctx.fill()
    }
    ctx.restore()

    // Drag UI (only when interactive)
    if (isDragging.current && dragStart.current && dragCurrent.current && readyPhaseRef.current === 'live') {
      const dx = dragCurrent.current.x - dragStart.current.x
      const dy = dragCurrent.current.y - dragStart.current.y
      const length = Math.sqrt(dx * dx + dy * dy)
      const power = Math.min(1, length / 120)
      const slingshot = activeMomentType === 'shot' || activeMomentType === 'penalty' || activeMomentType === 'header' || activeMomentType === 'freekick'

      ctx.strokeStyle = '#F59E0B'
      ctx.lineWidth = 3
      ctx.setLineDash([4, 4])
      ctx.beginPath(); ctx.moveTo(dragStart.current.x, dragStart.current.y); ctx.lineTo(dragCurrent.current.x, dragCurrent.current.y); ctx.stroke()
      ctx.setLineDash([])

      if (length >= MIN_DRAG_LENGTH) {
        const previewX = slingshot ? b.x - dx * 2 : b.x + dx * 2
        const previewY = slingshot ? b.y - dy * 2 : b.y + dy * 2
        ctx.strokeStyle = power > 0.85 ? 'rgba(220,38,38,0.85)' : 'rgba(255,255,255,0.65)'
        ctx.lineWidth = 2
        ctx.setLineDash([6, 4])
        ctx.beginPath()
        ctx.moveTo(b.x, b.y - b.z)
        ctx.lineTo(previewX, previewY)
        ctx.stroke()
        ctx.setLineDash([])
        ctx.strokeStyle = power > 0.85 ? '#DC2626' : '#F59E0B'
        ctx.lineWidth = 2
        ctx.beginPath(); ctx.arc(previewX, previewY, 8, 0, Math.PI * 2); ctx.stroke()
        ctx.fillStyle = ctx.strokeStyle
        ctx.beginPath(); ctx.arc(previewX, previewY, 3, 0, Math.PI * 2); ctx.fill()
      }

      const barW = 120, barH = 12, barX = 140, barY = 372
      ctx.fillStyle = 'rgba(0,0,0,0.6)'
      ctx.fillRect(barX, barY, barW, barH)
      ctx.fillStyle = 'rgba(34,197,94,0.4)'
      ctx.fillRect(barX + barW * 0.6, barY, barW * 0.25, barH)
      ctx.fillStyle = power > 0.85 ? '#DC2626' : (power > 0.6 ? '#16A34A' : '#F59E0B')
      ctx.fillRect(barX, barY, barW * power, barH)
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 1
      ctx.strokeRect(barX, barY, barW, barH)
      ctx.fillStyle = '#fff'; ctx.font = 'bold 9px sans-serif'; ctx.textAlign = 'center'
      ctx.fillText('POWER', barX + barW / 2, barY - 3)
    }

    // First-time tutorial arrow
    if (showTutorialRef.current && !currentOutcomeRef.current && !isDragging.current && readyPhaseRef.current === 'live') {
      const t = Date.now() / 600
      const phase = (Math.sin(t) + 1) / 2
      const slingshot = activeMomentType === 'shot' || activeMomentType === 'penalty' || activeMomentType === 'header' || activeMomentType === 'freekick'
      ctx.strokeStyle = `rgba(255,255,255,${0.4 + phase * 0.45})`
      ctx.lineWidth = 3
      ctx.setLineDash([6, 4])
      const dirY = slingshot ? 1 : -1
      const fromX = b.x, fromY = b.y - b.z
      const toX = fromX, toY = fromY + 70 * dirY * phase
      ctx.beginPath(); ctx.moveTo(fromX, fromY); ctx.lineTo(toX, toY); ctx.stroke()
      ctx.setLineDash([])
      ctx.beginPath()
      ctx.moveTo(toX, toY)
      ctx.lineTo(toX - 6, toY - 8 * dirY)
      ctx.lineTo(toX + 6, toY - 8 * dirY)
      ctx.closePath()
      ctx.fillStyle = `rgba(255,255,255,${0.6 + phase * 0.3})`
      ctx.fill()
      ctx.fillStyle = 'rgba(0,0,0,0.6)'
      ctx.fillRect(fromX - 80, fromY + (slingshot ? 80 : -40), 160, 18)
      ctx.fillStyle = '#fff'; ctx.font = 'bold 10px sans-serif'; ctx.textAlign = 'center'
      ctx.fillText(slingshot ? 'Drag back to power up' : 'Drag toward target', fromX, fromY + (slingshot ? 92 : -27))
    }

    // Fog overlay
    if (weather === 'fog') {
      ctx.fillStyle = 'rgba(220,220,220,0.18)'
      ctx.fillRect(0, 0, 400, 400)
    }

    // Goal flash
    if (goalFlashRef.current > 0) {
      ctx.fillStyle = `rgba(255,255,255,${goalFlashRef.current * 0.75})`
      ctx.fillRect(0, 0, 400, 400)
    }

    // Pre-moment READY overlay
    if (readyPhaseRef.current === 'intro') {
      ctx.fillStyle = 'rgba(28,25,23,0.55)'
      ctx.fillRect(0, 0, 400, 400)
      const info = MOMENT_INFO[activeMomentType]
      ctx.fillStyle = '#F59E0B'
      ctx.font = 'bold 26px serif'
      ctx.textAlign = 'center'
      ctx.fillText(info.title, 200, 190)
      ctx.fillStyle = '#FEF3C7'
      ctx.font = '12px sans-serif'
      ctx.fillText(`${info.statLabel}: ${(playerStats as any)[info.stat] || 10}`, 200, 215)
      ctx.fillStyle = `rgba(254,243,199,${0.4 + Math.sin(Date.now() / 200) * 0.3})`
      ctx.font = 'bold 11px sans-serif'
      ctx.fillText('GET READY', 200, 240)
    }

    // eslint-disable-next-line react-hooks/immutability
    requestRef.current = requestAnimationFrame(drawFrame)
  }, [activeMomentType, weather, updateSimulation, playerStats])

  const getCanvasPoint = (clientX: number, clientY: number) => {
    const rect = canvasRef.current!.getBoundingClientRect()
    const scaleX = 400 / rect.width
    const scaleY = 400 / rect.height
    return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY }
  }

  const beginDrag = (clientX: number, clientY: number) => {
    if (currentOutcome || simulationFinished.current) return
    dragStart.current = getCanvasPoint(clientX, clientY)
    dragCurrent.current = { ...dragStart.current }
    isDragging.current = true
  }

  const updateDrag = (clientX: number, clientY: number) => {
    if (!isDragging.current) return
    dragCurrent.current = getCanvasPoint(clientX, clientY)
  }

  const endDrag = () => {
    if (!isDragging.current) return
    isDragging.current = false
    if (!dragStart.current || !dragCurrent.current) return
    const dx = dragCurrent.current.x - dragStart.current.x
    const dy = dragCurrent.current.y - dragStart.current.y
    const length = Math.sqrt(dx * dx + dy * dy)

    if (length < MIN_DRAG_LENGTH) {
      dragStart.current = null
      dragCurrent.current = null
      return
    }

    const slingshot = activeMomentType === 'shot' || activeMomentType === 'penalty' || activeMomentType === 'header' || activeMomentType === 'freekick'
    const angle = slingshot ? Math.atan2(-dy, -dx) : Math.atan2(dy, dx)
    const power = Math.max(0.25, Math.min(1, length / 120))
    const lateral = slingshot ? Math.abs(dx) : Math.abs(dy)
    const accuracy = Math.max(0, 1 - lateral / 100)
    dragStart.current = null
    dragCurrent.current = null
    handleInput(accuracy, power, angle)
  }

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (e.button !== undefined && e.button !== 0) return
    e.preventDefault()
    if (canvasRef.current && e.pointerId !== undefined && canvasRef.current.setPointerCapture) {
      try { canvasRef.current.setPointerCapture(e.pointerId) } catch (_) {}
    }
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
    endDrag()
  }
  const onPointerCancel = () => {
    if (!isDragging.current) return
    isDragging.current = false
    dragStart.current = null
    dragCurrent.current = null
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
            <div style={{ fontSize: '10px', color: 'var(--kit-amber)', fontWeight: 'bold' }}>MOMENT {momentIndex + 1}/4 · vs {opponent.name.toUpperCase()}</div>
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
          width={400}
          height={400}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerCancel}
          onPointerLeave={onPointerUp}
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
          }}
        />

        {currentOutcome && (
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(28, 25, 23, 0.92)', color: 'var(--cream)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            padding: '24px', textAlign: 'center', borderRadius: '8px', zIndex: 10,
            animation: 'sllFadeIn 0.4s ease-out',
          }}>
            <div style={{
              fontSize: isWin ? '34px' : '30px',
              fontWeight: 'bold',
              color: isWin ? 'var(--success)' : (isClose ? 'var(--kit-amber)' : 'var(--danger)'),
              marginBottom: '12px',
              textTransform: 'uppercase',
              textShadow: isWin ? '0 0 20px rgba(34,197,94,0.5)' : 'none',
              letterSpacing: '1px',
            }}>
              {currentOutcome.outcome}
            </div>
            <p style={{ fontSize: '15px', marginBottom: '24px', maxWidth: '320px', lineHeight: 1.4 }}>"{currentOutcome.details}"</p>
            <button
              aria-label="Continue to next moment"
              className="sll-btn"
              onClick={() => {
                const nextResults = [...momentResults, { type: activeMomentType, value: currentOutcome.clampedValue, outcome: currentOutcome.outcome }]
                setMomentResults(nextResults)
                if (momentIndex < 3) setMomentIndex(momentIndex + 1)
                else onCompleteMatch(nextResults, matchStats)
              }}
              style={{ width: 'auto', padding: '12px 40px' }}
            >
              CONTINUE
            </button>
          </div>
        )}

        {/* TV Broadcast HUD */}
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
          <div style={{ background: '#333', padding: '4px 7px' }}>{(momentIndex + 1) * 22}'</div>
        </div>

        {/* Weather indicator */}
        {weather !== 'clear' && (
          <div style={{
            position: 'absolute', top: '15px', right: '15px',
            background: 'rgba(0,0,0,0.8)', color: '#fff',
            fontSize: '10px', fontFamily: 'var(--font-mono)',
            padding: '4px 8px', borderRadius: '4px', zIndex: 5,
            border: '1px solid var(--charcoal)',
          }}>
            {weather === 'rain' ? '🌧 RAIN' : weather === 'fog' ? '🌫 FOG' : weather === 'sunshine' ? '☀ SUN' : weather === 'wind' ? '💨 WIND' : weather.toUpperCase()}
          </div>
        )}
      </div>

      <div style={{ marginTop: '16px', fontSize: '14px', color: 'var(--charcoal)', textAlign: 'center', background: 'var(--cream)', padding: '12px', borderRadius: '8px', border: '2px solid var(--border)' }}>
        {!currentOutcome ? info.instruction : 'Moment complete.'}
      </div>
    </ScreenContainer>
  )
}

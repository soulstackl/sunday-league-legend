import { useEffect, useRef, useState, useCallback } from 'react'
import { ScreenContainer } from '../components/shared/ScreenContainer'
import type { SaveState } from '../types/game'

interface TrainingDrillScreenProps {
  store: SaveState
  onComplete: (score: number) => void
  onSkip: () => void
  onCancel: () => void
}

const CANVAS_W = 340
const CANVAS_H = 320
const BALL_X = CANVAS_W / 2
const BALL_Y = CANVAS_H - 40
const BALL_RADIUS = 12
const TARGET_RADIUS = 28
const SUCCESS_CONE = Math.PI / 3.5  // ~51 degrees half-angle

const TARGET_POSITIONS: { x: number; y: number }[] = [
  { x: CANVAS_W * 0.25, y: CANVAS_H * 0.28 },
  { x: CANVAS_W * 0.5,  y: CANVAS_H * 0.20 },
  { x: CANVAS_W * 0.75, y: CANVAS_H * 0.28 },
]

type Phase = 'ready' | 'dragging' | 'result' | 'done'

export function TrainingDrillScreen({ store, onComplete, onSkip, onCancel }: TrainingDrillScreenProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [attempt, setAttempt] = useState(0)
  const [results, setResults] = useState<boolean[]>([])
  const [phase, setPhase] = useState<Phase>('ready')
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null)
  const [dragCurrent, setDragCurrent] = useState<{ x: number; y: number } | null>(null)
  const [lastSuccess, setLastSuccess] = useState<boolean | null>(null)

  const touchBonus = Math.max(0, (store.player.stats.touch - 10) / 20)
  const effectiveCone = SUCCESS_CONE * (1 + touchBonus * 0.4)

  const target = TARGET_POSITIONS[attempt] ?? TARGET_POSITIONS[0]

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H)

    // Pitch background
    ctx.fillStyle = '#2d5a1b'
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H)

    // Pitch lines
    ctx.strokeStyle = 'rgba(255,255,255,0.25)'
    ctx.lineWidth = 1
    // Centre line
    ctx.beginPath(); ctx.moveTo(0, CANVAS_H / 2); ctx.lineTo(CANVAS_W, CANVAS_H / 2); ctx.stroke()
    // Penalty area
    ctx.strokeRect(CANVAS_W * 0.2, 0, CANVAS_W * 0.6, CANVAS_H * 0.38)
    // Goal
    ctx.strokeStyle = 'rgba(255,255,255,0.6)'
    ctx.lineWidth = 2
    ctx.strokeRect(CANVAS_W * 0.33, 0, CANVAS_W * 0.34, 18)

    // Target zone
    const targetColor = phase === 'result'
      ? (lastSuccess ? '#22C55E' : '#F43F5E')
      : 'rgba(255,255,255,0.5)'
    ctx.strokeStyle = targetColor
    ctx.lineWidth = 2
    ctx.setLineDash([5, 4])
    ctx.beginPath()
    ctx.arc(target.x, target.y, TARGET_RADIUS, 0, Math.PI * 2)
    ctx.stroke()
    ctx.setLineDash([])
    ctx.fillStyle = phase === 'result'
      ? (lastSuccess ? 'rgba(34,197,94,0.25)' : 'rgba(244,63,94,0.2)')
      : 'rgba(255,255,255,0.08)'
    ctx.fill()

    // Target label
    ctx.fillStyle = 'rgba(255,255,255,0.6)'
    ctx.font = 'bold 10px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('TARGET', target.x, target.y + 4)

    // Drag trajectory
    if (phase === 'dragging' && dragStart && dragCurrent) {
      const dx = dragStart.x - dragCurrent.x
      const dy = dragStart.y - dragCurrent.y
      const len = Math.sqrt(dx * dx + dy * dy)
      if (len > 8) {
        ctx.strokeStyle = 'rgba(255,255,255,0.5)'
        ctx.lineWidth = 2
        ctx.setLineDash([4, 4])
        ctx.beginPath()
        ctx.moveTo(BALL_X, BALL_Y)
        ctx.lineTo(BALL_X + dx * 2, BALL_Y + dy * 2)
        ctx.stroke()
        ctx.setLineDash([])
      }
    }

    // Result line
    if (phase === 'result' && dragStart && dragCurrent) {
      const dx = dragStart.x - dragCurrent.x
      const dy = dragStart.y - dragCurrent.y
      const len = Math.sqrt(dx * dx + dy * dy)
      if (len > 4) {
        ctx.strokeStyle = lastSuccess ? '#22C55E' : '#F43F5E'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(BALL_X, BALL_Y)
        ctx.lineTo(BALL_X + dx * 3.5, BALL_Y + dy * 3.5)
        ctx.stroke()
      }
    }

    // Ball
    ctx.fillStyle = phase === 'result' ? (lastSuccess ? '#22C55E' : '#F43F5E') : '#FFFFFF'
    ctx.beginPath()
    ctx.arc(BALL_X, BALL_Y, BALL_RADIUS, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = 'rgba(0,0,0,0.4)'
    ctx.lineWidth = 1
    ctx.stroke()

    // Result text
    if (phase === 'result') {
      ctx.fillStyle = lastSuccess ? '#22C55E' : '#F43F5E'
      ctx.font = 'bold 18px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(lastSuccess ? 'ON TARGET' : 'MISSED', CANVAS_W / 2, CANVAS_H / 2)
    }
  }, [phase, dragStart, dragCurrent, target, lastSuccess])

  useEffect(() => { draw() }, [draw])

  // Prevent page scroll while dragging on touch devices.
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const prevent = (e: TouchEvent) => { if (e.cancelable) e.preventDefault() }
    canvas.addEventListener('touchmove', prevent, { passive: false })
    return () => canvas.removeEventListener('touchmove', prevent)
  }, [])

  const getPos = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect()
    const scaleX = CANVAS_W / rect.width
    const scaleY = CANVAS_H / rect.height
    if ('touches' in e) {
      const t = e.touches[0] ?? e.changedTouches[0]
      return { x: (t.clientX - rect.left) * scaleX, y: (t.clientY - rect.top) * scaleY }
    }
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY }
  }

  const onPointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    if (phase !== 'ready') return
    const canvas = canvasRef.current
    if (!canvas) return
    const pos = getPos(e, canvas)
    const dx = pos.x - BALL_X, dy = pos.y - BALL_Y
    if (Math.sqrt(dx * dx + dy * dy) > BALL_RADIUS * 2.5) return
    setDragStart(pos)
    setDragCurrent(pos)
    setPhase('dragging')
  }

  const onPointerMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (phase !== 'dragging') return
    const canvas = canvasRef.current
    if (!canvas) return
    setDragCurrent(getPos(e, canvas))
  }

  const onPointerUp = (e: React.MouseEvent | React.TouchEvent) => {
    if (phase !== 'dragging' || !dragStart) return
    const canvas = canvasRef.current
    if (!canvas) return
    const released = getPos(e, canvas)

    const shotDx = dragStart.x - released.x
    const shotDy = dragStart.y - released.y
    const shotLen = Math.sqrt(shotDx * shotDx + shotDy * shotDy)

    if (shotLen < 10) {
      setPhase('ready')
      setDragStart(null)
      setDragCurrent(null)
      return
    }

    const targetDx = target.x - BALL_X
    const targetDy = target.y - BALL_Y
    const targetAngle = Math.atan2(targetDy, targetDx)
    const shotAngle = Math.atan2(shotDy, shotDx)
    let angleDiff = Math.abs(shotAngle - targetAngle)
    if (angleDiff > Math.PI) angleDiff = 2 * Math.PI - angleDiff

    const success = angleDiff < effectiveCone
    setLastSuccess(success)
    setDragCurrent(released)
    setPhase('result')

    const newResults = [...results, success]
    setTimeout(() => {
      if (attempt + 1 >= TARGET_POSITIONS.length) {
        setResults(newResults)
        setAttempt(a => a + 1)
        setPhase('done')
      } else {
        setResults(newResults)
        setAttempt(a => a + 1)
        setDragStart(null)
        setDragCurrent(null)
        setLastSuccess(null)
        setPhase('ready')
      }
    }, 900)
  }

  const score = results.filter(Boolean).length
  const isDone = phase === 'done'

  const rewardLabel = score === 0 ? 'No improvement today'
    : score === 1 ? 'Stat +1'
    : score === 2 ? 'Stat +2'
    : 'Stat +3'

  return (
    <ScreenContainer style={{ background: 'var(--bg)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700, color: 'var(--text)' }}>Training Drill</h2>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>Drag the ball toward the target zone</p>
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          {TARGET_POSITIONS.map((_, i) => (
            <div key={i} style={{
              width: '10px', height: '10px', borderRadius: '50%',
              background: i < results.length
                ? (results[i] ? 'var(--success)' : 'var(--danger)')
                : i === attempt && !isDone ? 'var(--accent)' : 'var(--border)',
            }} />
          ))}
        </div>
      </div>

      <div style={{ position: 'relative', width: '100%', borderRadius: '14px', overflow: 'hidden', marginBottom: '14px', cursor: phase === 'ready' ? 'crosshair' : 'default', touchAction: 'none' }}>
        <canvas
          ref={canvasRef}
          width={CANVAS_W}
          height={CANVAS_H}
          style={{ width: '100%', display: 'block' }}
          onMouseDown={onPointerDown}
          onMouseMove={onPointerMove}
          onMouseUp={onPointerUp}
          onTouchStart={onPointerDown}
          onTouchMove={onPointerMove}
          onTouchEnd={onPointerUp}
        />
        {!isDone && phase === 'ready' && (
          <div style={{ position: 'absolute', bottom: '12px', left: 0, right: 0, textAlign: 'center', pointerEvents: 'none' }}>
            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', fontWeight: 600, background: 'rgba(0,0,0,0.5)', padding: '4px 10px', borderRadius: '8px' }}>
              Attempt {attempt + 1} of {TARGET_POSITIONS.length}
            </span>
          </div>
        )}
      </div>

      {isDone && (
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px', marginBottom: '14px', textAlign: 'center' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>Drill Complete</div>
          <div style={{ fontSize: '36px', fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--accent)', marginBottom: '4px' }}>{score}/{TARGET_POSITIONS.length}</div>
          <div style={{ fontSize: '13px', color: score > 0 ? 'var(--success)' : 'var(--text-muted)', fontWeight: 700 }}>{rewardLabel}</div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
        <button
          onClick={onCancel}
          style={{ flex: 1, minHeight: '44px', padding: '14px', background: 'none', border: '1px solid var(--border)', color: 'var(--text-muted)', borderRadius: '12px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-ui)' }}
        >
          Cancel
        </button>
        {!isDone && (
          <button
            onClick={onSkip}
            style={{ flex: 1, minHeight: '44px', padding: '14px', background: 'none', border: '1px solid var(--border)', color: 'var(--text-muted)', borderRadius: '12px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-ui)' }}
          >
            Skip drill
          </button>
        )}
        {isDone && (
          <button
            onClick={() => onComplete(score)}
            style={{ flex: 2, minHeight: '44px', padding: '14px', background: 'var(--btn-bg)', color: 'var(--btn-text)', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: 700, cursor: 'pointer', letterSpacing: '0.04em', fontFamily: 'var(--font-ui)' }}
          >
            APPLY REWARD
          </button>
        )}
      </div>
    </ScreenContainer>
  )
}

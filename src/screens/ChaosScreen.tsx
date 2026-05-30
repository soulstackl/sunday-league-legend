import { useState, useMemo } from 'react'
import { Layers2, CheckCircle2 } from 'lucide-react'
import { Badge } from '../components/shared/Badge'
import { CHAOS_CARDS } from '../data/chaos-cards'
import { cupRoundLabel } from '../data/cup'
import { mulberry32 } from '../engine/rng'
import type { SaveState, ChaosCard, ChaosCardChoice } from '../types/game'
import type { Fixture } from '../engine/schedule'

interface ChaosScreenProps {
  store: SaveState
  fixture: Fixture
  onKickOff: (cards: ChaosCard[], choiceEffects: ChaosCardChoice['effect'][]) => void
}

export function ChaosScreen({ store, fixture, onKickOff }: ChaosScreenProps) {
  const drawCount = useMemo(() => {
    if (fixture.kind === 'cup') return 3
    if (fixture.opponent.id === 'anchor-athletic') return 3
    return 2
  }, [fixture])

  const cards = useMemo<ChaosCard[]>(() => {
    const rng = mulberry32(store.seed + store.season.week * 41 + store.season.number * 7)
    const recentIds = new Set((store.chaosCardHistory || []).slice(-12).map(c => c.id))
    const states = store.player.states
    const conditionMet = (c: ChaosCard) => {
      if (!c.condition) return true
      if (c.condition.fatigue && states.fatigue < c.condition.fatigue.min) return false
      if (c.condition.teamChemistry) {
        if (c.condition.teamChemistry.min !== undefined && states.teamChemistry < c.condition.teamChemistry.min) return false
        if (c.condition.teamChemistry.max !== undefined && states.teamChemistry > c.condition.teamChemistry.max) return false
      }
      if (c.condition.localFame && states.localFame < c.condition.localFame.min) return false
      if (c.condition.injuryRisk && states.injuryRisk < c.condition.injuryRisk.min) return false
      return true
    }
    const available = CHAOS_CARDS.filter(c => !recentIds.has(c.id) && conditionMet(c))
    const pool = available.length >= drawCount ? available : CHAOS_CARDS.filter(conditionMet)
    const picked: ChaosCard[] = []
    const used = new Set<number>()
    while (picked.length < drawCount && used.size < pool.length) {
      const idx = Math.floor(rng() * pool.length)
      if (used.has(idx)) continue
      used.add(idx)
      picked.push(pool[idx])
    }
    return picked
  }, [store.seed, store.season.week, store.season.number, store.chaosCardHistory, drawCount, store.player.states])

  const [currentIndex, setCurrentIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [choiceMade, setChoiceMade] = useState(false)
  const [appliedChoiceEffects, setAppliedChoiceEffects] = useState<ChaosCardChoice['effect'][]>([])
  const [choiceOutcome, setChoiceOutcome] = useState<string | null>(null)

  if (cards.length === 0) {
    return (
      <div style={{ padding: '40px 20px', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', textAlign: 'center', marginBottom: '20px' }}>No chaos cards available. Head straight to the match.</p>
        <button onClick={() => onKickOff([], [])} style={{ padding: '16px 32px', background: 'var(--btn-bg)', color: 'var(--btn-text)', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: 700, cursor: 'pointer' }}>
          KICK OFF
        </button>
      </div>
    )
  }
  const current = cards[currentIndex]
  const proceedDisabled = !flipped || (current.choices && !choiceMade)

  const nextCard = () => {
    setFlipped(false)
    setChoiceMade(false)
    setChoiceOutcome(null)
    setTimeout(() => {
      if (currentIndex < cards.length - 1) setCurrentIndex(currentIndex + 1)
      else onKickOff(cards, appliedChoiceEffects)
    }, 150)
  }

  const subTitle = fixture.kind === 'cup'
    ? `${cupRoundLabel(fixture.cupRound as 'quarter-final' | 'semi-final' | 'final')} · ${fixture.opponent.name}`
    : `vs ${fixture.opponent.name}`

  return (
    <div style={{ padding: '24px 20px', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700, color: 'var(--text)', marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Matchday Chaos</h2>
      <div style={{ fontSize: '11px', color: 'var(--accent)', marginBottom: '20px', fontFamily: 'var(--font-mono)' }}>{subTitle}</div>

      <div
        onClick={() => !flipped && setFlipped(true)}
        style={{ width: '100%', maxWidth: '300px', minHeight: '380px', perspective: '1000px', cursor: flipped ? 'default' : 'pointer', marginBottom: '24px' }}
      >
        <div style={{ width: '100%', height: '100%', transition: 'transform 0.55s cubic-bezier(0.4,0,0.2,1)', transformStyle: 'preserve-3d', position: 'relative', transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}>
          {/* Card back */}
          <div style={{ position: 'absolute', width: '100%', height: '380px', backfaceVisibility: 'hidden', background: 'var(--card-bg)', border: '1px solid var(--accent-bg-strong)', borderRadius: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: '0 16px 40px rgba(0,0,0,0.5)' }}>
            <Badge size={72} />
            <div style={{ color: 'var(--text)', marginTop: '20px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '13px' }}>
              Tap to Reveal
            </div>
            <div style={{ color: 'var(--accent)', marginTop: '6px', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>Card {currentIndex + 1} of {cards.length}</div>
          </div>

          {/* Card face */}
          <div style={{ position: 'absolute', width: '100%', minHeight: '380px', backfaceVisibility: 'hidden', transform: 'rotateY(180deg)', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '20px', padding: '20px', display: 'flex', flexDirection: 'column', boxShadow: '0 16px 40px rgba(0,0,0,0.5)', color: 'var(--text)' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '10px', background: 'var(--surface-raised)', color: 'var(--text-muted)', padding: '3px 10px', borderRadius: '20px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{current.type}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--text-faint)', fontFamily: 'var(--font-mono)' }}>
                  <Layers2 size={12} />
                  {currentIndex + 1}/{cards.length}
                </span>
              </div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700, margin: '0 0 8px', color: 'var(--text)' }}>{current.title}</h3>
              <p style={{ fontSize: '13px', fontStyle: 'italic', lineHeight: '1.5', marginBottom: '16px', color: 'var(--text-muted)' }}>"{current.desc}"</p>
            </div>
            <div>
              <div style={{ background: 'var(--surface-raised)', padding: '10px 12px', borderRadius: '10px', marginBottom: '12px', borderLeft: '3px solid var(--danger)' }}>
                <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--danger)', letterSpacing: '0.06em', marginBottom: '4px' }}>Match Effects</div>
                <div style={{ fontSize: '13px', fontFamily: 'var(--font-mono)', color: 'var(--text)' }}>{current.effects}</div>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-faint)', marginBottom: '10px', lineHeight: '1.4' }}>
                <strong style={{ color: 'var(--text-muted)' }}>Tip:</strong> {current.tip}
              </div>
              {current.choices && !choiceMade && flipped && (
                <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {current.choices.map((c, i) => (
                    <button key={c.text ?? i} onClick={() => {
                      setChoiceMade(true)
                      setChoiceOutcome(c.outcome)
                      setAppliedChoiceEffects(prev => [...prev, c.effect])
                    }} style={{ padding: '10px 14px', background: 'var(--card-bg)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: '10px', fontSize: '13px', cursor: 'pointer', textAlign: 'left', fontWeight: 600, fontFamily: 'var(--font-ui)' }}>
                      {c.text}
                    </button>
                  ))}
                </div>
              )}
              {current.choices && choiceMade && (
                <div style={{ marginTop: '10px', fontSize: '13px', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={14} />
                  {choiceOutcome ?? 'Choice made.'}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <button
        disabled={!!proceedDisabled}
        onClick={nextCard}
        style={{
          width: '100%', padding: '16px',
          background: proceedDisabled ? 'var(--surface-raised)' : 'var(--btn-bg)',
          color: proceedDisabled ? 'var(--text-faint)' : 'var(--btn-text)',
          border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: 700,
          cursor: proceedDisabled ? 'not-allowed' : 'pointer',
          letterSpacing: '0.04em',
        }}
      >
        {currentIndex < cards.length - 1 ? 'NEXT CARD' : (fixture.kind === 'cup' ? 'TAKE THE PITCH' : 'KICK OFF')}
      </button>
    </div>
  )
}

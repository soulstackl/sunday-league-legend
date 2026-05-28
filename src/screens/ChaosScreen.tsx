import React, { useState } from 'react'
import { Badge } from '../components/shared/Badge'
import { CHAOS_CARDS } from '../data/chaos-cards'
import { mulberry32 } from '../engine/rng'
import type { SaveState, ChaosCard, ChaosCardChoice } from '../types/game'

interface ChaosScreenProps {
  store: SaveState
  onKickOff: (cards: ChaosCard[], choiceEffects: ChaosCardChoice['effect'][]) => void
}

export function ChaosScreen({ store, onKickOff }: ChaosScreenProps) {
  const [cards] = useState<ChaosCard[]>(() => {
    const rng = mulberry32(store.seed + store.season.week)
    const recentIds = new Set((store.chaosCardHistory || []).slice(-8).map(c => c.id))
    const available = CHAOS_CARDS.filter(c => !recentIds.has(c.id))
    const pool = available.length >= 2 ? available : CHAOS_CARDS
    const cardIndex1 = Math.floor(rng() * pool.length)
    let cardIndex2 = Math.floor(rng() * pool.length)
    if (cardIndex2 === cardIndex1) cardIndex2 = (cardIndex2 + 1) % pool.length
    return [pool[cardIndex1], pool[cardIndex2]]
  })
  const [currentIndex, setCurrentIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [choiceMade, setChoiceMade] = useState(false)
  const [appliedChoiceEffects, setAppliedChoiceEffects] = useState<ChaosCardChoice['effect'][]>([])
  const [choiceOutcome, setChoiceOutcome] = useState<string | null>(null)

  const nextCard = () => {
    setFlipped(false)
    setChoiceMade(false)
    setChoiceOutcome(null)
    setTimeout(() => {
      if (currentIndex < cards.length - 1) {
        setCurrentIndex(currentIndex + 1)
      } else {
        onKickOff(cards, appliedChoiceEffects)
      }
    }, 150)
  }

  if (cards.length === 0) return null
  const current = cards[currentIndex]
  const proceedDisabled = !flipped || (current.choices && !choiceMade)

  return (
    <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <h2 style={{ fontFamily: 'var(--font-primary)', fontSize: '24px', color: 'var(--cream)', marginBottom: '16px', textTransform: 'uppercase' }}>
        Matchday Chaos
      </h2>

      <div
        onClick={() => !flipped && setFlipped(true)}
        style={{
          width: '100%',
          maxWidth: '300px',
          minHeight: '380px',
          perspective: '1000px',
          cursor: flipped ? 'default' : 'pointer',
          marginBottom: '24px'
        }}
      >
        <div style={{
          width: '100%',
          height: '100%',
          transition: 'transform 0.6s',
          transformStyle: 'preserve-3d',
          position: 'relative',
          transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
        }}>
          {/* Front side (Back of Card) */}
          <div style={{
            position: 'absolute',
            width: '100%',
            height: '380px',
            backfaceVisibility: 'hidden',
            background: 'var(--charcoal)',
            border: '6px solid var(--kit-amber)',
            borderRadius: '16px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 10px 20px rgba(0,0,0,0.3)'
          }}>
            <Badge size={80} />
            <div style={{ color: 'var(--cream)', marginTop: '16px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '14px' }}>
              Tap to Reveal Chaos
            </div>
          </div>

          {/* Back side (Front of Card) */}
          <div style={{
            position: 'absolute',
            width: '100%',
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            background: 'var(--cream)',
            border: '4px solid var(--charcoal)',
            borderRadius: '16px',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: '0 10px 20px rgba(0,0,0,0.3)',
            color: 'var(--charcoal)'
          }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '10px', background: 'var(--charcoal)', color: 'var(--cream)', padding: '2px 8px', borderRadius: '10px', fontWeight: 'bold' }}>
                  {current.type}
                </span>
                <span style={{ fontSize: '12px' }}>🃏 Card {currentIndex + 1}/2</span>
              </div>
              <h3 style={{ fontFamily: 'var(--font-primary)', fontSize: '22px', margin: '8px 0', borderBottom: '2px solid var(--charcoal)', paddingBottom: '4px' }}>
                {current.title}
              </h3>
              <p style={{ fontSize: '13px', fontStyle: 'italic', lineHeight: '1.4', marginBottom: '16px' }}>
                "{current.desc}"
              </p>
            </div>
            <div>
              <div style={{ background: 'rgba(0,0,0,0.05)', padding: '10px', borderRadius: '6px', marginBottom: '12px', borderLeft: '3px solid var(--danger)' }}>
                <div style={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}>Match Effects:</div>
                <div style={{ fontSize: '13px', fontFamily: 'var(--font-mono)' }}>{current.effects}</div>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--warm-grey)', marginBottom: '8px' }}>
                <strong>Counterplay Tip:</strong> {current.tip}
              </div>
              {current.choices && !choiceMade && flipped && (
                <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {current.choices.map((c, i) => (
                    <button key={i} onClick={() => {
                      setChoiceMade(true)
                      setChoiceOutcome(c.outcome)
                      setAppliedChoiceEffects(prev => [...prev, c.effect])
                    }} style={{ padding: '8px 12px', background: 'var(--charcoal)', color: 'var(--cream)', border: 'none', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', textAlign: 'left' }}>
                      {c.text}
                    </button>
                  ))}
                </div>
              )}
              {current.choices && choiceMade && (
                <div style={{ marginTop: '8px', fontSize: '12px', color: 'var(--success)', fontStyle: 'italic' }}>
                  ✓ {choiceOutcome || 'Choice made.'}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <button
        disabled={!!proceedDisabled}
        onClick={nextCard}
        style={{ width: '100%', padding: '16px', background: proceedDisabled ? 'var(--warm-grey)' : 'var(--kit-amber)', color: 'var(--charcoal)', border: '3px solid var(--charcoal)', borderRadius: '8px', fontSize: '18px', fontWeight: 'bold', cursor: proceedDisabled ? 'not-allowed' : 'pointer', boxShadow: '0 4px 0px var(--charcoal)' }}
      >
        {currentIndex < cards.length - 1 ? 'NEXT CARD' : 'KICK OFF MATCH'}
      </button>
    </div>
  )
}

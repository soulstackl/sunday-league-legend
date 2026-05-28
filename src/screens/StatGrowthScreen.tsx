import { useState } from 'react'
import { ScreenContainer } from '../components/shared/ScreenContainer'
import { Badge } from '../components/shared/Badge'
import { Card } from '../components/shared/Card'
import type { SaveState, StatKey } from '../types/game'

const STAT_DESCRIPTIONS: Record<StatKey, string> = {
  touch: 'First touch, dribbling, ball control',
  strike: 'Shooting, volleys, finishing under pressure',
  pass: 'Range of passing, crossing, set-piece delivery',
  engine: 'Stamina, late-game running, defensive cover',
  graft: 'Tackling, pressing, second balls',
  head: 'Aerial duels, composure, set-piece threat',
  pace: 'Acceleration, recovery runs, beating defenders',
  vibes: 'Morale influence, leadership, dressing room',
}

interface Props {
  store: SaveState
  options: StatKey[]
  onConfirm: (chosen: StatKey) => void
}

export function StatGrowthScreen({ store, options, onConfirm }: Props) {
  const [selected, setSelected] = useState<StatKey | null>(null)

  return (
    <ScreenContainer style={{ textAlign: 'center' }}>
      <Badge size={80} />
      <h2 style={{ fontFamily: 'var(--font-primary)', fontSize: '24px', color: 'var(--cream)', margin: '12px 0 6px' }}>Pre-Season Development</h2>
      <p style={{ color: 'var(--cream)', fontSize: '13px', opacity: 0.85, marginBottom: '20px' }}>
        Another season behind you. Pick where you have grown.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', textAlign: 'left' }}>
        {options.map(stat => {
          const isSel = selected === stat
          const current = store.player.stats[stat]
          return (
            <Card
              key={stat}
              style={{
                background: 'var(--card-bg)',
                border: isSel ? '3px solid var(--kit-amber)' : '2px solid var(--border)',
                cursor: 'pointer',
              }}
            >
              <button
                type="button"
                onClick={() => setSelected(stat)}
                aria-pressed={isSel}
                style={{ all: 'unset', cursor: 'pointer', display: 'block', width: '100%' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 'bold', fontSize: '16px', textTransform: 'uppercase' }}>{stat}</div>
                    <div style={{ fontSize: '12px', color: 'var(--warm-grey)' }}>{STAT_DESCRIPTIONS[stat]}</div>
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 'bold' }}>
                    {current} <span style={{ color: 'var(--success)' }}>+1</span>
                  </div>
                </div>
              </button>
            </Card>
          )
        })}
      </div>

      <button
        disabled={!selected}
        onClick={() => selected && onConfirm(selected)}
        style={{
          width: '100%', padding: '16px',
          background: selected ? 'var(--kit-amber)' : 'var(--warm-grey)',
          color: 'var(--charcoal)',
          border: '3px solid var(--charcoal)', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold',
          cursor: selected ? 'pointer' : 'not-allowed', boxShadow: '0 4px 0px var(--charcoal)', marginTop: 'auto',
        }}
      >
        CONFIRM &amp; START NEW SEASON
      </button>
    </ScreenContainer>
  )
}

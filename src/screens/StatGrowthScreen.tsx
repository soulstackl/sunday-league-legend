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
      <Badge size={72} />
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 700, color: 'var(--text)', margin: '14px 0 4px' }}>Pre-Season Growth</h2>
      <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '24px' }}>
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
                background: isSel ? 'var(--surface-raised)' : 'var(--card-bg)',
                border: isSel ? '1px solid var(--accent)' : '1px solid var(--border)',
                cursor: 'pointer',
                transition: 'border-color 0.15s, background 0.15s',
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
                    <div style={{ fontWeight: 700, fontSize: '15px', textTransform: 'uppercase', letterSpacing: '0.04em', color: isSel ? 'var(--accent)' : 'var(--text)' }}>{stat}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{STAT_DESCRIPTIONS[stat]}</div>
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text)', textAlign: 'right' }}>
                    <span style={{ fontSize: '18px' }}>{current}</span>
                    <span style={{ color: 'var(--success)', fontSize: '13px' }}> +1</span>
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
          background: selected ? 'var(--accent)' : 'var(--surface-raised)',
          color: selected ? '#0C0C10' : 'var(--text-faint)',
          border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: 700,
          cursor: selected ? 'pointer' : 'not-allowed',
          letterSpacing: '0.04em', marginTop: '24px',
        }}
      >
        CONFIRM &amp; START NEW SEASON
      </button>
    </ScreenContainer>
  )
}

import { useState } from 'react'
import { ScreenContainer } from '../components/shared/ScreenContainer'
import { ARCHETYPES } from '../data/archetypes'

interface ArchetypeScreenProps {
  onNext: (archetypeId: string) => void
}

export function ArchetypeScreen({ onNext }: ArchetypeScreenProps) {
  const [selected, setSelected] = useState('unit')

  return (
    <ScreenContainer style={{ overflowY: 'auto' }}>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 700, marginBottom: '4px', color: 'var(--text)' }}>Select Your Archetype</h2>
      <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '18px' }}>Defines your playing style and starting stats.</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
        {ARCHETYPES.map(arch => {
          const isSel = selected === arch.id
          const entries = Object.entries(arch.stats) as [string, number][]
          const sorted = [...entries].sort((a, b) => b[1] - a[1])
          const topKeys = new Set(sorted.slice(0, 3).map(([k]) => k))
          return (
            <div
              key={arch.id}
              role="button"
              tabIndex={0}
              aria-label={`Select archetype: ${arch.name}`}
              aria-pressed={isSel}
              onClick={() => setSelected(arch.id)}
              onKeyDown={(e) => e.key === 'Enter' && setSelected(arch.id)}
              style={{
                background: isSel ? 'var(--surface-raised)' : 'var(--card-bg)',
                border: isSel ? '1px solid var(--accent)' : '1px solid var(--border)',
                borderRadius: '14px',
                padding: '16px',
                cursor: 'pointer',
                transition: 'border-color 0.15s, background 0.15s, transform 0.15s',
                transform: isSel ? 'translateY(-1px)' : 'none',
                boxShadow: isSel ? '0 6px 18px rgba(124,58,237,0.18)' : 'none',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '10px', gap: '10px' }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, color: isSel ? 'var(--accent)' : 'var(--text)', lineHeight: 1.1 }}>{arch.name}</span>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
                {arch.traits.map(t => (
                  <span
                    key={t}
                    style={{
                      fontSize: '10px',
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      background: isSel ? 'var(--accent-bg-strong)' : 'var(--surface)',
                      color: isSel ? 'var(--accent)' : 'var(--text-muted)',
                      padding: '3px 9px',
                      borderRadius: '20px',
                      fontWeight: 700,
                      border: '1px solid var(--border)',
                    }}
                  >
                    {t}
                  </span>
                ))}
              </div>

              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '14px', lineHeight: '1.45' }}>{arch.description}</p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: '14px', rowGap: '7px' }}>
                {entries.map(([k, v]) => {
                  const isTop = topKeys.has(k)
                  const pct = Math.min(100, (v / 20) * 100)
                  return (
                    <div key={k} style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                      <span style={{ width: '42px', fontSize: '9.5px', fontWeight: 700, color: isTop ? 'var(--accent)' : 'var(--text-muted)', letterSpacing: '0.06em' }}>{k.toUpperCase()}</span>
                      <div style={{ flex: 1, height: '5px', background: 'var(--surface)', borderRadius: '3px', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
                        <div style={{ width: `${pct}%`, height: '100%', background: isTop ? 'var(--accent)' : 'var(--text-faint)', borderRadius: '3px', transition: 'width 0.3s ease' }} />
                      </div>
                      <span style={{ width: '18px', fontSize: '12px', fontWeight: 700, color: isTop ? 'var(--accent)' : 'var(--text)', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{v}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      <button
        onClick={() => onNext(selected)}
        style={{ width: '100%', padding: '16px', background: 'var(--btn-bg)', color: 'var(--btn-text)', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: 700, cursor: 'pointer', letterSpacing: '0.04em', marginTop: 'auto' }}
      >
        NEXT: CHOOSE JOB
      </button>
    </ScreenContainer>
  )
}

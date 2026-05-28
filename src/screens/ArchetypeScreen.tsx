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

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
        {ARCHETYPES.map(arch => {
          const isSel = selected === arch.id
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
                padding: '14px',
                cursor: 'pointer',
                transition: 'border-color 0.15s, background 0.15s',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '17px', fontWeight: 700, color: isSel ? 'var(--accent)' : 'var(--text)' }}>{arch.name}</span>
                <span style={{ fontSize: '11px', background: isSel ? 'var(--accent-bg)' : 'var(--surface)', color: isSel ? 'var(--accent)' : 'var(--text-muted)', padding: '3px 8px', borderRadius: '20px', fontWeight: 600, border: '1px solid var(--border)' }}>
                  {arch.traits.join(' / ')}
                </span>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px', lineHeight: '1.4' }}>{arch.description}</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px', fontFamily: 'var(--font-mono)', fontSize: '10px', textAlign: 'center' }}>
                {Object.entries(arch.stats).map(([k, v]) => (
                  <div key={k} style={{ background: 'var(--surface)', padding: '5px 4px', borderRadius: '6px' }}>
                    <div style={{ fontWeight: 700, color: 'var(--text-muted)', fontSize: '9px', letterSpacing: '0.04em' }}>{k.toUpperCase()}</div>
                    <div style={{ color: 'var(--text)', fontSize: '12px', fontWeight: 700 }}>{v as number}</div>
                  </div>
                ))}
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

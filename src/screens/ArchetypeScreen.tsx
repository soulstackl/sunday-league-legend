import React, { useState } from 'react'
import { ScreenContainer } from '../components/shared/ScreenContainer'
import { ARCHETYPES } from '../data/archetypes'

interface ArchetypeScreenProps {
  onNext: (archetypeId: string) => void
}

export function ArchetypeScreen({ onNext }: ArchetypeScreenProps) {
  const [selected, setSelected] = useState('unit')

  return (
    <ScreenContainer style={{ overflowY: 'auto' }}>
      <h2 style={{ fontFamily: 'var(--font-primary)', fontSize: '24px', marginBottom: '16px', color: 'var(--cream)' }}>Select Your Archetype</h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
        {ARCHETYPES.map(arch => (
          <div
            key={arch.id}
            role="button"
            tabIndex={0}
            aria-label={`Select archetype: ${arch.name}`}
            aria-pressed={selected === arch.id}
            onClick={() => setSelected(arch.id)}
            onKeyDown={(e) => e.key === 'Enter' && setSelected(arch.id)}
            style={{
              background: 'var(--card-bg)',
              border: selected === arch.id ? '4px solid var(--kit-amber)' : '2px solid var(--border)',
              borderRadius: '12px',
              padding: '16px',
              cursor: 'pointer',
              transform: selected === arch.id ? 'scale(1.02)' : 'scale(1)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontFamily: 'var(--font-primary)', fontSize: '18px', fontWeight: 'bold' }}>{arch.name}</span>
              <span style={{ fontSize: '12px', background: 'var(--cream)', padding: '2px 8px', borderRadius: '10px', fontWeight: 'bold' }}>{arch.traits.join(' / ')}</span>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--warm-grey)', marginBottom: '12px' }}>{arch.description}</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px', fontFamily: 'var(--font-mono)', fontSize: '10px', textAlign: 'center' }}>
              {Object.entries(arch.stats).map(([k, v]) => (
                <div key={k} style={{ background: 'var(--surface)', padding: '4px', borderRadius: '4px' }}>
                  <div style={{ fontWeight: 'bold' }}>{k.toUpperCase()}</div>
                  <div>{v as number}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => onNext(selected)}
        style={{ width: '100%', padding: '16px', background: 'var(--kit-amber)', color: 'var(--charcoal)', border: '3px solid var(--charcoal)', borderRadius: '8px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 0px var(--charcoal)', marginTop: 'auto' }}
      >
        NEXT: CHOOSE JOB →
      </button>
    </ScreenContainer>
  )
}

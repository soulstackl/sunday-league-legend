import React, { useState } from 'react'
import { ScreenContainer } from '../components/shared/ScreenContainer'
import { JOBS } from '../data/jobs'

interface JobScreenProps {
  onNext: (jobId: string) => void
}

export function JobScreen({ onNext }: JobScreenProps) {
  const [selected, setSelected] = useState('builder')

  return (
    <ScreenContainer style={{ overflowY: 'auto' }}>
      <h2 style={{ fontFamily: 'var(--font-primary)', fontSize: '24px', marginBottom: '16px', color: 'var(--cream)' }}>Select Your Midweek Job</h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
        {JOBS.map(job => (
          <div
            key={job.id}
            role="button"
            tabIndex={0}
            aria-label={`Select job: ${job.name}`}
            aria-pressed={selected === job.id}
            onClick={() => setSelected(job.id)}
            onKeyDown={(e) => e.key === 'Enter' && setSelected(job.id)}
            style={{
              background: 'var(--card-bg)',
              border: selected === job.id ? '4px solid var(--kit-amber)' : '2px solid var(--border)',
              borderRadius: '10px',
              padding: '14px',
              cursor: 'pointer'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontWeight: 'bold', fontSize: '16px' }}>{job.name}</span>
              <span style={{ fontSize: '11px', background: 'var(--cream)', padding: '2px 6px', borderRadius: '8px', fontWeight: 'bold', color: 'var(--kit-amber-dark)' }}>
                {job.trait}
              </span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--warm-grey)', marginBottom: '8px' }}>{job.text}</p>
            <div style={{ fontSize: '11px', color: 'var(--success)', fontWeight: 'bold', fontFamily: 'var(--font-mono)' }}>
              Stat Modifier: {Object.entries(job.modifier).map(([k, v]) => `+${v} ${k.toUpperCase()}`).join(', ')}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => onNext(selected)}
        style={{ width: '100%', padding: '16px', background: 'var(--kit-amber)', color: 'var(--charcoal)', border: '3px solid var(--charcoal)', borderRadius: '8px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 0px var(--charcoal)', marginTop: 'auto' }}
      >
        JOIN DOG &amp; DUCK FC
      </button>
    </ScreenContainer>
  )
}

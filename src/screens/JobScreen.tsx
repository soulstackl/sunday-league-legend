import { useState } from 'react'
import { ScreenContainer } from '../components/shared/ScreenContainer'
import { JOBS } from '../data/jobs'

interface JobScreenProps {
  onNext: (jobId: string) => void
}

export function JobScreen({ onNext }: JobScreenProps) {
  const [selected, setSelected] = useState('builder')

  return (
    <ScreenContainer style={{ overflowY: 'auto' }}>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 700, marginBottom: '4px', color: 'var(--text)' }}>Select Your Midweek Job</h2>
      <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '18px' }}>Shapes your training access and week-to-week rhythm.</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
        {JOBS.map(job => {
          const isSel = selected === job.id
          return (
            <div
              key={job.id}
              role="button"
              tabIndex={0}
              aria-label={`Select job: ${job.name}`}
              aria-pressed={isSel}
              onClick={() => setSelected(job.id)}
              onKeyDown={(e) => e.key === 'Enter' && setSelected(job.id)}
              style={{
                background: isSel ? 'var(--surface-raised)' : 'var(--card-bg)',
                border: isSel ? '1px solid var(--accent)' : '1px solid var(--border)',
                borderRadius: '14px',
                padding: '14px',
                cursor: 'pointer',
                transition: 'border-color 0.15s, background 0.15s',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                <span style={{ fontWeight: 700, fontSize: '16px', color: isSel ? 'var(--accent)' : 'var(--text)' }}>{job.name}</span>
                <span style={{ fontSize: '11px', background: isSel ? 'var(--accent-bg)' : 'var(--surface)', color: isSel ? 'var(--accent)' : 'var(--text-muted)', padding: '3px 8px', borderRadius: '20px', fontWeight: 600 }}>
                  {job.trait}
                </span>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', lineHeight: '1.4' }}>{job.text}</p>
              <div style={{ fontSize: '11px', color: 'var(--success)', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                {Object.entries(job.modifier).map(([k, v]) => `+${v} ${k.toUpperCase()}`).join(', ')}
              </div>
            </div>
          )
        })}
      </div>

      <button
        onClick={() => onNext(selected)}
        style={{ width: '100%', padding: '16px', background: 'var(--btn-bg)', color: 'var(--btn-text)', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: 700, cursor: 'pointer', letterSpacing: '0.04em', marginTop: 'auto' }}
      >
        JOIN DOG &amp; DUCK FC
      </button>
    </ScreenContainer>
  )
}

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
                transition: 'border-color 0.15s, background 0.15s, transform 0.15s',
                transform: isSel ? 'translateY(-1px)' : 'none',
                boxShadow: isSel ? '0 6px 18px rgba(124,58,237,0.18)' : 'none',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px', gap: '10px' }}>
                <span style={{ fontWeight: 700, fontSize: '16px', color: isSel ? 'var(--accent)' : 'var(--text)' }}>{job.name}</span>
                <span style={{ fontSize: '10px', letterSpacing: '0.06em', textTransform: 'uppercase', background: isSel ? 'var(--accent-bg-strong)' : 'var(--surface)', color: isSel ? 'var(--accent)' : 'var(--text-muted)', padding: '3px 9px', borderRadius: '20px', fontWeight: 700, border: '1px solid var(--border)', flexShrink: 0 }}>
                  {job.trait}
                </span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '10px', lineHeight: '1.45' }}>{job.text}</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                {Object.entries(job.modifier).map(([k, v]) => (
                  <span
                    key={k}
                    style={{
                      fontSize: '10px',
                      fontFamily: 'var(--font-mono)',
                      padding: '3px 8px',
                      borderRadius: '5px',
                      background: 'var(--success-bg)',
                      color: 'var(--success)',
                      fontWeight: 700,
                      border: '1px solid var(--border)',
                      letterSpacing: '0.02em',
                    }}
                  >
                    +{v} {k.toUpperCase()}
                  </span>
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
        JOIN DOG &amp; DUCK FC
      </button>
    </ScreenContainer>
  )
}

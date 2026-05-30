import { Target, CheckCircle2, Clock } from 'lucide-react'
import { findObjective } from '../../data/objectives'
import type { ObjectiveState } from '../../types/game'

interface ObjectivesWidgetProps {
  objectives: ObjectiveState
}

const TYPE_LABEL: Record<string, string> = {
  short: 'This Match',
  medium: 'This Month',
  long: 'This Season',
}

const TYPE_COLOUR: Record<string, string> = {
  short: 'var(--success)',
  medium: 'var(--accent)',
  long: 'var(--kit-amber, #F0A830)',
}

export function ObjectivesWidget({ objectives }: ObjectivesWidgetProps) {
  const slots = [
    { key: 'short',  id: objectives.short },
    { key: 'medium', id: objectives.medium },
    { key: 'long',   id: objectives.long },
  ] as const

  const activeSlots = slots.filter(s => s.id !== null)
  if (activeSlots.length === 0) return null

  return (
    <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px', marginBottom: '14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
        <Target size={13} style={{ color: 'var(--accent)' }} />
        <span style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--accent)', fontWeight: 700, fontFamily: 'var(--font-mono)', letterSpacing: '0.06em' }}>
          Objectives
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
        {activeSlots.map(({ key, id }) => {
          const def = findObjective(id!)
          if (!def) return null
          const completed = objectives.completedThisSeason.includes(id!)
          const colour = TYPE_COLOUR[key]
          return (
            <div
              key={key}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '7px 10px',
                background: completed ? 'var(--success-bg)' : 'var(--surface)',
                border: `1px solid ${completed ? 'rgba(34,197,94,0.25)' : 'var(--border-subtle, var(--border))'}`,
                borderRadius: '8px',
                opacity: completed ? 0.7 : 1,
              }}
            >
              {completed
                ? <CheckCircle2 size={14} style={{ color: 'var(--success)', flexShrink: 0 }} />
                : <Clock size={14} style={{ color: colour, flexShrink: 0 }} />
              }
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '11px', color: colour, fontWeight: 700, fontFamily: 'var(--font-mono)', marginBottom: '1px' }}>
                  {TYPE_LABEL[key]}
                </div>
                <div style={{ fontSize: '12px', color: completed ? 'var(--text-muted)' : 'var(--text)', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {def.title}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-faint)' }}>{def.description}</div>
              </div>
              {!completed && (
                <div style={{ fontSize: '10px', color: 'var(--text-faint)', fontFamily: 'var(--font-mono)', flexShrink: 0, textAlign: 'right' }}>
                  {def.reward.label}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

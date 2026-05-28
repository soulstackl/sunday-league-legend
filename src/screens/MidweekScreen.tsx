import React, { useState } from 'react'
import { ScreenContainer } from '../components/shared/ScreenContainer'
import { DiscordVotePanel } from '../components/discord/DiscordVotePanel'
import { MIDWEEK_ACTIONS } from '../data/midweek-actions'
import type { SaveState, MidweekAction } from '../types/game'

interface MidweekScreenProps {
  store: SaveState
  onConfirm: (action: MidweekAction) => void
  onBack: () => void
  isDiscord: boolean
}

export function MidweekScreen({ store, onConfirm, onBack, isDiscord }: MidweekScreenProps) {
  const [selected, setSelected] = useState<MidweekAction | null>(null)
  const available = MIDWEEK_ACTIONS.filter(act => {
    if (act.id === 'patchrelationship') {
      return Object.values(store.npcs).some(n => n.relationshipScore < 45)
    }
    return true
  })

  const handleVoteComplete = (winnerId: string) => {
    const action = available.find(a => a.id === winnerId)
    if (action) onConfirm(action)
  }

  return (
    <ScreenContainer style={{ background: 'var(--surface)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ fontFamily: 'var(--font-primary)', fontSize: '22px', color: 'var(--charcoal)' }}>Midweek Action</h2>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'var(--charcoal)', fontSize: '14px', cursor: 'pointer', fontWeight: 'bold' }}>Cancel</button>
      </div>

      {isDiscord && !selected && (
        <div style={{ marginBottom: '16px' }}>
          <DiscordVotePanel options={available} onVoteComplete={handleVoteComplete} />
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
        {available.map(act => (
          <div
            key={act.id}
            role="button"
            tabIndex={0}
            aria-label={`Select midweek action: ${act.name}`}
            aria-pressed={selected?.id === act.id}
            onClick={() => setSelected(act)}
            onKeyDown={(e) => e.key === 'Enter' && setSelected(act)}
            style={{
              background: 'var(--card-bg)',
              border: selected?.id === act.id ? '3px solid var(--kit-amber)' : '2px solid var(--border)',
              borderRadius: '8px',
              padding: '12px',
              cursor: 'pointer',
              transform: selected?.id === act.id ? 'scale(1.01)' : 'scale(1)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ fontSize: '20px' }}>{act.icon}</span>
              <span style={{ fontWeight: 'bold', fontSize: '15px' }}>{act.name}</span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--warm-grey)', marginBottom: '8px' }}>{act.description}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', fontSize: '10px', fontFamily: 'var(--font-mono)' }}>
              {Object.entries(act.effects).map(([k, v]) => {
                const text =
                  k === 'statBoost' ? '+1 Random Stat Boost'
                  : k === 'statBoostOptions' ? `+1 to either ${(v as string[]).join(' or ').toUpperCase()}`
                  : k === 'targetRelationship' ? '+15 Relationship with target'
                  : k === 'hangoverRisk' ? 'Warning: Hangover XI risk'
                  : `${(v as number) > 0 ? '+' : ''}${v} ${k.toUpperCase()}`

                return (
                  <span key={k} style={{ padding: '2px 6px', borderRadius: '4px', background: 'var(--surface)', fontWeight: 'bold' }}>
                    {text}
                  </span>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      <button
        disabled={!selected}
        onClick={() => selected && onConfirm(selected)}
        style={{ width: '100%', padding: '16px', background: selected ? 'var(--kit-amber)' : 'var(--warm-grey)', color: 'var(--charcoal)', border: '3px solid var(--charcoal)', borderRadius: '8px', fontSize: '18px', fontWeight: 'bold', cursor: selected ? 'pointer' : 'not-allowed', boxShadow: '0 4px 0px var(--charcoal)', marginTop: 'auto' }}
      >
        CONFIRM ACTION
      </button>
    </ScreenContainer>
  )
}

import { useState } from 'react'
import { ScreenContainer } from '../components/shared/ScreenContainer'
import { DiscordVotePanel } from '../components/discord/DiscordVotePanel'
import { NpcAvatar } from '../components/shared/NpcAvatar'
import { MIDWEEK_ACTIONS } from '../data/midweek-actions'
import { NPCS } from '../data/npcs'
import type { SaveState, MidweekAction, StatKey } from '../types/game'

interface MidweekScreenProps {
  store: SaveState
  onConfirm: (action: MidweekAction, statChoice?: StatKey, npcTarget?: string) => void
  onBack: () => void
  isDiscord: boolean
}

export function MidweekScreen({ store, onConfirm, onBack, isDiscord }: MidweekScreenProps) {
  const [selected, setSelected] = useState<MidweekAction | null>(null)
  const [statChoice, setStatChoice] = useState<StatKey | null>(null)
  const [npcTarget, setNpcTarget] = useState<string | null>(null)

  // patchrelationship is only available when at least one NPC's relationship is shaky
  const available = MIDWEEK_ACTIONS.filter(act => {
    if (act.id === 'patchrelationship') {
      return Object.values(store.npcs).some(n => n.relationshipScore < 50)
    }
    return true
  })

  const patchCandidates = Object.entries(store.npcs)
    .filter(([id, n]) => NPCS[id] && n.relationshipScore < 50)
    .sort((a, b) => a[1].relationshipScore - b[1].relationshipScore)
    .slice(0, 4)
    .map(([id]) => id)

  const handleVoteComplete = (winnerId: string) => {
    const action = available.find(a => a.id === winnerId)
    if (!action) return
    setSelected(action)
  }

  const canConfirm = (() => {
    if (!selected) return false
    if (selected.statChoice && !statChoice) return false
    if (selected.npcTarget && !npcTarget) return false
    return true
  })()

  const confirm = () => {
    if (!selected) return
    onConfirm(selected, statChoice ?? undefined, npcTarget ?? undefined)
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
            onClick={() => { setSelected(act); setStatChoice(null); setNpcTarget(null) }}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { setSelected(act); setStatChoice(null); setNpcTarget(null) } }}
            style={{
              background: 'var(--card-bg)',
              border: selected?.id === act.id ? '3px solid var(--kit-amber)' : '2px solid var(--border)',
              borderRadius: '8px',
              padding: '12px',
              cursor: 'pointer',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ fontSize: '20px' }}>{act.icon}</span>
              <span style={{ fontWeight: 'bold', fontSize: '15px' }}>{act.name}</span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--warm-grey)', marginBottom: '8px' }}>{act.description}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', fontSize: '10px', fontFamily: 'var(--font-mono)' }}>
              {Object.entries(act.effects).map(([k, v]) => {
                let text = ''
                if (k === 'statBoost') text = '+1 Random Stat'
                else if (k === 'statBoostOptions') text = `Choose: ${(v as string[]).join(', ').toUpperCase()}`
                else if (k === 'targetRelationship') text = `+${v} Relationship`
                else if (k === 'hangoverRisk') text = 'Hangover Risk'
                else if (k === 'contextModifier') text = String(v) === 'opposition-scouted' ? 'Match: Accuracy +' : 'Set Pieces: Power +'
                else if (k === 'specialModifier') text = String(v)
                else if (typeof v === 'number') text = `${v > 0 ? '+' : ''}${v} ${k.toUpperCase()}`
                if (!text) return null

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

      {selected?.statChoice && selected.effects.statBoostOptions && (
        <div style={{ background: 'var(--card-bg)', border: '2px dashed var(--kit-amber)', borderRadius: '8px', padding: '12px', marginBottom: '12px' }}>
          <div style={{ fontWeight: 'bold', fontSize: '13px', marginBottom: '8px' }}>Pick a focus:</div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {selected.effects.statBoostOptions.map(k => (
              <button
                key={k}
                onClick={() => setStatChoice(k)}
                style={{
                  padding: '8px 12px',
                  background: statChoice === k ? 'var(--kit-amber)' : 'var(--surface)',
                  color: 'var(--charcoal)',
                  border: statChoice === k ? '2px solid var(--charcoal)' : '1px solid var(--border)',
                  borderRadius: '16px',
                  fontWeight: 'bold',
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                {k.toUpperCase()} ({store.player.stats[k]})
              </button>
            ))}
          </div>
        </div>
      )}

      {selected?.npcTarget && patchCandidates.length > 0 && (
        <div style={{ background: 'var(--card-bg)', border: '2px dashed var(--kit-amber)', borderRadius: '8px', padding: '12px', marginBottom: '12px' }}>
          <div style={{ fontWeight: 'bold', fontSize: '13px', marginBottom: '8px' }}>Patch up with:</div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {patchCandidates.map(id => {
              const npc = NPCS[id]
              const isSel = npcTarget === id
              return (
                <button
                  key={id}
                  onClick={() => setNpcTarget(id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '6px 12px',
                    background: isSel ? 'var(--kit-amber)' : 'var(--surface)',
                    color: 'var(--charcoal)',
                    border: isSel ? '2px solid var(--charcoal)' : '1px solid var(--border)',
                    borderRadius: '20px',
                    fontWeight: 'bold',
                    fontSize: '13px',
                    cursor: 'pointer',
                  }}
                >
                  <NpcAvatar npcId={id} size={24} />
                  <span>{npc?.name} ({store.npcs[id].relationshipScore})</span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      <button
        disabled={!canConfirm}
        onClick={confirm}
        style={{
          width: '100%', padding: '16px',
          background: canConfirm ? 'var(--kit-amber)' : 'var(--warm-grey)',
          color: 'var(--charcoal)',
          border: '3px solid var(--charcoal)', borderRadius: '8px', fontSize: '18px', fontWeight: 'bold',
          cursor: canConfirm ? 'pointer' : 'not-allowed', boxShadow: '0 4px 0px var(--charcoal)', marginTop: 'auto',
        }}
      >
        CONFIRM ACTION
      </button>
    </ScreenContainer>
  )
}

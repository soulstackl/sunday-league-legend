import { useState } from 'react'
import { Activity, Bed, Dumbbell, Beer, Briefcase, Eye, Heart, Target, type LucideProps } from 'lucide-react'
import { ScreenContainer } from '../components/shared/ScreenContainer'
import { DiscordVotePanel } from '../components/discord/DiscordVotePanel'
import { NpcAvatar } from '../components/shared/NpcAvatar'
import { MIDWEEK_ACTIONS } from '../data/midweek-actions'
import { NPCS } from '../data/npcs'
import type { SaveState, MidweekAction, StatKey } from '../types/game'

const ACTION_ICONS: Record<string, React.ComponentType<LucideProps>> = {
  Activity, Bed, Dumbbell, Beer, Briefcase, Eye, Heart, Target,
}

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
    <ScreenContainer>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 700, color: 'var(--text)' }}>Midweek</h2>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>How do you spend the week?</p>
        </div>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '14px', cursor: 'pointer', fontWeight: 600, padding: '6px 8px', fontFamily: 'var(--font-ui)' }}>Cancel</button>
      </div>

      {isDiscord && !selected && (
        <div style={{ marginBottom: '16px' }}>
          <DiscordVotePanel options={available} onVoteComplete={handleVoteComplete} />
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
        {available.map(act => {
          const isSel = selected?.id === act.id
          const IconComponent = ACTION_ICONS[act.icon]
          return (
            <div
              key={act.id}
              role="button"
              tabIndex={0}
              aria-label={`Select midweek action: ${act.name}`}
              aria-pressed={isSel}
              onClick={() => { setSelected(act); setStatChoice(null); setNpcTarget(null) }}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { setSelected(act); setStatChoice(null); setNpcTarget(null) } }}
              style={{
                background: isSel ? 'var(--surface-raised)' : 'var(--card-bg)',
                border: isSel ? '1px solid var(--accent)' : '1px solid var(--border)',
                borderRadius: '12px',
                padding: '12px 14px',
                cursor: 'pointer',
                transition: 'border-color 0.15s, background 0.15s',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                {IconComponent && (
                  <div style={{ color: isSel ? 'var(--accent)' : 'var(--text-muted)', flexShrink: 0 }}>
                    <IconComponent size={18} />
                  </div>
                )}
                <span style={{ fontWeight: 700, fontSize: '15px', color: isSel ? 'var(--accent)' : 'var(--text)' }}>{act.name}</span>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', lineHeight: '1.4', paddingLeft: '28px' }}>{act.description}</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', fontSize: '10px', fontFamily: 'var(--font-mono)', paddingLeft: '28px' }}>
                {Object.entries(act.effects).map(([k, v]) => {
                  let text = ''
                  if (k === 'statBoost') text = '+1 Random Stat'
                  else if (k === 'statBoostOptions') text = `Choose: ${(v as string[]).join(', ').toUpperCase()}`
                  else if (k === 'targetRelationship') text = `+${v} Relationship`
                  else if (k === 'hangoverRisk') text = 'Hangover Risk'
                  else if (k === 'contextModifier') text = String(v) === 'opposition-scouted' ? 'Accuracy +' : 'Set Pieces +'
                  else if (k === 'specialModifier') text = String(v)
                  else if (typeof v === 'number') text = `${v > 0 ? '+' : ''}${v} ${k.toUpperCase()}`
                  if (!text) return null
                  return (
                    <span key={k} style={{ padding: '2px 7px', borderRadius: '5px', background: 'var(--surface)', color: 'var(--text-muted)', fontWeight: 700, border: '1px solid var(--border)' }}>
                      {text}
                    </span>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {selected?.statChoice && selected.effects.statBoostOptions && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--accent-bg-strong)', borderRadius: '12px', padding: '14px', marginBottom: '12px' }}>
          <div style={{ fontWeight: 700, fontSize: '13px', marginBottom: '10px', color: 'var(--text)' }}>Pick your focus:</div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {selected.effects.statBoostOptions.map(k => (
              <button
                key={k}
                onClick={() => setStatChoice(k)}
                style={{
                  padding: '8px 14px',
                  background: statChoice === k ? 'var(--accent)' : 'var(--surface-raised)',
                  color: statChoice === k ? '#0C0C10' : 'var(--text)',
                  border: statChoice === k ? 'none' : '1px solid var(--border)',
                  borderRadius: '20px',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-ui)',
                }}
              >
                {k.toUpperCase()} ({store.player.stats[k]})
              </button>
            ))}
          </div>
        </div>
      )}

      {selected?.npcTarget && patchCandidates.length > 0 && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--accent-bg-strong)', borderRadius: '12px', padding: '14px', marginBottom: '12px' }}>
          <div style={{ fontWeight: 700, fontSize: '13px', marginBottom: '10px', color: 'var(--text)' }}>Patch up with:</div>
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
                    padding: '7px 12px',
                    background: isSel ? 'var(--accent)' : 'var(--surface-raised)',
                    color: isSel ? '#0C0C10' : 'var(--text)',
                    border: isSel ? 'none' : '1px solid var(--border)',
                    borderRadius: '20px',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-ui)',
                  }}
                >
                  <NpcAvatar npcId={id} size={22} />
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
          background: canConfirm ? 'var(--accent)' : 'var(--surface-raised)',
          color: canConfirm ? '#0C0C10' : 'var(--text-faint)',
          border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: 700,
          cursor: canConfirm ? 'pointer' : 'not-allowed',
          letterSpacing: '0.04em', marginTop: 'auto',
        }}
      >
        CONFIRM ACTION
      </button>
    </ScreenContainer>
  )
}

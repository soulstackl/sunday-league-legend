import { ScreenContainer } from '../components/shared/ScreenContainer'
import { NpcAvatar } from '../components/shared/NpcAvatar'
import { Card } from '../components/shared/Card'
import { NPCS } from '../data/npcs'
import type { SaveState } from '../types/game'

interface Props {
  store: SaveState
  onBack: () => void
}

function relationshipBand(score: number): { label: string; colour: string } {
  if (score >= 80) return { label: 'Tight Bond', colour: 'var(--success)' }
  if (score >= 60) return { label: 'Solid', colour: 'var(--success)' }
  if (score >= 45) return { label: 'Workable', colour: 'var(--accent)' }
  if (score >= 30) return { label: 'Strained', colour: 'var(--accent-dark)' }
  return { label: 'Frosty', colour: 'var(--danger)' }
}

export function SquadScreen({ store, onBack }: Props) {
  const ids = Object.keys(store.npcs).filter(id => NPCS[id])
  const ordered = ids.sort((a, b) => store.npcs[b].relationshipScore - store.npcs[a].relationshipScore)

  return (
    <ScreenContainer style={{ overflowY: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 700, color: 'var(--text)' }}>Squad</h2>
          <div style={{ fontSize: '12px', color: 'var(--text-faint)', marginTop: '2px' }}>Dog &amp; Duck FC</div>
        </div>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '14px', cursor: 'pointer', fontWeight: 600, padding: '6px', fontFamily: 'var(--font-ui)' }}>Back</button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {ordered.map(id => {
          const npc = NPCS[id]
          if (!npc) return null
          const state = store.npcs[id]
          const band = relationshipBand(state.relationshipScore)
          return (
            <Card key={id} style={{ padding: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <NpcAvatar npcId={id} size={44} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '2px' }}>
                    <span style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text)' }}>{npc.name}</span>
                    <span style={{ fontSize: '11px', color: band.colour, fontWeight: 700, flexShrink: 0, marginLeft: '8px' }}>{band.label}</span>
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px' }}>{npc.role}{npc.position ? ` · ${npc.position}` : ''}</div>
                  <div style={{ height: '4px', background: 'var(--surface-raised)', borderRadius: '2px', overflow: 'hidden', marginBottom: '7px' }}>
                    <div style={{ width: `${state.relationshipScore}%`, height: '100%', background: band.colour, borderRadius: '2px', transition: 'width 0.4s ease' }} />
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-faint)', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span><strong style={{ color: 'var(--text-muted)' }}>Strength:</strong> {npc.strength}</span>
                    <span><strong style={{ color: 'var(--text-muted)' }}>Flaw:</strong> {npc.flaw}</span>
                  </div>
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </ScreenContainer>
  )
}

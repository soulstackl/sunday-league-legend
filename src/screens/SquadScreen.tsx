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
  if (score >= 60) return { label: 'Solid', colour: '#16A34A' }
  if (score >= 45) return { label: 'Workable', colour: 'var(--kit-amber)' }
  if (score >= 30) return { label: 'Strained', colour: 'var(--kit-amber-dark)' }
  return { label: 'Frosty', colour: 'var(--danger)' }
}

export function SquadScreen({ store, onBack }: Props) {
  const ids = Object.keys(store.npcs).filter(id => NPCS[id])
  const ordered = ids.sort((a, b) => store.npcs[b].relationshipScore - store.npcs[a].relationshipScore)

  return (
    <ScreenContainer style={{ overflowY: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ fontFamily: 'var(--font-primary)', fontSize: '24px', color: 'var(--cream)' }}>Dog &amp; Duck Squad</h2>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'var(--cream)', fontSize: '14px', cursor: 'pointer', fontWeight: 'bold' }}>Back</button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {ordered.map(id => {
          const npc = NPCS[id]
          if (!npc) return null
          const state = store.npcs[id]
          const band = relationshipBand(state.relationshipScore)
          return (
            <Card key={id} style={{ background: 'var(--card-bg)', border: '2px solid var(--border)', padding: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <NpcAvatar npcId={id} size={48} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ fontWeight: 'bold', fontSize: '15px' }}>{npc.name}</span>
                    <span style={{ fontSize: '11px', color: band.colour, fontWeight: 'bold' }}>{band.label} · {state.relationshipScore}</span>
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--warm-grey)' }}>{npc.role}{npc.position ? ` · ${npc.position}` : ''}</div>
                  <div style={{ marginTop: '6px', height: '5px', background: 'var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${state.relationshipScore}%`, height: '100%', background: band.colour, transition: 'width 0.4s ease' }} />
                  </div>
                  <div style={{ fontSize: '11px', marginTop: '6px', color: 'var(--charcoal)', fontStyle: 'italic' }}>
                    <strong>Strength:</strong> {npc.strength}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--warm-grey)' }}>
                    <strong>Flaw:</strong> {npc.flaw}
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

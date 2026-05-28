import { Trophy } from 'lucide-react'
import { ScreenContainer } from '../components/shared/ScreenContainer'
import { Card } from '../components/shared/Card'
import { TIER_NAMES } from '../data/opponents'
import { ARCHETYPES } from '../data/archetypes'
import type { HallOfFameEntry } from '../types/game'

interface HallOfFameScreenProps {
  hallOfFame: HallOfFameEntry[]
  onBack: () => void
}

export function HallOfFameScreen({ hallOfFame, onBack }: HallOfFameScreenProps) {
  const sorted = [...hallOfFame].sort((a, b) => b.date - a.date)

  return (
    <ScreenContainer style={{ overflowY: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 700, color: 'var(--text)' }}>Hall of Fame</h2>
          <div style={{ fontSize: '12px', color: 'var(--text-faint)', marginTop: '2px' }}>{sorted.length} career{sorted.length !== 1 ? 's' : ''} recorded</div>
        </div>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '14px', cursor: 'pointer', fontWeight: 600, padding: '6px', fontFamily: 'var(--font-ui)' }}>Back</button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {sorted.map((career, i) => {
          const archetype = ARCHETYPES.find(a => a.id === career.archetype)?.name ?? career.archetype
          return (
            <Card key={i}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 700, color: 'var(--text)' }}>{career.name}</span>
                <span style={{ fontSize: '12px', color: 'var(--accent)', fontWeight: 700 }}>{career.title}</span>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px', fontFamily: 'var(--font-mono)' }}>
                {archetype} · {career.seasons} season{career.seasons === 1 ? '' : 's'} · {TIER_NAMES[career.finalTier]}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: 'var(--text-faint)' }}>
                <span style={{ fontFamily: 'var(--font-mono)' }}>{career.goals} goals · {career.points} pts</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  {career.cupWon && <Trophy size={11} style={{ color: 'var(--kit-amber)' }} />}
                  {new Date(career.date).toLocaleDateString('en-GB')}
                </span>
              </div>
            </Card>
          )
        })}
        {sorted.length === 0 && (
          <div style={{ color: 'var(--text-muted)', textAlign: 'center', fontStyle: 'italic', margin: '32px 0' }}>No legend records yet. Your first career awaits.</div>
        )}
      </div>
    </ScreenContainer>
  )
}

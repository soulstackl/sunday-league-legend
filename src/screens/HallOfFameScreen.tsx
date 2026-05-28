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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ fontFamily: 'var(--font-primary)', fontSize: '24px', color: 'var(--cream)' }}>Hall of Fame</h2>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'var(--cream)', fontSize: '14px', cursor: 'pointer', fontWeight: 'bold' }}>Back</button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {sorted.map((career, i) => {
          const archetype = ARCHETYPES.find(a => a.id === career.archetype)?.name ?? career.archetype
          return (
            <Card key={i} style={{ background: 'var(--card-bg)', border: '2px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', alignItems: 'baseline' }}>
                <span style={{ fontSize: '16px' }}>{career.name}</span>
                <span style={{ color: 'var(--kit-amber-dark)' }}>{career.title}</span>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--warm-grey)', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
                {archetype} · {career.seasons} season{career.seasons === 1 ? '' : 's'} · {TIER_NAMES[career.finalTier]}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '11px', color: 'var(--charcoal)' }}>
                <span>{career.goals} goals · {career.points} pts</span>
                <span>{career.cupWon ? '🏆 Tankard winner' : ''} {new Date(career.date).toLocaleDateString('en-GB')}</span>
              </div>
            </Card>
          )
        })}
        {sorted.length === 0 && (
          <div style={{ color: 'var(--cream)', textAlign: 'center', fontStyle: 'italic', margin: '20px 0' }}>No legend records recorded yet. Your first career awaits.</div>
        )}
      </div>
    </ScreenContainer>
  )
}

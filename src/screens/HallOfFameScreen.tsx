import React from 'react'
import { ScreenContainer } from '../components/shared/ScreenContainer'
import type { HallOfFameEntry } from '../types/game'

interface HallOfFameScreenProps {
  hallOfFame: HallOfFameEntry[]
  onBack: () => void
}

export function HallOfFameScreen({ hallOfFame, onBack }: HallOfFameScreenProps) {
  return (
    <ScreenContainer style={{ overflowY: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ fontFamily: 'var(--font-primary)', fontSize: '24px', color: 'var(--cream)' }}>Hall of Fame</h2>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'var(--cream)', fontSize: '14px', cursor: 'pointer', fontWeight: 'bold' }}>Back</button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
        {hallOfFame.map((career, i) => (
          <div key={i} style={{ background: 'var(--card-bg)', border: '2px solid var(--border)', borderRadius: '8px', padding: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
              <span>{career.name}</span>
              <span style={{ color: 'var(--kit-amber-dark)' }}>{career.title}</span>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--warm-grey)', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
              Archetype: {career.archetype} | Date: {new Date(career.date).toLocaleDateString()}
            </div>
          </div>
        ))}
        {hallOfFame.length === 0 && (
          <div style={{ color: 'var(--cream)', textAlign: 'center', fontStyle: 'italic', margin: '20px 0' }}>No legend records recorded yet. Your first career awaits.</div>
        )}
      </div>
    </ScreenContainer>
  )
}

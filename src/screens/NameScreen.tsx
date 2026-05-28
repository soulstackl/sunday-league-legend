import { useState } from 'react'
import { ScreenContainer } from '../components/shared/ScreenContainer'

interface NameScreenProps {
  onNext: (name: string) => void
}

export function NameScreen({ onNext }: NameScreenProps) {
  const [name, setName] = useState('')
  const suggestions = ['Bazza', 'Stevo', 'Gaz-Two-Pints', 'Chappers', 'Smudger', 'Tangerine Machine', 'The Fridge']

  return (
    <ScreenContainer>
      <h2 style={{ fontFamily: 'var(--font-primary)', fontSize: '24px', marginBottom: '16px', color: 'var(--cream)' }}>Enter Your Legend Name</h2>
      <input
        aria-label="Enter your legend name"
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="e.g. Gazza"
        maxLength={18}
        style={{ width: '100%', padding: '16px', fontSize: '18px', border: '3px solid var(--charcoal)', borderRadius: '8px', marginBottom: '16px', fontFamily: 'var(--font-mono)' }}
      />

      <div style={{ marginBottom: 'auto' }}>
        <div style={{ fontSize: '13px', color: 'var(--cream)', marginBottom: '8px', fontWeight: 'bold' }}>Suggestions:</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {suggestions.map(s => (
            <button key={s} aria-label={`Use name ${s}`} onClick={() => setName(s)} style={{ padding: '8px 12px', background: 'var(--border)', color: 'var(--charcoal)', border: 'none', borderRadius: '16px', fontSize: '14px', cursor: 'pointer', fontWeight: '600' }}>
              {s}
            </button>
          ))}
        </div>
      </div>

      <button
        disabled={!name.trim()}
        onClick={() => onNext(name)}
        style={{ width: '100%', padding: '16px', background: name.trim() ? 'var(--kit-amber)' : 'var(--warm-grey)', color: 'var(--charcoal)', border: '3px solid var(--charcoal)', borderRadius: '8px', fontSize: '18px', fontWeight: 'bold', cursor: name.trim() ? 'pointer' : 'not-allowed', boxShadow: '0 4px 0px var(--charcoal)' }}
      >
        NEXT: PICK ARCHETYPE →
      </button>
    </ScreenContainer>
  )
}

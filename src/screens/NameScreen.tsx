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
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 700, marginBottom: '6px', color: 'var(--text)' }}>Enter Your Legend Name</h2>
      <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>What do they call you down the Dog &amp; Duck?</p>

      <input
        aria-label="Enter your legend name"
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="e.g. Gazza"
        maxLength={18}
        style={{ width: '100%', padding: '16px', fontSize: '18px', border: '1px solid var(--border)', borderRadius: '12px', marginBottom: '16px', fontFamily: 'var(--font-ui)', background: 'var(--surface)', color: 'var(--text)' }}
      />

      <div style={{ marginBottom: 'auto' }}>
        <div style={{ fontSize: '12px', color: 'var(--text-faint)', marginBottom: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Suggestions</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {suggestions.map(s => (
            <button
              key={s}
              aria-label={`Use name ${s}`}
              onClick={() => setName(s)}
              style={{ padding: '8px 14px', background: 'var(--surface)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: '20px', fontSize: '14px', cursor: 'pointer', fontWeight: 600, fontFamily: 'var(--font-ui)' }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <button
        disabled={!name.trim()}
        onClick={() => onNext(name.trim())}
        style={{
          width: '100%', padding: '16px',
          background: name.trim() ? 'var(--btn-bg)' : 'var(--surface-raised)',
          color: name.trim() ? 'var(--btn-text)' : 'var(--text-faint)',
          border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: 700,
          cursor: name.trim() ? 'pointer' : 'not-allowed',
          letterSpacing: '0.04em', marginTop: '20px',
        }}
      >
        NEXT: PICK ARCHETYPE
      </button>
    </ScreenContainer>
  )
}

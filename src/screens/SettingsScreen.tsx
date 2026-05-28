import { useState } from 'react'
import { ScreenContainer } from '../components/shared/ScreenContainer'
import type { SaveState, GameSettings } from '../types/game'

interface SettingsScreenProps {
  store: SaveState
  onSaveSettings: (settings: GameSettings) => void
  onBack: () => void
  onDeleteSave: () => void
}

export function SettingsScreen({ store, onSaveSettings, onBack, onDeleteSave }: SettingsScreenProps) {
  const [reduced, setReduced] = useState(store.settings.reducedMotion)
  const [sound, setSound] = useState(store.settings.soundEnabled)
  const [textSize, setTextSize] = useState<GameSettings['textSize']>(store.settings.textSize)
  const [inputSensitivity, setInputSensitivity] = useState<GameSettings['inputSensitivity']>(store.settings.inputSensitivity)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const handleSave = () => {
    onSaveSettings({ reducedMotion: reduced, soundEnabled: sound, textSize, inputSensitivity })
    onBack()
  }

  const segmentBtn = <T extends string>(value: T, selected: T, onClick: (v: T) => void, label: string) => (
    <button
      key={value}
      onClick={() => onClick(value)}
      aria-pressed={selected === value}
      style={{
        flex: 1,
        padding: '8px',
        background: selected === value ? 'var(--kit-amber)' : 'var(--surface)',
        color: 'var(--charcoal)',
        border: selected === value ? '2px solid var(--charcoal)' : '1px solid var(--border)',
        borderRadius: '6px',
        fontWeight: 'bold',
        fontSize: '12px',
        cursor: 'pointer',
        textTransform: 'uppercase',
      }}
    >
      {label}
    </button>
  )

  return (
    <ScreenContainer style={{ overflowY: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontFamily: 'var(--font-primary)', fontSize: '24px', color: 'var(--cream)' }}>Settings</h2>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'var(--cream)', fontSize: '14px', cursor: 'pointer', fontWeight: 'bold' }}>Close</button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', background: 'var(--card-bg)', border: '2px solid var(--border)', padding: '16px', borderRadius: '8px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 'bold' }}>Reduced Motion</div>
            <div style={{ fontSize: '11px', color: 'var(--warm-grey)' }}>Disables most animations and screen shake.</div>
          </div>
          <input aria-label="Toggle reduced motion" type="checkbox" checked={reduced} onChange={(e) => setReduced(e.target.checked)} style={{ width: '20px', height: '20px' }} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 'bold' }}>Sound Effects</div>
            <div style={{ fontSize: '11px', color: 'var(--warm-grey)' }}>Procedural kicks, whistles, crowd murmur.</div>
          </div>
          <input aria-label="Toggle sound effects" type="checkbox" checked={sound} onChange={(e) => setSound(e.target.checked)} style={{ width: '20px', height: '20px' }} />
        </div>

        <div>
          <div style={{ fontWeight: 'bold', marginBottom: '6px' }}>Text Size</div>
          <div style={{ display: 'flex', gap: '6px' }}>
            {(['small', 'normal', 'large'] as const).map(v => segmentBtn(v, textSize, setTextSize, v))}
          </div>
        </div>

        <div>
          <div style={{ fontWeight: 'bold', marginBottom: '6px' }}>Input Sensitivity</div>
          <div style={{ fontSize: '11px', color: 'var(--warm-grey)', marginBottom: '6px' }}>Adjusts how strict drag-aim accuracy is on shots and passes.</div>
          <div style={{ display: 'flex', gap: '6px' }}>
            {(['low', 'normal', 'high'] as const).map(v => segmentBtn(v, inputSensitivity, setInputSensitivity, v))}
          </div>
        </div>
      </div>

      <div style={{ fontSize: '11px', color: 'var(--warm-grey)', fontFamily: 'var(--font-mono)', background: 'var(--surface)', padding: '10px', borderRadius: '6px', marginBottom: '16px', lineHeight: '1.6' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '4px', color: 'var(--charcoal)' }}>Debug Info</div>
        <div>Seed: {store.seed}</div>
        <div>Season: {store.season.number} · Week {store.season.week}/15</div>
        <div>Tier: {store.season.tier}</div>
        <div>Matches played: {store.season.results.length}</div>
        <div>Career events: {store.careerEvents.length}</div>
        <div>Subplots active: {store.subplots.filter(s => !s.resolved).length}</div>
        <div>Save version: {store.version}</div>
        <button onClick={() => navigator.clipboard?.writeText(String(store.seed))} style={{ marginTop: '4px', padding: '2px 8px', fontSize: '10px', cursor: 'pointer', border: '1px solid var(--border)', borderRadius: '4px', background: 'var(--card-bg)' }} aria-label="Copy seed to clipboard">Copy Seed</button>
      </div>

      <button
        aria-label="Save settings"
        onClick={handleSave}
        style={{ width: '100%', padding: '14px', background: 'var(--kit-amber)', color: 'var(--charcoal)', border: '3px solid var(--charcoal)', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 3px 0px var(--charcoal)', marginBottom: '16px' }}
      >
        SAVE SETTINGS
      </button>

      {!confirmDelete ? (
        <button
          aria-label="Delete career data"
          onClick={() => setConfirmDelete(true)}
          style={{ width: '100%', padding: '14px', background: 'var(--danger)', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', marginTop: 'auto' }}
        >
          DELETE ALL CAREER DATA
        </button>
      ) : (
        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ fontSize: '13px', color: 'var(--cream)', textAlign: 'center' }}>This wipes your current career. Hall of Fame is kept.</div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setConfirmDelete(false)}
              style={{ flex: 1, padding: '12px', background: 'var(--surface)', color: 'var(--charcoal)', border: '2px solid var(--border)', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button
              onClick={onDeleteSave}
              style={{ flex: 1, padding: '12px', background: 'var(--danger)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              Confirm Delete
            </button>
          </div>
        </div>
      )}
    </ScreenContainer>
  )
}

import React, { useState } from 'react'
import { ScreenContainer } from '../components/shared/ScreenContainer'
import type { SaveState } from '../types/game'

interface SettingsScreenProps {
  store: SaveState
  onSaveSettings: (settings: SaveState['settings']) => void
  onBack: () => void
  onDeleteSave: () => void
}

export function SettingsScreen({ store, onSaveSettings, onBack, onDeleteSave }: SettingsScreenProps) {
  const [reduced, setReduced] = useState(store.settings.reducedMotion)
  const [sound, setSound] = useState(store.settings.soundEnabled)

  const handleSave = () => {
    onSaveSettings({ reducedMotion: reduced, soundEnabled: sound, textSize: 'normal' })
    onBack()
  }

  return (
    <ScreenContainer>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontFamily: 'var(--font-primary)', fontSize: '24px', color: 'var(--cream)' }}>Settings</h2>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'var(--cream)', fontSize: '14px', cursor: 'pointer', fontWeight: 'bold' }}>Cancel</button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', background: 'var(--card-bg)', border: '2px solid var(--border)', padding: '16px', borderRadius: '8px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 'bold' }}>Reduced Motion</span>
          <input aria-label="Toggle reduced motion" type="checkbox" checked={reduced} onChange={(e) => setReduced(e.target.checked)} style={{ width: '20px', height: '20px' }} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 'bold' }}>Sound Effects (Visual indicators only)</span>
          <input aria-label="Toggle sound effects" type="checkbox" checked={sound} onChange={(e) => setSound(e.target.checked)} style={{ width: '20px', height: '20px' }} />
        </div>
      </div>

      <div style={{ fontSize: '11px', color: 'var(--warm-grey)', fontFamily: 'var(--font-mono)', background: 'var(--surface)', padding: '10px', borderRadius: '6px', marginBottom: '8px', lineHeight: '1.6' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '4px', color: 'var(--charcoal)' }}>Debug Info</div>
        <div>Seed: {store.seed}</div>
        <div>Week: {store.season.week} / 12</div>
        <div>Matches played: {store.season.results.length}</div>
        <div>Career events: {store.careerEvents.length}</div>
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

      <button
        aria-label="Delete all career data and reset game"
        onClick={onDeleteSave}
        style={{ width: '100%', padding: '14px', background: 'var(--danger)', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', marginTop: 'auto' }}
      >
        DELETE ALL CAREER DATA
      </button>
    </ScreenContainer>
  )
}

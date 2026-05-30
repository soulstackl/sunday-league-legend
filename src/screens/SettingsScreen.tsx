import { useRef, useState } from 'react'
import { ScreenContainer } from '../components/shared/ScreenContainer'
import type { SaveState, GameSettings } from '../types/game'
import { exportSave, importSave } from '../store/persistence'

interface SettingsScreenProps {
  store: SaveState
  onSaveSettings: (settings: GameSettings) => void
  onImportSave: (state: SaveState) => void
  onBack: () => void
  onDeleteSave: () => void
}

export function SettingsScreen({ store, onSaveSettings, onImportSave, onBack, onDeleteSave }: SettingsScreenProps) {
  const [reduced, setReduced] = useState(store.settings.reducedMotion)
  const [sound, setSound] = useState(store.settings.soundEnabled)
  const [textSize, setTextSize] = useState<GameSettings['textSize']>(store.settings.textSize)
  const [inputSensitivity, setInputSensitivity] = useState<GameSettings['inputSensitivity']>(store.settings.inputSensitivity)
  const [difficulty, setDifficulty] = useState<GameSettings['difficulty']>(store.settings.difficulty)
  const [inputMode, setInputMode] = useState<GameSettings['inputMode']>(store.settings.inputMode)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [dataMsg, setDataMsg] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSave = () => {
    // Spread existing settings so non-UI fields (e.g. tutorialSeen) are preserved.
    onSaveSettings({ ...store.settings, reducedMotion: reduced, soundEnabled: sound, textSize, inputSensitivity, difficulty, inputMode })
    onBack()
  }

  const flashDataMsg = (msg: string) => {
    setDataMsg(msg)
    window.setTimeout(() => setDataMsg(null), 4000)
  }

  const handleExportDownload = () => {
    try {
      const blob = new Blob([exportSave(store)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      const stamp = new Date().toISOString().slice(0, 10)
      a.href = url
      a.download = `sunday-league-legend-${store.player.name || 'career'}-${stamp}.json`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
      flashDataMsg('Career exported.')
    } catch {
      flashDataMsg('Export failed.')
    }
  }

  const handleExportCopy = () => {
    navigator.clipboard?.writeText(exportSave(store))
      .then(() => flashDataMsg('Career copied to clipboard.'))
      .catch(() => flashDataMsg('Copy failed.'))
  }

  const handleImportFile = (file: File) => {
    const reader = new FileReader()
    reader.onload = () => {
      const imported = importSave(String(reader.result ?? ''))
      if (imported && imported.player && imported.player.name) {
        onImportSave(imported)
      } else {
        flashDataMsg('That file is not a valid Sunday League Legend save.')
      }
    }
    reader.onerror = () => flashDataMsg('Could not read that file.')
    reader.readAsText(file)
  }

  const segmentBtn = <T extends string>(value: T, selected: T, onClick: (v: T) => void, label: string) => {
    const isSel = selected === value
    return (
      <button
        key={value}
        onClick={() => onClick(value)}
        aria-pressed={isSel}
        style={{
          flex: 1,
          padding: '9px 6px',
          background: isSel ? 'var(--btn-bg)' : 'var(--surface)',
          color: isSel ? 'var(--btn-text)' : 'var(--text-muted)',
          border: isSel ? 'none' : '1px solid var(--border)',
          borderRadius: '8px',
          fontWeight: 700,
          fontSize: '12px',
          cursor: 'pointer',
          textTransform: 'capitalize' as const,
          fontFamily: 'var(--font-ui)',
          transition: 'background 0.15s, color 0.15s',
        }}
      >
        {label}
      </button>
    )
  }

  const toggle = (label: string, description: string, checked: boolean, onChange: (v: boolean) => void) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
      <div>
        <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text)' }}>{label}</div>
        <div style={{ fontSize: '11px', color: 'var(--text-faint)', marginTop: '2px', lineHeight: '1.4' }}>{description}</div>
      </div>
      <label style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', cursor: 'pointer', flexShrink: 0 }}>
        <input
          type="checkbox"
          aria-label={`Toggle ${label}`}
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          style={{ opacity: 0, width: 0, height: 0, position: 'absolute' }}
        />
        <div style={{
          width: '44px', height: '24px',
          background: checked ? 'var(--accent)' : 'var(--surface-raised)',
          border: `1px solid ${checked ? 'transparent' : 'var(--border)'}`,
          borderRadius: '12px',
          transition: 'background 0.2s',
          display: 'flex', alignItems: 'center',
          padding: '2px',
        }}>
          <div style={{
            width: '18px', height: '18px',
            background: checked ? '#0C0C10' : 'var(--text-faint)',
            borderRadius: '50%',
            transform: checked ? 'translateX(20px)' : 'translateX(0)',
            transition: 'transform 0.2s, background 0.2s',
          }} />
        </div>
      </label>
    </div>
  )

  return (
    <ScreenContainer style={{ overflowY: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 700, color: 'var(--text)' }}>Settings</h2>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '14px', cursor: 'pointer', fontWeight: 600, padding: '6px', fontFamily: 'var(--font-ui)' }}>Done</button>
      </div>

      {/* Toggles */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', background: 'var(--card-bg)', border: '1px solid var(--border)', padding: '16px', borderRadius: '14px', marginBottom: '14px' }}>
        {toggle('Reduced Motion', 'Disables animations and screen shake.', reduced, setReduced)}
        <div style={{ height: '1px', background: 'var(--border-subtle)' }} />
        {toggle('Sound Effects', 'Procedural kicks, whistles, crowd murmur.', sound, setSound)}
      </div>

      {/* Segment controls */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', background: 'var(--card-bg)', border: '1px solid var(--border)', padding: '16px', borderRadius: '14px', marginBottom: '14px' }}>
        <div>
          <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text)', marginBottom: '8px' }}>Text Size</div>
          <div style={{ display: 'flex', gap: '6px' }}>
            {(['small', 'normal', 'large'] as const).map(v => segmentBtn(v, textSize, setTextSize, v))}
          </div>
        </div>
        <div style={{ height: '1px', background: 'var(--border-subtle)' }} />
        <div>
          <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text)', marginBottom: '4px' }}>Input Sensitivity</div>
          <div style={{ fontSize: '11px', color: 'var(--text-faint)', marginBottom: '8px', lineHeight: '1.4' }}>Adjusts drag-aim accuracy on shots and passes.</div>
          <div style={{ display: 'flex', gap: '6px' }}>
            {(['low', 'normal', 'high'] as const).map(v => segmentBtn(v, inputSensitivity, setInputSensitivity, v))}
          </div>
        </div>
        <div style={{ height: '1px', background: 'var(--border-subtle)' }} />
        <div>
          <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text)', marginBottom: '4px' }}>Aim Control</div>
          <div style={{ fontSize: '11px', color: 'var(--text-faint)', marginBottom: '8px', lineHeight: '1.4' }}>Drag-and-release, or tap where you want the ball to go.</div>
          <div style={{ display: 'flex', gap: '6px' }}>
            {segmentBtn('drag', inputMode, setInputMode, 'Drag')}
            {segmentBtn('tap', inputMode, setInputMode, 'Tap')}
          </div>
        </div>
        <div style={{ height: '1px', background: 'var(--border-subtle)' }} />
        <div>
          <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text)', marginBottom: '4px' }}>Difficulty</div>
          <div style={{ fontSize: '11px', color: 'var(--text-faint)', marginBottom: '8px', lineHeight: '1.4' }}>How hard the opposition and keepers play.</div>
          <div style={{ display: 'flex', gap: '6px' }}>
            {(['easy', 'normal', 'hard'] as const).map(v => segmentBtn(v, difficulty, setDifficulty, v))}
          </div>
        </div>
      </div>

      {/* Backup & data */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', background: 'var(--card-bg)', border: '1px solid var(--border)', padding: '16px', borderRadius: '14px', marginBottom: '14px' }}>
        <div>
          <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text)' }}>Back Up Your Career</div>
          <div style={{ fontSize: '11px', color: 'var(--text-faint)', marginTop: '2px', lineHeight: '1.4' }}>Your career lives only on this device. Export a copy to keep it safe or move it to another device.</div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="sll-btn sll-btn--secondary sll-btn--small" style={{ flex: 1 }} onClick={handleExportDownload} aria-label="Export career to a file">Export</button>
          <button className="sll-btn sll-btn--secondary sll-btn--small" style={{ flex: 1 }} onClick={handleExportCopy} aria-label="Copy career to clipboard">Copy</button>
          <button className="sll-btn sll-btn--secondary sll-btn--small" style={{ flex: 1 }} onClick={() => fileInputRef.current?.click()} aria-label="Import career from a file">Import</button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          style={{ display: 'none' }}
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImportFile(f); e.target.value = '' }}
        />
        {dataMsg && <div role="status" aria-live="polite" style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center' }}>{dataMsg}</div>}
        <div style={{ fontSize: '11px', color: 'var(--text-faint)', lineHeight: '1.5', borderTop: '1px solid var(--border-subtle)', paddingTop: '10px' }}>
          <strong style={{ color: 'var(--text-muted)' }}>Privacy &amp; data:</strong> Sunday League Legend has no accounts and no tracking. Your career is stored only in this browser&rsquo;s local storage on this device. Importing a file replaces your current career. Fonts are loaded from Google Fonts.
        </div>
      </div>

      {/* Debug info */}
      <div style={{ fontSize: '11px', color: 'var(--text-faint)', fontFamily: 'var(--font-mono)', background: 'var(--surface)', padding: '12px', borderRadius: '10px', marginBottom: '16px', lineHeight: '1.7' }}>
        <div style={{ fontWeight: 700, marginBottom: '4px', color: 'var(--text-muted)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Debug</div>
        <div>Seed: {store.seed}</div>
        <div>Season {store.season.number} · Week {store.season.week}/15 · Tier {store.season.tier}</div>
        <div>Matches: {store.season.results.length} · Events: {store.careerEventCount}</div>
        <div>Subplots active: {store.subplots.filter(s => !s.resolved).length} · Save v{store.version}</div>
        <button
          onClick={() => navigator.clipboard?.writeText(String(store.seed)).catch(() => {})}
          style={{ marginTop: '6px', padding: '3px 10px', fontSize: '10px', cursor: 'pointer', border: '1px solid var(--border)', borderRadius: '6px', background: 'var(--surface-raised)', color: 'var(--text-muted)', fontFamily: 'var(--font-ui)' }}
          aria-label="Copy seed to clipboard"
        >
          Copy Seed
        </button>
      </div>

      <button
        aria-label="Save settings"
        onClick={handleSave}
        style={{ width: '100%', padding: '14px', background: 'var(--btn-bg)', color: 'var(--btn-text)', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: 700, cursor: 'pointer', letterSpacing: '0.04em', marginBottom: '12px' }}
      >
        SAVE SETTINGS
      </button>

      {!confirmDelete ? (
        <button
          aria-label="Delete career data"
          onClick={() => setConfirmDelete(true)}
          style={{ width: '100%', padding: '14px', background: 'var(--danger-bg)', color: 'var(--danger)', border: '1px solid rgba(244,63,94,0.2)', borderRadius: '12px', fontSize: '14px', fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-ui)', marginTop: 'auto' }}
        >
          DELETE ALL CAREER DATA
        </button>
      ) : (
        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center', padding: '4px 0' }}>This wipes your current career. Hall of Fame is kept.</div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setConfirmDelete(false)}
              style={{ flex: 1, padding: '12px', background: 'var(--surface)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-ui)' }}
            >
              Cancel
            </button>
            <button
              onClick={onDeleteSave}
              style={{ flex: 1, padding: '12px', background: 'var(--danger)', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-ui)' }}
            >
              Confirm Delete
            </button>
          </div>
        </div>
      )}
    </ScreenContainer>
  )
}

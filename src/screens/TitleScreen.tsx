import { Trophy, Settings, CalendarDays } from 'lucide-react'
import { Badge } from '../components/shared/Badge'

interface TitleScreenProps {
  onNew: () => void
  onContinue: () => void
  onHall: () => void
  onSettings: () => void
  onDaily: () => void
  hasSave: boolean
}

export function TitleScreen({ onNew, onContinue, onHall, onSettings, onDaily, hasSave }: TitleScreenProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, padding: '32px 24px', textAlign: 'center', gap: '0', position: 'relative' }}>
      <div style={{ animation: 'bounce 2.5s infinite', marginBottom: '24px' }}>
        <Badge size={100} />
      </div>

      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '34px', fontWeight: 700, color: 'var(--text)', lineHeight: 1.1, marginBottom: '4px' }}>
          Sunday League
        </h1>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '34px', fontWeight: 700, color: 'var(--accent)', lineHeight: 1.1 }}>
          Legend
        </h2>
      </div>

      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <button
          aria-label="Start a new career"
          onClick={onNew}
          style={{ width: '100%', padding: '16px', background: 'var(--btn-bg)', color: 'var(--btn-text)', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: 700, cursor: 'pointer', letterSpacing: '0.04em' }}
        >
          NEW CAREER
        </button>

        {hasSave && (
          <button
            aria-label="Continue saved career"
            onClick={onContinue}
            style={{ width: '100%', padding: '16px', background: 'var(--surface)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: '12px', fontSize: '16px', fontWeight: 700, cursor: 'pointer', letterSpacing: '0.04em' }}
          >
            CONTINUE
          </button>
        )}

        <button
          aria-label="Play the daily challenge"
          onClick={onDaily}
          style={{ width: '100%', padding: '14px', background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border)', borderRadius: '12px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
        >
          <CalendarDays size={16} />
          Daily Challenge
        </button>

        <button
          aria-label="View Hall of Fame"
          onClick={onHall}
          style={{ width: '100%', padding: '14px', background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border)', borderRadius: '12px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
        >
          <Trophy size={16} />
          Hall of Fame
        </button>

        <button
          aria-label="Open settings"
          onClick={onSettings}
          style={{ background: 'none', border: 'none', color: 'var(--text-faint)', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '8px', margin: '0 auto' }}
        >
          <Settings size={14} />
          Settings
        </button>
      </div>
    </div>
  )
}

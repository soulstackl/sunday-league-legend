import { Badge } from '../components/shared/Badge'

interface TitleScreenProps {
  onNew: () => void
  onContinue: () => void
  onHall: () => void
  onSettings: () => void
  hasSave: boolean
}

export function TitleScreen({ onNew, onContinue, onHall, onSettings, hasSave }: TitleScreenProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, padding: '24px', textAlign: 'center' }}>
      <div style={{ animation: 'bounce 2s infinite', marginBottom: '20px' }}>
        <Badge size={110} />
      </div>
      <h1 style={{ fontFamily: 'var(--font-primary)', fontSize: '32px', marginBottom: '8px', color: 'var(--cream)', textShadow: '2px 2px 0px var(--charcoal)' }}>
        Sunday League
      </h1>
      <h2 style={{ fontFamily: 'var(--font-primary)', fontSize: '28px', color: 'var(--kit-amber)', textShadow: '2px 2px 0px var(--charcoal)', marginBottom: '32px' }}>
        Legend
      </h2>

      <button aria-label="Start a new career" onClick={onNew} style={{ width: '100%', padding: '16px', background: 'var(--kit-amber)', color: 'var(--charcoal)', border: '3px solid var(--charcoal)', borderRadius: '8px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '12px', boxShadow: '0 4px 0px var(--charcoal)' }}>
        NEW CAREER
      </button>

      {hasSave && (
        <button aria-label="Continue saved career" onClick={onContinue} style={{ width: '100%', padding: '16px', background: 'var(--cream)', color: 'var(--charcoal)', border: '3px solid var(--charcoal)', borderRadius: '8px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '12px', boxShadow: '0 4px 0px var(--charcoal)' }}>
          CONTINUE CAREER
        </button>
      )}

      <button aria-label="View Hall of Fame" onClick={onHall} style={{ width: '100%', padding: '14px', background: 'var(--surface)', color: 'var(--charcoal)', border: '3px solid var(--border)', borderRadius: '8px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginBottom: '8px' }}>
        🏆 HALL OF FAME
      </button>

      <button aria-label="Open settings" onClick={onSettings} style={{ width: '100%', padding: '10px', background: 'transparent', color: 'var(--cream)', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' }}>
        ⚙️ Settings
      </button>
    </div>
  )
}

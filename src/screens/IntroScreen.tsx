import { ScreenContainer } from '../components/shared/ScreenContainer'
import { Badge } from '../components/shared/Badge'
import { Card } from '../components/shared/Card'

interface IntroScreenProps {
  onNext: () => void
}

export function IntroScreen({ onNext }: IntroScreenProps) {
  return (
    <ScreenContainer style={{ alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
      <Badge size={100} />
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 700, color: 'var(--text)', margin: '18px 0 6px' }}>Dog &amp; Duck FC</h2>
      <div style={{ color: 'var(--accent)', fontSize: '14px', marginBottom: '24px', fontStyle: 'italic' }}>"Avoid relegation, maybe win the cup."</div>

      <Card style={{ textAlign: 'left' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <div style={{ fontWeight: 700, color: 'var(--accent)', marginBottom: '3px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Objective</div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.5' }}>Navigate muddy fields, late hangovers, and referee Clive. Keep Pete happy, score some goals, and avoid finishing bottom of the table.</p>
          </div>
          <div>
            <div style={{ fontWeight: 700, color: 'var(--success)', marginBottom: '3px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Strengths</div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Vibes ceiling is high. Legendary pub night bonuses.</p>
          </div>
          <div>
            <div style={{ fontWeight: 700, color: 'var(--danger)', marginBottom: '3px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Weaknesses</div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Extreme hangover risks, players vanish randomly for stag weekends.</p>
          </div>
        </div>
      </Card>

      <div style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '24px', fontStyle: 'italic' }}>
        "Get it wide, get it in the mixer." - Pete the Gaffer
      </div>

      <button
        onClick={onNext}
        style={{ width: '100%', padding: '16px', background: 'var(--btn-bg)', color: 'var(--btn-text)', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: 700, cursor: 'pointer', letterSpacing: '0.04em' }}
      >
        ENTER WEEKLY HUB
      </button>
    </ScreenContainer>
  )
}

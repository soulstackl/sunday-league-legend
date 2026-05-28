import React from 'react'
import { ScreenContainer } from '../components/shared/ScreenContainer'
import { Badge } from '../components/shared/Badge'
import { Card } from '../components/shared/Card'

interface IntroScreenProps {
  onNext: () => void
}

export function IntroScreen({ onNext }: IntroScreenProps) {
  return (
    <ScreenContainer style={{ alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
      <Badge size={120} />
      <h2 style={{ fontFamily: 'var(--font-primary)', fontSize: '28px', color: 'var(--cream)', margin: '16px 0 8px' }}>Dog &amp; Duck FC</h2>
      <div style={{ fontStyle: 'italic', color: 'var(--kit-amber)', fontSize: '14px', marginBottom: '20px' }}>"Avoid relegation, maybe win the cup."</div>

      <Card style={{ textAlign: 'left', background: 'var(--charcoal)', color: 'var(--cream)', border: '2px solid var(--border)' }}>
        <div style={{ fontWeight: 'bold', color: 'var(--kit-amber)', marginBottom: '4px' }}>Club Objective:</div>
        <p style={{ fontSize: '13px', marginBottom: '12px' }}>Navigate muddy fields, late hangovers, and referee Clive. Keep Pete happy, score some goals, and avoid finishing bottom of the table.</p>
        <div style={{ fontWeight: 'bold', color: 'var(--success)', marginBottom: '4px' }}>Club Strengths:</div>
        <p style={{ fontSize: '12px', marginBottom: '12px' }}>Vibes ceiling is high. Legendary pub night bonuses.</p>
        <div style={{ fontWeight: 'bold', color: 'var(--danger)', marginBottom: '4px' }}>Club Weaknesses:</div>
        <p style={{ fontSize: '12px' }}>Extreme hangover risks, players vanish randomly for stag weekends.</p>
      </Card>

      <div style={{ color: 'var(--cream)', fontSize: '13px', marginBottom: '24px', fontStyle: 'italic' }}>
        "Get it wide, get it in the mixer." - Pete the Gaffer
      </div>

      <button
        onClick={onNext}
        style={{ width: '100%', padding: '16px', background: 'var(--kit-amber)', color: 'var(--charcoal)', border: '3px solid var(--charcoal)', borderRadius: '8px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 0px var(--charcoal)' }}
      >
        ENTER WEEKLY HUB
      </button>
    </ScreenContainer>
  )
}

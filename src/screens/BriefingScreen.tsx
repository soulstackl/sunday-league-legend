import React from 'react'
import { Card } from '../components/shared/Card'
import { NpcAvatar } from '../components/shared/NpcAvatar'
import { OPPONENTS } from '../data/opponents'
import { mulberry32 } from '../engine/rng'
import type { SaveState, ChaosCard } from '../types/game'

interface BriefingScreenProps {
  store: SaveState
  activeCards: ChaosCard[]
  onStartMatch: () => void
}

export function BriefingScreen({ store, activeCards, onStartMatch }: BriefingScreenProps) {
  const week = store.season.week
  const opponent = OPPONENTS[week - 1]

  const teamTalks = [
    'Right lads. Standard 4-4-2. Pass it simple, and hit it long if in doubt.',
    'They have got a weak defensive line. Get it wide, get it in the mixer.',
    'We are down to the bare bones today. Work hard, cover each other, and drink water.',
    'Focus on the first touches. Do not give them a second to settle in our half.'
  ]

  const rng = mulberry32(store.seed + week)
  const teamTalk = teamTalks[Math.floor(rng() * teamTalks.length)]

  return (
    <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
      <h2 style={{ fontFamily: 'var(--font-primary)', fontSize: '24px', color: 'var(--cream)', marginBottom: '12px' }}>Pre-Match Briefing</h2>

      <Card style={{ background: 'var(--charcoal)', color: 'var(--cream)', border: '2px solid var(--border)', marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '12px', color: 'var(--kit-amber)', fontWeight: 'bold' }}>Week {week} Fixture</span>
          <span style={{ fontSize: '12px', background: 'var(--danger)', padding: '2px 8px', borderRadius: '10px', fontWeight: 'bold' }}>MATCHDAY</span>
        </div>
        <h3 style={{ fontFamily: 'var(--font-primary)', fontSize: '22px', marginBottom: '4px' }}>Dog &amp; Duck vs {opponent.name}</h3>
        <p style={{ fontSize: '12px', opacity: 0.8 }}>Opponent Style: {opponent.style}</p>
      </Card>

      <div style={{ display: 'flex', gap: '12px', background: 'var(--card-bg)', border: '2px solid var(--border)', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>
        <NpcAvatar npcId="pete" size={50} />
        <div>
          <div style={{ fontWeight: 'bold', fontSize: '14px', color: 'var(--kit-amber-dark)' }}>Pete the Gaffer</div>
          <p style={{ fontSize: '13px', fontStyle: 'italic', marginTop: '4px' }}>"{teamTalk}"</p>
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--cream)', marginBottom: '8px', textTransform: 'uppercase' }}>Active Match Modifiers:</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {activeCards.map(c => (
            <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--cream)', border: '2px solid var(--border)', borderRadius: '6px', fontSize: '12px' }}>
              <span style={{ fontWeight: 'bold' }}>🃏 {c.title}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--danger)' }}>{c.effects.split(',')[0]}</span>
            </div>
          ))}
          {activeCards.length === 0 && (
            <div style={{ fontSize: '13px', color: 'var(--warm-grey)' }}>No active chaos card modifiers. Standard conditions.</div>
          )}
        </div>
      </div>

      <button
        onClick={onStartMatch}
        style={{ width: '100%', padding: '16px', background: 'var(--kit-amber)', color: 'var(--charcoal)', border: '3px solid var(--charcoal)', borderRadius: '8px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 0px var(--charcoal)', marginTop: 'auto' }}
      >
        PLAY MATCH MOMENTS
      </button>
    </div>
  )
}

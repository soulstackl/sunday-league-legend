import { Layers2, CheckCircle2 } from 'lucide-react'
import { Card } from '../components/shared/Card'
import { NpcAvatar } from '../components/shared/NpcAvatar'
import { mulberry32 } from '../engine/rng'
import { cupRoundLabel } from '../data/cup'
import type { SaveState, ChaosCard } from '../types/game'
import type { Fixture } from '../engine/schedule'

interface BriefingScreenProps {
  store: SaveState
  fixture: Fixture
  activeCards: ChaosCard[]
  onStartMatch: () => void
}

export function BriefingScreen({ store, fixture, activeCards, onStartMatch }: BriefingScreenProps) {
  const week = store.season.week

  const cupTalk = [
    'Right lads. Tankard tie. None of this is friendly. Get tight, win the second balls.',
    'Cup football is different. One mistake and we are out. Concentrate for ninety minutes.',
    'I have waited fifteen years to win this Tankard. Do me proud.',
  ]
  const leagueTalk = [
    'Right lads. Standard 4-4-2. Pass it simple, and hit it long if in doubt.',
    'They have got a weak defensive line. Get it wide, get it in the mixer.',
    'We are down to the bare bones today. Work hard, cover each other, and drink water.',
    'Focus on the first touches. Do not give them a second to settle in our half.',
  ]
  const pool = fixture.kind === 'cup' ? cupTalk : leagueTalk
  const rng = mulberry32(store.seed + week * 11)
  const teamTalk = pool[Math.floor(rng() * pool.length)]

  const fixtureLabel = fixture.kind === 'cup'
    ? cupRoundLabel(fixture.cupRound as 'quarter-final' | 'semi-final' | 'final')
    : `Week ${week} Fixture`

  const isCup = fixture.kind === 'cup'

  return (
    <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', background: 'var(--bg)' }}>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 700, color: 'var(--text)', marginBottom: '16px' }}>Pre-Match</h2>

      {/* Fixture card */}
      <Card style={{ marginBottom: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <span style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: 700, fontFamily: 'var(--font-mono)', letterSpacing: '0.04em' }}>{fixtureLabel}</span>
          <span style={{ fontSize: '10px', background: isCup ? 'var(--success-bg)' : 'var(--accent-bg)', color: isCup ? 'var(--success)' : 'var(--accent)', padding: '3px 8px', borderRadius: '20px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {isCup ? 'Cup Tie' : 'Matchday'}
          </span>
        </div>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700, marginBottom: '5px', color: 'var(--text)' }}>Dog &amp; Duck vs {fixture.opponent.name}</h3>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{fixture.opponent.style}</p>
        {fixture.opponent.notes && (
          <p style={{ fontSize: '11px', color: 'var(--text-faint)', marginTop: '4px', fontStyle: 'italic' }}>{fixture.opponent.notes}</p>
        )}
      </Card>

      {/* Pete's team talk */}
      <div style={{ display: 'flex', gap: '12px', background: 'var(--card-bg)', border: '1px solid var(--border)', padding: '14px', borderRadius: '14px', marginBottom: '14px' }}>
        <NpcAvatar npcId="pete" size={46} />
        <div>
          <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--accent)', marginBottom: '5px' }}>Pete the Gaffer</div>
          <p style={{ fontSize: '13px', fontStyle: 'italic', color: 'var(--text-muted)', lineHeight: '1.5' }}>"{teamTalk}"</p>
        </div>
      </div>

      {/* Active modifiers */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-faint)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Active Modifiers</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {activeCards.map(c => (
            <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: 'var(--surface)', border: '1px solid var(--border)', borderLeft: '3px solid var(--danger)', borderRadius: '10px', fontSize: '12px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: 'var(--text)' }}>
                <Layers2 size={12} style={{ color: 'var(--text-muted)' }} />
                {c.title}
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--danger)' }}>{c.effects.split(',')[0]}</span>
            </div>
          ))}
          {store.contextModifiers.oppositionScouted && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: 'var(--success-bg)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '10px', fontSize: '12px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: 'var(--success)' }}>
                <CheckCircle2 size={13} />
                Opposition Scouted
              </span>
              <span style={{ fontSize: '11px', color: 'var(--success)', fontFamily: 'var(--font-mono)' }}>+5% accuracy</span>
            </div>
          )}
          {store.contextModifiers.setPieceReady && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: 'var(--success-bg)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '10px', fontSize: '12px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: 'var(--success)' }}>
                <CheckCircle2 size={13} />
                Set Pieces Sharp
              </span>
              <span style={{ fontSize: '11px', color: 'var(--success)', fontFamily: 'var(--font-mono)' }}>Boost on dead balls</span>
            </div>
          )}
          {activeCards.length === 0 && !store.contextModifiers.oppositionScouted && !store.contextModifiers.setPieceReady && (
            <div style={{ fontSize: '13px', color: 'var(--text-faint)', padding: '8px 0' }}>Standard conditions. No active modifiers.</div>
          )}
        </div>
      </div>

      <button
        onClick={onStartMatch}
        style={{ width: '100%', padding: '16px', background: 'var(--btn-bg)', color: 'var(--btn-text)', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: 700, cursor: 'pointer', letterSpacing: '0.04em', marginTop: 'auto' }}
      >
        PLAY MATCH MOMENTS
      </button>
    </div>
  )
}

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

  return (
    <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
      <h2 style={{ fontFamily: 'var(--font-primary)', fontSize: '24px', color: 'var(--cream)', marginBottom: '12px' }}>Pre-Match Briefing</h2>

      <Card style={{ background: 'var(--charcoal)', color: 'var(--cream)', border: '2px solid var(--border)', marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '12px', color: 'var(--kit-amber)', fontWeight: 'bold' }}>{fixtureLabel}</span>
          <span style={{ fontSize: '12px', background: fixture.kind === 'cup' ? 'var(--success)' : 'var(--danger)', padding: '2px 8px', borderRadius: '10px', fontWeight: 'bold' }}>
            {fixture.kind === 'cup' ? 'CUP TIE' : 'MATCHDAY'}
          </span>
        </div>
        <h3 style={{ fontFamily: 'var(--font-primary)', fontSize: '22px', marginBottom: '4px' }}>Dog &amp; Duck vs {fixture.opponent.name}</h3>
        <p style={{ fontSize: '12px', opacity: 0.85 }}>Opponent Style: {fixture.opponent.style}</p>
        <p style={{ fontSize: '11px', opacity: 0.7, marginTop: '4px', fontStyle: 'italic' }}>{fixture.opponent.notes}</p>
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
          {store.contextModifiers.oppositionScouted && (
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--success)', color: '#fff', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold' }}>
              <span>✓ Opposition Scouted</span>
              <span style={{ fontSize: '11px' }}>+5% accuracy</span>
            </div>
          )}
          {store.contextModifiers.setPieceReady && (
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--success)', color: '#fff', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold' }}>
              <span>✓ Set Pieces Sharp</span>
              <span style={{ fontSize: '11px' }}>Boost on penalties/freekicks</span>
            </div>
          )}
          {activeCards.length === 0 && !store.contextModifiers.oppositionScouted && !store.contextModifiers.setPieceReady && (
            <div style={{ fontSize: '13px', color: 'var(--warm-grey)' }}>Standard conditions. No active modifiers.</div>
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

import { Trophy } from 'lucide-react'
import { ScreenContainer } from '../components/shared/ScreenContainer'
import { Badge } from '../components/shared/Badge'
import { Card } from '../components/shared/Card'
import { buildStandings, ourLeaguePosition, resolvePromotionRelegation } from '../engine/league'
import { TIER_NAMES } from '../data/opponents'
import type { SaveState, Ending } from '../types/game'

interface CompleteScreenProps {
  store: SaveState
  resolveEnding: () => Ending
  onHallOfFame: (title: string) => void
  onNextSeason: () => void
}

export function CompleteScreen({ store, resolveEnding, onHallOfFame, onNextSeason }: CompleteScreenProps) {
  const standings = buildStandings(store.season.aiTable, store.season.tier, store.season.results)
  const position = ourLeaguePosition(standings)
  const promo = resolvePromotionRelegation(position, standings.length, store.season.tier)
  const points = standings.find(r => r.isUs)?.points ?? 0
  const goals = store.season.results.reduce((acc, r) => acc + (r.stats?.goals ?? 0), 0)

  const ending = resolveEnding()
  const tierName = TIER_NAMES[store.season.tier]
  const nextTierName = TIER_NAMES[promo.newTier]

  const movementColour = promo.movement === 'promoted' ? 'var(--success)' : promo.movement === 'relegated' ? 'var(--danger)' : 'var(--accent)'
  const movementBg = promo.movement === 'promoted' ? 'var(--success-bg)' : promo.movement === 'relegated' ? 'var(--danger-bg)' : 'var(--accent-bg)'
  const movementBorder = promo.movement === 'promoted' ? 'rgba(34,197,94,0.25)' : promo.movement === 'relegated' ? 'rgba(244,63,94,0.25)' : 'rgba(240,168,48,0.25)'
  const movementLabel = promo.movement === 'promoted' ? `Promoted to ${nextTierName}` : promo.movement === 'relegated' ? `Relegated to ${nextTierName}` : `Holding in ${tierName}`

  return (
    <ScreenContainer style={{ textAlign: 'center' }}>
      <Badge size={88} />
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '26px', fontWeight: 700, color: 'var(--text)', margin: '14px 0 3px' }}>Season {store.season.number} Complete</h2>
      <div style={{ fontSize: '12px', color: 'var(--accent)', marginBottom: '16px', fontFamily: 'var(--font-mono)' }}>{tierName} · {position}{['st','nd','rd'][position-1] ?? 'th'} of {standings.length}</div>

      {/* Career title card */}
      <Card style={{ marginBottom: '12px', textAlign: 'left' }}>
        <div style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-faint)', fontWeight: 700, letterSpacing: '0.06em', marginBottom: '6px' }}>Career Title</div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700, color: 'var(--accent)', marginBottom: '6px' }}>{ending.title}</h1>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.5', fontStyle: 'italic' }}>"{ending.text}"</p>
      </Card>

      {/* Movement banner */}
      <div style={{ background: movementBg, border: `1px solid ${movementBorder}`, borderRadius: '12px', padding: '12px 16px', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
        <div style={{ fontWeight: 700, fontSize: '15px', color: movementColour, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{movementLabel}</div>
      </div>

      {/* Season summary */}
      <Card style={{ marginBottom: '20px', textAlign: 'left' }}>
        <div style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--accent)', fontWeight: 700, letterSpacing: '0.06em', fontFamily: 'var(--font-mono)', marginBottom: '10px' }}>Season Summary</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-muted)' }}>
          <div><span style={{ color: 'var(--text)', fontWeight: 700 }}>{points}</span> pts</div>
          <div><span style={{ color: 'var(--text)', fontWeight: 700 }}>{goals}</span> goals</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {store.season.cupWon ? (
              <><Trophy size={12} style={{ color: 'var(--kit-amber)' }} /><span style={{ color: 'var(--accent)', fontWeight: 700 }}>Tankard won</span></>
            ) : store.season.cupExited ? (
              <span>Cup: eliminated</span>
            ) : (
              <span>No cup run</span>
            )}
          </div>
          <div>Trust: <span style={{ color: 'var(--text)', fontWeight: 700 }}>{store.player.states.managerTrust}</span>/100</div>
        </div>
      </Card>

      <button
        className="sll-btn"
        onClick={() => onHallOfFame(ending.title)}
        style={{ marginBottom: '10px' }}
      >
        RETIRE TO HALL OF FAME
      </button>

      <button
        className="sll-btn sll-btn--secondary"
        onClick={onNextSeason}
      >
        PLAY SEASON {store.season.number + 1}
      </button>
    </ScreenContainer>
  )
}

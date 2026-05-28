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

  const movementColour = promo.movement === 'promoted' ? 'var(--success)' : promo.movement === 'relegated' ? 'var(--danger)' : 'var(--kit-amber)'
  const movementLabel = promo.movement === 'promoted' ? `PROMOTED to ${nextTierName}` : promo.movement === 'relegated' ? `RELEGATED to ${nextTierName}` : `Holding in ${tierName}`

  return (
    <ScreenContainer style={{ background: 'var(--charcoal)', textAlign: 'center' }}>
      <Badge size={100} />
      <h2 style={{ fontFamily: 'var(--font-primary)', fontSize: '28px', color: 'var(--cream)', margin: '16px 0 4px' }}>Season {store.season.number} Complete</h2>
      <div style={{ fontSize: '12px', color: 'var(--kit-amber)', marginBottom: '12px' }}>{tierName} · Finished {position} of {standings.length}</div>

      <Card style={{ margin: '20px 0', border: '3px solid var(--charcoal)', background: '#fff' }}>
        <div style={{ textTransform: 'uppercase', color: 'var(--kit-amber-dark)', fontWeight: 'bold', fontSize: '12px' }}>Your Career Title:</div>
        <h1 style={{ fontFamily: 'var(--font-primary)', fontSize: '24px', margin: '8px 0' }}>{ending.title}</h1>
        <p style={{ fontSize: '14px', color: 'var(--warm-grey)' }}>"{ending.text}"</p>
      </Card>

      <Card style={{ background: movementColour, color: '#fff', marginBottom: '16px' }}>
        <div style={{ fontWeight: 'bold', fontSize: '14px', textTransform: 'uppercase' }}>{movementLabel}</div>
      </Card>

      <div style={{ background: 'var(--charcoal)', color: 'var(--cream)', width: '100%', padding: '16px', borderRadius: '8px', marginBottom: '20px', fontFamily: 'var(--font-mono)', border: '1px solid var(--border)' }}>
        <h4 style={{ color: 'var(--kit-amber)' }}>SEASON SUMMARY</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '8px', textAlign: 'left' }}>
          <div>League Points: {points}</div>
          <div>League Goals: {goals}</div>
          <div>Cup: {store.season.cupWon ? 'WON 🏆' : store.season.cupExited ? 'Eliminated' : 'No run'}</div>
          <div>Manager Trust: {store.player.states.managerTrust}/100</div>
        </div>
      </div>

      <button className="sll-btn" onClick={() => onHallOfFame(ending.title)} style={{ marginBottom: '12px' }}>
        RETIRE TO HALL OF FAME
      </button>

      <button className="sll-btn" onClick={onNextSeason} style={{ background: 'var(--cream)', color: 'var(--charcoal)' }}>
        PLAY SEASON {store.season.number + 1}
      </button>
    </ScreenContainer>
  )
}

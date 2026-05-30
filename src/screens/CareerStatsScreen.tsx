import type { ReactNode } from 'react'
import { Trophy, Target, CalendarDays, Flame } from 'lucide-react'
import { ScreenContainer } from '../components/shared/ScreenContainer'
import { Card } from '../components/shared/Card'
import { ARCHETYPES } from '../data/archetypes'
import { TIER_NAMES } from '../data/opponents'
import type { SaveState } from '../types/game'

interface CareerStatsScreenProps {
  store: SaveState
  onBack: () => void
}

// Count consecutive most-recent calendar days present in the daily-challenge history.
function dailyStreak(dates: string[]): number {
  if (dates.length === 0) return 0
  const set = new Set(dates)
  // Walk back from the most recent recorded day.
  const sorted = [...set].sort()
  let cursor = sorted[sorted.length - 1]
  let streak = 0
  while (set.has(cursor)) {
    streak += 1
    const d = new Date(cursor + 'T00:00:00Z')
    d.setUTCDate(d.getUTCDate() - 1)
    cursor = d.toISOString().slice(0, 10)
  }
  return streak
}

export function CareerStatsScreen({ store, onBack }: CareerStatsScreenProps) {
  const matches = store.careerEvents.filter(e => e.type === 'match_complete')
  const wins = matches.filter(e => e.result === 'win').length
  const draws = matches.filter(e => e.result === 'draw').length
  const losses = matches.filter(e => e.result === 'loss').length
  const played = matches.length
  const winRate = played > 0 ? Math.round((wins / played) * 100) : 0
  const seasonsPlayed = store.season.number

  const archetypeName = ARCHETYPES.find(a => a.id === store.player.archetype)?.name ?? 'The Unit'

  // Hall of Fame (retired careers) aggregates.
  const hof = store.hallOfFame
  const hofGoals = hof.reduce((acc, h) => acc + (h.goals ?? 0), 0)
  const hofTrophies = hof.filter(h => h.cupWon).length
  const bestTier = hof.length > 0 ? Math.min(...hof.map(h => h.finalTier)) as 1 | 2 | 3 : store.season.tier

  // Daily challenge aggregates.
  const daily = store.dailyChallenge?.history ?? []
  const dailyBest = daily.reduce((acc, d) => Math.max(acc, d.score), 0)
  const dailyDays = new Set(daily.map(d => d.date)).size
  const streak = dailyStreak(daily.map(d => d.date))

  const statTile = (value: ReactNode, label: string, colour = 'var(--text)') => (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '26px', fontWeight: 700, fontFamily: 'var(--font-display)', color: colour, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: '10px', color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: '4px' }}>{label}</div>
    </div>
  )

  const sectionLabel = (text: string) => (
    <div style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--accent)', fontWeight: 700, fontFamily: 'var(--font-mono)', letterSpacing: '0.06em', marginBottom: '12px' }}>{text}</div>
  )

  return (
    <ScreenContainer style={{ background: 'var(--bg)', overflowY: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 700, color: 'var(--text)' }}>Career</h2>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '14px', cursor: 'pointer', fontWeight: 600, padding: '6px', fontFamily: 'var(--font-ui)' }}>Done</button>
      </div>

      <Card style={{ marginBottom: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, color: 'var(--text)' }}>{store.player.name || 'Unnamed Legend'}</div>
          <div style={{ fontSize: '11px', color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>{archetypeName}</div>
        </div>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Season {seasonsPlayed} · {TIER_NAMES[store.season.tier]}</div>
      </Card>

      {/* This career record */}
      <Card style={{ marginBottom: '12px' }}>
        {sectionLabel('Career Record')}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '14px' }}>
          {statTile(played, 'Played')}
          {statTile(wins, 'Won', 'var(--success)')}
          {statTile(draws, 'Drawn', 'var(--accent)')}
          {statTile(losses, 'Lost', 'var(--danger)')}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ flex: 1, height: '8px', borderRadius: '4px', overflow: 'hidden', display: 'flex', background: 'var(--surface)' }}>
            <div style={{ width: `${played ? (wins / played) * 100 : 0}%`, background: 'var(--success)' }} />
            <div style={{ width: `${played ? (draws / played) * 100 : 0}%`, background: 'var(--accent)' }} />
            <div style={{ width: `${played ? (losses / played) * 100 : 0}%`, background: 'var(--danger)' }} />
          </div>
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text)', fontFamily: 'var(--font-mono)', minWidth: '54px', textAlign: 'right' }}>{winRate}% win</div>
        </div>
      </Card>

      {/* Honours */}
      <Card style={{ marginBottom: '12px' }}>
        {sectionLabel('Honours')}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
          {statTile(<span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Trophy size={18} style={{ color: 'var(--kit-amber)' }} />{hofTrophies}</span>, 'Tankards')}
          {statTile(hof.length, 'Legends Retired')}
          {statTile(TIER_NAMES[bestTier].replace('Sunday League ', ''), 'Best Division', 'var(--accent)')}
        </div>
        {hofGoals > 0 && (
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', marginTop: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            <Target size={13} style={{ color: 'var(--accent)' }} />
            {hofGoals} career goals across retired legends
          </div>
        )}
      </Card>

      {/* Daily challenge */}
      <Card>
        {sectionLabel('Daily Challenge')}
        {dailyDays > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
            {statTile(dailyBest, 'Best Score', 'var(--accent)')}
            {statTile(<span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><CalendarDays size={16} />{dailyDays}</span>, 'Days Played')}
            {statTile(<span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Flame size={16} style={{ color: streak > 0 ? 'var(--danger)' : 'var(--text-faint)' }} />{streak}</span>, 'Day Streak')}
          </div>
        ) : (
          <div style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center', padding: '4px 0' }}>No daily challenges played yet. Find it on the title screen.</div>
        )}
      </Card>
    </ScreenContainer>
  )
}

import { CalendarDays, MessageCircle, Users, BarChart3, CircleDot, Trophy, Settings, CheckCircle2, UserCircle2, LineChart } from 'lucide-react'
import { ScreenContainer } from '../components/shared/ScreenContainer'
import { Badge } from '../components/shared/Badge'
import { StatusBar } from '../components/shared/StatusBar'
import { ObjectivesWidget } from '../components/shared/ObjectivesWidget'
import { ARCHETYPES } from '../data/archetypes'
import { JOBS } from '../data/jobs'
import { TIER_NAMES } from '../data/opponents'
import { cupRoundLabel } from '../data/cup'
import { TOTAL_WEEKS } from '../engine/schedule'
import type { SaveState } from '../types/game'
import type { Fixture } from '../engine/schedule'

interface HubScreenProps {
  store: SaveState
  fixture: Fixture | null
  onMidweek: () => void
  onGroupChat: () => void
  onSettings: () => void
  onNextMatch: () => void
  onHall: () => void
  onSquad: () => void
  onTable: () => void
  onPlayer: () => void
  onCareer: () => void
  isDiscord: boolean
}

export function HubScreen({ store, fixture, onMidweek, onGroupChat, onSettings, onNextMatch, onHall, onSquad, onTable, onPlayer, onCareer, isDiscord }: HubScreenProps) {
  const p = store.player
  const week = store.season.week
  const tierName = TIER_NAMES[store.season.tier]

  const unreadCount = store.groupChatLog.filter(m => m.choices && m.sender !== 'system').length
  const totalGoals = store.season.results.reduce((acc, r) => acc + (r.stats?.goals ?? 0), 0)
  const totalPasses = store.season.results.reduce((acc, r) => acc + (r.stats?.passes ?? 0), 0)
  const totalPassSuccess = store.season.results.reduce((acc, r) => acc + (r.stats?.passSuccess ?? 0), 0)
  const totalTackles = store.season.results.reduce((acc, r) => acc + (r.stats?.tackleSuccess ?? 0), 0)

  const fixtureTitle = fixture
    ? fixture.kind === 'cup'
      ? cupRoundLabel(fixture.cupRound as 'quarter-final' | 'semi-final' | 'final')
      : 'League Fixture'
    : 'Season Complete'

  const ctxBadges = [
    store.contextModifiers.oppositionScouted ? 'Opposition Scouted' : null,
    store.contextModifiers.setPieceReady ? 'Set Pieces Sharp' : null,
  ].filter(Boolean) as string[]

  const recentLeague = store.season.results.filter(r => r.competition === 'league').slice(-3)
  const recentWins = recentLeague.filter(r => r.ourGoals > r.theirGoals).length
  const recentLosses = recentLeague.filter(r => r.ourGoals < r.theirGoals).length
  const peteDisposition = recentWins >= 2 ? 'confident' : recentLosses >= 2 ? 'frustrated' : 'neutral'
  const peteMoodLine = peteDisposition === 'confident' ? 'Pete looks fired up.'
    : peteDisposition === 'frustrated' ? 'Pete seems under pressure.' : null

  const isInjured = p.states.injuryWeeksRemaining > 0

  const navBtn = (label: string, icon: React.ReactNode, onClick: () => void, badge?: number) => (
    <button
      aria-label={label}
      onClick={onClick}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
        padding: '14px 8px',
        background: 'var(--surface)',
        color: 'var(--text)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        fontWeight: 700,
        fontSize: '10px',
        letterSpacing: '0.06em',
        cursor: 'pointer',
        position: 'relative',
        fontFamily: 'var(--font-ui)',
      }}
    >
      {icon}
      <span>{label.toUpperCase()}</span>
      {badge != null && badge > 0 && (
        <span style={{ position: 'absolute', top: '-5px', right: '-5px', width: '18px', height: '18px', background: 'var(--danger)', color: '#fff', borderRadius: '50%', fontSize: '10px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
          {badge}
        </span>
      )}
    </button>
  )

  return (
    <ScreenContainer style={{ background: 'var(--bg)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
            <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--accent)', fontWeight: 700, fontFamily: 'var(--font-mono)', letterSpacing: '0.06em' }}>
              S{store.season.number} · {tierName} · Wk {week}/{TOTAL_WEEKS}
            </span>
            {isDiscord && (
              <div style={{ background: 'var(--danger)', color: '#fff', padding: '2px 7px', borderRadius: '4px', fontSize: '9px', fontWeight: 700, letterSpacing: '0.06em' }}>LIVE</div>
            )}
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 700, color: 'var(--text)' }}>{p.name}</h2>
        </div>
        <Badge size={42} />
      </div>

      {/* Identity row: tap to open player profile */}
      <button
        type="button"
        onClick={onPlayer}
        aria-label="Open player profile"
        style={{ all: 'unset', cursor: 'pointer', display: 'block', width: '100%', marginBottom: '14px' }}
      >
        <div style={{ display: 'flex', alignItems: 'stretch', gap: '8px' }}>
          <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
            {[
              { label: 'Archetype', value: ARCHETYPES.find(a => a.id === p.archetype)?.name ?? 'The Unit' },
              { label: 'Position', value: p.position },
              { label: 'Job', value: JOBS.find(j => j.id === p.job)?.name ?? 'Jobless' },
            ].map(({ label, value }) => (
              <div key={label} style={{ background: 'var(--surface)', padding: '10px 10px', borderRadius: '10px', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '9px', textTransform: 'uppercase', color: 'var(--text-faint)', fontWeight: 700, letterSpacing: '0.06em', marginBottom: '3px' }}>{label}</div>
                <div style={{ fontWeight: 700, fontSize: '12px', color: 'var(--text)', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '38px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--accent)' }} aria-hidden="true">
            <UserCircle2 size={18} />
          </div>
        </div>
      </button>

      {/* Status bars */}
      <div style={{ background: 'var(--card-bg)', padding: '14px', borderRadius: '12px', border: '1px solid var(--border)', marginBottom: '14px' }}>
        <StatusBar label="Fitness" value={p.states.fitness} colour="var(--success)" />
        <StatusBar label="Fatigue" value={p.states.fatigue} colour="var(--danger)" />
        <StatusBar label="Confidence" value={p.states.confidence} colour="var(--accent)" />
        <StatusBar label="Manager Trust" value={p.states.managerTrust} colour="var(--purple)" />
        {isInjured && (
          <div style={{ marginTop: '10px', padding: '8px 10px', background: 'var(--danger-bg)', border: '1px solid rgba(244,63,94,0.3)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--danger)' }}>Injured</span>
            <span style={{ fontSize: '11px', color: 'var(--danger)', fontFamily: 'var(--font-mono)' }}>{p.states.injuryWeeksRemaining} week{p.states.injuryWeeksRemaining !== 1 ? 's' : ''} remaining</span>
          </div>
        )}
      </div>

      <ObjectivesWidget objectives={store.objectives} />

      {/* Season totals */}
      <div style={{ background: 'var(--card-bg)', padding: '14px', borderRadius: '12px', border: '1px solid var(--border)', marginBottom: '14px' }}>
        <div style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--accent)', fontWeight: 700, fontFamily: 'var(--font-mono)', letterSpacing: '0.06em', marginBottom: '12px' }}>Season Totals</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', textAlign: 'center' }}>
          {[
            { value: totalGoals, label: 'Goals' },
            { value: `${totalPasses ? Math.round((totalPassSuccess / totalPasses) * 100) : 0}%`, label: 'Pass %' },
            { value: totalTackles, label: 'Tackles' },
          ].map(({ value, label }) => (
            <div key={label}>
              <div style={{ fontSize: '22px', fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--text)' }}>{value}</div>
              <div style={{ fontSize: '10px', color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Next up */}
      {fixture ? (
        <div style={{ background: 'var(--card-bg)', padding: '14px', borderRadius: '12px', border: '1px solid var(--border)', marginBottom: '20px' }}>
          <div style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--accent)', fontWeight: 700, fontFamily: 'var(--font-mono)', letterSpacing: '0.06em', marginBottom: '6px' }}>
            Next Up · {fixtureTitle}
          </div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '17px', fontWeight: 700, color: 'var(--text)', marginBottom: '3px' }}>vs {fixture.opponent.name}</h3>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Style: {fixture.opponent.style}</div>
          <div style={{ fontSize: '11px', color: 'var(--accent)', marginTop: '3px' }}>Difficulty: {fixture.opponent.difficulty}/10</div>
          {peteMoodLine && (
            <div style={{ fontSize: '11px', color: peteDisposition === 'confident' ? 'var(--success)' : 'var(--danger)', marginTop: '4px', fontStyle: 'italic' }}>{peteMoodLine}</div>
          )}
          {ctxBadges.length > 0 && (
            <div style={{ display: 'flex', gap: '6px', marginTop: '10px', flexWrap: 'wrap' }}>
              {ctxBadges.map(b => (
                <span key={b} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'var(--success-bg)', color: 'var(--success)', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700 }}>
                  <CheckCircle2 size={11} />
                  {b}
                </span>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div style={{ background: 'var(--card-bg)', padding: '14px', borderRadius: '12px', border: '1px solid var(--border)', marginBottom: '20px' }}>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-muted)' }}>Season over. Head to summary.</div>
        </div>
      )}

      {/* Primary nav grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '12px' }}>
        {navBtn('Midweek', <CalendarDays size={20} />, onMidweek)}
        {navBtn('Chat', <MessageCircle size={20} />, onGroupChat, unreadCount)}
        {navBtn('Squad', <Users size={20} />, onSquad)}
        {navBtn('Table', <BarChart3 size={20} />, onTable)}
      </div>

      {/* Kick off */}
      <button
        aria-label="Kick off this week's match"
        disabled={!fixture}
        onClick={onNextMatch}
        style={{
          width: '100%', padding: '18px',
          background: fixture ? 'var(--btn-bg)' : 'var(--surface-raised)',
          color: fixture ? 'var(--btn-text)' : 'var(--text-faint)',
          border: 'none',
          borderRadius: '14px',
          fontSize: '16px',
          fontWeight: 700,
          cursor: fixture ? 'pointer' : 'not-allowed',
          marginBottom: '10px',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
          letterSpacing: '0.04em',
        }}
      >
        <CircleDot size={20} />
        {fixture?.kind === 'cup' ? cupRoundLabel(fixture.cupRound as 'quarter-final' | 'semi-final' | 'final').toUpperCase() : 'KICK OFF MATCH'}
      </button>

      {/* Utility row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', alignItems: 'center' }}>
        <button
          aria-label="Open settings"
          onClick={onSettings}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '10px', background: 'none', border: '1px solid var(--border)', color: 'var(--text-faint)', borderRadius: '8px', fontSize: '12px', cursor: 'pointer', fontFamily: 'var(--font-ui)' }}
        >
          <Settings size={13} />
          Settings
        </button>
        <button
          aria-label="View career stats"
          onClick={onCareer}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '10px', background: 'none', border: '1px solid var(--border)', color: 'var(--text-faint)', borderRadius: '8px', fontSize: '12px', cursor: 'pointer', fontFamily: 'var(--font-ui)' }}
        >
          <LineChart size={13} />
          Career
        </button>
        <button
          aria-label="View Hall of Fame"
          onClick={onHall}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '10px', background: 'none', border: '1px solid var(--border)', color: 'var(--text-faint)', borderRadius: '8px', fontSize: '12px', cursor: 'pointer', fontFamily: 'var(--font-ui)' }}
        >
          <Trophy size={13} />
          Hall of Fame
        </button>
      </div>
    </ScreenContainer>
  )
}

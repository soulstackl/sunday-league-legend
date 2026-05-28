import React from 'react'
import { ScreenContainer } from '../components/shared/ScreenContainer'
import { Badge } from '../components/shared/Badge'
import { Card } from '../components/shared/Card'
import { StatusBar } from '../components/shared/StatusBar'
import { ARCHETYPES } from '../data/archetypes'
import { JOBS } from '../data/jobs'
import { OPPONENTS } from '../data/opponents'
import type { SaveState } from '../types/game'

interface HubScreenProps {
  store: SaveState
  onMidweek: () => void
  onGroupChat: () => void
  onSettings: () => void
  onNextMatch: () => void
  onHall: () => void
  isDiscord: boolean
}

export function HubScreen({ store, onMidweek, onGroupChat, onSettings, onNextMatch, onHall, isDiscord }: HubScreenProps) {
  const p = store.player
  const week = store.season.week
  const nextOpponent = OPPONENTS[week - 1] || { name: 'Season Complete', style: '', difficulty: 0, id: '', notes: '' }

  const unreadCount = store.groupChatLog.length > 0 ? 1 : 0

  return (
    <ScreenContainer style={{ background: 'var(--charcoal)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--kit-amber)', fontWeight: 'bold', fontFamily: 'var(--font-mono)' }}>Week {week} of 12</span>
            {isDiscord && (
              <div style={{ background: 'var(--danger)', color: '#fff', padding: '2px 6px', borderRadius: '4px', fontSize: '9px', fontWeight: 'bold' }}>LIVE</div>
            )}
          </div>
          <h2 style={{ fontFamily: 'var(--font-primary)', fontSize: '24px', color: 'var(--cream)' }}>{p.name}</h2>
        </div>
        <Badge size={44} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
        <div style={{ background: 'var(--card-bg)', padding: '10px', borderRadius: '8px', border: '2px solid var(--border)' }}>
          <div style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--warm-grey)', fontWeight: 'bold' }}>Job / Role</div>
          <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{JOBS.find(j => j.id === p.job)?.name || 'Jobless'}</div>
        </div>
        <div style={{ background: 'var(--card-bg)', padding: '10px', borderRadius: '8px', border: '2px solid var(--border)' }}>
          <div style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--warm-grey)', fontWeight: 'bold' }}>Archetype</div>
          <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{ARCHETYPES.find(a => a.id === p.archetype)?.name || 'The Unit'}</div>
        </div>
      </div>

      <div style={{ background: 'var(--card-bg)', padding: '12px', borderRadius: '8px', border: '2px solid var(--border)', marginBottom: '16px' }}>
        <StatusBar label="Fitness" value={p.states.fitness} colour="var(--success)" />
        <StatusBar label="Fatigue" value={p.states.fatigue} colour="var(--danger)" />
        <StatusBar label="Morale / Confidence" value={p.states.confidence} colour="var(--kit-amber)" />
        <StatusBar label="Manager Trust" value={p.states.managerTrust} colour="#8B5CF6" />
      </div>

      <Card style={{ background: 'var(--charcoal)', color: 'var(--cream)', border: '2px solid var(--border)', marginBottom: '16px' }}>
        <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--kit-amber)', fontWeight: 'bold', fontFamily: 'var(--font-mono)', marginBottom: '8px' }}>Career Totals</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', textAlign: 'center' }}>
          <div>
            <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{store.season.results.reduce((acc, r) => acc + (r.stats?.goals || 0), 0)}</div>
            <div style={{ fontSize: '8px', opacity: 0.7, textTransform: 'uppercase' }}>Goals</div>
          </div>
          <div>
            <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
              {(() => {
                const totalPasses = store.season.results.reduce((acc, r) => acc + (r.stats?.passes || 0), 0)
                const totalSuccess = store.season.results.reduce((acc, r) => acc + (r.stats?.passSuccess || 0), 0)
                return totalPasses ? Math.round((totalSuccess / totalPasses) * 100) : 0
              })()}%
            </div>
            <div style={{ fontSize: '8px', opacity: 0.7, textTransform: 'uppercase' }}>Pass %</div>
          </div>
          <div>
            <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
              {store.season.results.reduce((acc, r) => acc + (r.stats?.tackleSuccess || 0), 0)}
            </div>
            <div style={{ fontSize: '8px', opacity: 0.7, textTransform: 'uppercase' }}>Tackles</div>
          </div>
        </div>
      </Card>

      <Card style={{ background: 'var(--charcoal)', color: 'var(--cream)', border: '2px solid var(--border)' }}>
        <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--kit-amber)', fontWeight: 'bold', fontFamily: 'var(--font-mono)', marginBottom: '4px' }}>Next Up</div>
        <h3 style={{ fontFamily: 'var(--font-primary)', fontSize: '18px', marginBottom: '4px' }}>vs {nextOpponent.name}</h3>
        <div style={{ fontSize: '12px', color: 'var(--cream)', opacity: 0.8 }}>Style: {nextOpponent.style}</div>
        <div style={{ fontSize: '11px', color: 'var(--kit-amber)', marginTop: '4px' }}>Difficulty: {nextOpponent.difficulty}/10</div>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' }}>
        <button
          aria-label="Choose midweek action"
          onClick={onMidweek}
          style={{ padding: '12px', background: 'var(--cream)', color: 'var(--charcoal)', border: '2px solid var(--charcoal)', borderRadius: '6px', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', boxShadow: '0 2px 0px var(--charcoal)' }}
        >
          🗓️ MIDWEEK ACTION
        </button>
        <button
          aria-label="Open team group chat"
          onClick={onGroupChat}
          style={{ padding: '12px', background: 'var(--card-bg)', color: 'var(--charcoal)', border: '2px solid var(--border)', borderRadius: '6px', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', position: 'relative' }}
        >
          💬 TEAM CHAT
          {unreadCount > 0 && <span style={{ position: 'absolute', top: '-4px', right: '-4px', width: '12px', height: '12px', background: 'var(--danger)', borderRadius: '50%' }} />}
        </button>
      </div>

      <button
        aria-label="Kick off this week's match"
        onClick={onNextMatch}
        style={{ width: '100%', padding: '16px', background: 'var(--kit-amber)', color: 'var(--charcoal)', border: '3px solid var(--charcoal)', borderRadius: '8px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 0px var(--charcoal)', marginBottom: '12px' }}
      >
        ⚽ KICK-OFF MATCH
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
        <button aria-label="Open settings" onClick={onSettings} style={{ padding: '8px', background: 'none', border: '1px solid var(--border)', color: 'var(--cream)', borderRadius: '4px', fontSize: '12px', cursor: 'pointer' }}>
          ⚙️ Settings
        </button>
        <button aria-label="View Hall of Fame" onClick={onHall} style={{ padding: '8px', background: 'none', border: '1px solid var(--border)', color: 'var(--cream)', borderRadius: '4px', fontSize: '12px', cursor: 'pointer' }}>
          🏆 Hall of Fame
        </button>
      </div>
    </ScreenContainer>
  )
}

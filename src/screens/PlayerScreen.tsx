import { ScreenContainer } from '../components/shared/ScreenContainer'
import { Card } from '../components/shared/Card'
import { ARCHETYPES } from '../data/archetypes'
import { JOBS } from '../data/jobs'
import { TRAIT_REGISTRY } from '../engine/traits'
import { TIER_NAMES } from '../data/opponents'
import type { SaveState, StatKey, PlayerStats, Player } from '../types/game'

const STAT_KEYS: StatKey[] = ['touch', 'strike', 'pass', 'engine', 'graft', 'head', 'pace', 'vibes']

const STAT_DESCRIPTIONS: Record<StatKey, string> = {
  touch: 'First touch, dribbling, ball control',
  strike: 'Shooting, volleys, finishing under pressure',
  pass: 'Range of passing, crossing, set-piece delivery',
  engine: 'Stamina, late-game running, defensive cover',
  graft: 'Tackling, pressing, second balls',
  head: 'Aerial duels, composure, set-piece threat',
  pace: 'Acceleration, recovery runs, beating defenders',
  vibes: 'Morale influence, leadership, dressing room',
}

interface Props {
  store: SaveState
  onBack: () => void
}

function computeStartingStats(player: Player): PlayerStats {
  const arch = ARCHETYPES.find(a => a.id === player.archetype)
  const job = JOBS.find(j => j.id === player.job)
  const base: PlayerStats = arch ? { ...arch.stats } : { ...player.stats }
  if (job) {
    (Object.entries(job.modifier) as [StatKey, number][]).forEach(([k, v]) => {
      base[k] = Math.min(20, base[k] + (v ?? 0))
    })
  }
  return base
}

export function PlayerScreen({ store, onBack }: Props) {
  const player = store.player
  const archetype = ARCHETYPES.find(a => a.id === player.archetype)
  const job = JOBS.find(j => j.id === player.job)
  const starting = computeStartingStats(player)
  const totalGoals = store.season.results.reduce((acc, r) => acc + (r.stats?.goals ?? 0), 0)
  const matches = store.season.results.length

  const milestones = store.careerEvents
    .filter(e => e.type === 'stat_growth' || e.type === 'subplot_resolved' || e.type === 'season_summary')
    .slice(-8)
    .reverse()

  return (
    <ScreenContainer style={{ overflowY: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 700, color: 'var(--text)' }}>{player.name}</h2>
          <div style={{ fontSize: '12px', color: 'var(--text-faint)', marginTop: '2px' }}>
            {archetype?.name ?? 'Unsigned'} · {job?.name ?? 'Unemployed'} · {player.position}
          </div>
        </div>
        <button onClick={onBack} aria-label="Back to hub" style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '14px', cursor: 'pointer', fontWeight: 600, padding: '6px', fontFamily: 'var(--font-ui)' }}>Back</button>
      </div>

      {archetype && (
        <Card style={{ padding: '14px', marginBottom: '12px' }}>
          <div style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--accent)', fontWeight: 700, fontFamily: 'var(--font-mono)', letterSpacing: '0.06em', marginBottom: '6px' }}>
            Archetype
          </div>
          <div style={{ fontWeight: 700, fontSize: '16px', color: 'var(--text)', marginBottom: '4px' }}>{archetype.name}</div>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.45, margin: 0 }}>{archetype.description}</p>
        </Card>
      )}

      <Card style={{ padding: '14px', marginBottom: '12px' }}>
        <div style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--accent)', fontWeight: 700, fontFamily: 'var(--font-mono)', letterSpacing: '0.06em', marginBottom: '10px' }}>
          Attributes
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', rowGap: '8px' }}>
          {STAT_KEYS.map(k => {
            const current = player.stats[k]
            const start = starting[k] ?? current
            const delta = current - start
            const pct = Math.min(100, (current / 20) * 100)
            return (
              <div key={k} style={{ display: 'grid', gridTemplateColumns: '70px 1fr 60px', alignItems: 'center', gap: '10px' }}>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text)', letterSpacing: '0.06em' }}>{k.toUpperCase()}</div>
                  <div style={{ fontSize: '9px', color: 'var(--text-faint)', lineHeight: 1.2 }}>{STAT_DESCRIPTIONS[k]}</div>
                </div>
                <div style={{ height: '6px', background: 'var(--surface)', borderRadius: '3px', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ width: pct + '%', height: '100%', background: 'var(--accent)', borderRadius: '3px', transition: 'width 0.3s ease' }} />
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', textAlign: 'right' }}>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)' }}>{current}</span>
                  {delta !== 0 && (
                    <span style={{ fontSize: '11px', fontWeight: 700, color: delta > 0 ? 'var(--success)' : 'var(--danger)', marginLeft: '6px' }}>
                      {delta > 0 ? '+' : ''}{delta}
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      <Card style={{ padding: '14px', marginBottom: '12px' }}>
        <div style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--accent)', fontWeight: 700, fontFamily: 'var(--font-mono)', letterSpacing: '0.06em', marginBottom: '10px' }}>
          Traits
        </div>
        {player.traits.length === 0 ? (
          <div style={{ fontSize: '12px', color: 'var(--text-faint)' }}>No traits yet.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {player.traits.map(t => {
              const def = TRAIT_REGISTRY[t]
              return (
                <div key={t} style={{ background: 'var(--surface)', padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '3px', gap: '8px' }}>
                    <span style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text)' }}>{t}</span>
                    {def && (
                      <span style={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-faint)', fontWeight: 700 }}>
                        {def.source}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                    {def?.description ?? 'A personal quirk that shapes how you play.'}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Card>

      <Card style={{ padding: '14px', marginBottom: '12px' }}>
        <div style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--accent)', fontWeight: 700, fontFamily: 'var(--font-mono)', letterSpacing: '0.06em', marginBottom: '10px' }}>
          Season {store.season.number} · {TIER_NAMES[store.season.tier]}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', textAlign: 'center' }}>
          <div>
            <div style={{ fontSize: '20px', fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--text)' }}>{matches}</div>
            <div style={{ fontSize: '9px', color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Matches</div>
          </div>
          <div>
            <div style={{ fontSize: '20px', fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--text)' }}>{totalGoals}</div>
            <div style={{ fontSize: '9px', color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Goals</div>
          </div>
          <div>
            <div style={{ fontSize: '20px', fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--text)' }}>{store.player.states.localFame}</div>
            <div style={{ fontSize: '9px', color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Local Fame</div>
          </div>
        </div>
      </Card>

      <Card style={{ padding: '14px' }}>
        <div style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--accent)', fontWeight: 700, fontFamily: 'var(--font-mono)', letterSpacing: '0.06em', marginBottom: '10px' }}>
          Recent Milestones
        </div>
        {milestones.length === 0 ? (
          <div style={{ fontSize: '12px', color: 'var(--text-faint)' }}>Nothing notable yet. Keep playing.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {milestones.map((m, i) => {
              let label = ''
              if (m.type === 'stat_growth') label = 'Grew ' + (m.action ?? '').toString().toUpperCase() + ' between seasons'
              else if (m.type === 'subplot_resolved') label = 'Resolved a subplot: ' + (m.outcome ?? 'decision made')
              else if (m.type === 'season_summary') label = 'Season closed: ' + (m.result ?? 'stayed') + (m.pts != null ? ', ' + m.pts + ' pts' : '')
              return (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontSize: '12px', color: 'var(--text-muted)', borderBottom: '1px dashed var(--border-subtle)', paddingBottom: '5px' }}>
                  <span>{label}</span>
                  {m.week != null && <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-faint)' }}>Wk {m.week}</span>}
                </div>
              )
            })}
          </div>
        )}
      </Card>
    </ScreenContainer>
  )
}

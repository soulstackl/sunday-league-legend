import { ScreenContainer } from '../components/shared/ScreenContainer'
import { buildStandings } from '../engine/league'
import { TIER_NAMES } from '../data/opponents'
import type { SaveState } from '../types/game'

interface TableScreenProps {
  store: SaveState
  onContinue: () => void
  onBack: () => void
  canAdvance: boolean
}

export function TableScreen({ store, onContinue, onBack, canAdvance }: TableScreenProps) {
  const standings = buildStandings(store.season.aiTable, store.season.tier, store.season.results)
  const totalTeams = standings.length

  return (
    <ScreenContainer style={{ overflowY: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 700, color: 'var(--text)' }}>{TIER_NAMES[store.season.tier]}</h2>
          <div style={{ fontSize: '11px', color: 'var(--text-faint)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>Season {store.season.number} · Week {store.season.week}</div>
        </div>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '14px', cursor: 'pointer', fontWeight: 600, padding: '6px', fontFamily: 'var(--font-ui)' }}>Back</button>
      </div>

      <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden', marginBottom: '12px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', fontFamily: 'var(--font-mono)' }}>
          <thead>
            <tr style={{ background: 'var(--surface)', color: 'var(--text-muted)' }}>
              <th style={{ padding: '8px 10px', textAlign: 'left', fontSize: '10px', letterSpacing: '0.06em', fontWeight: 700 }}>#</th>
              <th style={{ padding: '8px 6px', textAlign: 'left', fontSize: '10px', letterSpacing: '0.06em', fontWeight: 700 }}>CLUB</th>
              <th style={{ padding: '8px 6px', textAlign: 'center', fontSize: '10px' }}>P</th>
              <th style={{ padding: '8px 6px', textAlign: 'center', fontSize: '10px' }}>W</th>
              <th style={{ padding: '8px 6px', textAlign: 'center', fontSize: '10px' }}>D</th>
              <th style={{ padding: '8px 6px', textAlign: 'center', fontSize: '10px' }}>L</th>
              <th style={{ padding: '8px 6px', textAlign: 'center', fontSize: '10px' }}>GD</th>
              <th style={{ padding: '8px 10px', textAlign: 'center', fontSize: '10px', fontWeight: 700 }}>PTS</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((team, i) => {
              const pos = i + 1
              const promoteZone = pos <= 2 && store.season.tier > 1
              const relegateZone = pos >= totalTeams - 1 && store.season.tier < 3
              let rowBg = 'transparent'
              if (team.isUs) rowBg = 'var(--accent-bg)'
              else if (promoteZone) rowBg = 'var(--success-bg)'
              else if (relegateZone) rowBg = 'var(--danger-bg)'
              return (
                <tr key={team.id} style={{ background: rowBg, borderBottom: '1px solid var(--border-subtle)', fontWeight: team.isUs ? 700 : 400 }}>
                  <td style={{ padding: '7px 10px', color: promoteZone ? 'var(--success)' : (relegateZone ? 'var(--danger)' : 'var(--text-faint)'), fontWeight: 700, fontSize: '11px' }}>{pos}</td>
                  <td style={{ padding: '7px 6px', color: team.isUs ? 'var(--accent)' : 'var(--text)' }}>{team.name}</td>
                  <td style={{ padding: '7px 6px', textAlign: 'center', color: 'var(--text-muted)' }}>{team.played}</td>
                  <td style={{ padding: '7px 6px', textAlign: 'center', color: 'var(--text-muted)' }}>{team.won}</td>
                  <td style={{ padding: '7px 6px', textAlign: 'center', color: 'var(--text-muted)' }}>{team.drawn}</td>
                  <td style={{ padding: '7px 6px', textAlign: 'center', color: 'var(--text-muted)' }}>{team.lost}</td>
                  <td style={{ padding: '7px 6px', textAlign: 'center', color: 'var(--text-muted)' }}>{team.goalDifference > 0 ? '+' : ''}{team.goalDifference}</td>
                  <td style={{ padding: '7px 10px', textAlign: 'center', color: 'var(--text)', fontWeight: 700 }}>{team.points}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', fontSize: '11px', color: 'var(--text-muted)' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ display: 'inline-block', width: '10px', height: '10px', background: 'var(--success-bg)', borderRadius: '2px', border: '1px solid rgba(34,197,94,0.3)' }} />
          Promotion zone
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ display: 'inline-block', width: '10px', height: '10px', background: 'var(--danger-bg)', borderRadius: '2px', border: '1px solid rgba(244,63,94,0.3)' }} />
          Relegation zone
        </span>
      </div>

      <button
        disabled={!canAdvance}
        onClick={onContinue}
        style={{
          width: '100%', padding: '16px',
          background: canAdvance ? 'var(--accent)' : 'var(--surface-raised)',
          color: canAdvance ? '#0C0C10' : 'var(--text-faint)',
          border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: 700,
          cursor: canAdvance ? 'pointer' : 'not-allowed',
          letterSpacing: '0.04em', marginTop: 'auto',
        }}
      >
        {canAdvance ? 'NEXT WEEK' : 'CLOSE TABLE'}
      </button>
    </ScreenContainer>
  )
}

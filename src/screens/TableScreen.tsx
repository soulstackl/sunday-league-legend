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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h2 style={{ fontFamily: 'var(--font-primary)', fontSize: '24px', color: 'var(--cream)' }}>{TIER_NAMES[store.season.tier]}</h2>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'var(--cream)', fontSize: '14px', cursor: 'pointer', fontWeight: 'bold' }}>Back</button>
      </div>

      <div style={{ background: 'var(--card-bg)', border: '3px solid var(--charcoal)', borderRadius: '8px', overflow: 'hidden', marginBottom: '16px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', fontFamily: 'var(--font-mono)' }}>
          <thead>
            <tr style={{ background: 'var(--charcoal)', color: 'var(--cream)' }}>
              <th style={{ padding: '6px 4px', textAlign: 'left' }}>#</th>
              <th style={{ padding: '6px 4px', textAlign: 'left' }}>CLUB</th>
              <th style={{ padding: '6px 4px', textAlign: 'center' }}>P</th>
              <th style={{ padding: '6px 4px', textAlign: 'center' }}>W</th>
              <th style={{ padding: '6px 4px', textAlign: 'center' }}>D</th>
              <th style={{ padding: '6px 4px', textAlign: 'center' }}>L</th>
              <th style={{ padding: '6px 4px', textAlign: 'center' }}>GD</th>
              <th style={{ padding: '6px 4px', textAlign: 'center' }}>PTS</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((team, i) => {
              const pos = i + 1
              const promoteZone = pos <= 2 && store.season.tier > 1
              const relegateZone = pos >= totalTeams - 1 && store.season.tier < 3
              const bg = team.isUs ? 'var(--cream)' : (promoteZone ? 'rgba(22,163,74,0.08)' : (relegateZone ? 'rgba(220,38,38,0.06)' : 'none'))
              return (
                <tr key={team.id} style={{ background: bg, borderBottom: '1px solid var(--border)', fontWeight: team.isUs ? 'bold' : 'normal' }}>
                  <td style={{ padding: '6px 4px', color: promoteZone ? 'var(--success)' : (relegateZone ? 'var(--danger)' : 'inherit') }}>{pos}</td>
                  <td style={{ padding: '6px 4px' }}>{team.name}</td>
                  <td style={{ padding: '6px 4px', textAlign: 'center' }}>{team.played}</td>
                  <td style={{ padding: '6px 4px', textAlign: 'center' }}>{team.won}</td>
                  <td style={{ padding: '6px 4px', textAlign: 'center' }}>{team.drawn}</td>
                  <td style={{ padding: '6px 4px', textAlign: 'center' }}>{team.lost}</td>
                  <td style={{ padding: '6px 4px', textAlign: 'center' }}>{team.goalDifference > 0 ? '+' : ''}{team.goalDifference}</td>
                  <td style={{ padding: '6px 4px', textAlign: 'center' }}>{team.points}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div style={{ background: 'var(--card-bg)', border: '2px solid var(--border)', padding: '8px 10px', borderRadius: '6px', marginBottom: '16px', fontSize: '11px', color: 'var(--charcoal)' }}>
        <span style={{ display: 'inline-block', width: '10px', height: '10px', background: 'rgba(22,163,74,0.3)', marginRight: '6px', verticalAlign: 'middle' }} />Promotion zone
        <span style={{ display: 'inline-block', width: '10px', height: '10px', background: 'rgba(220,38,38,0.3)', margin: '0 6px 0 12px', verticalAlign: 'middle' }} />Relegation zone
      </div>

      <button
        disabled={!canAdvance}
        onClick={onContinue}
        style={{ width: '100%', padding: '16px', background: canAdvance ? 'var(--kit-amber)' : 'var(--warm-grey)', color: 'var(--charcoal)', border: '3px solid var(--charcoal)', borderRadius: '8px', fontSize: '18px', fontWeight: 'bold', cursor: canAdvance ? 'pointer' : 'not-allowed', boxShadow: '0 4px 0px var(--charcoal)', marginTop: 'auto' }}
      >
        {canAdvance ? 'NEXT WEEK' : 'CLOSE TABLE'}
      </button>
    </ScreenContainer>
  )
}

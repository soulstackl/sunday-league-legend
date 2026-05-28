import React from 'react'
import { ScreenContainer } from '../components/shared/ScreenContainer'
import { OPPONENTS } from '../data/opponents'
import type { SaveState } from '../types/game'

interface TableScreenProps {
  store: SaveState
  onContinue: () => void
}

export function TableScreen({ store, onContinue }: TableScreenProps) {
  // Basic calculated league standings
  const standings = OPPONENTS.map((opp) => {
    const points = 18 - opp.difficulty * 2
    return { name: opp.name, pts: points, gd: 2 }
  })

  // Add Dog & Duck FC
  const ourPts = store.season.results.reduce((acc, r) => {
    if (r.ourGoals > r.theirGoals) return acc + 3
    if (r.ourGoals === r.theirGoals) return acc + 1
    return acc
  }, 0)

  standings.push({ name: 'Dog & Duck FC', pts: ourPts, gd: 0 })
  standings.sort((a, b) => b.pts - a.pts)

  return (
    <ScreenContainer style={{ overflowY: 'auto' }}>
      <h2 style={{ fontFamily: 'var(--font-primary)', fontSize: '24px', color: 'var(--cream)', marginBottom: '16px' }}>Standings Table</h2>

      <div style={{ background: 'var(--card-bg)', border: '3px solid var(--charcoal)', borderRadius: '8px', overflow: 'hidden', marginBottom: '20px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', fontFamily: 'var(--font-mono)' }}>
          <thead>
            <tr style={{ background: 'var(--charcoal)', color: 'var(--cream)' }}>
              <th style={{ padding: '8px', textAlign: 'left' }}>CLUB</th>
              <th style={{ padding: '8px', textAlign: 'center' }}>PTS</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((team, i) => {
              const isUs = team.name === 'Dog & Duck FC'
              return (
                <tr key={i} style={{ background: isUs ? 'var(--cream)' : 'none', borderBottom: '1px solid var(--border)', fontWeight: isUs ? 'bold' : 'normal' }}>
                  <td style={{ padding: '8px' }}>{i + 1}. {team.name}</td>
                  <td style={{ padding: '8px', textAlign: 'center' }}>{team.pts}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <button
        onClick={onContinue}
        style={{ width: '100%', padding: '16px', background: 'var(--kit-amber)', color: 'var(--charcoal)', border: '3px solid var(--charcoal)', borderRadius: '8px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 0px var(--charcoal)', marginTop: 'auto' }}
      >
        NEXT WEEK
      </button>
    </ScreenContainer>
  )
}

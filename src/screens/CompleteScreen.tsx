import React from 'react'
import { ScreenContainer } from '../components/shared/ScreenContainer'
import { Badge } from '../components/shared/Badge'
import { Card } from '../components/shared/Card'
import { ENDINGS } from '../data/endings'
import type { SaveState } from '../types/game'

interface CompleteScreenProps {
  store: SaveState
  onHallOfFame: (title: string) => void
  onNextSeason: () => void
}

export function CompleteScreen({ store, onHallOfFame, onNextSeason }: CompleteScreenProps) {
  const pts = store.season.results.reduce((acc, r) => {
    if (r.ourGoals > r.theirGoals) return acc + 3
    if (r.ourGoals === r.theirGoals) return acc + 1
    return acc
  }, 0)

  const goals = store.season.results.reduce((acc, r) => acc + (r.stats?.goals || 0), 0)
  const trust = store.player.states.managerTrust
  const refRep = store.player.states.refereeRep || 50

  let ending
  if (pts >= 28) ending = ENDINGS[0] // Club Legend
  else if (pts >= 22 && trust >= 70) ending = ENDINGS[1] // Pub Hero
  else if (goals >= 6) ending = ENDINGS[2] // Could Have Gone Pro
  else if (pts < 15 && store.season.results.some(r => r.rating >= 9)) ending = ENDINGS[7] // One Season Wonder
  else if (refRep < 30) ending = ENDINGS[6] // Sent Off in Own Testimonial
  else if (trust >= 80) ending = ENDINGS[5] // Saviour
  else if (store.player.archetype === 'winger' && goals >= 4) ending = ENDINGS[4] // Sunday League Cantona
  else if (pts >= 18 && pts < 22) ending = ENDINGS[3] // Cup Final Bottler
  else ending = ENDINGS[1] // Pub Hero fallback

  return (
    <ScreenContainer style={{ background: 'var(--charcoal)', textAlign: 'center' }}>
      <Badge size={100} />
      <h2 style={{ fontFamily: 'var(--font-primary)', fontSize: '28px', color: 'var(--cream)', margin: '16px 0 8px' }}>Season Complete!</h2>

      <Card style={{ margin: '20px 0', border: '3px solid var(--charcoal)', background: '#fff' }}>
        <div style={{ textTransform: 'uppercase', color: 'var(--kit-amber-dark)', fontWeight: 'bold', fontSize: '12px' }}>Your Career Title:</div>
        <h1 style={{ fontFamily: 'var(--font-primary)', fontSize: '24px', margin: '8px 0' }}>{ending.title}</h1>
        <p style={{ fontSize: '14px', color: 'var(--warm-grey)' }}>"{ending.text}"</p>
      </Card>

      <div style={{ background: 'var(--charcoal)', color: 'var(--cream)', width: '100%', padding: '16px', borderRadius: '8px', marginBottom: '24px', fontFamily: 'var(--font-mono)', border: '1px solid var(--border)' }}>
        <h4 style={{ color: 'var(--kit-amber)' }}>FINAL STATS</h4>
        <div style={{ margin: '8px 0' }}>Total Season Points: {pts}</div>
        <div>Manager Trust: {store.player.states.managerTrust}/100</div>
      </div>

      <button
        className="sll-btn"
        onClick={() => onHallOfFame(ending.title)}
        style={{ marginBottom: '12px' }}
      >
        RECORD TO HALL OF FAME
      </button>

      <button
        className="sll-btn"
        onClick={onNextSeason}
        style={{ background: 'var(--cream)', color: 'var(--charcoal)' }}
      >
        START NEXT SEASON
      </button>
    </ScreenContainer>
  )
}

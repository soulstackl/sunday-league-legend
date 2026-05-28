import React from 'react'
import { ScreenContainer } from '../components/shared/ScreenContainer'
import { mulberry32 } from '../engine/rng'
import type { SaveState, MatchStats } from '../types/game'

interface MatchReportProp {
  ourGoals: number
  theirGoals: number
  rating?: number
  ourxG?: number
  theirxG?: number
  stats?: MatchStats
}

interface PostMatchScreenProps {
  store: SaveState
  matchReport: MatchReportProp
  onContinue: () => void
}

export function PostMatchScreen({ store, matchReport, onContinue }: PostMatchScreenProps) {
  const rating = matchReport.rating || 6
  const ourGoals = matchReport.ourGoals
  const theirGoals = matchReport.theirGoals
  const won = ourGoals > theirGoals
  const draw = ourGoals === theirGoals

  const WIN_HEADLINES = [
    `${store.player.name.toUpperCase()} POWERS THE DUCK TO MAGNIFICENT VICTORY`,
    'SUNDAY LEAGUE MAGIC AS DOG & DUCK TRIUMPH AT RECREATION GROUND',
    'THREE POINTS! THE DUCK DELIVER IN DRAMATIC MATCHDAY WINNER',
    "BRILLIANT PERFORMANCE SECURES VITAL WIN FOR PETE'S MEN",
    'RECREATION GROUND ERUPTS AS DOG & DUCK PRODUCE STUNNING DISPLAY',
    'THE DUCK BITE BACK — CLINICAL FINISH SEALS THE DEAL'
  ]
  const DRAW_HEADLINES = [
    'SPOILS SHARED AT RECREATION GROUND IN MUDDY DRAW',
    'ONE EACH IN HARD-FOUGHT STALEMATE AT THE REC',
    'A POINT APIECE AS DOG & DUCK HOLD THEIR NERVE',
    "GUTSY DRAW FOR PETE'S MEN IN BATTLING DISPLAY",
    'HONOURS EVEN — THE DUCK DIG IN FOR A SHARE OF THE SPOILS'
  ]
  const LOSS_HEADLINES = [
    'DISASTER FOR THE DUCK IN DEMORALISING DEFEAT',
    'DARK DAYS AT THE REC AS DOG & DUCK SLUMP TO HEAVY LOSS',
    'PETE FUMES AS THE DUCK CAPITULATE IN SECOND HALF COLLAPSE',
    'ANOTHER ONE TO FORGET FOR THE DOG & DUCK FAITHFUL',
    'DEFEAT DENTS TITLE HOPES AS THE DUCK STRUGGLE TO IMPOSE',
    'GUTLESS SAYS GAFFER AS DUCK FALL TO FIFTH DEFEAT OF THE CAMPAIGN'
  ]
  const rngHead = mulberry32(store.seed + store.season.week * 77)
  const headline = won
    ? WIN_HEADLINES[Math.floor(rngHead() * WIN_HEADLINES.length)]
    : draw
      ? DRAW_HEADLINES[Math.floor(rngHead() * DRAW_HEADLINES.length)]
      : LOSS_HEADLINES[Math.floor(rngHead() * LOSS_HEADLINES.length)]

  return (
    <ScreenContainer style={{ background: '#e8e4d9', padding: '24px' }}>
      <div style={{
        border: '2px solid #333',
        background: '#fffef0',
        padding: '20px',
        boxShadow: '5px 5px 0px rgba(0,0,0,0.1)',
        minHeight: '85%',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'serif',
        color: '#111'
      }}>
        <div style={{ textAlign: 'center', borderBottom: '4px double #333', paddingBottom: '10px', marginBottom: '16px' }}>
          <div style={{ fontSize: '12px', fontWeight: 'bold', letterSpacing: '2px' }}>THE SUNDAY LEAGUE WEEKLY</div>
          <div style={{ fontSize: '10px' }}>EST. 1982 | PRICE: 50P | {new Date().toLocaleDateString('en-GB')}</div>
        </div>

        <h1 style={{ fontSize: '26px', lineHeight: '1.1', marginBottom: '16px', fontWeight: '900', textAlign: 'center' }}>
          {headline}
        </h1>

        <div style={{ display: 'flex', gap: '16px', flex: 1, flexDirection: window.innerWidth > 600 ? 'row' : 'column' }}>
          <div style={{ flex: 2 }}>
            <div style={{ fontSize: '56px', fontWeight: 'bold', textAlign: 'center', border: '2px solid #333', margin: '10px 0', background: '#fff' }}>
              {ourGoals} - {theirGoals}
            </div>
            <p style={{ fontSize: '14px', lineHeight: '1.4', color: '#333', fontStyle: 'italic', marginBottom: '16px' }}>
              "It was a match of two halves," said Pete the Gaffer. "We worked hard, we stayed in the mixer, and at the end of the day, football was the winner."
            </p>
            <div style={{ marginTop: 'auto' }}>
              <div style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', borderBottom: '1px solid #333', marginBottom: '8px' }}>Player Match Rating</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{rating}/10</div>
                <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{store.player.name}</div>
              </div>
            </div>
          </div>
          <div style={{ flex: 1, borderLeft: window.innerWidth > 600 ? '1px solid #ccc' : 'none', borderTop: window.innerWidth > 600 ? 'none' : '1px solid #ccc', paddingLeft: window.innerWidth > 600 ? '12px' : '0', paddingTop: window.innerWidth > 600 ? '0' : '12px', fontSize: '13px' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '8px', textTransform: 'uppercase' }}>Match Statistics</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Shots (Goals)</span>
                <span>{matchReport.stats?.shots || 0} ({matchReport.stats?.goals || 0})</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Pass Completion</span>
                <span>{matchReport.stats?.passes ? Math.round((matchReport.stats.passSuccess / matchReport.stats.passes) * 100) : 0}%</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Tackles Won</span>
                <span>{matchReport.stats?.tackleSuccess || 0}/{matchReport.stats?.tackles || 0}</span>
              </div>
            </div>

            <div style={{ fontWeight: 'bold', marginTop: '16px', marginBottom: '8px', textTransform: 'uppercase' }}>Squad Banter</div>
            <p style={{ marginBottom: '8px' }}>"Best I've seen him play in weeks," noted Gav Two Yards. "Even if he didn't pass to me once."</p>
            <p>"Ref was a joke, but the lad pulled us through," added Big Taz.</p>
          </div>
        </div>

        <button
          className="sll-btn"
          onClick={onContinue}
          style={{ marginTop: '24px', background: '#333', color: '#fff', border: 'none', borderRadius: '0', padding: '12px' }}
        >
          NEXT EDITION
        </button>
      </div>
    </ScreenContainer>
  )
}

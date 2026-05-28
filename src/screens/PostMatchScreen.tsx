import { useEffect, useState } from 'react'
import { ScreenContainer } from '../components/shared/ScreenContainer'
import { mulberry32 } from '../engine/rng'
import { cupRoundLabel } from '../data/cup'
import type { SaveState, MatchStats } from '../types/game'

interface MatchReportProp {
  ourGoals: number
  theirGoals: number
  rating?: number
  stats?: MatchStats
  kind: 'league' | 'cup'
  cupRound?: 'quarter-final' | 'semi-final' | 'final'
  opponentName: string
}

interface PostMatchScreenProps {
  store: SaveState
  matchReport: MatchReportProp
  onContinue: () => void
}

const WIDE_LAYOUT_BREAKPOINT = 600

function useWideLayout(): boolean {
  const [wide, setWide] = useState(() => typeof window !== 'undefined' ? window.innerWidth > WIDE_LAYOUT_BREAKPOINT : false)
  useEffect(() => {
    const onResize = () => setWide(window.innerWidth > WIDE_LAYOUT_BREAKPOINT)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])
  return wide
}

export function PostMatchScreen({ store, matchReport, onContinue }: PostMatchScreenProps) {
  const wide = useWideLayout()
  const rating = matchReport.rating ?? 6
  const { ourGoals, theirGoals, opponentName } = matchReport
  const won = ourGoals > theirGoals
  const draw = ourGoals === theirGoals
  const isCup = matchReport.kind === 'cup'

  const WIN_HEADLINES = [
    `${store.player.name.toUpperCase()} POWERS THE DUCK PAST ${opponentName.toUpperCase()}`,
    `SUNDAY LEAGUE MAGIC AS DOG & DUCK SEE OFF ${opponentName.toUpperCase()}`,
    'THREE POINTS! THE DUCK DELIVER IN DRAMATIC MATCHDAY WINNER',
    `BRILLIANT PERFORMANCE SECURES VITAL WIN OVER ${opponentName.toUpperCase()}`,
    'RECREATION GROUND ERUPTS AS DOG & DUCK PRODUCE STUNNING DISPLAY',
    'THE DUCK BITE BACK, CLINICAL FINISH SEALS THE DEAL',
  ]
  const DRAW_HEADLINES = [
    `SPOILS SHARED AS THE DUCK HOLD ${opponentName.toUpperCase()}`,
    'ONE EACH IN HARD-FOUGHT STALEMATE AT THE REC',
    'A POINT APIECE AS DOG & DUCK HOLD THEIR NERVE',
    "GUTSY DRAW FOR PETE'S MEN IN BATTLING DISPLAY",
    'HONOURS EVEN AS THE DUCK DIG IN',
  ]
  const LOSS_HEADLINES = [
    `DISASTER FOR THE DUCK IN DEFEAT TO ${opponentName.toUpperCase()}`,
    'DARK DAYS AT THE REC AS DOG & DUCK SLUMP TO HEAVY LOSS',
    'PETE FUMES AS THE DUCK CAPITULATE IN SECOND HALF COLLAPSE',
    'ANOTHER ONE TO FORGET FOR THE DOG & DUCK FAITHFUL',
    'DEFEAT DENTS TITLE HOPES AS THE DUCK STRUGGLE TO IMPOSE',
    'GUTLESS SAYS GAFFER AS DUCK FALL TO ANOTHER DEFEAT',
  ]
  const CUP_WIN_HEADLINES = (round: string) => [
    `${store.player.name.toUpperCase()} FIRES THE DUCK INTO THE NEXT ROUND OF THE TANKARD`,
    `${round.toUpperCase()}: THE DUCK SURVIVE AND ADVANCE`,
    'CUP MAGIC AT THE REC AS DOG & DUCK PROGRESS',
  ]
  const CUP_LOSS_HEADLINES = (round: string) => [
    `TANKARD DREAM OVER: THE DUCK GO OUT AT THE ${round.toUpperCase()}`,
    "END OF THE CUP RUN FOR PETE'S MEN",
    `HEARTBREAK AT THE ${round.toUpperCase()} STAGE`,
  ]

  const rngHead = mulberry32(store.seed + store.season.week * 77 + store.season.number * 13)
  let headline: string
  if (isCup) {
    const roundLabel = matchReport.cupRound ? cupRoundLabel(matchReport.cupRound) : 'Cup Tie'
    if (won && matchReport.cupRound === 'final') headline = `${store.player.name.toUpperCase()} LIFTS THE TANKARD!`
    else if (won) {
      const arr = CUP_WIN_HEADLINES(roundLabel)
      headline = arr[Math.floor(rngHead() * arr.length)]
    } else {
      const arr = CUP_LOSS_HEADLINES(roundLabel)
      headline = arr[Math.floor(rngHead() * arr.length)]
    }
  } else {
    const arr = won ? WIN_HEADLINES : draw ? DRAW_HEADLINES : LOSS_HEADLINES
    headline = arr[Math.floor(rngHead() * arr.length)]
  }

  const sideQuote = won
    ? '"That is what football is about," said Pete the Gaffer. "We grafted, we deserved it. Now drink water."'
    : draw
      ? '"Honest result on the day," said Pete the Gaffer. "Could have nicked it, could have lost it. We move on."'
      : '"Absolute shambles," said Pete the Gaffer. "Training is mandatory. Gary is excused."'

  const resultAccent = won ? '#22C55E' : draw ? '#F0A830' : '#F43F5E'

  return (
    <ScreenContainer style={{ background: 'var(--bg)', padding: '20px' }}>
      {/* Newspaper masthead */}
      <div style={{ background: '#F5F0E6', borderRadius: '16px', overflow: 'hidden', flex: 1, display: 'flex', flexDirection: 'column', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
        {/* Header band */}
        <div style={{ borderBottom: '3px double #1a1a1a', padding: '12px 16px', textAlign: 'center', background: '#FFFDF5' }}>
          <div style={{ fontFamily: 'Georgia, serif', fontSize: '11px', fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#1a1a1a' }}>The Sunday League Weekly</div>
          <div style={{ fontFamily: 'Georgia, serif', fontSize: '10px', color: '#555', marginTop: '2px' }}>
            Est. 1982 · Price 50p · {new Date().toLocaleDateString('en-GB')}
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', background: '#FFFDF5', color: '#1a1a1a' }}>
          {/* Result bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '12px', background: resultAccent, borderRadius: '8px', marginBottom: '14px' }}>
            <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '42px', fontWeight: 700, color: won ? '#fff' : (draw ? '#0C0C10' : '#fff'), lineHeight: 1 }}>{ourGoals}</span>
            <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '20px', fontWeight: 700, color: won ? 'rgba(255,255,255,0.7)' : (draw ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.7)'), lineHeight: 1 }}>:</span>
            <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '42px', fontWeight: 700, color: won ? '#fff' : (draw ? '#0C0C10' : '#fff'), lineHeight: 1 }}>{theirGoals}</span>
          </div>

          {/* Headline */}
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: wide ? '22px' : '18px', lineHeight: '1.2', marginBottom: '12px', fontWeight: 900, textAlign: 'center', color: '#1a1a1a' }}>{headline}</h1>

          <div style={{ display: 'flex', gap: '16px', flex: 1, flexDirection: wide ? 'row' : 'column' }}>
            <div style={{ flex: 2 }}>
              <p style={{ fontFamily: 'Georgia, serif', fontSize: '13px', lineHeight: '1.5', color: '#333', fontStyle: 'italic', marginBottom: '14px' }}>{sideQuote}</p>

              <div style={{ borderTop: '1px solid #ccc', paddingTop: '12px' }}>
                <div style={{ fontFamily: 'Georgia, serif', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#555', marginBottom: '6px' }}>Player Rating</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '36px', fontWeight: 700, color: '#1a1a1a', lineHeight: 1 }}>{rating}<span style={{ fontSize: '16px', color: '#888' }}>/10</span></div>
                  <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '15px', fontWeight: 700, color: '#1a1a1a' }}>{store.player.name}</div>
                </div>
              </div>
            </div>

            <div style={{ flex: 1, borderLeft: wide ? '1px solid #ddd' : 'none', borderTop: wide ? 'none' : '1px solid #ddd', paddingLeft: wide ? '14px' : '0', paddingTop: wide ? '0' : '12px', fontSize: '12px' }}>
              <div style={{ fontFamily: 'Georgia, serif', fontWeight: 700, marginBottom: '8px', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.08em', color: '#555' }}>Stats</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontFamily: "'Courier Prime', monospace", fontSize: '11px', color: '#333' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Shots (Goals)</span><span style={{ fontWeight: 700 }}>{matchReport.stats?.shots ?? 0} ({matchReport.stats?.goals ?? 0})</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Pass Completion</span><span style={{ fontWeight: 700 }}>{matchReport.stats?.passes ? Math.round(((matchReport.stats.passSuccess ?? 0) / matchReport.stats.passes) * 100) : 0}%</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Tackles Won</span><span style={{ fontWeight: 700 }}>{matchReport.stats?.tackleSuccess ?? 0}/{matchReport.stats?.tackles ?? 0}</span></div>
              </div>

              <div style={{ fontFamily: 'Georgia, serif', fontWeight: 700, marginTop: '14px', marginBottom: '6px', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.08em', color: '#555' }}>Dressing Room</div>
              <p style={{ fontFamily: 'Georgia, serif', fontSize: '12px', lineHeight: '1.4', marginBottom: '6px', color: '#444' }}>"Best I have seen him play in weeks," noted Gav Two Yards.</p>
              <p style={{ fontFamily: 'Georgia, serif', fontSize: '12px', lineHeight: '1.4', color: '#444' }}>"Ref was a joke, but the lad pulled us through," added Big Taz.</p>
            </div>
          </div>

          <button
            onClick={onContinue}
            style={{ marginTop: '18px', width: '100%', padding: '12px', background: '#1a1a1a', color: '#F5F0E6', border: 'none', borderRadius: '6px', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '14px', cursor: 'pointer', letterSpacing: '0.04em' }}
          >
            NEXT EDITION
          </button>
        </div>
      </div>
    </ScreenContainer>
  )
}

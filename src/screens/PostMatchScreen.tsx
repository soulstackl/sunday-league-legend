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

  return (
    <ScreenContainer style={{ background: '#e8e4d9', padding: '24px' }}>
      <div style={{ border: '2px solid #333', background: '#fffef0', padding: '20px', boxShadow: '5px 5px 0px rgba(0,0,0,0.1)', minHeight: '85%', display: 'flex', flexDirection: 'column', fontFamily: 'serif', color: '#111' }}>
        <div style={{ textAlign: 'center', borderBottom: '4px double #333', paddingBottom: '10px', marginBottom: '16px' }}>
          <div style={{ fontSize: '12px', fontWeight: 'bold', letterSpacing: '2px' }}>THE SUNDAY LEAGUE WEEKLY</div>
          <div style={{ fontSize: '10px' }}>EST. 1982 | PRICE: 50P | {new Date().toLocaleDateString('en-GB')}</div>
        </div>

        <h1 style={{ fontSize: '24px', lineHeight: '1.1', marginBottom: '16px', fontWeight: 900, textAlign: 'center' }}>{headline}</h1>

        <div style={{ display: 'flex', gap: '16px', flex: 1, flexDirection: wide ? 'row' : 'column' }}>
          <div style={{ flex: 2 }}>
            <div style={{ fontSize: '56px', fontWeight: 'bold', textAlign: 'center', border: '2px solid #333', margin: '10px 0', background: '#fff' }}>
              {ourGoals} : {theirGoals}
            </div>
            <p style={{ fontSize: '14px', lineHeight: '1.4', color: '#333', fontStyle: 'italic', marginBottom: '16px' }}>{sideQuote}</p>
            <div>
              <div style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', borderBottom: '1px solid #333', marginBottom: '8px' }}>Player Match Rating</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{rating}/10</div>
                <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{store.player.name}</div>
              </div>
            </div>
          </div>
          <div style={{ flex: 1, borderLeft: wide ? '1px solid #ccc' : 'none', borderTop: wide ? 'none' : '1px solid #ccc', paddingLeft: wide ? '12px' : '0', paddingTop: wide ? '0' : '12px', fontSize: '13px' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '8px', textTransform: 'uppercase' }}>Match Statistics</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Shots (Goals)</span><span>{matchReport.stats?.shots ?? 0} ({matchReport.stats?.goals ?? 0})</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Pass Completion</span><span>{matchReport.stats?.passes ? Math.round(((matchReport.stats.passSuccess ?? 0) / matchReport.stats.passes) * 100) : 0}%</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Tackles Won</span><span>{matchReport.stats?.tackleSuccess ?? 0}/{matchReport.stats?.tackles ?? 0}</span></div>
            </div>

            <div style={{ fontWeight: 'bold', marginTop: '16px', marginBottom: '8px', textTransform: 'uppercase' }}>Squad Banter</div>
            <p style={{ marginBottom: '8px' }}>"Best I have seen him play in weeks," noted Gav Two Yards. "Even if he did not pass to me once."</p>
            <p>"Ref was a joke, but the lad pulled us through," added Big Taz.</p>
          </div>
        </div>

        <button className="sll-btn" onClick={onContinue} style={{ marginTop: '24px', background: '#333', color: '#fff', border: 'none', borderRadius: '0', padding: '12px' }}>
          NEXT EDITION
        </button>
      </div>
    </ScreenContainer>
  )
}

import { useEffect, useState } from 'react'
import { Share2 } from 'lucide-react'
import { ScreenContainer } from '../components/shared/ScreenContainer'
import { mulberry32 } from '../engine/rng'
import { cupRoundLabel } from '../data/cup'
import type { SaveState, MatchStats } from '../types/game'

async function shareNewspaper(data: {
  headline: string
  ourGoals: number
  theirGoals: number
  playerName: string
  rating: number
  result: 'win' | 'draw' | 'loss'
  date: string
}): Promise<void> {
  const canvas = document.createElement('canvas')
  canvas.width = 600
  canvas.height = 380
  const c = canvas.getContext('2d')
  if (!c) return

  const accent = data.result === 'win' ? '#22C55E' : data.result === 'draw' ? '#F0A830' : '#F43F5E'

  c.fillStyle = '#FFFDF5'
  c.fillRect(0, 0, 600, 380)

  c.fillStyle = '#1a1a1a'
  c.fillRect(0, 0, 600, 48)
  c.fillStyle = '#FFFDF5'
  c.font = 'bold 11px Georgia, serif'
  c.textAlign = 'center'
  c.letterSpacing = '4px'
  c.fillText('THE SUNDAY LEAGUE WEEKLY', 300, 22)
  c.font = '10px Georgia, serif'
  c.letterSpacing = '0px'
  c.fillStyle = 'rgba(255,255,255,0.6)'
  c.fillText(`Est. 1982 · Price 50p · ${data.date}`, 300, 38)

  c.fillStyle = accent
  c.fillRect(24, 60, 552, 80)
  c.fillStyle = data.result === 'draw' ? '#0C0C10' : '#fff'
  c.font = 'bold 64px sans-serif'
  c.textAlign = 'center'
  c.fillText(`${data.ourGoals}  :  ${data.theirGoals}`, 300, 122)

  c.fillStyle = '#1a1a1a'
  c.font = 'bold 18px Georgia, serif'
  c.textAlign = 'center'
  const words = data.headline.split(' ')
  let line = ''
  let y = 172
  for (const word of words) {
    const test = line ? `${line} ${word}` : word
    if (c.measureText(test).width > 540 && line) {
      c.fillText(line, 300, y)
      line = word
      y += 22
    } else {
      line = test
    }
  }
  if (line) c.fillText(line, 300, y)
  y += 28

  c.strokeStyle = '#ccc'
  c.lineWidth = 1
  c.beginPath()
  c.moveTo(24, y)
  c.lineTo(576, y)
  c.stroke()
  y += 18

  c.font = 'bold 13px Georgia, serif'
  c.textAlign = 'left'
  c.fillText('Player of the Match', 24, y)
  c.font = 'bold 36px sans-serif'
  c.fillText(`${data.rating}`, 24, y + 36)
  c.font = '13px Georgia, serif'
  c.fillStyle = '#555'
  c.fillText('/10', 54, y + 36)
  c.fillStyle = '#1a1a1a'
  c.font = 'bold 15px sans-serif'
  c.textAlign = 'right'
  c.fillText(data.playerName, 576, y + 36)

  c.fillStyle = '#555'
  c.font = '11px Georgia, serif'
  c.textAlign = 'center'
  c.fillText('Sunday League Legend · sunday-league-legend.app', 300, 362)

  const blob = await new Promise<Blob | null>(res => canvas.toBlob(res, 'image/png'))
  if (!blob) return

  const file = new File([blob], 'match-report.png', { type: 'image/png' })
  if (navigator.canShare?.({ files: [file] })) {
    await navigator.share({ files: [file], title: 'Sunday League Legend', text: data.headline })
  } else if (navigator.share) {
    await navigator.share({ title: 'Sunday League Legend', text: `${data.headline}\n${data.ourGoals} : ${data.theirGoals} · Rating ${data.rating}/10\n#SundayLeagueLegend` })
  } else {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'match-report.png'
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }
}

interface MatchReportProp {
  ourGoals: number
  theirGoals: number
  rating?: number
  stats?: MatchStats
  kind: 'league' | 'cup'
  cupRound?: 'quarter-final' | 'semi-final' | 'final'
  opponentName: string
  isNemesisRevenge?: boolean
  isNewNemesis?: boolean
  unlockedObjectives?: { title: string; rewardLabel: string }[]
  unlockedAchievements?: { emoji: string; title: string }[]
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

  const NEMESIS_REVENGE_HEADLINES = [
    `REVENGE IS SWEET: ${store.player.name.toUpperCase()} SINKS ${opponentName.toUpperCase()}`,
    `THE DOG BITES BACK: ${opponentName.toUpperCase()} FINALLY BEATEN`,
    `NEMESIS NO MORE: ${store.player.name.toUpperCase()} ENDS THE HOODOO`,
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
    const arr = matchReport.isNemesisRevenge ? NEMESIS_REVENGE_HEADLINES : (won ? WIN_HEADLINES : draw ? DRAW_HEADLINES : LOSS_HEADLINES)
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

          {/* Nemesis callout */}
          {matchReport.isNemesisRevenge && (
            <div style={{ border: '2px solid #166534', borderRadius: '6px', padding: '5px 8px', marginBottom: '10px', textAlign: 'center', fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: '11px', color: '#166534', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              ★ Nemesis Defeated ★
            </div>
          )}
          {matchReport.isNewNemesis && (
            <div style={{ border: '2px solid #b91c1c', borderRadius: '6px', padding: '5px 8px', marginBottom: '10px', textAlign: 'center', fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: '11px', color: '#b91c1c', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              ⚠ {opponentName}: Your New Nemesis
            </div>
          )}

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

          {/* Unlocked this match */}
          {((matchReport.unlockedObjectives?.length ?? 0) > 0 || (matchReport.unlockedAchievements?.length ?? 0) > 0) && (
            <div style={{ borderTop: '1px solid #ccc', paddingTop: '10px', marginTop: '14px' }}>
              <div style={{ fontFamily: 'Georgia, serif', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#555', marginBottom: '6px' }}>Late Flash</div>
              {matchReport.unlockedObjectives?.map((o, i) => (
                <div key={`obj-${i}`} style={{ fontFamily: 'Georgia, serif', fontSize: '12px', color: '#333', marginBottom: '4px' }}>★ {o.title} — {o.rewardLabel}</div>
              ))}
              {matchReport.unlockedAchievements?.map((a, i) => (
                <div key={`ach-${i}`} style={{ fontFamily: 'Georgia, serif', fontSize: '12px', color: '#333', marginBottom: '4px' }}>{a.emoji} {a.title}</div>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', gap: '8px', marginTop: '18px' }}>
            <button
              onClick={() => shareNewspaper({
                headline,
                ourGoals,
                theirGoals,
                playerName: store.player.name,
                rating,
                result: won ? 'win' : draw ? 'draw' : 'loss',
                date: new Date().toLocaleDateString('en-GB'),
              }).catch(() => {})}
              aria-label="Share match report"
              style={{ padding: '12px 14px', background: 'transparent', color: '#555', border: '1px solid #ccc', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, flexShrink: 0 }}
            >
              <Share2 size={14} />
              Share
            </button>
            <button
              onClick={onContinue}
              style={{ flex: 1, padding: '12px', background: '#1a1a1a', color: '#F5F0E6', border: 'none', borderRadius: '6px', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '14px', cursor: 'pointer', letterSpacing: '0.04em' }}
            >
              NEXT EDITION
            </button>
          </div>
        </div>
      </div>
    </ScreenContainer>
  )
}

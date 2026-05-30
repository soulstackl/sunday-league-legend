import { Trophy, Share2 } from 'lucide-react'
import { ScreenContainer } from '../components/shared/ScreenContainer'
import { Badge } from '../components/shared/Badge'
import { Card } from '../components/shared/Card'
import { buildStandings, ourLeaguePosition, resolvePromotionRelegation } from '../engine/league'
import { TIER_NAMES } from '../data/opponents'
import type { SaveState, Ending } from '../types/game'

async function shareSeasonWrap(data: {
  playerName: string
  season: number
  tierName: string
  position: number
  totalTeams: number
  goals: number
  wins: number
  draws: number
  losses: number
  cupWon: boolean
  movement: 'promoted' | 'relegated' | 'stayed'
  title: string
}): Promise<void> {
  const canvas = document.createElement('canvas')
  canvas.width = 540
  canvas.height = 640
  const c = canvas.getContext('2d')
  if (!c) return

  c.fillStyle = '#0C0C10'
  c.fillRect(0, 0, 540, 640)

  const grad = c.createLinearGradient(0, 0, 540, 640)
  grad.addColorStop(0, 'rgba(124,58,237,0.25)')
  grad.addColorStop(1, 'rgba(12,12,16,0)')
  c.fillStyle = grad
  c.fillRect(0, 0, 540, 640)

  c.fillStyle = 'rgba(255,255,255,0.06)'
  c.font = 'bold 11px sans-serif'
  c.textAlign = 'center'
  c.letterSpacing = '4px'
  c.fillText('SUNDAY LEAGUE LEGEND', 270, 40)

  c.fillStyle = '#7C3AED'
  c.font = 'bold 14px sans-serif'
  c.letterSpacing = '2px'
  c.fillText(`SEASON ${data.season} WRAPPED`, 270, 70)

  c.fillStyle = '#fff'
  c.font = 'bold 32px sans-serif'
  c.letterSpacing = '0px'
  c.fillText(data.playerName, 270, 115)

  c.fillStyle = 'rgba(255,255,255,0.45)'
  c.font = '14px sans-serif'
  c.fillText(`${data.tierName} · ${data.position}${['st','nd','rd'][data.position-1] ?? 'th'} of ${data.totalTeams}`, 270, 140)

  c.strokeStyle = 'rgba(124,58,237,0.4)'
  c.lineWidth = 1
  c.beginPath(); c.moveTo(60, 162); c.lineTo(480, 162); c.stroke()

  const stats = [
    { label: 'Goals', value: String(data.goals) },
    { label: 'Wins', value: String(data.wins) },
    { label: 'Draws', value: String(data.draws) },
    { label: 'Losses', value: String(data.losses) },
  ]
  stats.forEach((s, i) => {
    const col = i % 2
    const row = Math.floor(i / 2)
    const x = col === 0 ? 135 : 405
    const y = 210 + row * 110
    c.fillStyle = '#7C3AED'
    c.font = 'bold 52px sans-serif'
    c.textAlign = 'center'
    c.fillText(s.value, x, y)
    c.fillStyle = 'rgba(255,255,255,0.4)'
    c.font = '12px sans-serif'
    c.letterSpacing = '2px'
    c.fillText(s.label.toUpperCase(), x, y + 22)
    c.letterSpacing = '0px'
  })

  c.strokeStyle = 'rgba(124,58,237,0.4)'
  c.lineWidth = 1
  c.beginPath(); c.moveTo(60, 442); c.lineTo(480, 442); c.stroke()

  const movColour = data.movement === 'promoted' ? '#22C55E' : data.movement === 'relegated' ? '#F43F5E' : '#F0A830'
  const movLabel = data.movement === 'promoted' ? 'PROMOTED' : data.movement === 'relegated' ? 'RELEGATED' : 'HELD STEADY'
  c.fillStyle = movColour
  c.font = 'bold 18px sans-serif'
  c.letterSpacing = '2px'
  c.textAlign = 'center'
  c.fillText(movLabel, 270, 478)
  c.letterSpacing = '0px'

  if (data.cupWon) {
    c.fillStyle = '#F0A830'
    c.font = '28px sans-serif'
    c.fillText('🏆', 270, 520)
    c.fillStyle = 'rgba(240,168,48,0.8)'
    c.font = 'bold 13px sans-serif'
    c.fillText('TANKARD CHAMPIONS', 270, 546)
  } else {
    c.fillStyle = 'rgba(255,255,255,0.3)'
    c.font = 'italic 14px sans-serif'
    c.fillText(`"${data.title}"`, 270, 510)
  }

  c.fillStyle = 'rgba(255,255,255,0.15)'
  c.font = '11px sans-serif'
  c.textAlign = 'center'
  c.fillText('#SundayLeagueLegend', 270, 615)

  const blob = await new Promise<Blob | null>(res => canvas.toBlob(res, 'image/png'))
  if (!blob) return

  const file = new File([blob], 'season-wrapped.png', { type: 'image/png' })
  if (navigator.canShare?.({ files: [file] })) {
    await navigator.share({ files: [file], title: 'Sunday League Legend', text: `Season ${data.season} wrapped. ${data.goals} goals. ${movLabel.toLowerCase()}.` })
  } else if (navigator.share) {
    await navigator.share({ title: 'Sunday League Legend', text: `Season ${data.season}: ${data.goals} goals, ${movLabel.toLowerCase()}. #SundayLeagueLegend` })
  } else {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'season-wrapped.png'
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }
}

interface CompleteScreenProps {
  store: SaveState
  resolveEnding: () => Ending
  onHallOfFame: (title: string) => void
  onNextSeason: () => void
}

export function CompleteScreen({ store, resolveEnding, onHallOfFame, onNextSeason }: CompleteScreenProps) {
  const standings = buildStandings(store.season.aiTable, store.season.tier, store.season.results)
  const position = ourLeaguePosition(standings)
  const promo = resolvePromotionRelegation(position, standings.length, store.season.tier)
  const points = standings.find(r => r.isUs)?.points ?? 0
  const goals = store.season.results.reduce((acc, r) => acc + (r.stats?.goals ?? 0), 0)

  const ending = resolveEnding()
  const tierName = TIER_NAMES[store.season.tier]
  const nextTierName = TIER_NAMES[promo.newTier]

  const movementColour = promo.movement === 'promoted' ? 'var(--success)' : promo.movement === 'relegated' ? 'var(--danger)' : 'var(--accent)'
  const movementBg = promo.movement === 'promoted' ? 'var(--success-bg)' : promo.movement === 'relegated' ? 'var(--danger-bg)' : 'var(--accent-bg)'
  const movementBorder = promo.movement === 'promoted' ? 'rgba(34,197,94,0.25)' : promo.movement === 'relegated' ? 'rgba(244,63,94,0.25)' : 'rgba(240,168,48,0.25)'
  const movementLabel = promo.movement === 'promoted' ? `Promoted to ${nextTierName}` : promo.movement === 'relegated' ? `Relegated to ${nextTierName}` : `Holding in ${tierName}`

  return (
    <ScreenContainer style={{ textAlign: 'center' }}>
      <Badge size={88} />
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '26px', fontWeight: 700, color: 'var(--text)', margin: '14px 0 3px' }}>Season {store.season.number} Complete</h2>
      <div style={{ fontSize: '12px', color: 'var(--accent)', marginBottom: '16px', fontFamily: 'var(--font-mono)' }}>{tierName} · {position}{['st','nd','rd'][position-1] ?? 'th'} of {standings.length}</div>

      {/* Career title card */}
      <Card style={{ marginBottom: '12px', textAlign: 'left' }}>
        <div style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-faint)', fontWeight: 700, letterSpacing: '0.06em', marginBottom: '6px' }}>Career Title</div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700, color: 'var(--accent)', marginBottom: '6px' }}>{ending.title}</h1>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.5', fontStyle: 'italic' }}>"{ending.text}"</p>
      </Card>

      {/* Movement banner */}
      <div style={{ background: movementBg, border: `1px solid ${movementBorder}`, borderRadius: '12px', padding: '12px 16px', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
        <div style={{ fontWeight: 700, fontSize: '15px', color: movementColour, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{movementLabel}</div>
      </div>

      {/* Season summary */}
      <Card style={{ marginBottom: '20px', textAlign: 'left' }}>
        <div style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--accent)', fontWeight: 700, letterSpacing: '0.06em', fontFamily: 'var(--font-mono)', marginBottom: '10px' }}>Season Summary</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-muted)' }}>
          <div><span style={{ color: 'var(--text)', fontWeight: 700 }}>{points}</span> pts</div>
          <div><span style={{ color: 'var(--text)', fontWeight: 700 }}>{goals}</span> goals</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {store.season.cupWon ? (
              <><Trophy size={12} style={{ color: 'var(--kit-amber)' }} /><span style={{ color: 'var(--accent)', fontWeight: 700 }}>Tankard won</span></>
            ) : store.season.cupExited ? (
              <span>Cup: eliminated</span>
            ) : (
              <span>No cup run</span>
            )}
          </div>
          <div>Trust: <span style={{ color: 'var(--text)', fontWeight: 700 }}>{store.player.states.managerTrust}</span>/100</div>
        </div>
      </Card>

      <button
        onClick={() => shareSeasonWrap({
          playerName: store.player.name,
          season: store.season.number,
          tierName,
          position,
          totalTeams: standings.length,
          goals,
          wins: store.season.results.filter(r => r.ourGoals > r.theirGoals).length,
          draws: store.season.results.filter(r => r.ourGoals === r.theirGoals).length,
          losses: store.season.results.filter(r => r.ourGoals < r.theirGoals).length,
          cupWon: store.season.cupWon,
          movement: promo.movement,
          title: ending.title,
        }).catch(() => {})}
        style={{ width: '100%', padding: '12px', background: 'none', border: '1px solid var(--border)', color: 'var(--text-muted)', borderRadius: '12px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '10px', fontFamily: 'var(--font-ui)' }}
      >
        <Share2 size={14} />
        Share Season Card
      </button>

      <button
        className="sll-btn"
        onClick={() => onHallOfFame(ending.title)}
        style={{ marginBottom: '10px' }}
      >
        RETIRE TO HALL OF FAME
      </button>

      <button
        className="sll-btn sll-btn--secondary"
        onClick={onNextSeason}
      >
        PLAY SEASON {store.season.number + 1}
      </button>
    </ScreenContainer>
  )
}

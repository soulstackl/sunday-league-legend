import { lazy, Suspense, useMemo, useState } from 'react'
import { CalendarDays, Trophy } from 'lucide-react'
import { ScreenContainer } from '../components/shared/ScreenContainer'
import { Card } from '../components/shared/Card'
import { deepClone } from '../store/persistence'
import { initialSaveState } from '../store/initial-state'
import { getLeagueOpponents } from '../data/opponents'
import type { SaveState, MomentResult, MatchStats } from '../types/game'
import type { Fixture } from '../engine/schedule'

// Arena is heavy; share the same dynamically-imported chunk as the main match flow.
const ArenaScreen = lazy(() => import('./arena/index').then(m => ({ default: m.ArenaScreen })))

interface DailyChallengeScreenProps {
  store: SaveState
  onRecordResult: (date: string, score: number, goals: number) => void
  onBack: () => void
}

// Goal-grade outcomes are worth more than a plain successful moment.
const GOAL_OUTCOMES = new Set(['GOAL', 'TOP CORNER', 'CHIPPED HIM', 'TUCKED AWAY', 'BANGER'])
const SUCCESS_OUTCOMES = new Set(['SUCCESS', 'RECOVERY'])

function todayString(): string {
  return new Date().toISOString().slice(0, 10)
}

// Stable numeric seed from a YYYY-MM-DD string so every device gets the same daily puzzle.
function seedFromDate(d: string): number {
  let h = 2166136261
  for (let i = 0; i < d.length; i++) {
    h ^= d.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function scoreResults(results: MomentResult[], stats: MatchStats): { score: number; goals: number } {
  const goals = stats.goals
  const successes = results.filter(r => SUCCESS_OUTCOMES.has(r.outcome) || GOAL_OUTCOMES.has(r.outcome)).length
  return { score: goals * 5 + successes, goals }
}

export function DailyChallengeScreen({ store, onRecordResult, onBack }: DailyChallengeScreenProps) {
  const date = todayString()
  const seed = useMemo(() => seedFromDate(date), [date])

  const [phase, setPhase] = useState<'intro' | 'playing' | 'result'>('intro')
  const [lastScore, setLastScore] = useState<number | null>(null)

  // A fixed, fair profile so the daily score reflects play, not career progress.
  const challengeOpponent = useMemo(() => {
    const pool = getLeagueOpponents(2)
    return pool[seed % pool.length]
  }, [seed])

  const challengeStore = useMemo<SaveState>(() => {
    const s = deepClone(initialSaveState)
    s.player.name = 'Challenger'
    s.player.archetype = 'unit'
    s.player.stats = { touch: 12, strike: 12, pass: 12, engine: 12, graft: 12, head: 12, pace: 12, vibes: 12 }
    s.seed = seed
    s.season.number = 1
    s.season.tier = 2
    s.season.week = 1
    // Keep the player's comfort/accessibility prefs, but fix difficulty for fair scoring
    // and skip the tutorial.
    s.settings = { ...s.settings, ...store.settings, difficulty: 'normal', tutorialSeen: true }
    return s
  }, [seed, store.settings])

  const fixture: Fixture = useMemo(() => ({
    week: 1,
    kind: 'league',
    opponent: challengeOpponent,
    leagueIndex: 0,
  }), [challengeOpponent])

  const todaysHistory = store.dailyChallenge?.history ?? []
  const todaysBest = todaysHistory.filter(h => h.date === date).reduce((acc, h) => Math.max(acc, h.score), 0)
  const recent = [...todaysHistory].reverse().slice(0, 5)

  const handleComplete = (results: MomentResult[], stats: MatchStats) => {
    const { score, goals } = scoreResults(results, stats)
    setLastScore(score)
    onRecordResult(date, score, goals)
    setPhase('result')
  }

  if (phase === 'playing') {
    return (
      <Suspense fallback={<div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100dvh', color: 'var(--text-muted)' }}>Loading challenge&hellip;</div>}>
        <ArenaScreen
          store={challengeStore}
          fixture={fixture}
          activeCards={[]}
          onCompleteMatch={handleComplete}
        />
      </Suspense>
    )
  }

  const playedToday = todaysHistory.some(h => h.date === date)
  const improved = phase === 'result' && lastScore !== null && lastScore >= todaysBest

  return (
    <ScreenContainer style={{ background: 'var(--bg)', overflowY: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 700, color: 'var(--text)' }}>Daily Challenge</h2>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '14px', cursor: 'pointer', fontWeight: 600, padding: '6px', fontFamily: 'var(--font-ui)' }}>Done</button>
      </div>

      <Card style={{ marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--accent)' }}>
          <CalendarDays size={16} />
          <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', letterSpacing: '0.04em' }}>{date}</span>
        </div>
        <div style={{ fontSize: '14px', color: 'var(--text)', fontWeight: 600, marginBottom: '4px' }}>One match. Same for everyone today.</div>
        <div style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
          You are the Challenger away to <strong style={{ color: 'var(--text)' }}>{challengeOpponent.name}</strong>. Score 5 points per goal, 1 per moment won. Beat your best.
        </div>
      </Card>

      {phase === 'result' && lastScore !== null && (
        <Card style={{ marginBottom: '12px', textAlign: 'center' }}>
          <div style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-faint)', fontWeight: 700, letterSpacing: '0.06em', marginBottom: '4px' }}>{improved ? 'New Best Today!' : 'Your Score'}</div>
          <div style={{ fontSize: '44px', fontWeight: 700, fontFamily: 'var(--font-display)', color: improved ? 'var(--success)' : 'var(--accent)', lineHeight: 1 }}>{lastScore}</div>
        </Card>
      )}

      <Card style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
            <Trophy size={16} style={{ color: 'var(--kit-amber)' }} />
            <span style={{ fontSize: '13px' }}>Best today</span>
          </div>
          <div style={{ fontSize: '20px', fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--text)' }}>{todaysBest}</div>
        </div>
        {recent.length > 0 && (
          <div style={{ marginTop: '12px', borderTop: '1px solid var(--border-subtle)', paddingTop: '10px' }}>
            <div style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-faint)', fontWeight: 700, letterSpacing: '0.06em', marginBottom: '8px' }}>Recent Days</div>
            {recent.map((h, i) => (
              <div key={`${h.date}-${i}`} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontFamily: 'var(--font-mono)', color: h.date === date ? 'var(--accent)' : 'var(--text-muted)', padding: '2px 0' }}>
                <span>{h.date}</span>
                <span style={{ fontWeight: 700 }}>{h.score} pts · {h.goals}g</span>
              </div>
            ))}
          </div>
        )}
      </Card>

      <button className="sll-btn" onClick={() => setPhase('playing')} style={{ marginBottom: '10px' }}>
        {playedToday ? 'PLAY AGAIN' : 'PLAY TODAY’S CHALLENGE'}
      </button>
    </ScreenContainer>
  )
}

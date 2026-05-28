import { useState, useEffect, useRef } from 'react'
import { Card } from '../shared/Card'

interface VoteOption {
  id: string
  name: string
}

interface Props {
  options: VoteOption[]
  onVoteComplete: (winnerId: string) => void
}

export function DiscordVotePanel({ options, onVoteComplete }: Props) {
  const [votes, setVotes] = useState<Record<string, number>>({})
  const [timeLeft, setTimeLeft] = useState(15)

  const votesRef = useRef(votes)
  const optionsRef = useRef(options)
  const onVoteCompleteRef = useRef(onVoteComplete)
  useEffect(() => {
    votesRef.current = votes
    optionsRef.current = options
    onVoteCompleteRef.current = onVoteComplete
  })

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timer)
          const winner =
            Object.entries(votesRef.current).sort((a, b) => b[1] - a[1])[0]?.[0] ??
            optionsRef.current[0].id
          onVoteCompleteRef.current(winner)
          return 0
        }
        if (Math.random() > 0.7) {
          const randomOpt =
            optionsRef.current[Math.floor(Math.random() * optionsRef.current.length)].id
          setVotes(v => ({ ...v, [randomOpt]: (v[randomOpt] ?? 0) + 1 }))
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <Card style={{ background: 'var(--surface)', border: '1px solid var(--accent-bg-strong)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Audience Voting</span>
        <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{timeLeft}s</span>
      </div>
      <div style={{ height: '3px', background: 'var(--surface-raised)', borderRadius: '2px', marginBottom: '14px', overflow: 'hidden' }}>
        <div style={{ width: `${(timeLeft / 15) * 100}%`, height: '100%', background: 'var(--accent)', transition: 'width 1s linear', borderRadius: '2px' }} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {options.slice(0, 3).map(opt => (
          <div key={opt.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
            <span style={{ color: 'var(--text)' }}>{opt.name}</span>
            <span style={{ fontWeight: 700, color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>{votes[opt.id] ?? 0}</span>
          </div>
        ))}
      </div>
    </Card>
  )
}

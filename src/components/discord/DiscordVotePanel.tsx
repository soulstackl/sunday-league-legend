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

  // Refs keep the interval closure up-to-date without restarting the timer.
  // Updated after every render (not during render , React 19 refs rule).
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
    <Card style={{ background: 'var(--charcoal)', color: 'var(--cream)', border: '2px solid var(--kit-amber)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--kit-amber)' }}>AUDIENCE VOTING</span>
        <span style={{ fontSize: '11px', fontWeight: 'bold' }}>{timeLeft}s LEFT</span>
      </div>
      <div style={{ height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', marginBottom: '12px', overflow: 'hidden' }}>
        <div style={{ width: `${(timeLeft / 15) * 100}%`, height: '100%', background: 'var(--kit-amber)', transition: 'width 1s linear' }} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {options.slice(0, 3).map(opt => (
          <div key={opt.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
            <span>{opt.name}</span>
            <span style={{ fontWeight: 'bold' }}>{votes[opt.id] ?? 0} votes</span>
          </div>
        ))}
      </div>
    </Card>
  )
}

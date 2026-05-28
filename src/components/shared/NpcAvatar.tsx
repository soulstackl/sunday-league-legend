import React from 'react'
import { NPCS } from '../../data/npcs'

interface Props {
  npcId: string
  size?: number
}

export function NpcAvatar({ npcId, size = 44 }: Props) {
  const npc = NPCS[npcId] ?? { bg: '#78716C', avatar: 'M 30,50 L 70,50' }
  const hash = npcId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const rotation = hash % 360
  const strokeWidth = 4 + (hash % 6)

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      style={{
        borderRadius: '50%',
        background: npc.bg,
        border: '2px solid var(--border)',
        transform: `rotate(${rotation}deg)`,
      }}
    >
      <path d={npc.avatar} fill="none" stroke="#FFFFFF" strokeWidth={strokeWidth} strokeLinecap="round" />
      {hash % 2 === 0 && <circle cx="50" cy="50" r="10" fill="rgba(255,255,255,0.2)" />}
    </svg>
  )
}

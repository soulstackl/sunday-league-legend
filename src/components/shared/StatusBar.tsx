import React from 'react'

interface Props {
  label: string
  value: number
  max?: number
  colour?: string
}

export function StatusBar({ label, value, max = 100, colour = 'var(--kit-amber)' }: Props) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100))
  return (
    <div style={{ marginBottom: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 'bold', marginBottom: '2px', fontFamily: 'var(--font-mono)' }}>
        <span>{label}</span>
        <span>{Math.round(value)}/{max}</span>
      </div>
      <div style={{ width: '100%', height: '8px', background: 'var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
        <div style={{ width: `${percentage}%`, height: '100%', background: colour, transition: 'width 0.4s ease' }} />
      </div>
    </div>
  )
}

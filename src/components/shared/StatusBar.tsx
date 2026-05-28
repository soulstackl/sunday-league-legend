
interface Props {
  label: string
  value: number
  max?: number
  colour?: string
}

export function StatusBar({ label, value, max = 100, colour = 'var(--accent)' }: Props) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100))
  return (
    <div style={{ marginBottom: '10px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 700, marginBottom: '4px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', letterSpacing: '0.04em' }}>
        <span style={{ textTransform: 'uppercase' }}>{label}</span>
        <span style={{ color: 'var(--text)' }}>{Math.round(value)}</span>
      </div>
      <div style={{ width: '100%', height: '5px', background: 'var(--surface-raised)', borderRadius: '3px', overflow: 'hidden' }}>
        <div style={{ width: `${percentage}%`, height: '100%', background: colour, borderRadius: '3px', transition: 'width 0.4s ease' }} />
      </div>
    </div>
  )
}

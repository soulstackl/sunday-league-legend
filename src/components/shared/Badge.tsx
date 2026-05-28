
interface Props {
  size?: number
}

export function Badge({ size = 60 }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ filter: 'drop-shadow(0px 3px 3px rgba(0,0,0,0.15))' }}>
      <path d="M 10,10 L 90,10 L 80,70 L 50,95 L 20,70 Z" fill="var(--kit-amber)" stroke="var(--charcoal)" strokeWidth="6" />
      <path d="M 20,17 L 80,17 L 72,65 L 50,85 L 28,65 Z" fill="var(--charcoal)" />
      <circle cx="50" cy="45" r="16" fill="var(--kit-amber)" />
      <text x="50" y="52" fill="var(--charcoal)" fontSize="20" fontWeight="bold" textAnchor="middle" fontFamily="var(--font-primary)">D</text>
    </svg>
  )
}

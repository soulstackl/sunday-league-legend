
interface Props {
  children: React.ReactNode
  style?: React.CSSProperties
}

export function ScreenContainer({ children, style }: Props) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '16px', animation: 'fadeIn 0.3s ease-out', overflowY: 'auto', ...style }}>
      {children}
    </div>
  )
}

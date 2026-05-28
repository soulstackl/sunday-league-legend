import { useState } from 'react'
import { Sun, Moon } from 'lucide-react'
import { getTheme, toggleTheme, type Theme } from '../../utils/theme'

interface Props {
  style?: React.CSSProperties
}

export function ThemeToggle({ style }: Props) {
  const [theme, setTheme] = useState<Theme>(getTheme)

  const handleToggle = () => {
    const next = toggleTheme()
    setTheme(next)
  }

  return (
    <button
      onClick={handleToggle}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '36px',
        height: '36px',
        borderRadius: '50%',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        color: 'var(--text-muted)',
        cursor: 'pointer',
        transition: 'background 0.2s, color 0.2s, border-color 0.2s',
        flexShrink: 0,
        ...style,
      }}
    >
      {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
    </button>
  )
}

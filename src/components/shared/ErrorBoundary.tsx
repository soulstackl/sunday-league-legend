import { Component, type ErrorInfo, type ReactNode } from 'react'
import { captureException } from '../../lib/errorTracking'
import { SAVE_KEY, LEGACY_KEYS } from '../../store/initial-state'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    captureException(error, { componentStack: info.componentStack ?? undefined })
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div style={{
          maxWidth: '430px', margin: '0 auto', minHeight: '100dvh',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', padding: '32px 24px',
          background: 'var(--bg)', color: 'var(--text)', textAlign: 'center',
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚽</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 700, marginBottom: '10px', color: 'var(--text)' }}>
            The Dog &amp; Duck Have A Problem
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '28px', lineHeight: '1.5' }}>
            Something went wrong during the match. Your save is safe in local storage.
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            style={{
              padding: '14px 28px', background: 'var(--btn-bg)', color: 'var(--btn-text)',
              border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: 700,
              cursor: 'pointer', marginBottom: '12px', width: '100%',
            }}
          >
            TRY AGAIN
          </button>
          <button
            onClick={() => {
              try { [SAVE_KEY, ...LEGACY_KEYS].forEach(k => localStorage.removeItem(k)) } catch { /* storage unavailable */ }
              window.location.reload()
            }}
            style={{
              padding: '12px 28px', background: 'none', color: 'var(--text-muted)',
              border: '1px solid var(--border)', borderRadius: '12px', fontSize: '13px',
              cursor: 'pointer', width: '100%',
            }}
          >
            Reset &amp; Start Fresh
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

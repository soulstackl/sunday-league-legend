// Error tracking integration point.
// Wire up a real provider (e.g. Sentry) by replacing the stubs below.
//
// To enable Sentry:
//   npm install @sentry/react
//   Replace captureException with Sentry.captureException
//   Call Sentry.init({ dsn: '...' }) before createRoot in main.tsx

export function captureException(error: Error, context?: Record<string, unknown>): void {
  if (import.meta.env.DEV) {
    console.error('[error tracking]', error, context)
  }
  // Sentry.captureException(error, { extra: context })
}

export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info'): void {
  if (import.meta.env.DEV) {
    console.warn(`[error tracking] ${level}:`, message)
  }
  // Sentry.captureMessage(message, level)
}

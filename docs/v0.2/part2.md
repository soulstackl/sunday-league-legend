# Part 2: Production Readiness Gaps

Changes required to bring Sunday League Legend to consumer-grade production quality. Ordered by priority.

---

## Must Fix Before Launch

### 1. No React Error Boundary
Any unhandled render error causes a blank white screen with no recovery path. Wrap the screen router in an `<ErrorBoundary>` component that renders a fallback UI with a "Restart" action.

---

### 2. Platform adapter init has no error handler
`platformAdapter.init().then(...)` has no `.catch()`. A rejection (e.g. Discord SDK unavailable) causes an unhandled promise rejection that can break app initialisation entirely. Add `.catch()` or wrap in `try/catch`.

**File:** `src/App.tsx:119`

---

### 3. Save failures are invisible to the user
`QuotaExceededError` (storage full) is caught and logged, but the player sees nothing. Add an in-game notification: "Your progress could not be saved. Check your device storage." This is the difference between a player losing hours of progress silently and them knowing to act.

**File:** `src/store/persistence.ts`

---

## Should Fix

### 4. No error tracking
Production issues are invisible until users report them. Integrate Sentry (or equivalent) so crashes and unhandled rejections surface automatically.

---

### 5. No PWA manifest or service worker
Players cannot install the game to their home screen. Add `public/manifest.json` with app name, icons, and theme colour. Add a basic service worker for asset caching. The game already works offline via localStorage — this just exposes that capability to the OS.

---

### 6. Missing favicon, OG tags, and description meta
`index.html` has no favicon, no Open Graph tags, and no description meta tag. First-impression quality issue affecting links shared in Discord, iMessage, and social platforms.

---

### 7. `console.log` left in production code
`src/platform/standalone.ts:20` emits to the console unconditionally. Remove or gate behind a `DEBUG` environment variable.

---

### 8. No security headers documented or configured
CSP, `X-Frame-Options`, and `X-Content-Type-Options` headers should be set at the hosting layer. These need to be documented in a deployment guide and verified in the production environment.

---

## Could Fix

### 9. TypeScript strict unused checks disabled
`noUnusedLocals` and `noUnusedParameters` are both `false` in `tsconfig.json`. Enabling them catches real latent bugs at zero runtime cost.

---

### 10. No Lighthouse or Core Web Vitals baseline
Run Lighthouse once and document the scores as a regression baseline. Bundle size is already reasonable (102 kB gzipped) but performance, accessibility, and best-practices scores should be tracked.

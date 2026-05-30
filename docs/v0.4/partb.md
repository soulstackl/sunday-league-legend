# Part B: Production Readiness

> **v0.4 status.** App-facing items are **implemented**: B6 (safe-area + `viewport-fit`), B7 (focus-visible), B8 (save export/import), B9 (pinch-zoom restored), B10 (arena code-split into its own chunk), B12 (OS reduced-motion seeding), B13 (aria-live toast, 44px small button, contrast), B14 (privacy/storage notice). Infrastructure/ops items are **deferred pending a hosting decision (GCP/Firebase under consideration)** and were intentionally NOT touched: B1 (Amplify config), B2 (service worker), B3 (error tracking + sourcemaps), B4 (CI), B5 (UI test tooling), B11 (icons/og-image/version stamp), B15 (package version + Discord dep — the Discord SDK stays, as a Discord Activity is on the roadmap).


Gaps between the current build and a consumer-grade production release. The app is technically deployable (clean build, clean `npm audit`, a real ErrorBoundary, a manifest and service worker), but several items below would bite real users on a public launch. Each item cites a file or marks it absent. Severity is judged for a consumer launch, not for internal testing.

---

## Critical for launch

### B1. Deploy headers and SPA rewrite target the wrong platform
**Files:** `public/_headers` (Netlify/Cloudflare format), `vercel.json` (Vercel format); deploy target is AWS Amplify

Amplify honours neither file, so the CSP and security headers and the SPA `/* -> /index.html` rewrite are almost certainly not applied in production. Deep links and refreshes can 404, and the intended security headers are absent.

**Fix:** commit an `amplify.yml` with `customHeaders` and the SPA redirect, porting the rules from `_headers` / `vercel.json`. Remove the platform files that do not apply, or keep one as the single source and generate the others.

### B2. Service worker serves stale builds indefinitely
**File:** `public/sw.js`

The worker precaches `/` and uses cache-first for all GETs with a static cache name `sll-v1`. After any deploy, returning users keep the cached `index.html` and its old hashed JS, with no invalidation unless the constant is bumped by hand.

**Fix:** use network-first (or stale-while-revalidate) for navigation/HTML, and auto-version the cache name with the build hash so a deploy invalidates old assets.

---

## High

### B3. No real error tracking and no source maps
**Files:** `src/lib/errorTracking.ts` (DEV-only console stub), `vite.config.ts` (bare, no `sourcemap`)

Production crashes are invisible and, if captured, unreadable (minified). There is also no `window` `error` / `unhandledrejection` handler, so async and canvas-loop errors bypass the ErrorBoundary entirely.

**Fix:** wire a real provider (e.g. Sentry) behind an env-gated DSN, set `build.sourcemap: 'hidden'`, and add global error handlers in `src/main.tsx` routing to `captureException`.

### B4. No CI; the deploy gate is manual only
**Files:** absent `.github/workflows`, `scripts/deploy.sh`

`scripts/deploy.sh` (typecheck -> lint -> build -> audit) is run by hand; Amplify deploys whatever lands on `main`, so a broken build can ship.

**Fix:** add a GitHub Actions workflow running typecheck, lint, test and build on PRs to `main`.

### B5. No UI, integration or e2e tests
**Files:** `src/engine/__tests__/` only

All nine test files are engine units; there are no `.test.tsx` and no jsdom/vitest test environment. The 20 screens, the `App.tsx` state machine, persistence-in-UI and arena interaction are untested.

**Fix:** add a vitest jsdom config plus `@testing-library/react`, and write smoke tests for screen rendering and the core game-flow transitions.

### B6. No safe-area-inset handling on a mobile-first app
**Files:** `index.html` (viewport), `src/App.tsx` (app shell, fixed toast)

There is no `viewport-fit=cover` and no `env(safe-area-inset-*)` anywhere. The fixed toast (`bottom: 20px`) and the app shell collide with the notch and home indicator on modern phones.

**Fix:** add `viewport-fit=cover` to the viewport meta and apply `env(safe-area-inset-*)` padding to the app shell and fixed elements.

### B7. No visible keyboard focus indicator
**Files:** `src/styles/global.css`, `src/styles/tokens.css`

The primary control `.sll-btn` (used ~49 times) has only `:hover` / `:active` styling, and the global reset strips outlines, so keyboard users get no focus indicator.

**Fix:** add a `:focus-visible` ring to buttons and interactive elements.

---

## Medium / Low

### B8. localStorage is the sole persistence with no backup
**File:** `src/store/persistence.ts`

A cleared browser, private mode or storage eviction wipes the entire career. There is no export/import.

**Fix:** add save export/import (download or copy a share code). See Part C, C1.

### B9. Viewport blocks pinch-zoom
**File:** `index.html:5`

`maximum-scale=1.0, user-scalable=no` blocks zoom, an accessibility anti-pattern.

**Fix:** drop `maximum-scale` and `user-scalable=no`.

### B10. No code splitting
**Files:** `vite.config.ts`, `src/App.tsx`

The 1,574-line arena ships in the initial bundle even though the player does not reach a match immediately.

**Fix:** `React.lazy` the arena screen at minimum; consider a vendor chunk split.

### B11. Icons and share images are SVG-only
**Files:** `public/manifest.json`, `index.html` (OG image)

A single SVG icon produces poor or blank install icons on Android/iOS and SVG OG images do not unfurl on Discord/Slack/iMessage.

**Fix:** add 192/512 maskable PNG icons and a 1200x630 `og-image.png`.

### B12. OS reduced-motion preference is not seeded
**Files:** `src/store/initial-state.ts:49`, arena canvas effects

The canvas screen-shake and hit-stop default on even when the OS requests reduced motion (CSS respects it, the canvas does not).

**Fix:** seed `reducedMotion` from `matchMedia('(prefers-reduced-motion: reduce)')` on new careers.

### B13. Screen-reader and contrast gaps
**Files:** `src/App.tsx` (toast), `src/styles/global.css`, `src/styles/tokens.css`

The toast (including "Save failed") has no `role="status"` / `aria-live`. `.sll-btn--small` is 40px, below the 44px minimum in CLAUDE.md. `--text-faint` is roughly 2.5:1 contrast, below WCAG AA.

**Fix:** add `aria-live` to the toast, raise the small button to 44px, lift faint-text opacity.

### B14. No privacy or storage notice; third-party fonts
**Files:** `index.html` (Google Fonts), absent privacy notice

The app stores career data locally and loads fonts from Google (transmitting IP), a UK/EU consumer consideration.

**Fix:** add a short privacy/storage notice and consider self-hosting fonts (also tightens CSP).

### B15. Stale metadata and an unused dependency
**Files:** `package.json:3` (version `0.1.0`), `CLAUDE.md` (says save key `sll_save_v3`, code is `sll_save_v4`), `@discord/embedded-app-sdk` (never imported)

**Fix:** bump the app version and surface a build id, correct the CLAUDE.md save-key reference, and remove the unused Discord dependency until the adapter is real.

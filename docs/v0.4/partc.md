# Part C: Feature Opportunities

> **v0.4 status: all implemented.** C1 save export/import (Settings), C2 lifetime career dashboard (new Career screen) plus the existing season recap, C3 shareable cards (match report + season card, already present), C4 first-match tutorial (now sourced from `settings.tutorialSeen` and mode-aware), C5 difficulty settings + tap-to-aim arena input, C6 daily seeded challenge with a local history/leaderboard. Save schema bumped to v5 with migration.


High-value, low-complexity features that would meaningfully raise user satisfaction without adding significant systems complexity. Each reuses data and rendering that already exist in the codebase, so the cost is mostly presentation and wiring rather than new simulation.

---

## C1. Save export / import (cloud-free backup)

**Value:** high. **Complexity:** low.

A one-tap "Export career" (download a file or copy a share code) and "Import" on the Settings or Title screen. The whole `SaveState` is already serialised for `localStorage`, so this is a thin layer on top: stringify to a Blob/clipboard for export, parse and run through the existing `migrate()` for import.

This is the single biggest insurance against catastrophic career loss (a cleared browser or private mode wipes everything today, see Part B, B8) and unblocks moving a career between devices with no backend.

**Touch points:** `src/store/persistence.ts` (export/import helpers reusing `migrate`), `src/screens/SettingsScreen.tsx` (buttons), `src/App.tsx` (apply imported state).

---

## C2. Career and season-review summary

**Value:** high. **Complexity:** low.

An end-of-season recap (goals, appearances, trophies, league finish, standout moment) and a lifetime career dashboard. The data already lives in `careerEvents`, `season.results` and `hallOfFame`; this is aggregation and presentation, not new simulation. It is what turns a run of matches into a story the player wants to continue.

**Touch points:** `src/screens/CompleteScreen.tsx` (season recap block), a new lifetime view reachable from the hub or Hall of Fame, both reading existing state.

---

## C3. Shareable moment cards (Discord-native)

**Value:** high. **Complexity:** low-medium.

Render a standout goal or a season summary to a canvas, then let the player share it as an image or text. The post-match newspaper already renders to canvas (`shareNewspaper`), so a "share" affordance reuses that pipeline. Given the Discord platform target, a built-in share is a cheap virality lever.

**Touch points:** `src/screens/PostMatchScreen.tsx` (existing canvas render), a share helper in the platform adapter.

---

## C4. Guided first-match tutorial

**Value:** high (retention). **Complexity:** low.

A one-time interactive drag-and-release walkthrough before the first real moment. The drag mechanic is the whole game and currently has no onboarding, so new players who do not grasp it churn immediately. A short coached sequence (aim here, release now) with a skip option closes that gap.

**Touch points:** `src/screens/arena/index.tsx` (a tutorial scenario flag), a one-time `tutorialSeen` flag in settings, gated on the first match of a new career.

---

## C5. Difficulty settings and an accessible arena input mode

**Value:** high (audience breadth). **Complexity:** low-medium.

Easy / Normal / Hard presets that scale the existing stat and chaos modifiers, plus a tap-to-aim alternative to drag-and-release. The difficulty scaling reuses modifiers the engine already applies; the input mode gives the pointer-only arena a non-drag fallback that also helps the accessibility gap in Part B (B7).

**Touch points:** `src/store/initial-state.ts` and settings (difficulty + input mode), `src/engine/match.ts` and arena resolution (apply the multiplier), `src/screens/arena/index.tsx` (tap-to-aim path).

---

## C6. Daily / seeded challenge with a local leaderboard

**Value:** medium-high (replayability). **Complexity:** low.

Because the engine is deterministic from a seed, a "scenario of the day" (fixed date-derived seed, score chase, best score persisted locally) adds replayability for near-zero new systems: a seeded run plus a stored high score. It also gives lapsed players a reason to return daily.

**Touch points:** a date-seeded entry point (reusing `mulberry32` and the arena), a small `dailyBest` field in settings, a compact leaderboard/best-score view. Note this depends on the deterministic-RNG fix in Part A (A18) so the daily seed is reproducible.

---

## Sequencing note

C1 and C4 are the highest value-to-effort items and are good first deliverables: C1 protects existing players from data loss, C4 protects new players from bouncing off the core mechanic. C6 should follow the Part A A18 fix so daily seeds are genuinely reproducible.

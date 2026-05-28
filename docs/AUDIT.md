# Sunday League Legend , Codebase Audit

**Date:** 28 May 2026
**Architecture:** Vite + React 19 + TypeScript, modular source structure
**Status:** Consumer-ready vertical slice. Cup, multi-tier league with promotion/relegation, NPC subplots, stat growth, accessibility, and full UK English audit all complete.

---

## 1. Requirements coverage

| Requirement | Status | Notes |
| --- | --- | --- |
| Career creation | DONE | Name, archetype, job with stat modifiers; saved at every step |
| Archetypes | DONE | Unit, Winger, Midfield Organiser (3 with traits) |
| Player stats | DONE | Touch, Strike, Pass, Engine, Graft, Head, Pace, Vibes (8) |
| Player states | DONE | Form, Fitness, Fatigue, Confidence, Injury Risk, Manager Trust, Team Chemistry, Local Fame, Referee Rep (9) |
| Club | DONE | Dog & Duck FC, with full intro and identity |
| NPC squad | DONE | 10 named NPCs, including referee Clive, all with relationship tracking |
| Match moments | DONE | 8 moment types: Shot, Pass, First Touch, Tackle, Header, Penalty, Free Kick, Corner |
| Moment resolution | DONE | Stat-driven, input-driven, chaos-modifier-driven, deterministic RNG |
| Match result | DONE | Poisson-driven simulation with team strength, chaos and player contribution |
| Chaos cards | DONE | 34 cards, 8 categories, 4 with interactive choices |
| Group chat | DONE | Templates plus branching choices, NPC tone keyed off relationships |
| Post-match updates | DONE | Stats, relationships, manager trust, vibes, fame, form, fatigue |
| League table | DONE | Full W/D/L/GF/GA/GD/Pts, deterministic AI sim each week, three tiers |
| Cup competition | DONE | Tankard QF (week 4), SF (week 8), Final (week 15) |
| Hall of Fame | DONE | Persistent across careers, shows tier, cup, points, goals, seasons |
| Save/Resume | DONE | localStorage v3 with v1 and v2 migrations |
| Mobile responsive | DONE | 360px+ portrait, tablet, desktop |
| Discord adapter | DONE (UI) | Platform detection, voting UI; full SDK integration is post-MVP |
| Promotion/relegation | DONE | Top 2 promote, bottom 2 relegate, tier follows career |
| Stat growth | DONE | Pre-season choice between three offers (weakness, mid-tier, archetype) |
| Subplots | DONE | 4 NPC arcs (Pete retirement, Taz knee, Callum trial, Gary confidence) |
| Settings | DONE | Reduced motion, sound, text size, input sensitivity, delete career confirm |
| Squad roster | DONE | Dedicated screen with relationship bands and strengths/flaws |

---

## 2. Architecture

### Layers

- `src/types/game.ts` , single source of truth for all shared types
- `src/engine/` , pure logic modules:
  - `rng.ts` , mulberry32 and poissonSample
  - `match.ts` , simulateMatch and calculateTeamStrength
  - `chaos.ts` , card-driven modifier resolution
  - `schedule.ts` , fixture lookup per week (league/cup) per tier
  - `league.ts` , initial table, AI advancement, standings build, promotion logic
  - `endings.ts` , career-ending resolution driven by season summary
- `src/data/` , static content:
  - `archetypes.ts`, `jobs.ts`, `npcs.ts`, `chaos-cards.ts`, `midweek-actions.ts`, `opponents.ts` (three tiers), `cup.ts`, `endings.ts`, `subplots.ts`, `message-templates.ts`
- `src/store/` , persistence and initial state
- `src/platform/` , adapter pattern (standalone is the active adapter)
- `src/audio/AudioManager.ts` , procedural Web Audio
- `src/screens/` , one screen per file plus the canvas-heavy `arena/index.tsx`
- `src/components/shared/` and `chat/` and `discord/` , reusable primitives

### State and persistence

- All state held in one `SaveState` object, mutated via `updateStore(updater)` which deep-clones, runs the updater, then persists to localStorage and shows a Saved toast.
- Save key is `sll_save_v3`; older `_v2` and `_v1` keys are migrated on first load and then removed.

### React rules

- Function components, no class components.
- No prop drilling, no context providers. `App.tsx` owns state and passes the relevant slices to screens.
- React 19 jsx-runtime means no `import React` in component files.

---

## 3. UK English and content notes

- Full audit complete: colour, behaviour, organise, defence, centre, favourite, etc.
- No em-dash or en-dash characters anywhere in source, content or docs.
- All match commentary, chat lines, and post-match copy uses British vernacular.

---

## 4. Accessibility

- Reduced motion respected via `@media (prefers-reduced-motion: reduce)` and the explicit Settings toggle.
- Text size setting changes root font size at 14/16/18px.
- Input sensitivity setting scales drag accuracy in the arena.
- Tap targets minimum 44x44.
- No hover-only interactions.
- ARIA labels on all interactive controls.
- Visual equivalents for every audio cue (screen shake, particle FX, banner overlays).

---

## 5. Known limitations

- Discord Activity integration is detection and voting UI only. Full SDK init, tunnelling, session persistence and live spectator voting are post-MVP.
- Cloud saves not implemented. localStorage only.
- No unit tests yet; engine modules are pure functions so this is the natural next step.

---

## 6. Build pipeline

- `npm run typecheck` , `tsc --noEmit`, no errors
- `npm run lint` , ESLint with `--max-warnings 0`, no warnings
- `npm run build` , Vite production build (334 kB JS, 102 kB gzipped)
- `npm run deploy:check` , runs the whole chain plus `npm audit`

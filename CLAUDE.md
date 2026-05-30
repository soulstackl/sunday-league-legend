# CLAUDE.md

Project guidance for Claude Code working in this repository.

## Project

Sunday League Legend is a mobile-first football life RPG built as a single-page Vite + React 19 + TypeScript application. The game loop covers career creation, weekly midweek choices, chaos card events, drag-and-release match moments rendered on a canvas, a post-match newspaper, league table, cup competition, multi-season progression with promotion/relegation, and a Hall of Fame.

## Quick reference

| Layer | Location |
| ----- | -------- |
| App orchestrator | `src/App.tsx` |
| Game engine (pure logic) | `src/engine/` |
| Static game content | `src/data/` |
| Save state and persistence | `src/store/` |
| Platform adapter (Discord/standalone) | `src/platform/` |
| Audio (procedural Web Audio) | `src/audio/AudioManager.ts` |
| Screen components | `src/screens/` |
| Shared UI primitives | `src/components/shared/` |
| Styles | `src/styles/` |

## Build commands

- `npm run dev` , Vite dev server on port 5173
- `npm run build` , `tsc` typecheck then Vite production build
- `npm run typecheck` , standalone `tsc --noEmit`
- `npm run lint` , ESLint with `--max-warnings 0`
- `npm test` , Vitest
- `npm run deploy:check` , runs typecheck, lint, build, and audit in order

## Architecture rules

- Game logic in `src/engine/` is React-free and deterministic where practical. UI must not duplicate engine logic.
- `App.tsx` owns all state and screen routing. It calls `updateStore` to mutate state immutably and auto-save.
- All Discord SDK calls go through the platform adapter (`src/platform/standalone.ts` is the only production adapter today). The game must remain fully playable in standalone mode.
- Save schema is versioned. Bumps require a migration in `src/store/persistence.ts`. Current version is 5.
- All chaos cards, NPCs, opponents, midweek actions, and subplots live in `src/data/` as TypeScript modules.

## House rules

- UK English. Use colour, organise, behaviour, defence, centre, favourite, etc.
- Do not use em-dash (`,`) or en-dash (`,`) characters in code or content. Use commas, colons, or rephrase.
- Trust the type system. Avoid `as unknown as` casts and `any` outside of `src/screens/arena/` where it is gated behind an ESLint disable comment.
- Match moments live in `src/screens/arena/index.tsx`. The file is large by design (canvas rendering plus simulation); split only with a clear reason.
- Tap targets must be at least 44x44. No hover-only interactions. Mobile portrait at 360px wide is the primary target.

## Save data

- Storage key: `sll_save_v5`. Older `sll_save_v4`, `sll_save_v3`, `sll_save_v2`, and `sll_save_v1` keys are auto-migrated on load and then removed. A save written by a newer build than the running code is preserved as-is rather than downgraded.
- A career is identified by `player.name` being non-empty. Title screen "Continue" gates on this.

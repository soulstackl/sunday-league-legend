# Sunday League Legend

A mobile-first football RPG. You play one footballer at Dog & Duck FC, navigating chaotic Sunday morning fixtures, drag-and-release match moments, group chat drama and a season-long promotion fight.

Built with Vite + React 19 + TypeScript. Plays offline. Runs in standalone web or as a Discord Activity.

## Getting started

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

## Scripts

- `npm run dev` , local dev server with HMR
- `npm run build` , production build to `dist/`
- `npm run preview` , serve the production build locally
- `npm run typecheck` , TypeScript without emitting
- `npm run lint` , ESLint, zero warnings tolerated
- `npm test` , Vitest unit tests

## Project structure

```
src/
  audio/         Procedural Web Audio sound manager
  components/    Shared UI primitives and Discord vote panel
  data/          Static game content (NPCs, cards, fixtures, etc.)
  engine/        Pure game logic (rng, match, league, schedule, endings, chaos)
  platform/      Standalone and (future) Discord Activity adapters
  screens/       One file per screen in the game flow
  store/         Save state shape and localStorage persistence
  styles/        CSS tokens and global styles
  types/         Shared TypeScript types
  App.tsx        State and screen router
  main.tsx       React entry point
```

## Game flow

1. Title , New Career , Name , Archetype , Job , Club Intro
2. Hub , Midweek action (choose) , optional Group Chat , Kick Off
3. Chaos cards , Briefing , Arena (drag-aim moments) , Newspaper , Table
4. Repeat for 15 weeks (12 league fixtures plus three cup ties at weeks 4, 8, 15)
5. Season Complete , optional Hall of Fame retire or Stat Growth , next season

## Tech notes

See [docs/STACK.md](docs/STACK.md) for the agreed stack, [docs/AUDIT.md](docs/AUDIT.md) for the current codebase audit, and [docs/ROADMAP.md](docs/ROADMAP.md) for the development roadmap.

## Licence

Private prototype. All content fictional. No real clubs, players or kits.

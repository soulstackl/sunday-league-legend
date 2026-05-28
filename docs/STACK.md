# Sunday League Legend — Agreed Tech Stack

## Overview

| Layer | Technology | Purpose |
| --- | --- | --- |
| **Frontend framework** | Vite + React + TypeScript | UI, game loop, match moments |
| **Hosting & CDN** | AWS Amplify | Build, deploy, global CDN |
| **Real-time sync** | API Gateway WebSocket + Lambda + DynamoDB | Discord audience voting |
| **Local persistence** | localStorage | Career saves, settings |
| **Cloud persistence** | DynamoDB (future) | Cloud saves, Hall of Fame sync |
| **Platform adapter** | Discord Embedded App SDK | Identity, presence, iframe comms |

---

## Frontend

### Vite + React + TypeScript

**Vite** is the build tool. It handles JSX/TSX compilation natively (no Babel standalone), provides instant HMR during development, tree-shakes the output, and minifies the production bundle.

**React 18** is the UI framework. The existing codebase is already React-shaped — all components, hooks, and state patterns carry over directly.

**TypeScript** adds type safety across the game engine, state model, and component props. Catching shape errors at compile time matters especially for the save schema and moment resolution logic.

**No Next.js.** Sunday League Legend is a client-side game running in a Discord iframe. Next.js is built for SSR and content sites. Its conventions (App Router, server components, server actions) are irrelevant here and would create friction throughout.

**No Vue, Svelte, or SvelteKit.** The existing implementation is React. Rewriting every component for no meaningful gain is not a good trade. SvelteKit would be a fine greenfield choice but is not worth the migration cost.

### Project structure

The following structure is in place as of the Vite + React + TypeScript refactor.

```bash
sll/
  src/
    data/                   ← Game content as TypeScript data modules
      npcs.ts
      archetypes.ts
      chaos-cards.ts
      jobs.ts
      opponents.ts
      endings.ts
      midweek-actions.ts
      message-templates.ts

    engine/                 ← Pure game logic, no React, fully testable
      rng.ts                ← mulberry32, poissonSample (seeded, deterministic)
      match.ts              ← simulateMatch, calculateTeamStrength
      moment.ts             ← resolveMoment (drag input → outcome)
      chaos.ts              ← card eligibility, weighting, draw
      weekly.ts             ← weekly progression, stat updates, fallout

    store/
      types.ts              ← TypeScript interfaces for all game state
      store.ts              ← React context store + updateStore
      persistence.ts        ← saveGame, loadGame, schema migration
      initial-state.ts      ← initialSaveState

    platform/               ← Adapter pattern: game never calls Discord SDK directly
      types.ts              ← PlatformAdapter interface
      standalone.ts         ← No-op adapter for solo web play
      discord.ts            ← Discord SDK wrapper (init, getUser, sendVote)

    audio/
      audio.ts              ← AudioManager (Web Audio API, procedural sounds)

    components/
      shared/               ← Reusable primitives
        ScreenContainer.tsx
        Card.tsx
        Button.tsx
        StatusBar.tsx
        NpcAvatar.tsx
        ChatBubble.tsx
      screens/              ← One file per screen
        TitleScreen.tsx
        NameScreen.tsx
        ArchetypeScreen.tsx
        JobScreen.tsx
        IntroScreen.tsx
        HubScreen.tsx
        MidweekScreen.tsx
        ChatScreen.tsx
        ChaosScreen.tsx
        BriefingScreen.tsx
        ArenaScreen.tsx     ← canvas drag/aim moments
        PostMatchScreen.tsx
        TableScreen.tsx
        CompleteScreen.tsx
        HallOfFameScreen.tsx
        SettingsScreen.tsx
      discord/
        DiscordVotePanel.tsx

    styles/
      tokens.css            ← CSS custom properties (colours, fonts)
      global.css            ← Reset, animations, shared classes

    App.tsx
    main.tsx

  index.html                ← Minimal shell: <div id="root"> only
  vite.config.ts
  tsconfig.json
  package.json
```text

### Key dependencies

```json
{
  "react": "^18",
  "react-dom": "^18",
  "@discord/embedded-app-sdk": "latest"
}

devDependencies: {
  "vite": "^5",
  "@vitejs/plugin-react": "^4",
  "typescript": "^5",
  "vitest": "^1"
}
```text

No CSS framework. The existing design system (CSS custom properties + utility classes) is already clean and sufficient.

---

## Hosting: AWS Amplify

AWS Amplify hosts the static Vite build output (HTML, JS, CSS, assets) on CloudFront with global edge distribution.

### Why Amplify over raw S3 + CloudFront

Amplify wraps S3 + CloudFront with a managed CI/CD layer. Connect a GitHub repository, and every push to `main` triggers a build and deploy automatically, including CloudFront cache invalidation. SSL, custom domains, and branch previews are all handled without manual configuration.

### Why AWS over Firebase

Firebase's JavaScript SDK dynamically injects scripts at runtime. Discord enforces strict Content Security Policy (CSP) inside its Activity iframe, which blocks this injection. This is a documented, confirmed conflict — teams that have shipped Discord Activities on Firebase have had to pre-download and vendor every Firebase SDK file into their build to work around it. That workaround grows in maintenance cost with every SDK update.

AWS Amplify serves plain static files with no runtime script injection. No CSP conflict.

### Free tier

Amplify's free tier is permanent (not time-limited): 1,000 build minutes per month, 15GB bandwidth per month, 5GB storage. At indie scale this is unlikely to be exceeded.

Beyond the free tier: $0.01 per build minute, $0.15 per GB bandwidth.

---

## Real-time sync: API Gateway WebSocket + Lambda + DynamoDB

Used for Discord audience voting. Not needed for solo play.

### How it works

Each Discord Activity session (a group in a voice channel) creates a session ID. All participants (host + spectators) open a WebSocket connection to the same API Gateway endpoint. A DynamoDB table stores active connection IDs keyed on session ID. When the host triggers a vote, a Lambda broadcasts the prompt to all connections. When spectators vote, their choices are tallied and the result is broadcast back.

```text
Discord client (host)         Discord clients (spectators)
       │                              │
       └──────── WebSocket ───────────┘
                     │
           API Gateway WebSocket
                     │
        ┌────────────┼────────────┐
        │            │            │
   onConnect    onMessage    onDisconnect
   (Lambda)     (Lambda)      (Lambda)
        │            │            │
        └────────────┴────────────┘
                     │
                 DynamoDB
          (sessionId → connectionIds[])
```text

### Why this over alternatives

**Cloudflare Durable Objects** would also work well and is arguably more elegant. AWS is chosen here for ecosystem consistency — hosting, sync, and future cloud saves all under one account and one billing dashboard.

**Partykit** (built on Cloudflare) is a higher-level abstraction for exactly this pattern. Worth revisiting if AWS complexity becomes a concern.

**Firebase Realtime Database** is ruled out for the CSP reasons above.

### Infrastructure definition

All three Lambda functions and the DynamoDB table are defined in a single `template.yaml` using AWS SAM. One command (`sam deploy`) creates the full backend stack. No manual console configuration.

### Cost at indie scale

API Gateway WebSocket: 1 million messages free per month, then $1.00 per million.
Lambda: 1 million requests free per month.
DynamoDB: 25GB storage free, 200M requests free per month (on-demand).

A typical SLL session involves 10–20 WebSocket connections and a few hundred messages. The free tier covers this comfortably into the thousands of sessions per month.

---

## Local persistence

Career saves, Hall of Fame, and settings are stored in `localStorage` using the existing v2 schema with migration logic. This requires no network, works offline, and is already implemented.

Save key: `sll_save_v2`

Schema versioning is in place. Future migrations follow the existing v1 → v2 pattern.

---

## Discord integration

The Discord Embedded App SDK is isolated behind a `PlatformAdapter` interface. The game never calls the SDK directly — all SDK calls go through `src/platform/discord.ts`. The standalone adapter (`src/platform/standalone.ts`) is a no-op that lets the game run identically outside Discord.

This means:

- The full game is playable in a browser without any Discord context
- Discord features (identity, voting, presence) are additive, not required
- The SDK can be updated or swapped without touching game logic

### CSP note

Discord blocks inline scripts and dynamic code injection. The Vite build must produce a bundled output with no `eval`, no inline `<script>` content beyond the entry point, and no dynamically constructed script tags. Vite's production build satisfies this by default.

---

## Testing

**Vitest** for unit tests on the engine layer. No browser required for:
- `rng.ts` — seeded output verification
- `moment.ts` — resolveMoment outcomes across stat/input combinations
- `chaos.ts` — card eligibility and weighting
- `weekly.ts` — stat updates, relationship changes, progression
- `persistence.ts` — save/load and migration correctness

UI components are not unit tested at this stage. Manual device testing covers the interaction model.

---

## What was ruled out

| Option | Reason |
| --- | --- |
| Next.js | SSR framework, wrong fit for a client-side game in an iframe |
| Vue / SvelteKit | Would require rewriting all existing components |
| Firebase | CSP conflict with Discord Activity iframe (documented) |
| GCP | User preference; Firebase CSP issue reinforces avoidance |
| Cloudflare stack | Good alternative; AWS chosen for single-account consistency |
| Raw S3 + CloudFront | Amplify is simpler with equivalent capability at this scale |
| Colyseus | Overkill for a voting/broadcast pattern; no persistent game state needed server-side |

---

## Open decisions

1. **Cloud saves** — DynamoDB schema and API contract not yet defined. Decision: defer until Discord integration is proven in a live environment. Local saves (localStorage v2) are sufficient for solo play.
2. **Phaser for ArenaScreen** — Decided against. The hand-rolled Canvas implementation handles the drag-aim mechanic well; Phaser would add dependency weight without clear benefit at this scope. Revisit only if physics or animation requirements grow significantly beyond the current moment types.
3. **SAM vs CDK** — Still SAM. Backend not yet built. Revisit if the Lambda count grows beyond five or infrastructure needs more composition.

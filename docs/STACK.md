# Sunday League Legend , Agreed Tech Stack

## Overview

| Layer | Technology | Purpose |
| --- | --- | --- |
| **Frontend framework** | Vite + React + TypeScript | UI, game loop, match moments |
| **Hosting & CDN** | Firebase Hosting | Build, deploy, global CDN |
| **Real-time sync** | Cloud Firestore listeners + Cloud Functions (future) | Discord audience voting |
| **Local persistence** | localStorage | Career saves, settings |
| **Cloud persistence** | Cloud Firestore (future) | Cloud saves, Hall of Fame sync |
| **Platform adapter** | Discord Embedded App SDK | Identity, presence, iframe comms |

---

## Frontend

### Vite + React + TypeScript

**Vite** is the build tool. It handles JSX/TSX compilation natively (no Babel standalone), provides instant HMR during development, tree-shakes the output, and minifies the production bundle.

**React 19** is the UI framework. The existing codebase is already React-shaped, all components, hooks, and state patterns carry over directly.

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
  "react": "^19",
  "react-dom": "^19",
  "@discord/embedded-app-sdk": "^2"
}

devDependencies: {
  "vite": "^8",
  "@vitejs/plugin-react": "^6",
  "typescript": "^6",
  "vitest": "^4"
}
```text

No CSS framework. The existing design system (CSS custom properties + utility classes) is already clean and sufficient.

---

## Hosting: Firebase Hosting

Firebase Hosting serves the static Vite build output (HTML, JS, CSS, assets) from a global CDN with automatic SSL.

Configuration lives in `firebase.json` (committed to the repo), so the SPA rewrite, security headers (CSP, X-Frame-Options, etc.) and cache-control are version-controlled and actually applied, unlike the earlier setup where header files targeted a platform that ignored them.

### Deploy

Deploys are manual: `npm run deploy:hosting` (builds, then `firebase deploy --only hosting`). The app is a new site, `sunday-league-legend`, inside the existing `soapy-saxons-fc-frontend` project; the `"site"` field in `firebase.json` scopes the deploy so the other site in that project is never touched. Live at `https://sunday-league-legend.web.app`.

Auto-deploy on push (a GitHub Action via `firebase init hosting:github`, which also gives per-PR preview channels) is a possible future step but is intentionally not set up yet.

### The Discord CSP point (important correction)

An earlier version of this stack ruled Firebase out, citing the Firebase JavaScript SDK injecting scripts at runtime and conflicting with Discord's strict Activity-iframe CSP. That concern is about the **client SDK**, not about **Hosting**:

- **Firebase Hosting** serves plain static files with no runtime script injection. There is no CSP conflict, and it is safe inside the Discord iframe. (This migration only changes hosting.)
- The **Firebase client SDK** (Auth, Firestore) is only relevant later, for cloud save and realtime. The modern modular v9+ SDK is bundled into our own Vite output, so Firestore and core Auth do not inject scripts and work under a strict CSP. The features that DO inject scripts or use `eval`/popups, namely Firebase Analytics, reCAPTCHA-backed phone auth, and popup OAuth flows, must be avoided inside the Discord iframe (use redirect/token auth and skip Analytics there).

So Firebase is CSP-safe for hosting now, and CSP-safe for the planned Firestore/Auth backend provided we stick to the modular SDK and avoid the script-injecting extras.

### Free tier

Firebase Hosting (Spark plan) is free and not time-limited: 10GB storage and 360MB/day egress, which comfortably covers indie scale. Firestore and Functions have their own generous free tiers when the backend is added.

---

## Real-time sync: Cloud Firestore (future)

Used for Discord audience voting and the global daily-challenge leaderboard. Not needed for solo play.

### How it works

Each Discord Activity session (a group in a voice channel) maps to a Firestore document, e.g. `sessions/{sessionId}`. Every participant subscribes to that document with a realtime listener (`onSnapshot`). When the host opens a vote, they write the prompt into the document; all clients receive the update instantly. Spectators write their choice into a `votes` subcollection; a small Cloud Function (or a client-side tally with security rules) aggregates and writes the result back, which again propagates to every listener.

```text
Discord client (host)        Discord clients (spectators)
       │                             │
       │   onSnapshot listeners      │
       └─────────────┬───────────────┘
                     │
              Cloud Firestore
         sessions/{id}  ← prompt, result
         sessions/{id}/votes/{uid}
                     │
           (optional) Cloud Function
             tallies votes on write
```

This replaces the previous API Gateway WebSocket + Lambda + DynamoDB design: Firestore's realtime listeners remove all the connection-management and broadcast plumbing, so there is far less to build and operate.

### Why this over alternatives

**Firestore realtime listeners** give push updates, offline buffering, and security-rule-based auth out of the box. Identity comes from Firebase Auth signed in with the Discord OAuth token, so a player is the same across sessions and devices.

**Cloudflare Durable Objects / Partykit** remain elegant alternatives for the pure broadcast pattern, but keeping hosting, auth, realtime, and cloud saves in one Firebase project (one console, one billing dashboard) is the deciding factor.

### CSP note

The modular Firebase v9+ SDK is bundled by Vite, so Firestore and token-based Auth run inside the Discord iframe without script injection. Avoid Firebase Analytics and popup/reCAPTCHA auth flows inside the iframe (see the Hosting section).

### Cost at indie scale

Firestore free tier (Spark): 1GB storage, 50k document reads / 20k writes / 20k deletes per day. A typical session is a handful of documents and a few hundred reads/writes; this covers thousands of sessions per month before any paid usage.

---

## Local persistence

Career saves, Hall of Fame, and settings are stored in `localStorage` with migration logic. This requires no network, works offline, and is already implemented. A future Firestore cloud save would sync this same state for signed-in players, with localStorage remaining the offline source of truth.

Save key: `sll_save_v5`

Schema versioning is in place. Future migrations follow the existing v1/v2/v3/v4 → v5 pattern.

---

## Discord integration

The Discord Embedded App SDK is isolated behind a `PlatformAdapter` interface. The game never calls the SDK directly , all SDK calls go through `src/platform/discord.ts`. The standalone adapter (`src/platform/standalone.ts`) is a no-op that lets the game run identically outside Discord.

This means:

- The full game is playable in a browser without any Discord context
- Discord features (identity, voting, presence) are additive, not required
- The SDK can be updated or swapped without touching game logic

### CSP note

Discord blocks inline scripts and dynamic code injection. The Vite build must produce a bundled output with no `eval`, no inline `<script>` content beyond the entry point, and no dynamically constructed script tags. Vite's production build satisfies this by default.

---

## Testing

**Vitest** for unit tests on the engine layer. No browser required for:
- `rng.ts` , seeded output verification
- `moment.ts` , resolveMoment outcomes across stat/input combinations
- `chaos.ts` , card eligibility and weighting
- `weekly.ts` , stat updates, relationship changes, progression
- `persistence.ts` , save/load and migration correctness

UI components are not unit tested at this stage. Manual device testing covers the interaction model.

---

## What was ruled out

| Option | Reason |
| --- | --- |
| Next.js | SSR framework, wrong fit for a client-side game in an iframe |
| Vue / SvelteKit | Would require rewriting all existing components |
| AWS Amplify | Was the documented hosting target (never confirmed provisioned in production); superseded by Firebase Hosting to keep hosting, auth, realtime and cloud saves in one ecosystem |
| AWS API Gateway + Lambda + DynamoDB | Firestore realtime listeners replace the WebSocket/broadcast plumbing with far less to build |
| Cloudflare stack / Partykit | Good alternatives; Firebase chosen for single-project consistency |
| Firebase Analytics / popup auth inside Discord | Inject scripts / use popups; conflict with the Discord iframe CSP. Use token auth and skip Analytics there |
| Colyseus | Overkill for a voting/broadcast pattern; no persistent game state needed server-side |

---

## Open decisions

1. **Cloud saves** , DynamoDB schema and API contract not yet defined. Decision: defer until Discord integration is proven in a live environment. Local saves (localStorage v2) are sufficient for solo play.
2. **Phaser for ArenaScreen** , Decided against. The hand-rolled Canvas implementation handles the drag-aim mechanic well; Phaser would add dependency weight without clear benefit at this scope. Revisit only if physics or animation requirements grow significantly beyond the current moment types.
3. **SAM vs CDK** , Still SAM. Backend not yet built. Revisit if the Lambda count grows beyond five or infrastructure needs more composition.

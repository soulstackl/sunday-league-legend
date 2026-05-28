# Sunday League Legend - Requirements

## 1. Purpose

This document defines product, platform, gameplay and technical requirements for the first build of **Sunday League Legend**.

The initial goal is to build a polished vertical slice that proves the core loop works across mobile, tablet, desktop and Discord Activity environments.

## 2. Product requirements

### PR-001: Core loop

The game must support the weekly loop:

1. Midweek choice
2. Matchday chaos
3. Key match moments
4. Post-match fallout
5. Progression to next week

### PR-002: Short session length

A single week should be playable in 2 to 5 minutes.

### PR-003: Season structure

The MVP must support a 12-match league season plus a basic cup route.

### PR-004: Career summary

At the end of a season or career, the game must produce a summary including stats, reputation, major events and ending title.

### PR-005: Replayable runs

The MVP must support multiple careers with different player archetypes, randomised events and persistent Hall of Fame entries.

## 3. Platform requirements

### PLAT-001: Web-first build

The game must be implemented as a responsive web application.

### PLAT-002: Mobile support

The game must work well on modern mobile browsers and inside Discord mobile Activity iframe contexts.

Minimum supported viewport target:

- 360px wide portrait layout

### PLAT-003: Tablet support

The game must support portrait and landscape tablet layouts.

### PLAT-004: Desktop support

The game must support desktop browser play with mouse input.

### PLAT-005: Discord Activity compatibility

The game should be designed to run as a Discord Activity using Discord's Embedded App SDK.

Activities are web apps hosted in an iframe and use the Embedded App SDK to communicate with Discord clients. Discord documentation says Activities run in Discord on desktop, mobile and web, so the product should be built as an iframe-safe responsive web game.

### PLAT-006: Progressive enhancement

The core game must be playable without Discord-specific features. Discord integration should enhance the experience, not be required for standalone play.

## 4. Input requirements

### IN-001: Primary input

The primary input must be drag, aim and release.

### IN-002: Touch support

All match moments and UI actions must be usable with touch.

### IN-003: Mouse support

All match moments and UI actions must be usable with mouse.

### IN-004: Keyboard support

Keyboard controls may be added as an accessibility and desktop enhancement, but must not be required.

### IN-005: Tap target size

Interactive UI elements should have a minimum practical tap target of 44px by 44px.

### IN-006: No hover dependency

No core interaction may rely on hover states.

## 5. Gameplay requirements

### GAME-001: Player creation

MVP must allow the player to create a footballer with:

- Name
- Archetype
- Job/background
- Preferred position or role

### GAME-002: Archetypes

MVP must include at least three archetypes:

- The Unit
- The Winger
- The Midfield Organiser

### GAME-003: Player stats

MVP must implement the following stats:

- Touch
- Strike
- Pass
- Engine
- Graft
- Head
- Pace
- Vibes

### GAME-004: Player states

MVP must track:

- Form
- Fitness
- Fatigue
- Confidence
- Injury risk
- Manager trust
- Team chemistry
- Local fame

### GAME-005: One club

MVP must include Dog & Duck FC as the first playable club.

### GAME-006: NPC squad

MVP must include at least ten named NPCs with relationship values and event hooks.

### GAME-007: Match moments

MVP must include at least six playable match moment types:

- Shot
- Pass
- First touch
- Tackle
- Header
- Penalty

### GAME-008: Moment resolution

Moment resolution must consider:

- Player input
- Relevant player stats
- Traits
- Context modifiers
- Controlled randomness

### GAME-009: Match result resolution

The game must resolve match outcomes based on:

- Pre-match team strength
- Chaos modifiers
- Player performance in key moments
- Opposition difficulty
- Current form and morale

### GAME-010: Chaos events

MVP must include at least thirty chaos event cards.

### GAME-011: Event counterplay

Chaos events should usually have at least one mitigation route through earlier choices, traits, relationships or stats.

### GAME-012: Group chat

MVP must include a group chat-style narrative feed.

### GAME-013: Post-match consequences

After each match, the game must update:

- League table or simplified standings
- Player rating
- Stats
- Fitness/fatigue
- Relationships
- Manager trust
- Vibes
- Reputation

### GAME-014: Hall of Fame

The game must store completed career summaries locally at minimum.

## 6. Discord Activity requirements

### DISC-001: Standalone first

The game must run as a normal web game before Discord integration is added.

### DISC-002: SDK wrapper

Discord-specific calls must be isolated behind an adapter or service layer so the game can run outside Discord.

### DISC-003: Host mode

The MVP Discord mode should support one active host player.

### DISC-004: Audience voting

The MVP Discord mode should support spectator voting for selected choices.

Voting examples:

- Midweek choice
- Risky match decision
- Career decision
- Team drama response

### DISC-005: Voting fallback

If no votes are received, the host must be able to choose manually or the game must apply a default.

### DISC-006: Persistence

Game state must be persisted outside the ephemeral Discord Activity session.

### DISC-007: Identity

Discord user identity may be used for display names, voting and session participation where available, but must not be required for standalone play.

### DISC-008: Low-latency expectations

Audience voting should feel responsive but must tolerate mobile network latency and reconnects.

## 7. UX requirements

### UX-001: Mobile-first UI

All screens must be designed for mobile portrait first.

### UX-002: Responsive layout

The UI must adapt to mobile, tablet and desktop without hiding core functionality.

### UX-003: Large readable text

Core gameplay text must be readable on mobile without zooming.

### UX-004: Low reading burden

Narrative text should be short and punchy. Avoid long paragraphs during active play.

### UX-005: Clear state feedback

The player must be able to quickly see:

- Score
- Time or match phase
- Current objective
- Fitness/fatigue
- Key relationship or morale changes
- Consequence of recent choices

### UX-006: Fast restart

Starting a new career after completing or abandoning a run should take fewer than 60 seconds after the first playthrough.

### UX-007: Save and resume

The game must support resuming a current career.

## 8. Accessibility requirements

### A11Y-001: Colour independence

No critical information may be conveyed by colour alone.

### A11Y-002: Reduced motion

The game should support a reduced motion setting.

### A11Y-003: Text scaling

The UI should tolerate increased browser text size.

### A11Y-004: Captions/substitutes

Any important audio cue must have a visual equivalent.

### A11Y-005: Input forgiveness

Mobile drag interactions should include forgiving thresholds and cancellation behaviour.

## 9. Technical requirements

### TECH-001: Suggested stack

Recommended initial stack:

- TypeScript
- React
- Vite
- Canvas or SVG layer for match moments
- Zustand or similar lightweight state management
- Local storage or IndexedDB for local saves
- Optional backend for Discord sessions and cloud saves

### TECH-002: Game engine separation

Core game logic must be separated from UI rendering.

### TECH-003: Deterministic simulation

Runs should use seeded randomness so bugs can be reproduced and Discord sessions can remain consistent.

### TECH-004: Content-driven data

Archetypes, clubs, NPCs, events and moment definitions should be data-driven using JSON, YAML or TypeScript data modules.

### TECH-005: Save schema versioning

Saved games must include a schema version for future migrations.

### TECH-006: Responsive performance

The game should target smooth interaction on mid-range mobile devices.

### TECH-007: Offline-friendly standalone mode

Standalone mode should support local play after initial load where practical.

### TECH-008: Testing

Core simulation logic must be covered by unit tests.

Recommended areas:

- Moment resolution
- Chaos card selection
- Weekly progression
- Relationship updates
- Save/load migration
- Season table updates

## 10. Content requirements

### CONTENT-001: Tone

The game should be funny, warm and grounded. It should mock the situation, not punch down at real people.

### CONTENT-002: Fictional clubs

Use fictional club, league and player names.

### CONTENT-003: No licensed assets

Avoid real club badges, real player names, real league names and copyrighted kits.

### CONTENT-004: Repeat mitigation

Content should be tagged and weighted to avoid the same events appearing too often in one season.

### CONTENT-005: Event variety

MVP should include event categories for:

- Weather
- Pitch
- Availability
- Team drama
- Rivalry
- Work/life
- Injury
- Pub/social
- Manager decisions
- Referee issues

## 11. Analytics requirements

### AN-001: Funnel events

Track anonymously where possible:

- Career created
- Week completed
- Season completed
- Career ended
- New career started

### AN-002: Gameplay events

Track:

- Moment type success/failure
- Chosen archetype
- Chosen midweek action
- Most common chaos cards
- Abandonment points

### AN-003: Discord events

Track:

- Activity sessions started
- Number of spectators
- Votes cast
- Vote participation rate
- Session completion rate

## 12. Non-goals for MVP

The MVP should not include:

- Native iOS or Android app
- Full 3D football engine
- Real-time 11v11 gameplay
- Licensed professional teams
- Online PvP match control
- Complex transfer economy
- Deep Football Manager-style tactical simulation
- Microtransaction economy
- User-generated content moderation system

## 13. Open questions

Answers recorded as of May 2026.

1. Should a career be one season by default, or multiple short seasons?
   **Resolved:** One season by default. Multi-season "Next Season" flow added after MVP.

2. Should the player always control one footballer, or unlock player-manager mode early?
   **Resolved:** Single footballer throughout. Player-manager mode deferred.

3. Should Discord audience voting be available in every week, or only highlighted moments?
   **Resolved:** Selected moments only. Voting UI implemented; full Discord session integration still pending.

4. Should the first vertical slice include a visible league table or a simplified standings/rivalry tracker?
   **Resolved:** Full league table (TableScreen) implemented.

5. Should match moments be rendered with Canvas, SVG, DOM or a hybrid?
   **Resolved:** Canvas for match moments (ArenaScreen); SVG for procedural NPC avatars; DOM for all other UI.

6. How much authored writing is required before procedural generation feels rich enough?
   **Resolved (provisional):** 34 chaos cards (4 with interactive choices), 10 NPC bios, pre/post-match message templates in place. Rival personalities and multi-week subplots remain a future content work area.

7. Should the game use cloud saves from the start, or local saves until Discord mode is proven?
   **Resolved:** Local saves for MVP (localStorage v2 with migration logic). Cloud saves deferred until Discord integration is complete.


# Sunday League Legend — Development Roadmap

This document tracks the production development waves from initial vertical slice through elite production. Waves 1–9 are complete. Waves 10–11 are planned.

---

## Waves 1–6: Production Polish ✅ COMPLETE

### Wave 1: Visual "Juice" & Tactile VFX ✅

**Goal:** Make every interaction feel weighty and responsive.

- Screen shake triggered on goals, woodwork hits, and heavy tackles
- Hit stops (50–100ms pause) on successful tackles and strikes
- Match-day wipe transitions between game stages
- Grass particle feedback on ball contact

### Wave 2: Audio Engine & Procedural Soundscapes ✅

**Goal:** Build atmosphere through the Web Audio API.

- `AudioManager` singleton for triggering sounds
- Procedural kick, goal, miss, and whistle sounds
- Mute setting in preferences; visual equivalents for all audio cues

### Wave 3: Narrative Depth & The "Social" RPG ✅

**Goal:** Turn team-mates into characters with agency.

- Branching chat choices: `ChatBubble` renders `message.choices` as buttons; `onChoice` applies relationship and stat effects
- NPC relationship scores update based on chat choices
- Relationship-driven message variants in templates

### Wave 4: Presentation & UI Fidelity ✅

**Goal:** Professionalise the wrapper around the simulation.

- "Sunday League Weekly" newspaper-style post-match UI with generated headlines
- Animated stat bars and delta popups for relationship changes
- Full UK English audit (colour, centre, behaviour, etc.)

### Wave 5: Simulation Mechanics & "The Grind" ✅

**Goal:** Increase the strategic depth of the weekly loop.

- Match momentum: confidence-based hot-hand mechanic
- Stamina/energy visible during match moments; high fatigue narrows accuracy cone
- Career endings: 8 titles with multi-variable resolution logic

### Wave 6: Platform & Persistence ✅

**Goal:** Robustness and Discord Activity foundations.

- Save versioning: v2 schema with v1→v2 migration
- `PlatformAdapter` interface isolating all Discord SDK calls behind `src/platform/discord.ts`
- Standalone adapter lets the full game run outside Discord with no changes

---

## Waves 7–9: Elite Production ✅ COMPLETE

### Wave 7: Dynamic Visuals & Environmental FX ✅

**Goal:** Immersion through atmospheric rendering and personalised identity.

- Procedural NPC avatars: SVG-based sticker style, archetype and stat variations
- Weather particle systems: real-time rain and fog overlays on the Arena canvas
- TV broadcast match HUD: score ticker, weather condition badge
- Animated crowd backgrounds with subtle movement

### Wave 8: Deep Simulation & Statistical Certainty ✅

**Goal:** Making the "manager" side of the game feel data-driven.

- Pass completion %, shots on target, and tackles tracked per match
- Cumulative career totals displayed on HubScreen
- AI league logic with difficulty-correlated positions
- Match stats shown in Sunday League Weekly post-match UI

### Wave 9: Narrative Choice & Consequence ✅

**Goal:** Elevating chaos and chat into a branching story engine.

- Interactive chaos card choices implemented on 4 cards:
  - *Dressing Room Row* — mediate or stay out of it
  - *Referee Clive* — protest or stay quiet
  - *Bollocking at Work* — channel anger or stay professional
  - *Won £50 on the Horses* — buy a round or save the cash
- `ChaosScreen` gates the Kick Off button until a choice is made where required
- NPC-driven chat tone: relationship effects from choices persist across messages
- Multi-season "Next Season" flow implemented
- Themed NPC content for Pete, Taz, Callum, and Gary arcs (partial)

---

## Wave 10: Presentation & UX Mastery 🔲 PLANNED

**Goal:** Frictionless, high-end mobile-first experience.

### Tasks

1. **Haptic Feedback (Mocked)**
   - [ ] Visual pulse on successful moment completion
   - [ ] Screen flash on goal
   - [ ] Sound pulse simulating vibration intensity

2. **Contextual Tips**
   - [ ] "Gaffer's Advice" popup system for first three weeks
   - [ ] Examples: "Fitness below 30? Consider a Rest day next week"
   - [ ] Dismissible per-screen tip queue

3. **Enhanced Hall of Fame**
   - [ ] Career retrospective with best moments
   - [ ] Gallery of newspaper headlines from best games
   - [ ] Season records comparison across careers

4. **UI/UX Refinements**
   - [ ] Smoother screen transitions
   - [ ] Better empty states (no results, new career)

---

## Wave 11: Multi-Season & Evolution 🔲 PLANNED

**Goal:** Longevity and replayability.

### Tasks

1. **Promotion/Relegation System** (scaffolded, not yet active)
   - [ ] Activate 3-tier league structure
   - [ ] Promotion/relegation rules (top 2 up, bottom 2 down)
   - [ ] Per-tier opponent difficulty scaling and new opponents

2. **Stat Growth System**
   - [ ] Experience points per midweek action
   - [ ] Permanent +1 stat gains (capped at 15 per stat)
   - [ ] "Development phase" screen between seasons
   - [ ] Diminishing returns on repeat actions

3. **Career Longevity**
   - [ ] 3-season career arcs
   - [ ] Career milestone achievements
   - [ ] NPC retirements, departures, and new arrivals between seasons

---

## What was ruled out during development

| Considered | Reason not pursued |
| --- | --- |
| Phaser for ArenaScreen | Hand-rolled Canvas is sufficient; Phaser adds weight without clear benefit at this scope |
| Cloud saves from the start | Local saves (localStorage v2) sufficient until Discord integration is proven |
| Player-manager mode early | Scope risk; deferred to future career arc work |
| Keyboard-first input | Touch/mouse primary; keyboard as future accessibility enhancement |
| Online PvP | Outside scope; Discord Activity covers the social layer |

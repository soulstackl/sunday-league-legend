# Sunday League Legend - Comprehensive Codebase Audit

**Date:** 28 May 2026  
**Architecture:** Vite + React + TypeScript, modular source structure  
**Status:** MVP Vertical Slice complete — Waves 7–9 implemented; Waves 10–11 planned

---

## 1. VERTICAL SLICE COMPLETION STATUS

### ✅ COMPLETE - MVP Core Requirements Met

| Requirement | Status | Notes |
| --- | --- | --- |
| **Career Creation** | ✅ DONE | Name, archetype, job selection implemented with stat modifiers |
| **Archetypes** | ✅ DONE | Unit, Winger, Midfield Organiser (3/3 with traits) |
| **Player Stats** | ✅ DONE | Touch, Strike, Pass, Engine, Graft, Head, Pace, Vibes (8/8) |
| **Player States** | ✅ DONE | Form, Fitness, Fatigue, Confidence, Injury Risk, Manager Trust, Team Chemistry, Local Fame (8/8) |
| **Club** | ✅ DONE | Dog & Duck FC with full intro narrative |
| **NPC Squad** | ✅ DONE | 10 named NPCs with relationships: Pete, Deano, Gav, Taz, Callum, Clive, Shaz, Dazza, Gary, Bev |
| **Match Moments** | ✅ DONE | 6 core moment types: Shot, Pass, First Touch, Tackle, Header, Penalty |
| **Moment Resolution** | ✅ DONE | Stats, traits, context modifiers, seeded RNG, drag-aim input |
| **Match Result** | ✅ DONE | Team strength, chaos effects, moment outcomes drive match score |
| **Chaos Events** | ✅ DONE | 34 cards across 8 categories (Weather 5, Pitch 5, Availability 5, Drama 5, Rivalry 3, Work/Life 4, Fitness 3, Social 4) |
| **Group Chat** | ✅ DONE | Message templates, pre/post-match chat, narrative flow |
| **Post-Match Updates** | ✅ DONE | Stats, relationships, manager trust, team vibes, local fame tracking |
| **Hall of Fame** | ✅ DONE | Career summaries saved locally, 8 ending titles |
| **Mobile Responsive** | ✅ DONE | 360px+ portrait with adaptive layouts |
| **Save/Resume** | ✅ DONE | localStorage v2 with migration logic |
| **Weekly Loop** | ✅ DONE | Midweek → Chaos → Moments → Post-Match → Progression (2-5 min per week) |
| **12-Match Season** | ✅ DONE | 12 opponents with difficulty scaling |
| **Discord Adapter** | ✅ DONE | Platform detection, voting UI, spectator mode scaffolding |

### ✅ NICE-TO-HAVE FEATURES IMPLEMENTED

- Screen shake on goals (impact feedback)
- Hit stops for physical feedback
- Procedural audio (kick, goal, miss, whistle sounds)
- Match momentum system
- Stamina/Energy penalties
- Newspaper-style post-match UI (Sunday League Weekly)
- Multi-season support with next season flow
- UK English audit (colour, centre, behaviour)
- Accessibility settings (reduced motion, input sensitivity)
- Group chat choice branching
- Career statistics tracking

---

## 2. TASK CHECKLIST STATUS

### Section 4: Midweek Actions

- [x] Train, Rest, Gym, Pub, Overtime, Watch Opposition, Patch Relations, Set Pieces
- [ ] **MISSING:** Group chat choice hook (actions trigger chat but no choice branching)

### Section 5: Chaos Deck

- [x] All card categories implemented (30+ cards, achieved 34)
- [x] Eligibility, weighting, repeat prevention, duration handling
- [ ] **MISSING:** Interactive Chaos Card choices (some cards should offer decision points)

### Section 8: Narrative

- [x] Group chat UI and message templates
- [ ] **MISSING:** Choice prompts inside chat (partially done - choices implemented but not full branching)

### Section 10: Accessibility

- [x] Reduced motion, text size, non-colour indicators, input sensitivity, confirmations
- [ ] **MISSING:** Screen-reader labels for core UI controls (low priority for this wave)
- [ ] **MISSING:** Full keyboard navigation for menus (considered lower priority)

### Section 11: Discord Activity

- [x] SDK detection and adapter initialization
- [x] Audience voting UI and timer
- [ ] **MISSING:** Discord application creation (development setup)
- [ ] **MISSING:** Local development tunnel configuration
- [ ] **MISSING:** Context fetching and session persistence
- [ ] **MISSING:** Testing in Discord clients

### Section 12: Persistence

- [x] Local save implemented (localStorage)
- [x] Version migration (v1→v2)
- [x] Current career + Hall of Fame saves
- [ ] **MISSING:** Backend cloud saves (not MVP requirement, decision pending)

### Section 13: Content Pass

- [x] Chaos cards have titles and descriptions (34 cards)
- [x] Group chat templates for pre/post-match
- [x] NPC bios (10 NPCs with full personality data)
- [x] Career ending titles (8 endings)
- [ ] **MISSING:** Extended narrative pass (existing content is minimal/placeholder)
- [ ] **MISSING:** Rival player personalities
- [ ] **MISSING:** Full NPC story arcs during season

### Section 16: Elite Production

- [x] Procedural NPC avatars (SVG-based stickers)
- [x] Weather particle systems (rain/fog visual effects)
- [x] TV broadcast match HUD
- [x] Granular match stats (pass %, shots, tackles)
- [x] Career totals on hub
- [x] Multi-season support
- [ ] **MISSING:** Debug screen for game state inspection
- [ ] **MISSING:** Seed display/copy for bug reports
- [ ] **MISSING:** Multi-week narrative subplots
- [ ] **MISSING:** Promotion/relegation logic
- [ ] **MISSING:** Interactive chaos card choices

### Section 17: Vertical Slice Milestone

- [x] Career creation
- [x] Complete at least three weeks (12-week season playable)
- [x] Six match moments playable
- [x] Chaos events affect gameplay
- [x] Group chat responds to outcomes
- [x] Relationships update visibly
- [x] Save and resume
- [x] Mobile, tablet, desktop responsive
- [ ] **PARTIAL:** Discord Activity with host voting (detection works, UI scaffolded, full testing pending)

---

## 3. CODEBASE ARCHITECTURE OVERVIEW

### Core Data Structures

```typescript
initialSaveState = {
  player: { name, archetype, job, position, stats{8}, states{8}, traits[] }
  season: { week, results[] }
  npcs: { [id]: relationshipScore }
  chaos: { cardHistory[], activeCards[] }
  groupChatLog: { sender, text, time, choices? }[]
  hallOfFame: { name, archetype, title, date }[]
  settings: { reducedMotion, textSize, inputSensitivity }
}
```text

### Key Game Logic Functions

- `mulberry32(seed)` - Deterministic seeded RNG
- `poissonSample(lambda, rng)` - Goal distribution probability
- `calculateTeamStrength(states)` - Dynamic difficulty from morale
- `simulateMatch(results, states, chaos, opponent, rng)` - Match outcome resolution
- `resolveMoment(type, dragVector, stats, states, mods, rng)` - Player input → moment outcome
- `updateStore(updater)` - Immutable state updates with auto-save

### React Component Hierarchy

```text
App
├── TitleScreen
├── Creation Flow: NameScreen → ArchetypeScreen → JobScreen → IntroScreen
├── Weekly Loop:
│   ├── HubScreen (weekly hub with stats/actions)
│   ├── MidweekScreen (action choice)
│   ├── ChatScreen (group narrative)
│   ├── ChaosScreen (chaos card reveal)
│   ├── BriefingScreen (match setup)
│   ├── ArenaScreen (canvas drag-aim moments)
│   ├── PostMatchScreen (newspaper UI)
│   └── TableScreen (standings)
├── SeasonEnd: CompleteScreen → HallOfFameScreen
├── Settings, Hall of Fame
```text

### Styling

- CSS Variables: 16 color tokens + 3 font families
- Responsive: Mobile portrait-first, tablet, desktop breakpoints
- No external CSS framework (vanilla CSS + inline styles)
- Accessibility: Text size tolerant, reduced motion respected

### Audio

- Web Audio API procedural sounds (kick, goal, miss, whistle)
- Muted control in settings
- Scheduled audio events tied to game moments

---

## 4. IMPLEMENTATION QUALITY ASSESSMENT

### Strengths

✅ **Clean Architecture** - Clear separation of data, logic, UI  
✅ **Responsive Design** - Works at 360px+ mobile, tablets, desktop  
✅ **Persistence** - Robust save/load with version migration  
✅ **Audio/Visual Feedback** - Screen shake, hit stops, particle effects  
✅ **Accessibility** - Reduced motion, input sensitivity, text scaling  
✅ **Game Balance** - Stat modifiers, difficulty scaling, random seeding  
✅ **State Management** - Immutable updates, auto-save, deep cloning  
✅ **Content Variety** - 34 chaos cards, 10 NPCs, 8 endings, 12 opponents  

### Known Limitations

⚠️ **No Screen Reader Support** - UI not fully accessible for screen readers  
⚠️ **Limited Narrative Depth** - Message templates are procedural/placeholder; rival personalities and multi-week subplots not yet written  
⚠️ **No Keyboard Navigation** - Touch/mouse focused; full keyboard navigation not supported  
⚠️ **Discord Integration Incomplete** - Voting UI and platform adapter in place; app registration, tunnelling, context fetching, and session persistence not yet done  
⚠️ **No Backend** - All data local (localStorage); cloud saves and Discord session state deferred  
⚠️ **No Unit Test Coverage** - Engine modules (rng, match, moment, chaos, persistence) have no automated tests  
⚠️ **Canvas Performance** - Match simulation on canvas may struggle on low-end devices  

---

## 5. NEXT WAVE PRIORITIZATION (Waves 7-11)

### Wave 7: Dynamic Visuals & Environmental FX (Highest Priority - Immersion)

**Goal:** Visual richness and atmosphere  
**Estimated Effort:** 2-3 days

#### Tasks

1. **Weather Particle Systems** (exists but basic)
   - [ ] Rain streaks with parallax on canvas
   - [ ] Fog gradient overlay with opacity pulsing
   - [ ] Snow/hail particle collision physics
   - [ ] Wind effect on particle trajectory

2. **Procedural Player Avatars** (exists as simple SVGs)

   - [ ] Archive current placeholder SVGs
   - [ ] Generate stat-based avatar variations (20+ variations)
   - [ ] Add jersey number personalization
   - [ ] Color scheme per archetype/stat distribution

3. **Animated Backgrounds**

   - [ ] Crowd rectangles with synchronized swaying
   - [ ] Bleacher section variation
   - [ ] Tree/building silhouettes on horizon
   - [ ] Time-of-day lighting effects

4. **TV Broadcast Overlay** (partially done)
   - [ ] Match timer animation
   - [ ] Score ticker with highlight animations
   - [ ] Weather condition badge
   - [ ] Quarter-screen minimap of positioning

### Wave 8: Deep Simulation & Statistical Certainty (High Priority - Depth)

**Goal:** Data-driven manager simulation  
**Estimated Effort:** 2 days

#### Tasks

1. **Match Stats Tracking**

   - [ ] Pass completion % per game
   - [ ] Shots on target
   - [ ] Tackles won
   - [ ] Possession % estimation
   - [ ] Distance covered (visual feedback)

2. **Career Records Screen**

   - [ ] Cumulative goals, assists
   - [ ] Average match rating
   - [ ] Total games played
   - [ ] Personal best moment performance
   - [ ] Career win %, draw %, loss %

3. **AI League Logic**

   - [ ] Dynamic "Other Results" generator
   - [ ] Difficulty → league position correlation
   - [ ] Team form momentum tracking
   - [ ] Relegation/promotion implications

### Wave 9: Narrative Choice & Consequence (High Priority - Story Depth)

**Goal:** Branching narrative and NPC memory  
**Estimated Effort:** 3-4 days

#### Tasks

1. **Interactive Chaos Cards** (CRITICAL GAP)
   - [ ] Identify 5-10 cards with two-option choices
   - [ ] Examples: "Ref ignores foul: Protest (red card risk) vs Stay Quiet (lose momentum)"
   - [ ] Choice affects immediate moment difficulty or stats
   - [ ] Track choice history for future card eligibility

2. **Multi-Week Subplots**

   - [ ] 3-4 story arcs spanning 3-4 weeks
   - [ ] Example: "Callum's Potential Transfer" (weeks 2-4)
   - [ ] NPC life events trigger related chaos cards
   - [ ] Relationship choices unlock subplot variations

3. **NPC Grudge Memory**

   - [ ] Track if you snubbed NPC for pass/penalty (missed assist)
   - [ ] Affect chat tone for 2-3 weeks after
   - [ ] Relationship decay if patterns repeat
   - [ ] Reconciliation moment available via chat choice

4. **Themed Narrative Extensions**

   - [ ] Pete's retirement decision (season-long arc)
   - [ ] Taz's knee injury progression
   - [ ] Callum's semi-pro trial outcome
   - [ ] Gary's confidence journey

### Wave 10: Presentation & UX Mastery (Medium Priority - Polish)

**Goal:** Frictionless, high-end mobile experience  
**Estimated Effort:** 2-3 days

#### Tasks

1. **Haptic Feedback (Mocked)**

   - [ ] Visual pulse on successful moment completion
   - [ ] Screen flash on goal
   - [ ] Subtle color shift on stat change
   - [ ] Sound pulse that simulates vibration intensity

2. **Contextual Tips**

   - [ ] "Gaffer's Advice" popup system (first 3 weeks)
   - [ ] Example: "Fitness below 30? Consider a Rest day next week"
   - [ ] Dismissible with 'Got it' button
   - [ ] Per-screen tip queue

3. **Enhanced Hall of Fame**

   - [ ] Career retrospective with best moments
   - [ ] Highlight reel of top-rated games
   - [ ] Newspaper headlines gallery from best games
   - [ ] Season records comparison

4. **UI/UX Refinements**

   - [ ] Smoother transitions between screens
   - [ ] Loading states for async operations
   - [ ] Better empty states (no results, new career)
   - [ ] Confirmation dialogs for destructive actions (existing but refinable)

### Wave 11: Multi-Season & Evolution (Lower Priority - Longevity)

**Goal:** Long-term progression and replayability  
**Estimated Effort:** 3-4 days

#### Tasks

1. **Promotion/Relegation System**

   - [ ] 3-tier league structure
   - [ ] Promotion/relegation rules (top 2 up, bottom 2 down)
   - [ ] Opponent difficulty scaling per league tier
   - [ ] New opponents per tier

2. **Stat Growth System**

   - [ ] Experience points per midweek action
   - [ ] Permanent +1 stat gains (capped at 15 per stat)
   - [ ] "Development phase" screen between seasons
   - [ ] Diminishing returns on repeat actions

3. **Career Longevity**

   - [ ] 3-season career arcs (3+ years optional)
   - [ ] Career milestone achievements
   - [ ] Personal challenge system (10+ challenges)
   - [ ] Legacy mechanics (pass down team composition)

4. **Next-Season Features**

   - [ ] NPC retirements and departures
   - [ ] New squad member arrivals
   - [ ] Manager contract extension/renewal
   - [ ] Trophy/title retention mechanics

---

## 6. CURRENT GAPS

### ✅ PREVIOUSLY BLOCKING — NOW RESOLVED

1. **Interactive Chaos Card Choices** — 4 cards implemented (Dressing Room Row, Referee Clive, Bollocking at Work, Won on the Horses); `ChaosScreen` gates progression on choice when `card.choices` is present
2. **Group Chat Choice Hook** — Choices render in `ChatBubble` via `message.choices`; `onChoice` callback applies relationship/stat effects
3. **Debug Screen** — Built into `SettingsScreen`: seed, week, match count, career events, save version, and copy-seed button

### 🔴 ACTIVE GAPS (Near-term)

1. **Cup Route** — 12-match league is playable but cup progression is not implemented (MVP requirement GAME-003)
   - Effort: Low–medium (1 day: cup fixture list + bracket screen)

2. **Discord Integration** — App registration, tunnel config, context fetching, and session persistence all outstanding
   - Effort: High (requires Discord developer setup + backend infra; see STACK.md)

3. **Unit Test Coverage** — No engine modules are tested
   - Effort: Medium (1–2 days: rng, match, moment, chaos, persistence)

### 🟡 HIGH PRIORITY GAPS

1. **Narrative Content Depth** — Rival player personalities (6 needed), multi-week subplots, richer NPC story arcs
2. **Keyboard Navigation** — Menus and UI not keyboard-navigable; accessibility compliance gap
3. **Screen Reader Labels** — Limited ARIA labels on interactive elements

### 🟠 MEDIUM PRIORITY (Can defer)

1. **Discord Activity Full Integration** — Session persistence, context fetching, testing on Discord clients
2. **Backend Cloud Saves** — Not MVP requirement; deferred until Discord mode is proven
3. **Wave 10 UX Polish** — Haptic feedback mocking, contextual tips, enhanced Hall of Fame
4. **Wave 11 Multi-Season Evolution** — Promotion/relegation activation, stat growth system

---

## 7. TESTING CHECKLIST FOR NEXT WAVE

### Gameplay Testing

- [ ] Complete 3+ career playthroughs (different archetypes)
- [ ] Test all 34 chaos cards trigger correctly
- [ ] Verify match moment difficulty scales with stats
- [ ] Confirm relationships update after choices
- [ ] Check save/resume works across sessions
- [ ] Test abandoned career → new career flow

### Platform Testing

- [ ] Mobile portrait (360px) - all touch interactions
- [ ] Mobile landscape - layout adaptation
- [ ] Tablet portrait/landscape - spacing
- [ ] Desktop mouse - hover states
- [ ] Discord Activity context (when available)

### Accessibility Testing

- [ ] Reduced motion setting disables animations
- [ ] Text size scaling (browser zoom 100-200%)
- [ ] Color contrast ratio meets WCAG AA
- [ ] Tab navigation works (if added)
- [ ] Screen reader announces key elements (if labels added)

### Performance Testing

- [ ] Canvas animation smooth at 60fps
- [ ] No memory leaks over 30+ minute session
- [ ] localStorage usage < 2MB
- [ ] Load time < 3 seconds on 3G

---

## 8. DEVELOPMENT ROADMAP

### **Week 1: Wave 7 (Visual Richness)**

- Day 1-2: Enhanced particle systems + avatar variations
- Day 3: Animated backgrounds + broadcast overlay
- Day 4: Testing + refinement

### **Week 2: Wave 8 (Simulation Depth)**

- Day 1: Stats tracking implementation
- Day 2: Career records screen
- Day 3: AI league logic + other results generator

### **Week 3: Wave 9 (Story Depth)**

- Day 1-2: Interactive chaos cards (5-10 high-impact cards)
- Day 3: Multi-week subplots (Callum's trial, etc.)
- Day 4: NPC grudge memory system

### **Week 4: Wave 10 (UX Polish)**

- Day 1: Haptic feedback mocking + contextual tips
- Day 2: Enhanced Hall of Fame
- Day 3-4: UI refinement + bug fixes

### **Later: Wave 11 (Longevity)**

- Promotion/relegation system
- Stat growth between seasons
- Career extensions

---

## 9. HANDOFF NOTES

### Code Quality

- Modular Vite + React + TypeScript architecture: engine, data, store, screens, and components are all separated
- Build via Vite; type-checking via `tsc --noEmit`; linting via ESLint; utility scripts in `scripts/`
- No CSS framework; design system via CSS custom properties (`src/styles/tokens.css`)
- All dependencies via npm (`package.json`); no CDN runtime dependencies

### State Management Pattern

- Store is centralized, immutable updates via `updateStore()`
- Deep cloning prevents accidental mutations
- Auto-save on every update (localStorage)
- All async safe (Web Audio, canvas animation)

### CSS/Design System

- CSS variables make theming easy
- Responsive breakpoints: 360px (mobile), 768px (tablet), 1024px (desktop)
- Accessibility baked in (reduced motion, text scaling)
- Color palette: pitch green, kit amber, cream text, charcoal background

### Next Developer Focus

1. Start with Wave 7 visual enhancements (highest impact on feel)
2. Add interactive chaos card choices ASAP (critical narrative gap)
3. Extend NPC narratives as content task (can be done in parallel)
4. Test thoroughly on real devices (not just browser)

---

## 10. SUCCESS METRICS FOR NEXT WAVES

### Wave 7: Visual Richness

- ✓ Player visually distinguishes all 5 weather effects
- ✓ Avatar variations recognize at least 3 stat tiers per NPC
- ✓ Crowd animation feels organic (not obviously looping)
- ✓ 60fps canvas performance on iPhone XS equivalent

### Wave 8: Simulation Depth

- ✓ Career records show meaningful stat growth over season
- ✓ League positions correlate logically with difficulty
- ✓ Stats tracking accurate (within 5% margin)
- ✓ Player can view complete career statistics

### Wave 9: Story Depth

- ✓ 2-3 chaos cards per playthrough have meaningful choices
- ✓ NPC grudge mechanics visible in chat messages
- ✓ 3-week subplot completes within season
- ✓ Player feels narrative consequences of choices

### Wave 10: UX Polish

- ✓ New player completes first week without confusion
- ✓ Tips are contextual and helpful (not intrusive)
- ✓ Hall of Fame feels complete and memorable
- ✓ 100% satisfaction on mobile device playtest group

### Overall

- Game reaches 10+ minute average session length
- Replay rate improves (% starting new career after completing one)
- Discord integration functional in development environment

---

**Prepared by:** AI Development Agent  
**Next Review:** After Wave 7 completion

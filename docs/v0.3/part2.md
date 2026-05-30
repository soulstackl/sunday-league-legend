# Part 2: Content Depth Gaps

The game mechanics and production infrastructure are solid. The gaps below are in content volume and specificity: places where players encounter the same material on their second and third playthroughs. All are additive: no engine changes, no new screens, no new state fields unless noted.

---

## Address First

### 1. Subplots stop triggering after week 5
**File:** `src/data/subplots.ts:23,46,69,92`

All four subplots in the game have `startWeek` values of 2, 3, 4, and 5. From week 6 to the end of the season (nine of the fifteen matchweeks), the group chat receives no new story content. The second half of the season is driven entirely by match result templates and static NPC messages. Players who return for a second career will see every subplot within the first five weeks, then nothing new for the rest of the season.

The subplot trigger engine in `src/App.tsx:403-408` already handles week-based firing and multi-stage arcs. The gap is purely in the data at `src/data/subplots.ts`.

**Target additions:**
- 8 new single-stage subplots covering weeks 6 through 14 (Deano's form dip around week 7, Clive's rumoured move in week 9, Shaz stepping up as vice-captain around week 11, Bev's injury scare in week 13, end-of-season pressure from weeks 12 onwards)
- 2 multi-stage subplots where the player's choice in stage 1 (weeks 3-4) determines what content appears in stage 2 (weeks 10-12): the subplot engine supports this via `stage: number` on `SubplotProgress`; no engine change needed, only new data

Result: 14 subplots with meaningful spread across all 15 weeks and some carry-over consequences across the season arc.

---

### 2. Fifteen arena moment types have a single scenario each
**File:** `src/data/arenaScenarios.ts`

Current distribution across 54 scenarios and 23 types:

| Count | Types |
|-------|-------|
| 7 | `shot` |
| 5-6 | `corner`, `pass`, `header`, `freekick` |
| 4 | `touch`, `tackle` |
| 2 | `volley`, `penalty` |
| 1 each | `tapIn`, `oneVone`, `cutback`, `throwIn`, `longRange`, `block`, `clearance`, `goallineClearance`, `nutmeg`, `skillMove`, `rabona`, `panenka`, `bicycle`, `keeperSave` |

The five hero-pool types used exclusively in cup matches (`nutmeg`, `skillMove`, `rabona`, `bicycle`, `keeperSave`) each have one scenario. Every cup game produces the same hero moment for any given type. The weighted selection system in `src/engine/arenaSelection.ts:100-105` handles multiple scenarios per type automatically; this is a data gap only.

**Target:** Minimum 3 scenarios per type, 80+ total. Priority is the hero-pool types (cup match variety) and the commonly gated attack types (`tapIn`, `oneVone`, `longRange`).

---

## High Value

### 3. Post-match group chat uses only generic win/draw/loss templates
**File:** `src/data/message-templates.ts`, `src/App.tsx:327-328`

The three message pools (`postMatchWin`, `postMatchDraw`, `postMatchLoss`) fire unconditionally after every match. A 1-0 grind and a 4-0 demolition produce identical chat reactions. A 10/10 performance and a 3/10 horror show are treated the same way. No NPC reacts to a hat-trick, a clean sheet, a big win, or a particularly poor display.

The data to drive conditional reactions exists at the point the templates are pushed: `last.stats.goals`, `last.rating`, goal difference, `last.theirGoals === 0` for a clean sheet. The dispatch in `src/App.tsx:327-328` runs inside the same `updateStore` call that has full access to the result.

**Target additions:**

| Condition | Trigger | Example copy |
|-----------|---------|------|
| `stats.goals >= 3` | Deano or Gav sends hat-trick message | "Three goals mate. Absolute machine." |
| `rating >= 9` | Pete sends standout performance message | "Best I have seen you play in years." |
| `theirGoals === 0` | Clive or Shaz sends clean sheet message | "Back line was class today. We earned that." |
| `rating <= 4` | Teammate sends supportive message | "Shake it off mate. Different story next week." |
| Goal difference >= 3 | Group message about the result quality | "We battered them. Pub?" |

These are additive to the existing generic templates, not replacements. Specific reactions fire first; the generic pool follows.

---

### 4. Chaos cards have no state-conditional triggers
**File:** `src/data/chaos-cards.ts`, `src/types/game.ts:133-142`

The 34-card pool meets the design target for volume. The current `ChaosCard` interface has no mechanism for conditional eligibility: every card is always eligible to be drawn regardless of player state. A card like "Running on Empty" should only appear when `player.states.fatigue > 75`; a defensive chaos card should be more likely when `player.states.managerTrust < 40`; a card representing a local press story should be gated on `player.states.localFame > 60`.

Adding an optional `condition` field to `ChaosCard` and filtering in the chaos draw logic (currently in `src/screens/ChaosScreen.tsx` or wherever the draw occurs) would make the weekly midweek and state-management decisions feel consequential beyond just stat numbers. Cards would feel earned or ominous based on how the season is going.

**Scope:** New optional field on `ChaosCard`, a filter step at draw time, and condition properties on a subset of existing cards. No new cards needed: retrofit the conditional logic onto suitable cards already in the pool.

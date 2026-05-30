# Part A: Bugs and Correctness Issues

Findings from a full end-to-end review of Sunday League Legend (post v0.2 working tree, including the uncommitted v0.3 content additions). Every item below was confirmed against source; file and line references were accurate at time of review. Items are grouped by severity. This document is the implementation backlog: Part A is being delivered as a complete clean end-to-end fix in the v0.4 pass.

Baseline at time of review: `typecheck` clean, `lint` clean, 76/76 engine tests pass, `npm audit` clean.

---

## High

### A1. Three "keeper save" cup hero moments are unwinnable
**Files:** `src/screens/arena/scenarioAdapter.ts:38`, `src/screens/arena/index.tsx:554-558`, `src/data/arenaScenarios.ts:853,1135,1147`

`keeperSave` maps to `tackle` physics. The tackle handler does `fieldNPCs.current.find(n => n.type === 'attacker')` and, if no attacker exists, immediately resolves `BEATEN` ("He skipped past you"). The three keeper-save scenarios (`keeper-save`, `keeper-save-penalty`, `keeper-save-header`) define only `setup.ball` and no `actors`, so `fieldNPCs` is empty and the moment is lost on every swipe regardless of timing or aim. These are cup / semi-final / final gated hero moments, so a player who reaches them can never succeed.

**Fix:** give each keeper-save scenario an `attacker` actor (the onrushing shooter) so the dive/tackle mechanic has a target and a correctly timed, well-aimed swipe registers as a save.

### A2. AI league table gives one club home advantage in every match
**File:** `src/engine/league.ts:51-64`

The circle-method pairing hardcodes `const a = i === 0 ? n - 1 : home`, and the +0.6 home bonus is applied only to side `a`. The fixed team `n-1` (the last opponent in each tier list: Crossroads United, Thorn Tree FC, Station Arms United) is always side `a`, so it plays all of its fixtures at home and never away, systematically inflating its points every season.

**Fix:** alternate the fixed team's home/away by round parity so the home bonus rotates fairly across all clubs.

### A3. AI league season replays round 0 instead of playing a distinct round
**Files:** `src/engine/league.ts:52-53`, `src/App.tsx:484-485,530-531`

`advanceAiTable` is called with `completedFixture.leagueIndex` (0-11) as `weekIndex`, and the rotation uses `% (n - 1)` = `% 11`. So `leagueIndex 11` produces the identical pairing set as round 0, simulated with a different seed: one round's fixtures are effectively played twice while the genuine variety is reduced.

**Fix:** combined with A2's parity swap, week index 11 (odd) produces round 0's pairings with home and away reversed, i.e. a legitimate reverse fixture rather than an identical replay. This is the natural 12th round for a 12-team single round-robin and keeps each club on a consistent played count.

---

## Medium

### A4. Cup-exit "friendly" awards league points but the AI table does not advance
**Files:** `src/engine/schedule.ts:44-48`, `src/App.tsx:484,530`, `src/engine/league.ts`

The post-cup-exit fallback fixture is `kind: 'league'` with `leagueIndex: undefined`. Our result is counted in the standings, but because the `advanceAiTable` call is gated on `leagueIndex !== undefined`, the AI clubs do not play that week. A player who exits the cup gains extra league games and points while every AI club stays a game (or more) behind on played count.

**Fix:** advance the AI table for every completed league fixture, deriving a non-colliding round index from the week number when `leagueIndex` is undefined, so AI played counts stay aligned with ours.

### A5. `one-v-one-rounding` imposes a hidden timer and emits wrong commentary
**Files:** `src/data/arenaScenarios.ts` (new `one-v-one-rounding`), `src/screens/arena/index.tsx:974-979`

This new scenario uses `oneVone` -> `shot` physics but carries an `attacker` actor with `vy: 3.5`. For non-tackle moments the attacker-advance branch resolves `BEATEN` ("He's gone past you") once the actor passes `y > 330`, roughly 1.3s after the moment goes live, imposing a hidden timer and nonsensical copy on a one-on-one finish.

**Fix:** remove the `attacker` actor from this scenario so the shot mechanic resolves on its own terms.

### A6. `tap-in` and `tap-in-center` scenarios are unreachable
**Files:** `src/data/arenaScenarios.ts:708,908`, `src/engine/arenaSelection.ts:59-62,122`

Both scenarios gate on `prevTypeIn: ['corner','cutback','pass']`, but `tapIn` only appears in the `attack` group, which is always evaluated first with no previous type, so the gate always fails. No `chainHint` targets `tapIn`, so neither scenario can ever be selected.

**Fix:** add a `chainHint` from corner and cutback scenarios to `tapIn` so a tap-in can follow them naturally, making the gated scenarios reachable.

### A7. Scenario tuning fields are declared and assigned but never read
**Files:** `src/data/arenaScenarios.ts` (tuning blocks), `src/screens/arena/index.tsx`

`tackleWindowLo` / `tackleWindowHi` are set on eight scenarios but the tackle timing window is hardcoded `0.55 / 0.92`. `goalWidthFactor` and `postOddsMul` are likewise set but never consumed. Balance tuning that authors believe is active has no effect.

**Fix:** wire `tackleWindowLo/Hi` into the tackle timing check and its on-screen ring, `goalWidthFactor` into goal-mouth detection, and `postOddsMul` into woodwork odds. Remove any remaining tuning fields with no clear, safe mechanic so the data does not imply behaviour that does not exist.

### A8. `updateStore` runs side-effects inside an impure state updater
**File:** `src/App.tsx:156-172`

`saveGame()` (a `localStorage` write) and `setToast()` are called inside `setStoreRaw(prev => ...)`, and several updaters call `Math.random()`. React updaters must be pure; under StrictMode double-invocation this double-writes and can produce divergent state between the persisted and rendered values.

**Fix:** compute `next` once outside the setter (against a ref-tracked current state), run the updater once, then set state and perform save/toast side-effects exactly once.

### A9. Unbounded save growth serialised on every action
**File:** `src/App.tsx` (history pushes), `src/store/persistence.ts`

`careerEvents`, `chaosCardHistory` and `hallOfFame` accumulate across an entire career and the whole `SaveState` is `JSON.stringify`'d on every `updateStore`, steadily inflating each write toward the `localStorage` quota.

**Fix:** cap the unbounded history arrays to a sane recent window. Because `careerEvents.length` is also used as an RNG seed component, introduce a separate monotonic counter for seeding so capping the array does not break determinism.

---

## Low

### A10. Forward-version saves are silently downgraded and re-saved lossily
**File:** `src/store/persistence.ts:32-37`

`migrate()` never reads `data.version`; it unconditionally rebuilds from `initialSaveState` and sets `version = 4`. A save written by a future build is coerced to v4, dropping unknown fields, and the next auto-save overwrites it.

**Fix:** if the incoming `version` is greater than the current version, preserve the save as-is rather than stripping and downgrading it.

### A11. Migration drops the persisted `savedAt` timestamp
**File:** `src/store/persistence.ts:32-77`

`migrate()` never copies `data.savedAt`, so "last played" resets to undefined on any migrated load.

**Fix:** copy `data.savedAt` through migration when it is a number.

### A12. `loadGame()` is parsed and migrated twice on mount
**File:** `src/App.tsx:113-128`

Both the `store` and `currentScreen` `useState` initialisers independently call `loadGame()`, doing the full parse + migrate (and legacy-key cleanup) twice.

**Fix:** call `loadGame()` once and derive both initial states from the single result.

### A13. ErrorBoundary recovery uses a hardcoded save key
**File:** `src/components/shared/ErrorBoundary.tsx:53`

The recovery button literals `'sll_save_v4'` (correct today) but does not import `SAVE_KEY` or clear `LEGACY_KEYS`; it will silently drift on the next schema bump, breaking the only crash-recovery escape hatch.

**Fix:** import and clear `SAVE_KEY` and all `LEGACY_KEYS`.

### A14. `chaos` / `briefing` / `arena` screens render a blank dead-end if `fixture` is null
**File:** `src/App.tsx:753,757,766`

All three render conditions are gated on `&& fixture`. If the screen is active but `fixture` is null, nothing renders, with no button or back navigation. Currently unreachable in normal play, but latent.

**Fix:** when a fixture-dependent screen is active with no fixture, fall back to the hub.

### A15. Training drill: a played 0-hit drill is indistinguishable from a skip, and there is no cancel
**Files:** `src/App.tsx:248`, `src/screens/TrainingDrillScreen.tsx:281-296`

Both "Skip" and a fully played drill that misses every target yield `drillScore === 0`, so a player who tried and missed is told they "skipped the drill". The drill also has no way back to Midweek without consuming the week.

**Fix:** pass a distinct sentinel for an explicit skip so a played 0-score drill reads as a genuine attempt, and add a Cancel that returns to Midweek without consuming the turn.

### A16. `win-streak-3` objective counts only league matches, contradicting its copy
**File:** `src/engine/objectives.ts:53,66`

The objective text is "Win 3 consecutive matches" (any competition), but the check slices `leagueResults`, so cup wins are ignored.

**Fix:** count consecutive wins across all competitions to match the description.

### A17. `finish-top-half` admits slightly more than half the table
**File:** `src/engine/objectives.ts:98`

`position <= Math.ceil(totalTeams / 2)` admits positions 1-7 of a 13-team table (53.8%).

**Fix:** use `Math.floor(totalTeams / 2)` for a strict top half.

### A18. `buildScenarioSequence` uses `Math.random` instead of the seeded RNG
**Files:** `src/engine/arenaSelection.ts:90-99`, `src/screens/arena/index.tsx`

Every other engine module is seeded via `mulberry32`, but scenario selection uses raw `Math.random()`, so match-moment sequences are not reproducible from the save seed.

**Fix:** thread a seeded RNG (from `seed + week`) through `buildScenarioSequence` and `pickWeighted`, consistent with the rest of the engine.

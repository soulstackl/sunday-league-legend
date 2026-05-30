# Part 1: Bugs & Genuine Issues

Findings from a full end-to-end code review of Sunday League Legend. All items are confirmed against source; file and line references were accurate at time of review.

---

## Engine / Game Logic

### 1. Promotion/relegation affects two teams instead of one
**File:** `src/engine/league.ts:168`

`position >= totalTeams - 1` — for 12 teams, positions 11 and 12 both satisfy this condition. Should be `position > totalTeams - 1` so only the bottom team is relegated.

---

### 2. Delivery driver fatigue goes the wrong direction
**File:** `src/engine/jobs-weekly.ts:57`

Fatigue is reduced by `-5` for the delivery job. Every other physical job increases fatigue. The comment says "knees older" — the sign is wrong and should be `+5`.

---

### 3. Null dereference crash in arena scenario fallback
**File:** `src/engine/arenaSelection.ts:168`

`pickWeighted()` returns `null` when total weight is zero. When all attack scenarios are gated out, `fallbackType` is null and `pickScenarioForType(null, liveCtx)` is called. This will crash at runtime.

---

### 4. Undefined MomentType values in scenario groups
**File:** `src/engine/arenaSelection.ts:122`

`groups.attack` and `groups.build` reference types like `volley`, `tapIn`, `cutback`, `throwIn`, `goallineClearance` that do not exist in the `MomentType` union. If any of these are selected, runtime behaviour is undefined.

---

### 5. `ourLeaguePosition` returns 0 when player row is missing
**File:** `src/engine/league.ts:152`

`findIndex` returns `-1` when no row has `isUs === true`, causing the function to return `0`, which is not a valid league position. Any downstream display or logic using this value gets a silent bad result.

---

### 6. Job-assigned trait names never validated against registry
**File:** `src/data/jobs.ts` / `src/engine/traits.ts`

Jobs assign trait strings (e.g. `'Early Riser'`) that must exactly match keys in `TRAIT_REGISTRY`. No validation exists at assignment time, so a typo silently grants a no-op trait with no error.

---

### 7. `isFinalWeek` is permissive in the wrong direction
**File:** `src/engine/schedule.ts:50`

`week >= TOTAL_WEEKS` returns `true` for week 15 and any value above. If week 16 is ever reached through a bug, it is treated as a valid final week rather than an error state.

---

### 8. `autoAdvance` subplot field is defined but never used
**File:** `src/data/subplots.ts:4`

The field is documented in the type definition but no actual subplot uses it. Either dead code or an incomplete feature — needs to be resolved either way.

---

## UI / Screens

### 9. ChaosScreen silently returns null with no feedback
**File:** `src/screens/ChaosScreen.tsx:45`

If the chaos card array is empty (RNG failure or bad state), the screen disappears entirely. The user sees a blank void with no explanation or recovery path.

---

### 10. TableScreen disabled advance button explains nothing
**File:** `src/screens/TableScreen.tsx:80`

When `canAdvance` is false, the button is greyed out but no text explains why. Users tap it repeatedly expecting something to happen.

---

### 11. Space key default not prevented in MidweekScreen keyboard handler
**File:** `src/screens/MidweekScreen.tsx:85`

The `onKeyDown` handler for the Space key does not call `e.preventDefault()`, so pressing Space triggers both the action and scrolls the page simultaneously.

---

### 12. Chat send button is 40x40px — below 44px minimum
**File:** `src/screens/ChatScreen.tsx:61`

Below the 44px minimum tap target defined in project house rules. Hub navigation buttons are also marginal at approximately 40px total height.

---

### 13. Array index used as React key in three places
**Files:** `src/screens/ChaosScreen.tsx:106`, `src/screens/ChatScreen.tsx:46`, `src/screens/HallOfFameScreen.tsx:32`

`key={i}` causes incorrect reconciliation if those lists ever mutate, reorder, or are filtered. Not a crash today but will cause subtle UI bugs as the codebase evolves.

---

### 14. Arena ball draw radius is unbounded
**File:** `src/screens/arena/index.tsx:1211`

`ballDrawRadius = b.radius + b.z / 15` — a large `z` value (ball high above the pitch) causes the ball to render oversized. Needs a cap.

---

## Persistence / Data

### 15. Save failure is silent to the user
**File:** `src/store/persistence.ts`

`QuotaExceededError` (full device storage) is caught and `console.warn`'d but the user sees nothing. On a mobile device with low storage, the save silently stops persisting with no indication to the player.

---

### 16. Trait data in saves never cross-checked against registry on load
**File:** `src/store/persistence.ts`

On load, `uniqueStrings(data.player.traits)` deduplicates the array but does not verify each ID against `TRAIT_REGISTRY`. A corrupted or tampered save can inject unknown trait IDs that silently break trait effect calculations.

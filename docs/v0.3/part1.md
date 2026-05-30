# Part 1: Incomplete Implementations and Design Gaps

Findings from a full end-to-end code review of Sunday League Legend v0.2. All items are confirmed against source; file and line references were accurate at time of review. These are not regressions from v0.2; they are features that were partially built or design questions that were never resolved.

---

## Narrative / UI

### 1. Nemesis opponent is tracked but never surfaced at match time
**Files:** `src/App.tsx:298-306`, `src/screens/BriefingScreen.tsx`, `src/screens/PostMatchScreen.tsx`, `src/screens/CompleteScreen.tsx`

`season.nemesisOpponentId` is set correctly when the same opponent beats the player twice (`src/App.tsx:292-296`) and a single group chat revenge message fires when the player eventually wins (`src/App.tsx:305-306`). That is the entire player-visible output of the system. Three narrative moments are missing:

**BriefingScreen** (`src/screens/BriefingScreen.tsx:30-32`): Pete's team talk is selected from a static pool keyed only on `fixture.kind`. When the upcoming opponent matches `season.nemesisOpponentId`, a nemesis-specific line should replace or supplement the generic talk. The opponent ID is available via the `fixture` prop; the nemesis ID is available via `store.season.nemesisOpponentId`. No new data or screens required.

**PostMatchScreen**: The newspaper has no nemesis callout. When the result opponent is the nemesis, a badge or secondary headline should surface this: both for a loss ("They've done it again") and for a revenge win ("The dog bites back" already fires in chat but players land here first). The canvas `shareNewspaper` function at `src/screens/PostMatchScreen.tsx:9` would naturally include the callout in the shared image.

**CompleteScreen** (`src/screens/CompleteScreen.tsx`): The season summary has no reference to the nemesis. If `season.nemesisOpponentId` is non-null at season end, the screen should surface whether the player got revenge or never managed it. This is a one-line addition to the season narrative below the movement banner.

---

### 2. Objective and achievement completions are not shown at the point they happen
**Files:** `src/App.tsx:316`, `src/screens/PostMatchScreen.tsx`

When an objective completes after a match, a system message is pushed to the group chat log (`src/App.tsx:316`). When an achievement unlocks, a system message is also pushed to chat (`src/App.tsx:324`). Both are surfaced only if the player navigates to Chat after the match. PostMatchScreen has no reference to objectives or achievements from the current match.

The completion data exists at the moment `completeMatch` runs and `setCurrentScreen('postmatch')` is called. It is not passed through to the screen. Adding a compact unlocked row at the bottom of the PostMatchScreen results section (rendered only when there are completions) would close this loop without requiring a new screen or state change.

---

## Engine / Game Logic

### 3. `isFinalWeek` uses `>=` instead of strict equality
**File:** `src/engine/schedule.ts:51`

```typescript
export function isFinalWeek(week: number): boolean {
  return week >= TOTAL_WEEKS
}
```

`nextWeekNumber()` (`src/engine/schedule.ts:55`) caps week at 15 via `Math.min(TOTAL_WEEKS, week + 1)`, so a value above 15 cannot be reached through normal play. However, returning `true` for any value above 15 is semantically incorrect: a week of 16 would be treated as a valid final week rather than an error state. Should be `week === TOTAL_WEEKS`.

---

### 4. Relegation boundary is ambiguous between design intent and inline comment
**File:** `src/engine/league.ts:168-170`

```typescript
// Top two promoted, bottom two relegated.
const bottom = position >= totalTeams - 1
```

For 12 teams, `totalTeams - 1` is 11, so `position >= 11` matches both 11th and 12th place. The comment ("bottom two relegated") is consistent with the code. The v0.2 code review flagged this as a bug and proposed `position > totalTeams - 1` so that only the bottom team goes down.

The code and comment agree with each other; the v0.2 finding may have been wrong about the intent. This needs a documented design decision before implementation. If the intent is one team relegated, the condition becomes `position > totalTeams - 1`. If two teams is correct, the v0.2 finding should be closed as invalid and the comment left as-is.

# Part 3: Feature Opportunities

Three features that make each session structurally different from the last. All build on existing infrastructure with no new screens required for the first two, and a reuse of the arena canvas for the third.

---

## 1. Training Drill Mini-Game

The "Train Hard" midweek action currently resolves as an instant text outcome with a flat stat boost. When selected, show a condensed arena canvas with three drag-and-release moments against a static target, with no keeper and no defenders. Successful moments determine the quality of the stat reward rather than a fixed value.

**Reward scale:** 1 success gives stat +1, 2 successes give stat +2, 3 successes give stat +3. The current flat value is effectively always 2, so the ceiling is raised for skilled players while the floor is preserved.

**Why it matters:** Every other midweek option (Pub, Rest, Scout, Gym) has an immediate text consequence. Train Hard is the only one that just disappears. This feature gives the most common midweek choice a tangible interaction. It also acts as an organic tutorial before week 1: players who train on week 1 will have handled the drag mechanic before their first match under no pressure.

**Implementation notes:** The arena physics in `src/screens/arena/index.tsx` handles drag-and-release entirely. A training context needs a simplified scenario set (no `gates`, no keeper logic, static target zones) and a reduced moment count (3 vs the standard 4-5). A new `context: 'training' | 'match'` flag on `SelectionContext` in `src/engine/arenaSelection.ts` would route the selection to a training scenario pool. The stat reward hook replaces the current flat `+2` in the midweek action effects for `trainhard`.

**Complexity:** Medium. Arena canvas reuse is complete; new training scenario data and a context flag are the main work items.

---

## 2. Manager Pete Mood in Briefing

Pete the Gaffer gives the same static team talk pool every match, split only by league versus cup. His dialogue does not reflect the season so far. Two wins on the bounce and two losses on the bounce produce identical pre-match team talks.

Add a `peteDisposition` value derived at render time from the last three league results in `store.season.results`: `'confident'` for two or more wins, `'frustrated'` for two or more losses, `'neutral'` otherwise. Drive three team talk copy pools from this in `src/screens/BriefingScreen.tsx:24-32`, replacing the current two pools. Apply a match modifier based on disposition:

| Disposition | Effect |
|-------------|--------|
| Confident | +5 confidence entering the match |
| Neutral | No modifier (current behaviour) |
| Frustrated | -3 team chemistry, +5 tackle accuracy bonus |

Surface Pete's mood on HubScreen as a single line beside the fixture card: "Pete looks fired up" / "Pete seems tense" / "Pete's keeping it level." This gives players a signal before they commit to their midweek action: pressing too hard when Pete is already frustrated might not be worth the chemistry hit.

**Why it matters:** The Briefing screen is the last moment before the match. Making Pete feel like he is reacting to real events rather than reading from a script gives the season arc a sense of continuity. The frustrated modifier also makes a loss streak feel different mechanically, not just narratively.

**Implementation notes:** `peteDisposition` is a derived value, not stored state; calculated inline from `store.season.results.filter(r => r.competition === 'league').slice(-3)`. No new type fields needed. The match modifier is applied via the existing confidence and chemistry state paths in `completeMatch` or passed as a context modifier.

**Complexity:** Low. Derived value, new copy pools, one new conditional display line on HubScreen.

---

## 3. Injury Duration

Injuries currently last one week. `player.states.injuryRisk` affects match probability but once the week advances, the slate is clean. There is no strategic cost to running the player into the ground over multiple weeks; fatigue and fitness reset enough each cycle to make Rest feel optional rather than necessary.

Add `injuryWeeksRemaining: number` to `PlayerStates` in `src/types/game.ts` (default 0, zero means not injured). When `injuryRisk` crosses 85 during a midweek action or match simulation, set `injuryWeeksRemaining` to 2. In `handleNextWeek`:

- Decrement `injuryWeeksRemaining` by 1 (minimum 0)
- While `injuryWeeksRemaining > 0`: fitness recovery per week is halved, fatigue accumulates 20% faster, confidence drops by 2 per week

The midweek "Rest" action halves the counter (rounded down) in addition to its current effects, making Rest the active recovery choice rather than a passive one. The midweek action list should annotate "Rest" with "(Injured, X weeks to go)" when `injuryWeeksRemaining > 0`.

HubScreen already renders the status bars including `injuryRisk`. Extend the display to show the active injury counter when `injuryWeeksRemaining > 0`, using the existing `StatusBar` component.

**Why it matters:** A bad week 6 injury should have consequences through week 8. Currently it does not. This makes the midweek Rest decision genuinely strategic mid-injury rather than a dump choice when the player is fine, and gives the Nurse job trait (which presumably reduces injury risk or recovery time) more meaningful value.

**Implementation notes:** `injuryWeeksRemaining` requires a migration in `src/store/persistence.ts` (add to `migrate()` with default 0). The save schema version should bump to 5. Existing saves load cleanly with the counter at 0.

**Complexity:** Low-medium. New state field, migration, three touch points (midweek action effects, handleNextWeek tick, HubScreen display).

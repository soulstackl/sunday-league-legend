# Part 3: Feature Opportunities

Five high-impact features with strong player satisfaction payoff relative to implementation complexity. All build on existing infrastructure.

---

## 1. Social Sharing — Newspaper Clipping Export

After each match, a "Share" button renders the post-match newspaper to a PNG using `canvas.toDataURL()` and opens the native Web Share API sheet. Zero backend required. Newspaper headlines are already generated — this surfaces them as a shareable moment. Works on mobile, Discord, and any share-capable browser.

**Why it matters:** Viral distribution at zero marginal cost. Every shared clipping is an advert.
**Complexity:** Low. Canvas render + one share API call.

---

## 2. Career Objective System

Three rolling objectives visible on the Hub: one short-term (score this week), one medium (win 3 in a row), one long-term (get promoted this season). Completing objectives awards a trait unlock or stat boost. Objectives rotate each week or on completion.

**Why it matters:** Solves the biggest engagement gap — players currently have no intermediate goals between "play a match" and "win the league." Quieter weeks gain purpose. Dramatically improves second and third session retention.
**Complexity:** Medium. New data layer and Hub widget; no new screens.

---

## 3. Rival / Nemesis System

When a specific named opponent beats you, they are flagged as your Nemesis. Their name and head-to-head record appear in the post-match newspaper and group chat taunts. When you eventually beat them it is surfaced as a proper milestone moment. Tracking and taunts resolve at end of season.

**Why it matters:** Narrative hooks make losses feel meaningful rather than frustrating. The NPC and chat systems already exist — this is a data and copy layer on top.
**Complexity:** Low. State tracking + conditional narrative copy.

---

## 4. Achievements & Hall of Fame Badges

A set of ~30 lifetime achievements (first hat-trick, survived relegation, won the cup, 5 seasons played, maximum attribute, etc.) displayed as badges on Hall of Fame entries. Achievements unlock across careers and give players a reason to start again with different archetypes and choices.

**Why it matters:** Achievements are one of the highest-proven retention mechanics in mobile gaming. The event hooks (match result, promotion, chaos cards) already fire — achievements just register listeners.
**Complexity:** Low-medium. Achievement registry + event hooks + badge display on Hall of Fame.

---

## 5. End-of-Season Wrap Card

At season end, before the Hall of Fame screen, generate a full-screen summary card: goals scored, chaos cards survived, best moment of the season, total weeks played, win rate. Render to canvas and offer the same share-sheet export from feature 1.

**Why it matters:** Players love Spotify Wrapped-style recaps. It is a second viral sharing moment and gives players a sense of closure and pride before starting again. Builds directly on the newspaper canvas and share infrastructure from feature 1.
**Complexity:** Low-medium. Canvas layout + data aggregation. Reuses share logic from feature 1.

---

## Bonus: Training Drill Mini-Game

One midweek option is "train hard" — currently resolved as a text outcome. A short drag-and-release training drill (reusing the arena canvas physics) would make that choice feel tangible and teach new players the match mechanic without the pressure of a real game.

**Why it matters:** Bridges the tutorial gap, reinforces the core mechanic, and makes the midweek screen feel more alive.
**Complexity:** Medium. Reuses arena canvas; needs a simplified scenario set and a stat reward hook.

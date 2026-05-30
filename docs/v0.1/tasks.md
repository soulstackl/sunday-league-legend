# Sunday League Legend , Build Tasks

## 0. Project setup

- [x] Create repository
- [x] Set up TypeScript, React and Vite
- [x] Add linting and formatting
- [x] Add unit test framework
- [x] Add basic routing or screen state system
- [x] Add responsive CSS foundation
- [x] Add local save abstraction
- [x] Add seeded random utility
- [x] Add initial CI checks

## 1. Architecture

- [x] Define core game state model
- [x] Define save game schema with version field (v3, with v1 and v2 migrations)
- [x] Create game engine module separate from UI
- [x] Create content data loading pattern
- [x] Create event/effect resolution pipeline
- [x] Create platform adapter interface
- [x] Create standalone web platform adapter

## 2. Design data

- [x] Define stat model: Touch, Strike, Pass, Engine, Graft, Head, Pace, Vibes
- [x] Define derived state model
- [x] Define archetype schema and add three archetypes
- [x] Define club schema; add Dog & Duck FC
- [x] Define NPC schema; add ten NPCs (including referee Clive)

## 3. Game flow

- [x] Title screen with continue/new/hall/settings
- [x] Career creation flow (Name, Archetype, Job, Club Intro)
- [x] Weekly hub with fixture awareness
- [x] Midweek choice screen with stat focus and NPC targeting
- [x] Group chat screen with branching choices
- [x] Chaos card screen with interactive choices
- [x] Briefing screen with active modifiers
- [x] Arena (canvas drag-aim moments)
- [x] Post-match newspaper UI
- [x] League table (W/D/L/GF/GA/GD/Pts, promotion/relegation zones)
- [x] Season Complete screen with promotion/relegation summary
- [x] Stat growth screen between seasons
- [x] Hall of Fame screen
- [x] Squad roster screen
- [x] Settings screen with text size and input sensitivity
- [x] Save and resume
- [x] Delete career with confirmation

## 4. Midweek actions

- [x] Train (random stat boost)
- [x] Rest
- [x] Gym (player-chosen stat focus)
- [x] Pub session
- [x] Work overtime
- [x] Watch opposition (carries accuracy bonus into next match)
- [x] Patch up relationship (NPC target selection)
- [x] Set pieces (carries power bonus into next match)

## 5. Chaos deck

- [x] 34 cards across 8 categories
- [x] Eligibility, weighting, repeat prevention
- [x] Card effect application via getChaosModifiers
- [x] Interactive choices on 4 cards (Dressing Room Row, Referee Clive, Bollocking at Work, Won £50 on Horses)

## 6. Match moments

- [x] 8 moment types implemented (Shot, Pass, First Touch, Tackle, Header, Penalty, Free Kick, Corner)
- [x] Drag-aim input with min length and cancellation
- [x] Touch, mouse, pointer events all supported
- [x] Result feedback overlay
- [x] Difficulty modifiers (chaos, stats, momentum, energy, context, sensitivity)
- [x] Goal cinematics (slow-mo, flash, hit-stop, confetti)
- [x] Reduced-motion alternative respected by CSS media query

## 7. Match and season simulation

- [x] Team strength model
- [x] Opponent model across three tiers
- [x] 12-match league + 3-round cup
- [x] Match score resolution combining team strength, chaos, moments
- [x] Full standings table with deterministic AI sim each week
- [x] Goals, assists (via stats), cards, ratings tracked
- [x] Fatigue and injury risk tracked
- [x] NPC relationship updates after every match
- [x] Manager trust, team Vibes, local fame tracked
- [x] Cup progression with quarter, semi, final
- [x] Promotion (top 2) and relegation (bottom 2) across three tiers

## 8. Narrative and group chat

- [x] Group chat UI with NPC avatars and timestamps
- [x] Pre-match, post-match (win/draw/loss), midweek templates
- [x] NPC banter and manager feedback
- [x] Relationship-driven message variants via choice effects
- [x] Choice prompts inside chat
- [x] Multi-week subplots (Pete retirement, Taz knee, Callum trial, Gary confidence)
- [x] Message history kept in the current career save

## 9. Responsive UX

- [x] Mobile portrait, tablet portrait/landscape, desktop layouts
- [x] Bottom action area for mobile
- [x] Scalable status chips
- [x] 44x44 minimum tap targets
- [x] No hover-only interactions
- [x] 360px width tested

## 10. Accessibility

- [x] Reduced motion setting
- [x] Text size setting (small/normal/large)
- [x] Input sensitivity setting
- [x] Non-colour state indicators
- [x] Visual equivalents for audio cues
- [x] ARIA labels on interactive controls
- [x] Confirmation for destructive actions

## 11. Discord Activity prototype

- [x] Standalone vs Discord detection
- [x] Voting UI with timer and fallback
- [ ] Full Discord application registration
- [ ] Local development tunnel
- [ ] Embedded SDK init in discord adapter
- [ ] Session persistence backend
- [ ] Client testing across Discord clients

## 12. Persistence

- [x] localStorage save
- [x] Save versioning (v3)
- [x] Migration from v1 and v2 to v3 with legacy key cleanup
- [x] Current career, Hall of Fame, and settings all persisted
- [ ] Backend cloud saves (decision deferred until Discord integration is live)

## 13. Content pass

- [x] Dog & Duck FC intro
- [x] Ten NPC bios with strengths/flaws/temperaments
- [x] 34 chaos cards
- [x] Pre-match, post-match win/draw/loss, midweek chat templates
- [x] Post-match newspaper headlines (cup and league)
- [x] 12 opponents per tier (3 tiers, 36 total)
- [x] 8 career endings with dynamic resolution
- [x] Content tags for repeat prevention
- [x] Tone audit (UK English, no em/en dashes, Sunday League vernacular)

## 14. Visual and audio prototype

- [x] Art direction
- [x] Club badge, player silhouettes
- [x] Pitch/moment canvas visual
- [x] Ball movement with shadows, trail, spin
- [x] Whistle, kick, goal, miss, post, groan, ooh, crowd murmur sounds
- [x] Mute setting
- [x] Reduced motion respected by all animations

## 15. Production polish

- [x] Screen shake on goals and impacts
- [x] Hit stops on tackles and goals
- [x] AudioManager with Web Audio API
- [x] Procedural Kick, Goal, Miss, Post, Ooh, Groan, Murmur sounds
- [x] Branching Group Chat choices
- [x] NPC relationship effects for chat choices
- [x] Sunday League Weekly newspaper UI
- [x] Match Momentum system
- [x] Stamina/Energy bars and accuracy penalties
- [x] Save integrity v3 with migration
- [x] UK English audit

## 16. Elite production

- [x] Procedural NPC avatars
- [x] Real-time weather particle systems (rain/fog/wind/sunshine)
- [x] TV broadcast match HUD
- [x] Granular match stats (Pass %, Shots on Target, Tackles)
- [x] Cumulative Season Totals on Hub
- [x] Multi-season Next Season flow
- [x] Promotion/relegation activated across 3 tiers
- [x] Interactive Chaos Card choices
- [x] Multi-week narrative subplots
- [x] Track season completed and career ended
- [x] Track moment success/failure, archetype, midweek action, chaos cards
- [x] Debug screen for current game state
- [x] Seed display/copy for bug reports
- [x] Stat growth between seasons

## 17. Testing

- [ ] Unit test seeded random utility (next step)
- [ ] Unit test moment resolution
- [ ] Unit test chaos card eligibility
- [ ] Unit test weekly progression
- [ ] Unit test relationship updates
- [ ] Unit test save/load and migration
- [ ] Unit test season table updates
- [ ] Manual test full MVP season
- [ ] Manual test abandoned career
- [ ] Manual test Hall of Fame
- [ ] Manual test mobile touch input
- [ ] Manual test Discord Activity flow

## 18. Vertical slice milestone

- [x] Player can create a career
- [x] Player can complete at least three weeks
- [x] At least six match moments are playable (eight available)
- [x] Chaos events affect gameplay
- [x] Group chat responds to outcomes
- [x] Relationships update visibly
- [x] Career can be saved and resumed
- [x] UI works at mobile, tablet and desktop sizes
- [ ] Discord Activity host session with one voting prompt (UI ready; live infra pending)

## 19. MVP milestone

- [x] Full 12-match league season is playable
- [x] Cup route is playable
- [x] Three archetypes are meaningfully different
- [x] 30+ chaos cards (34 implemented)
- [x] 10 NPCs with relationship hooks
- [x] Hall of Fame stores completed careers
- [ ] Discord host plus audience voting works in live Discord client (UI works in standalone)
- [x] Performance acceptable on mid-range mobile
- [x] First-time player can understand the loop without developer guidance

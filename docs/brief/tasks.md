# Sunday League Legend - Build Tasks

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
- [x] Define save game schema with version field
- [x] Create game engine module separate from UI
- [x] Create content data loading pattern
- [x] Create event/effect resolution pipeline
- [x] Create platform adapter interface
- [x] Create standalone web platform adapter
- [x] Create placeholder Discord platform adapter

## 2. Design data

- [x] Define stat model: Touch, Strike, Pass, Engine, Graft, Head, Pace, Vibes
- [x] Define derived state model: Form, Fitness, Fatigue, Confidence, Injury Risk, Manager Trust, Team Chemistry, Local Fame
- [x] Define archetype schema
- [x] Add archetype: The Unit
- [x] Add archetype: The Winger
- [x] Add archetype: The Midfield Organiser
- [x] Define club schema
- [x] Add Dog & Duck FC
- [x] Define NPC schema
- [x] Add Pete the Gaffer
- [x] Add Deano the keeper
- [x] Add Gav Two Yards
- [x] Add Big Taz
- [x] Add Callum Trialist
- [x] Add at least five more squad NPCs

## 3. Game flow

- [x] Create title screen
- [x] Create new career flow
- [x] Create player name input
- [x] Create archetype selection screen
- [x] Create job/background selection screen
- [x] Create club intro screen
- [x] Create weekly hub screen
- [x] Create midweek choice screen
- [x] Create matchday intro screen
- [x] Create match moment sequence screen
- [x] Create post-match fallout screen
- [x] Create season progress screen
- [x] Create career summary screen
- [x] Create Hall of Fame screen
- [x] Implement save and resume
- [x] Implement abandon career/new career flow

## 4. Midweek actions

- [x] Implement Train action
- [x] Implement Rest action
- [x] Implement Gym action
- [x] Implement Pub/team social action
- [x] Implement Work overtime action
- [x] Implement Watch opposition action
- [x] Implement Patch up relationship action
- [x] Implement Practise set pieces action
- [x] Implement group chat choice hook
- [x] Add effects preview before confirming choices
- [x] Add consequence summary after choices

## 5. Chaos deck

- [x] Define chaos card schema
- [x] Implement card eligibility checks
- [x] Implement card weighting
- [x] Implement repeat prevention
- [x] Implement card effect application
- [x] Implement card duration handling
- [x] Add pitch cards
- [x] Add weather cards
- [x] Add availability cards
- [x] Add team drama cards
- [x] Add rivalry cards
- [x] Add work/life cards
- [x] Add injury cards
- [x] Add pub/social cards
- [x] Add manager cards
- [x] Add referee cards
- [x] Reach at least 30 MVP chaos cards

## 6. Match moments

- [x] Define match moment schema
- [x] Build reusable drag/aim/release input component
- [x] Add touch support
- [x] Add mouse support
- [x] Add input cancellation behaviour
- [x] Implement shot moment
- [x] Implement pass moment
- [x] Implement first touch moment
- [x] Implement tackle moment
- [x] Implement header moment
- [x] Implement penalty moment
- [x] Implement result feedback UI
- [x] Implement moment difficulty modifiers
- [x] Implement stat-based modifiers
- [x] Implement trait-based modifiers
- [x] Implement controlled randomness
- [x] Add basic animations
- [x] Add reduced-motion alternative

## 7. Match and season simulation

- [x] Define team strength model
- [x] Define opponent model
- [x] Generate 12-match fixture list
- [x] Add derby fixture
- [ ] Add basic cup progression
- [x] Resolve match score from team strength, chaos and player moment outcomes
- [x] Update league table or simplified standings
- [x] Track goals, assists, cards and ratings
- [x] Track fatigue and injury risk after matches
- [x] Track NPC relationship changes
- [x] Track manager trust changes
- [x] Track team Vibes changes
- [x] Track local fame changes

## 8. Narrative and group chat

- [x] Build group chat UI component
- [x] Define message schema
- [x] Add pre-match message templates
- [x] Add post-match message templates
- [x] Add NPC banter templates
- [x] Add manager feedback templates
- [x] Add rival message templates
- [x] Add injury/fatigue message templates
- [x] Add relationship-driven message variants
- [x] Add choice prompts inside chat
- [x] Add message history to current career save

## 9. Responsive UX

- [x] Create mobile portrait layout
- [x] Create mobile landscape checks
- [x] Create tablet portrait layout
- [x] Create tablet landscape layout
- [x] Create desktop layout
- [x] Add bottom action bar for mobile
- [x] Add side panels for desktop
- [x] Add scalable status chips
- [x] Ensure tap targets are large enough
- [x] Remove hover-only interactions
- [x] Test at 360px width
- [x] Test common phone dimensions
- [x] Test tablet dimensions
- [x] Test desktop browser dimensions

## 10. Accessibility

- [x] Add reduced motion setting
- [x] Add text size resilience checks
- [x] Add non-colour state indicators
- [x] Add visual equivalents for audio cues
- [x] Add screen-reader labels for core UI controls where practical
- [x] Add keyboard navigation for menus
- [x] Add input sensitivity setting for drag moments
- [x] Add confirmation for destructive actions

## 11. Discord Activity prototype

- [x] Review current Discord Embedded App SDK docs
- [ ] Create Discord application for development
- [ ] Configure Activity URL and local development tunnel
- [ ] Install Embedded App SDK
- [x] Implement Discord adapter initialisation
- [x] Detect standalone vs Discord Activity mode
- [ ] Fetch basic Discord context where available
- [ ] Create host session concept
- [ ] Create spectator list concept
- [x] Implement audience voting data model
- [x] Implement voting UI for host
- [x] Implement voting UI for spectators
- [x] Implement vote timer
- [x] Implement fallback when no votes arrive
- [ ] Persist Discord session-linked career state
- [ ] Test in Discord desktop
- [ ] Test in Discord web
- [ ] Test in Discord mobile

## 12. Persistence

- [x] Implement local save
- [x] Implement save versioning
- [x] Implement save migration placeholder
- [x] Implement current career save
- [x] Implement Hall of Fame save
- [x] Implement settings save
- [ ] Decide whether MVP needs backend cloud saves
- [ ] If backend required, define API contract
- [ ] If backend required, implement session storage
- [ ] If backend required, implement basic auth/session mapping

## 13. Content pass

- [x] Write Dog & Duck FC intro
- [x] Write ten NPC bios
- [x] Write first 30 chaos cards
- [x] Write first 40 group chat snippets
- [x] Write first 20 post-match headlines
- [x] Write first 12 opponent club names
- [ ] Write first 6 rival player personalities
- [x] Write first 8 career ending titles
- [x] Add content tags for repeat prevention
- [ ] Playtest for tone consistency

## 14. Visual and audio prototype

- [x] Define art direction mood board
- [x] Create temporary UI theme
- [x] Create placeholder club badge
- [x] Create placeholder player silhouettes
- [x] Create pitch/moment visual prototype
- [x] Add basic ball movement feedback
- [x] Add whistle sound
- [x] Add ball kick sound
- [x] Add crowd/pub ambience placeholder
- [x] Add group chat ping
- [x] Add mute setting

## 15. Production Polish (Waves 1-6)

- [x] Implement Screen Shake on goals and impacts
- [x] Implement Hit Stops for physical feedback
- [x] Establish AudioManager with Web Audio API
- [x] Add procedural Kick, Goal, and Miss sounds
- [x] Implement branching Group Chat choices
- [x] Add NPC relationship effects for chat choices
- [x] Refactor Post-Match into 'Sunday League Weekly' Newspaper UI
- [x] Implement Match Momentum system
- [x] Implement Stamina/Energy bars and accuracy penalties
- [x] Update save integrity to v2 with migration logic
- [x] Final UK English (colour, centre, behaviour) audit

## 16. Elite Production (Waves 7-11)

- [x] Implement procedural NPC avatars
- [x] Add real-time Weather Particle Systems (Rain/Fog)
- [x] Add TV Broadcast Match HUD
- [x] Track granular match stats (Pass %, Shots on Target)
- [x] Display cumulative Career Totals on Hub
- [x] Implement multi-season 'Next Season' support
- [x] Add promotion/relegation logic placeholders
- [x] Add interactive Chaos Card choices
- [ ] Implement multi-week narrative subplots
- [x] Track season completed
- [ ] Track career ended
- [x] Track new career started
- [x] Track moment type success/failure
- [x] Track selected archetype
- [x] Track selected midweek action
- [x] Track chaos cards drawn
- [ ] Track Discord votes cast
- [x] Add debug screen for current game state
- [x] Add seed display/copy for bug reports

## 17. Testing

- [ ] Unit test seeded random utility
- [ ] Unit test moment resolution
- [ ] Unit test chaos card eligibility
- [ ] Unit test weekly progression
- [ ] Unit test relationship updates
- [ ] Unit test save/load
- [ ] Unit test season table updates
- [ ] Manual test full MVP season
- [ ] Manual test abandoned career
- [ ] Manual test Hall of Fame
- [ ] Manual test mobile touch input
- [ ] Manual test Discord Activity flow

## 18. Vertical slice milestone

The vertical slice is complete when:

- [x] A player can create a career
- [x] A player can complete at least three weeks
- [x] At least six match moments are playable
- [x] Chaos events affect gameplay
- [x] Group chat responds to outcomes
- [x] Relationships update visibly
- [x] Career can be saved and resumed
- [x] UI works at mobile, tablet and desktop sizes
- [ ] Discord Activity mode can run a host session with one voting prompt

## 19. MVP milestone

The MVP is complete when:

- [x] Full 12-match season is playable
- [ ] Cup route is playable
- [x] Three archetypes are meaningfully different
- [x] Thirty chaos cards are implemented
- [x] Ten NPCs have relationship hooks
- [x] Hall of Fame stores completed careers
- [ ] Discord host plus audience voting works for selected moments
- [x] Performance is acceptable on mid-range mobile
- [x] First-time player can understand the loop without developer guidance


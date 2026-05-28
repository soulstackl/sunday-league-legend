# Sunday League Legend - Game Design Document

> **Implementation status (May 2026):** Vertical slice complete. The project has been refactored from a single-file prototype to a full Vite + React + TypeScript build. All MVP requirements are met. See [AUDIT.md](../AUDIT.md) for current state detail and [ROADMAP.md](../ROADMAP.md) for what is planned next.

## 1. Concept

**Sunday League Legend** is a replayable football life RPG about becoming a local legend in chaotic amateur football.

The player is not controlling a professional club or a full 90-minute football match. They play as one amateur footballer navigating weekly life, unreliable team-mates, muddy pitches, work commitments, rivalries, pub culture, injuries, group chat drama and a handful of decisive match moments.

The core fantasy is: **football glory at the lowest level, where everything matters because everything is personal.**

## 2. Product positioning

### One-line pitch

A mobile-first football RPG where every Sunday brings muddy match moments, chaotic team drama and one more chance to become a local legend.

### Longer pitch

Create a player, join a fictional Sunday league club and play through short, procedural seasons. Each week you choose how to manage your life, fitness and team relationships, then play a small number of decisive football moments. Your choices shape your form, reputation, injuries, team-mate trust, club loyalty and career story.

### Target feel

- Simple like a mobile sports game
- Replayable like a roguelite career run
- Characterful like a sitcom ensemble
- Emotionally sticky like a local club you actually care about
- Fast enough for Discord Activity sessions

## 3. Design pillars

### 3.1 One-thumb football

The game should be playable with one thumb on mobile, touch on tablet and mouse on desktop. The primary interaction is drag, aim and release.

### 3.2 Short sessions, long stories

A week should take 2 to 5 minutes. A season should take 45 to 90 minutes. A career should be memorable without requiring dozens of hours.

### 3.3 Chaos with consequences

Sunday league chaos should not be random noise. It should change gameplay, relationships, odds and story outcomes.

### 3.4 The team is the content

The squad, manager, rival players, referee and group chat should generate recurring stories. The player should care about team-mates as people, not just stat blocks.

### 3.5 Replayability through careers, not grind

Replayability should come from different player builds, clubs, jobs, rivals, events, endings and career choices. Meta progression should unlock variety more than raw power.

## 4. Target platforms

The game should be designed as a responsive web game first.

Primary targets:

- Mobile portrait
- Mobile landscape where useful
- Tablet portrait and landscape
- Desktop browser
- Discord Activity iframe on desktop, web and mobile

This should influence every design choice. Avoid controls that rely on precise keyboard input, hover states or large screens.

## 5. Game structure

### 5.1 The run

A run is one player career.

A typical run:

1. Create player
2. Choose archetype, job and starting club
3. Play weekly cycles across short seasons
4. Build reputation, relationships and traits
5. Handle offers, injuries, drama and rivalries
6. Retire, move up, become captain, become player-manager or flame out
7. Save career summary to Hall of Fame

### 5.2 Season length

Recommended first implementation:

- 12 league matches
- 1 cup competition
- 1 derby fixture
- Optional cup final if qualified

### 5.3 Weekly loop

Each week has four stages.

#### Stage 1: Midweek choice

Player chooses one main action:

- Train
- Rest
- Go gym
- Go pub/team social
- Work overtime
- Watch opposition
- Patch up relationship
- Practise set pieces
- Message group chat

#### Stage 2: Matchday chaos

The game draws one or more chaos events from active decks:

- Club deck
- Pitch deck
- Weather deck
- Rival deck
- Player lifestyle deck
- Season theme deck

#### Stage 3: Key moments

The player plays 4 to 8 match moments.

Moment types may include:

- First touch
- Shot
- Pass
- Cross
- Header
- Tackle
- Clearance
- Penalty
- Free kick
- Defensive positioning
- Keeper save

#### Stage 4: Fallout

The game resolves:

- Scoreline
- Match rating
- Player stats
- Injuries and fatigue
- Relationships
- Manager trust
- Team morale
- Reputation
- Group chat reactions
- Local headline
- Offers and rumours

## 6. Core football interaction

### 6.1 Universal input

Most football actions use the same input:

1. Touch/click and hold
2. Drag to set direction and power
3. Release to execute

Context modifies the result.

### 6.2 Action examples

#### Shooting

Drag from the ball towards a target zone. Power, direction, composure, pressure and player stats determine outcome.

#### Passing

Drag to a team-mate, space or channel. Timing, vision and relationship with the receiver affect run quality and completion.

#### First touch

Drag the desired first touch direction. The pitch, pressure, incoming pass quality and Touch stat determine control.

#### Tackling

Drag into the tackle window. Timing, Graft, aggression and referee reputation determine outcome.

#### Heading

Drag to attack, cushion or clear the ball. Strength, timing, Head stat and positioning determine outcome.

### 6.3 Skill model

Outcomes should blend player skill and RPG stats.

Suggested formula:

- 55% input skill
- 25% player stats and traits
- 10% context modifiers
- 10% controlled randomness

This preserves player agency while allowing RPG progression to matter.

## 7. Player model

### 7.1 Core stats

Use a small number of readable stats.

- **Touch**: first touch, control, dribbling
- **Strike**: shooting, volleys, penalties
- **Pass**: passing, crossing, through balls
- **Engine**: stamina, recovery, work rate
- **Graft**: tackling, pressing, bravery
- **Head**: heading, decisions, composure
- **Pace**: acceleration, loose balls, recovery runs
- **Vibes**: morale, relationships, social influence

### 7.2 Derived states

- Form
- Fitness
- Fatigue
- Injury risk
- Confidence
- Manager trust
- Team chemistry
- Referee reputation
- Local fame

### 7.3 Archetypes

Initial MVP archetypes:

#### The Unit

Strong striker or centre-back. Great for headers, hold-up play and physical duels. Weak at sharp turns and stamina.

#### The Winger

Fast, skilful and selfish if unmanaged. Great for dribbles, crosses and fouls won. Weak defensively.

#### The Midfield Organiser

Reliable passer and leader. Great for decisions, stamina and team influence. Less explosive.

All three MVP archetypes are implemented.

Post-MVP archetypes (planned):

- The Luxury No. 10
- The Dodgy Keeper
- The Veteran
- The Utility Player
- The Hothead
- The Wonderkid

## 8. Clubs

Clubs are campaign modifiers and character containers.

Each club has:

- Name
- Badge and colours
- Home pitch modifier
- Rival club
- Manager personality
- Squad personality
- Chaos deck bias
- Season objective
- Strengths and weaknesses

### MVP club

#### Dog & Duck FC

A pub team with strong social bonds, questionable fitness and a brilliant ability to create drama.

Strengths:

- High Vibes ceiling
- Strong comeback potential
- Pub events are more powerful

Weaknesses:

- Higher hangover risk
- Player availability issues
- Fitness progression is slower

## 9. Team-mates and NPCs

The squad should be small, recurring and memorable.

Each NPC has:

- Name
- Role
- Position
- Ability band
- Reliability
- Temperament
- Relationship with player
- One strength
- One flaw
- One story arc

Example NPCs:

- **Pete the Gaffer**: manager, loyal to 4-4-2, occasionally picks his nephew
- **Deano**: keeper, brilliant reflexes, unreliable before 10am
- **Gav Two Yards**: striker, always offside, deadly from close range
- **Big Taz**: centre-back, wins headers, turns slowly, protects friends
- **Callum Trialist**: young winger, quick, selfish, may get scouted
- **Clive**: recurring referee, low tolerance for dissent

## 10. Chaos deck system

The chaos deck is the procedural event engine.

### 10.1 Deck sources

Cards can come from:

- Club
- Pitch
- Weather
- Opponent
- Player job
- Player traits
- Relationships
- Season theme
- Previous choices

### 10.2 Card anatomy

Each card should define:

- Title
- Description
- Trigger timing
- Requirements
- Gameplay modifier
- Relationship effects
- Duration
- Counterplay

### 10.3 Example cards

#### Keeper is Late

Deano has not arrived at kick-off. A centre-back starts in goal for the first half.

Effects:

- Opponent xG modifier increases
- Defensive moments become more common
- If player calms team, Vibes loss is reduced

Counterplay:

- High Deano relationship lowers chance
- Captain trait can delay kick-off once per season

#### Boggy Pitch

The pitch is heavy and slow.

Effects:

- Ground passes slow down
- First touch checks are harder
- Sliding tackles are easier
- Pace advantage is reduced

#### Bare Eleven

Exactly eleven players have arrived.

Effects:

- No substitutions
- Fatigue grows faster
- Winning improves team Vibes more than usual

## 11. Narrative systems

### 11.1 Group chat

The group chat is the main narrative UI.

Use it for:

- Fixture reminders
- Team banter
- Availability drama
- Manager messages
- Consequences from previous choices
- Rival messages where appropriate
- Match fallout

The group chat should be short, punchy and interactive. Avoid walls of text.

### 11.2 Rivalries

Each run should generate:

- Main rival club
- Rival player
- Nemesis referee or recurring official
- Team-mate tension
- Favourite team-mate

### 11.3 Endings

Careers end with a local legend summary.

Example endings:

- Club Legend
- Pub Hero
- Could Have Gone Pro
- Cup Final Bottler
- Sunday League Cantona
- The Man Who Saved Dog & Duck FC
- Sent Off in His Own Testimonial

## 12. Discord Activity angle

Sunday League Legend can work well as a Discord Activity because the theme is already social, session-based and built around group banter.

### 12.1 Activity modes

#### Solo in voice

One player runs their career while friends watch, react and vote on occasional decisions.

#### Shared club

A Discord group controls a club together. Each participant owns a player. The week advances when the host starts the next fixture.

#### Hot-seat moments

During a match, different Discord participants take key moments for their own player.

#### Spectator voting

Spectators vote on choices such as:

- Go pub or rest?
- Pass to Gav or shoot?
- Calm Big Taz or let him cook?
- Take the semi-pro offer or stay loyal?

### 12.2 Recommended MVP Discord mode

Start with **solo host plus audience voting**.

Why:

- Lower networking complexity
- Fits streaming/voice chat behaviour
- Keeps the core single-player game intact
- Lets friends influence the story
- Works even with one active player

### 12.3 Discord-specific design rules

- Assume iframe constraints
- Assume mobile clients
- Avoid tiny text
- Avoid hover-only UI
- Make voting asynchronous within short timers
- Persist state outside Discord session
- Design for voice chat running alongside play

## 13. Responsive UX principles

### 13.1 Layout

Use a card-based interface that can collapse cleanly.

Primary mobile layout:

1. Current stage header
2. Main content card
3. Action buttons
4. Compact player/team status
5. Navigation drawer or bottom bar

Desktop layout:

- Main gameplay area centred
- Status/sidebar on the right
- Group chat or log on the left
- Bottom action bar

Tablet layout:

- Similar to desktop landscape
- Mobile-style stacked layout in portrait

### 13.2 Input

Support:

- Touch drag
- Mouse drag
- Keyboard shortcuts as optional enhancement
- Gamepad as future enhancement

### 13.3 Accessibility

- Large tap targets
- Colourblind-safe information design
- Reduced motion option
- Text size setting
- Haptics optional on supported devices
- No critical information conveyed only through colour

## 14. Art and audio direction

### 14.1 Visual style

Use stylised 2D rather than realism.

Good direction:

- Bold characters
- Muddy pitches
- Pub noticeboard UI
- Group chat panels
- Sticker-like player portraits
- Slightly exaggerated animations

Avoid:

- Full 3D simulation expectations
- Licence-dependent realism
- Tiny player sprites that lack personality

### 14.2 Audio

- Whistle blows
- Ball thuds
- Rain and wind
- Crowd of seven people cheering too loudly
- Pub ambience
- Group chat pings
- Sunday morning birds/traffic

## 15. Monetisation options

Preferred ethical options:

- Paid game
- Free demo plus paid full unlock
- Cosmetic club packs
- Cosmetic kit/badge editor additions
- Optional supporter pack

Avoid:

- Energy timers
- Pay-to-win stat boosts
- Loot boxes
- Gambling-like card packs

## 16. MVP scope

### MVP includes

All items below are implemented.

- Web game shell
- Responsive UI
- One club: Dog & Duck FC
- One season structure
- Three archetypes
- Six moment types
- Thirty chaos cards
- Ten named NPCs
- Group chat system
- Basic career save
- Hall of Fame entry
- Discord Activity prototype with host plus audience voting

### MVP excludes

- Full 90-minute match simulation
- Online PvP football
- Deep transfer market
- Licensed teams
- Complex 3D engine
- Multi-season world simulation
- Native mobile apps

## 17. Success criteria

All criteria below are met except the Discord spectator criterion, which is partially met: the voting UI is built but full Discord session integration (app registration, tunnelling, session persistence) is still pending.

Prototype succeeds if:

- A week can be completed in under 5 minutes
- A player understands controls within 60 seconds
- Match moments feel satisfying after 10 attempts
- Players remember at least two NPCs by name after one season
- Players want to start a second career with a different archetype
- Discord spectators meaningfully influence at least one story outcome


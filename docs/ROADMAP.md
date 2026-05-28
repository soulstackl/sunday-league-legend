# Sunday League Legend , Development Roadmap

Waves 1 through 11 are complete. Live Discord Activity infrastructure and unit-test coverage are the remaining outstanding workstreams.

---

## Waves 1 to 6: Production Polish

Complete. Screen shake, hit stops, procedural audio, branching chat choices, Sunday League Weekly newspaper UI, match momentum, stamina bars, save v3 with migration, full UK English audit.

## Waves 7 to 9: Elite Production

Complete. Procedural NPC avatars, weather particle systems, TV broadcast HUD, granular match stats, multi-season Next Season flow, interactive chaos card choices, multi-week NPC subplots.

## Wave 10: Presentation and UX Mastery

Complete.

- Settings: text size, input sensitivity, reduced motion, sound toggle, destructive-action confirmation
- Squad screen with relationship bands and NPC strengths/flaws
- Hall of Fame retrospective showing tier, cup, seasons, points, goals
- Stat growth screen between seasons (three offers: weakest, mid, archetype)
- Tier-aware league table with promotion/relegation zones

## Wave 11: Multi-Season and Evolution

Complete.

- Three-tier league: Division Three (entry), Division Two, Premier Division
- Promotion (top 2) and relegation (bottom 2) at season end
- Per-tier opponent rosters with difficulty scaling (12 opponents per tier)
- Career endings respond to promotion movement and cup outcome
- Pre-season stat growth carries between seasons

---

## Outstanding workstreams

### Discord Activity live infrastructure

- Register a Discord application
- Set up the local development tunnel
- Install the Embedded App SDK and wire init through the discord adapter
- Build a WebSocket vote channel (SAM stack as per `docs/STACK.md`)
- Test across Discord desktop, mobile and web clients

### Unit test coverage

- `engine/rng.ts`
- `engine/match.ts`
- `engine/chaos.ts`
- `engine/league.ts`
- `engine/schedule.ts`
- `engine/endings.ts`
- `store/persistence.ts` (especially the v1 and v2 migrations)

---

## Items considered and ruled out

| Considered | Reason not pursued |
| --- | --- |
| Phaser for ArenaScreen | Hand-rolled Canvas is sufficient |
| Cloud saves from the start | Local saves cover solo play; defer until Discord is proven |
| Player-manager mode early | Scope risk; deferred to future career arc work |
| Keyboard-first input | Touch/mouse primary; keyboard as future accessibility enhancement |
| Online PvP | Outside scope; Discord Activity covers the social layer |

import type { CommentaryKey } from './arenaScenarios'

export type GoalQuality = 'topcorner' | 'chip' | 'tucked' | 'rising' | 'standard'
export type FailureKind = 'saved' | 'woodwork' | 'crossbar' | 'nearMiss' | 'wide' | 'intercepted' | 'overhit' | 'cleared' | 'mistimed' | 'tooEarly' | 'tooLate' | 'beaten' | 'poorTouch' | 'bobbled'

export interface CommentaryPack {
  goal: Partial<Record<GoalQuality, string[]>>
  success?: string[]
  saved?: string[]
  woodwork?: string[]
  crossbar?: string[]
  nearMiss?: string[]
  wide?: string[]
  intercepted?: string[]
  overhit?: string[]
  cleared?: string[]
  mistimed?: string[]
  tooEarly?: string[]
  tooLate?: string[]
  beaten?: string[]
  poorTouch?: string[]
  bobbled?: string[]
}

const SHARED_NEAR_MISS = [
  'Inches wide of the post!',
  "Crowd ooh'd, that whistled past the post!",
  "So close, keeper's heart skipped a beat.",
  'Curled just over the bar!',
]

const SHARED_SAVE = [
  'Keeper holds it. Decent shot, better save.',
  'Their keeper somehow gets a glove on it.',
  'Pushed wide. Strong wrists.',
  "He'd have been beaten if it had any more dip.",
]

const SHARED_GOAL_TOPCORNER = [
  'TOP BINS! Absolute screamer!',
  'Top corner, keeper had no chance!',
  'Postage stamp! What a finish!',
  'Right in the upright! He never saw it!',
]

const SHARED_GOAL_TUCKED = [
  'Tucked away! Cold-blooded.',
  'Slotted neatly inside the post.',
  'Side-footed home like a pro.',
  'Calm as you like, into the corner.',
]

const SHARED_GOAL_RISING = [
  'Rising rocket, back of the net!',
  'Lashed it home off the underside!',
  'Power finish! Get in!',
  'Smashed it through him!',
]

const SHARED_GOAL_STANDARD = [
  'Pick that out!',
  'Get in! Back of the net.',
  'Goal, well done lad.',
  'Worldie. Pure worldie.',
]

export const COMMENTARY: Record<CommentaryKey, CommentaryPack> = {
  shotOpenPlay: {
    goal: { topcorner: SHARED_GOAL_TOPCORNER, tucked: SHARED_GOAL_TUCKED, rising: SHARED_GOAL_RISING, standard: SHARED_GOAL_STANDARD },
    saved: SHARED_SAVE,
    nearMiss: SHARED_NEAR_MISS,
    woodwork: ['Off the post! Agony.', 'Inches from glory.', 'Hits the upright and away.'],
    crossbar: ['Cannons off the bar!', 'Off the crossbar! Unreal.', 'Bar saves the keeper there.'],
  },

  shotLongRange: {
    goal: {
      topcorner: ['THAT IS HUGE! From 30 yards!', 'Pure venom! Top corner from miles!', 'Howitzer! Goal of the season!'],
      rising: ['Lasered it from range!', 'Pure power, 25 yards, in!'],
      standard: ['Lashed it in from range!', 'Hits it sweet and watches it fly in.'],
    },
    saved: ['Tipped over the bar from range. Strong hand.', 'Keeper holds it after the dip.', 'He sees it all the way and gathers.'],
    nearMiss: ['From distance, just over!', '30 yards out, agonisingly wide.', 'Flies just past the angle.'],
    woodwork: ['Hits the post from 25 yards!', 'Off the woodwork. So close from range!'],
    crossbar: ['Cracks the crossbar from distance!', 'Bar comes to the keeper\'s rescue.'],
  },

  shotCloseRange: {
    goal: { standard: ['Tap it in!', 'From close range, easy.', 'Stabs it home.'], tucked: ['Cool finish from six yards.'] },
    saved: ['Keeper blocks at point-blank!', 'Reaction save from a yard!', 'Smothered on the line!'],
    nearMiss: ['Steered wide from close range! How?!', 'Should have buried it!'],
  },

  shotWeakFoot: {
    goal: { standard: ['On his weaker foot! Get in!', 'Wrong foot, right result!', 'Scuffed it in but who cares!'] },
    saved: ['Lacked conviction on his weaker foot.', 'Telegraphed it. Keeper read it.'],
    nearMiss: ['Sliced wide. Weaker foot betrayed him.', 'Off his shin, away to safety.'],
  },

  shotFirstTime: {
    goal: { rising: ['First time! Bang!', 'Met it perfectly!', 'No backlift, all venom!'], topcorner: ['First-time finish into the top corner!'] },
    saved: ['Met it true but the keeper was alive.', 'Stopped, somehow.'],
    nearMiss: ['First-time effort drifts wide.', 'Caught it on the half-volley, just over.'],
  },

  shotOnTheTurn: {
    goal: { tucked: ['On the spin! Keeper wrong-footed!', 'Turned and finished in one motion!'] },
    saved: ['Spun and shot, keeper sticks out a leg.'],
    nearMiss: ['Quick turn, dragged it wide.'],
  },

  shotNarrowAngle: {
    goal: { topcorner: ['From an impossible angle!', 'Squeezed in at the near post!'], standard: ['Finds the gap from nothing!'] },
    saved: ['Keeper covers his near post well.', 'Body in the way from the tight angle.'],
    nearMiss: ['Tight angle, drifts the wrong side.', 'Whistled across the face from nothing.'],
  },

  passThroughBall: {
    goal: {},
    success: ['Threaded perfectly! In on goal!', 'Sliced the defence open!', 'Vision and execution.'],
    intercepted: ['Read it. Stepped in.', 'Cut out by the centre-half.'],
    overhit: ['Too much weight on it.', 'Sailed through to the keeper.'],
  },

  passSwitch: {
    goal: {},
    success: ['Magnificent switch of play!', 'Inch-perfect diagonal.', 'Across the pitch and onto a sixpence.'],
    intercepted: ['Cut out at full stretch.', 'Defender reads the diagonal.'],
    overhit: ['Out for a throw.', 'Overcooked the switch.'],
  },

  passSquare: {
    goal: {},
    success: ['Spot on. Right to your man.', 'Crisp and simple.', 'Knocks it square, perfect.'],
    intercepted: ['Cut out, hospital ball.', 'Defender nips in.'],
    overhit: ['Sailed past the lot of them.', 'Too much on it.'],
  },

  passKiller: {
    goal: {},
    success: ['Killer ball! Game-breaker!', 'Carved them open!', 'One pass, defence dismantled!'],
    intercepted: ['Brave try, intercepted.', 'Almost. Defender just gets there.'],
    overhit: ['Ambitious. Too ambitious.', 'Past everyone, no one home.'],
  },

  passTrivela: {
    goal: {},
    success: ['Outside of the boot! Showboating, and it worked!', 'Trivela! Style points!', 'Bent it round with the outside!'],
    intercepted: ['Trivela was read. Embarrassment.', 'Tried to be clever, got punished.'],
    overhit: ['Outside-foot pass, well overhit.'],
  },

  touchControl: {
    goal: {},
    success: ['Beautiful first touch, glued to your boot.', 'Velvet touch.', 'Killed it dead.'],
    poorTouch: ['Bounces off your shin. Wasted it.', 'Heavy touch, lost possession.'],
    bobbled: ['Too heavy. Ball ran away.', 'Bobbled and gone.'],
  },

  touchChest: {
    goal: {},
    success: ['Chested down beautifully.', 'Cushioned on the chest, perfect.', 'Settled it on his chest like a pro.'],
    poorTouch: ['Bounces awkwardly off your shoulder.', 'Chest control let him down.'],
    bobbled: ['Up and over his head.', 'Chest sends it too far ahead.'],
  },

  touchSpin: {
    goal: {},
    success: ['Touch and spin in one motion!', 'Pirouette! He\'s away!'],
    poorTouch: ['Mistimed the spin.', 'Caught in two minds.'],
    bobbled: ['Touch ran away from him.'],
  },

  touchCushion: {
    goal: {},
    success: ['Cushioned it perfectly into space.', 'Soft as anything.'],
    poorTouch: ['Stabbed at it, lost it.', 'Too firm a touch.'],
    bobbled: ['Cushion turned to bobble.'],
  },

  tackleSlide: {
    goal: {},
    success: ['Crunching tackle, ball won cleanly.', 'Textbook slide, gets the ball.', 'CLATTERED him, clean as a whistle.'],
    tooEarly: ['Dived in too early. He\'s gone past you.', 'Lunged. Beaten.', 'Early. He skipped over you.'],
    tooLate: ['A split-second late, he\'s away.', 'Caught him after the ball.', 'Late. Free kick coming.'],
    beaten: ['Wrong angle. He\'s just nutmegged you.', 'Stood up and beaten.', 'Body shape all wrong.'],
  },

  tackleBlockBody: {
    goal: {},
    success: ['Body in the way, ball stopped dead.', 'Steamrolled him fairly.', 'Won it back with sheer presence.'],
    tooEarly: ['Stepped in too soon, ran round you.'],
    tooLate: ['Got there second. Sloppy.'],
    beaten: ['Showed him the wrong side, gone.'],
  },

  tackleShoulder: {
    goal: {},
    success: ['Shoulder to shoulder, won it cleanly.', 'Muscled him off, ball is yours.'],
    tooEarly: ['Leaned in too early. Free kick.'],
    tooLate: ['Caught him late. Yellow card material.'],
    beaten: ['Bounced off him. Stronger than he looks.'],
  },

  tackleInterception: {
    goal: {},
    success: ['Reads it perfectly! Picks the pocket!', 'Anticipates and intercepts!', 'Beautiful read, ball is yours.'],
    tooEarly: ['Showed his hand. Pass went round him.'],
    tooLate: ['Reacted, didn\'t anticipate. Late.'],
    beaten: ['Read it wrong. Out of position.'],
  },

  headerAttacking: {
    goal: { topcorner: ['Bullet header, top corner!', 'Powerful header into the angle!'], standard: ['Heads it home!', 'Nodded in!'], rising: ['Powered the header in!'] },
    saved: ['Keeper claws it away!', 'Strong header, stronger save.'],
    mistimed: ['Mistimed your jump, ball squirms over your head.', 'Caught between heading and ducking.'],
    nearMiss: ['Heads it wide!', 'Off target with the header!'],
    woodwork: ['Header crashes off the post!'],
  },

  headerBackPost: {
    goal: { standard: ['Free at the back post, headed in!'], rising: ['Climbed at the far post!'] },
    saved: ['Back-post header, keeper at full stretch.'],
    mistimed: ['Mistimed at the back post.', 'Got under it.'],
    nearMiss: ['Back-post header wide.'],
  },

  headerDefensive: {
    goal: {},
    success: ['Cleared with authority.', 'Big header, danger gone.', 'Hoofed it clear.'],
    mistimed: ['Glanced it on into trouble.', 'Got under the clearance.'],
    poorTouch: ['Header drops at a striker\'s feet. Trouble.'],
  },

  headerFlickOn: {
    goal: {},
    success: ['Glanced on perfectly!', 'Flick on, runner in behind!'],
    mistimed: ['Couldn\'t get the flick on.', 'Got too much on it.'],
    nearMiss: ['Flick goes long.'],
  },

  headerBullet: {
    goal: { topcorner: ['BULLET HEADER, TOP CORNER!'], rising: ['Thundering header in!'] },
    saved: ['Bullet header, world-class save.'],
    nearMiss: ['Powered it wide.'],
    woodwork: ['Header off the iron!'],
  },

  penaltyStandard: {
    goal: { topcorner: ['Picked the top corner from the spot!', 'Spot on, top corner!'], tucked: ['Side-footed, cool as ice.', 'Tucked away.'], standard: ['Buries the penalty.'] },
    saved: ['Saved! Keeper guessed right.', 'Stopped at full stretch.'],
    nearMiss: ['Pulled it wide of the post!', 'Skied it! Disaster!'],
    crossbar: ['Penalty off the bar! Unreal!'],
    woodwork: ['Hits the post! Penalty woe!'],
  },

  penaltyPanenka: {
    goal: { chip: ['PANENKA! He sat down for it!', 'Chipped! Keeper humiliated!', 'Cheekiest finish you\'ll see all season.'] },
    saved: ['Keeper stood up. Caught it. Humiliation.', 'Didn\'t buy the dummy. Easy save.'],
    nearMiss: ['Panenka over the bar! What was he thinking!'],
  },

  penaltyDownMiddle: {
    goal: { rising: ['Down the middle! Keeper went the wrong way!'], standard: ['Straight down the middle and in!'] },
    saved: ['Keeper stayed home. Straight at him.'],
    crossbar: ['Down the middle, off the bar!'],
  },

  freekickDirect: {
    goal: { topcorner: ['Top corner, dead-ball wizardry!', 'Free kick bent into the angle!'], standard: ['Free kick in!'] },
    saved: ['Free kick, strong save behind for a corner.', 'Tipped over from the dead ball.'],
    nearMiss: ['Curls just wide of the post!', 'Whips it over the bar.'],
    woodwork: ['Off the post from the free kick!'],
    crossbar: ['Cracks the bar from the dead ball!'],
  },

  freekickLong: {
    goal: { topcorner: ['From 30! Top bins!', 'Banged in from range!'], rising: ['Drove it in from distance!'] },
    saved: ['Long-range free kick, keeper gathers.'],
    nearMiss: ['Long-range effort drifts wide.'],
    woodwork: ['From distance, off the post!'],
  },

  freekickNarrow: {
    goal: { topcorner: ['From a tight angle into the far corner!'], standard: ['Bends it round from the angle!'] },
    saved: ['Tight angle, keeper has it covered.'],
    nearMiss: ['Off the angle, agonisingly close.'],
  },

  freekickShort: {
    goal: {},
    success: ['Worked the routine to perfection!', 'Training-ground stuff! Open them up!'],
    intercepted: ['Routine read. Defence ready.'],
    overhit: ['Overcooked the lay-off.'],
  },

  freekickBullet: {
    goal: { rising: ['Drove it through the wall!', 'Bullet under the wall!'], standard: ['Smashed in low and hard!'] },
    saved: ['Driven free kick, keeper holds firm.'],
    woodwork: ['Driven into the post!'],
  },

  cornerInswinger: {
    goal: {},
    success: ['Whipped in beautifully, your man rose highest!', 'Inswinger, met perfectly!'],
    intercepted: ['Cleared by the first man.', 'Keeper claims comfortably.'],
    overhit: ['Sailed everyone.', 'Out for a goal kick.'],
    cleared: ['Headed clear.', 'Easy take.'],
  },

  cornerOutswinger: {
    goal: {},
    success: ['Outswinger, met on the edge!', 'Curled away for the late runner!'],
    intercepted: ['Cut out at the near post.'],
    overhit: ['Drifted past everyone.'],
    cleared: ['Cleared on the edge of the box.'],
  },

  cornerShort: {
    goal: {},
    success: ['Worked the short corner well.', 'Short corner, opened up an angle.'],
    intercepted: ['Defender reads the short corner.'],
    overhit: ['Lost in the lay-off.'],
  },

  cornerFarPost: {
    goal: {},
    success: ['Big Taz rose highest at the back post!', 'Inch-perfect to the far post!'],
    intercepted: ['Headed away from the back post.'],
    overhit: ['Over the head of the target.'],
  },

  cornerNearPost: {
    goal: {},
    success: ['Whipped in low for the near-post flick!', 'Near-post run met perfectly!'],
    intercepted: ['Defender beats him to the near post.'],
    overhit: ['Flies past everyone at the near post.'],
  },

  volleyHalf: {
    goal: { rising: ['Half-volley, into the roof!', 'Met it on the half-volley, banged in!'], topcorner: ['Sweet half-volley, top corner!'] },
    saved: ['Caught the half-volley, keeper holds.'],
    mistimed: ['Mistimed the half-volley, ballooned over.'],
    nearMiss: ['Caught it sweet, just wide.'],
  },

  volleyScissor: {
    goal: { rising: ['SCISSOR KICK! WHAT A FINISH!', 'Acrobatic and in! Goal of the season!'], topcorner: ['Scissor into the top corner! Get in!'] },
    saved: ['Scissor kick, brilliant save!'],
    mistimed: ['Got under the scissor, sailed over.'],
    nearMiss: ['Scissor wide. Brave attempt.'],
  },

  oneVone: {
    goal: { chip: ['Dinked over the onrushing keeper!', 'Chipped him! Audacious!'], tucked: ['Slotted past the keeper, calm as you like.'], standard: ['One on one, finished!'] },
    saved: ['Keeper spreads himself! Save!', 'Stopped one-on-one.'],
    nearMiss: ['Pulled it wide one-on-one!', 'Round the keeper, lost his angle.'],
  },

  tapIn: {
    goal: { standard: ['Tap-in! Easy.', 'Couldn\'t miss from there!', 'Stabbed home at the far post.'] },
    saved: ['Somehow blocked on the line!', 'Tap-in, blocked by a heroic defender!'],
    nearMiss: ['MISSED THE TAP-IN! UNTHINKABLE!', 'Sliced the tap-in wide!'],
    poorTouch: ['Got tangled at the far post.'],
  },

  cutback: {
    goal: {},
    success: ['Cutback, perfectly weighted!', 'Pulled back to the runner, peach of a ball.'],
    intercepted: ['Defender slides in to cut it out.'],
    overhit: ['Cutback too firm, past everyone.'],
  },

  longRange: {
    goal: { topcorner: ['LONG RANGE WORLDIE!', 'From distance into the top corner!'], rising: ['Lashed it from 30!'], standard: ['Long-range belter!'] },
    saved: ['Strong hand to the long-range effort.'],
    nearMiss: ['From distance, drifts past the post.'],
    woodwork: ['Hits the iron from range!'],
  },

  block: {
    goal: {},
    success: ['Brave block! Threw the body in!', 'Charged it down!', 'Body on the line, brilliant block!'],
    tooEarly: ['Dived in too early, shot went round you.'],
    tooLate: ['Late to the block, shot got through.'],
    beaten: ['Stood off. Got punished.'],
  },

  clearance: {
    goal: {},
    success: ['Cleared with authority.', 'Up and out, danger gone.', 'Boots it into Row Z.'],
    poorTouch: ['Stabbed at the clearance, fell to a striker.'],
    overhit: ['Sliced clearance. Lucky no one capitalised.'],
    intercepted: ['Charged down! Trouble!'],
  },

  goallineClearance: {
    goal: {},
    success: ['OFF THE LINE! SCENES!', 'Cleared off the line!', 'GOAL-LINE HEROICS!'],
    tooLate: ['A split-second too late, it crossed.'],
    tooEarly: ['Cleared into his own goal area!'],
  },

  throwInLong: {
    goal: {},
    success: ['Long throw, met perfectly!', 'Hurled it into the danger zone!'],
    intercepted: ['Defender beats him to it.'],
    overhit: ['Sailed everyone in the box.'],
    cleared: ['Headed clear from the long throw.'],
  },

  nutmeg: {
    goal: {},
    success: ['NUTMEG! Through his legs! Sit him down!', 'NUTS! He\'s humiliated!', 'Threaded it through, scenes!'],
    intercepted: ['Closed his legs in time. Awkward.'],
    overhit: ['Missed the gap. Bounces off his shin.'],
  },

  skillMove: {
    goal: {},
    success: ['Turned him inside out!', 'Stepover, gone!', 'Made him look silly!'],
    poorTouch: ['Tried to be clever, got tackled.'],
    beaten: ['Defender wasn\'t fooled. Embarrassment.'],
  },

  rabona: {
    goal: {},
    success: ['RABONA! Showboating gold!', 'Wrapped it round! Inch perfect!'],
    overhit: ['Rabona, way over. Cocky.'],
    intercepted: ['Tried the rabona, telegraphed.'],
  },

  bicycle: {
    goal: { rising: ['BICYCLE KICK! GET IN!', 'Acrobatic finish! Pure cinema!'], topcorner: ['Bicycle into the top corner!'] },
    saved: ['Bicycle, brilliant save!'],
    mistimed: ['Mistimed the bicycle, fell flat on his back.'],
    nearMiss: ['Bicycle, sailed wide.'],
  },

  keeperSave: {
    goal: {},
    success: ['Read it! Cat-like save!', 'Strong hand! Out for a corner!', 'Spreads himself! Save!'],
    beaten: ['Wrong way! Goal!', 'Dived past it! Goal!'],
  },
}

export function pickLine(arr?: string[]): string | null {
  if (!arr || arr.length === 0) return null
  return arr[Math.floor(Math.random() * arr.length)]
}

import type { ChatMessage, SubplotProgress } from '../types/game'

export interface SubplotStage {
  message: ChatMessage
  resolves?: boolean
}

export interface SubplotDefinition {
  id: string
  title: string
  startWeek: number
  npcId: string
  stages: SubplotStage[]
  gate?: (active: SubplotProgress[]) => boolean
}

// ---------------------------------------------------------------------------
// SEASON 1 SUBPLOTS (weeks 2-5)
// ---------------------------------------------------------------------------

const pete: SubplotDefinition = {
  id: 'pete-retirement',
  title: "Pete's Last Dance",
  startWeek: 3,
  npcId: 'pete',
  stages: [
    {
      message: {
        sender: 'pete',
        text: 'Quick word later. The mrs wants me out of this hobby. Twenty-three years of mud is enough for any woman to bear.',
        time: 'Wed 8:10pm',
        choices: [
          { text: "Gaffer no. Win the Tankard with us first.",               effect: { relationship: { pete: 8 }, vibes: 1 } },
          { text: "Fair play. You've done your time.",                       effect: { relationship: { pete: 4 } } },
          { text: 'Hand the reins to Big Taz then. He fancies it.',          effect: { relationship: { pete: -3, bigtaz: 8 } } },
        ],
      },
      resolves: true,
    },
  ],
}

const taz: SubplotDefinition = {
  id: 'taz-knee',
  title: "Taz's Knee",
  startWeek: 5,
  npcId: 'bigtaz',
  stages: [
    {
      message: {
        sender: 'bigtaz',
        text: "Knee is at me again. Probably nothing. Probably.",
        time: 'Tue 9:30pm',
        choices: [
          { text: 'Get Bev to wrap it properly before every match.', effect: { relationship: { bigtaz: 6, bev: 5 } } },
          { text: 'Push through it big man, we need you.',           effect: { relationship: { bigtaz: -3 } } },
          { text: 'Tell Pete to rest you for a couple of weeks.',    effect: { relationship: { bigtaz: 10 } } },
        ],
      },
      resolves: true,
    },
  ],
}

const callum: SubplotDefinition = {
  id: 'callum-trial',
  title: "Callum's Trial",
  startWeek: 4,
  npcId: 'callum',
  stages: [
    {
      message: {
        sender: 'callum',
        text: "Scout from Brewers Town reckons I have a trial. I dunno. Loyalty is a thing but so is twenty quid a match.",
        time: 'Thu 6:45pm',
        choices: [
          { text: 'Go for it. Career first, mate.',          effect: { relationship: { callum: 6 } } },
          { text: 'Stay. We need you for the Tankard run.',  effect: { relationship: { callum: 10 } } },
          { text: 'Up to you. Just give us a heads up.',     effect: { relationship: { callum: 2 } } },
        ],
      },
      resolves: true,
    },
  ],
}

const gary: SubplotDefinition = {
  id: 'gary-confidence',
  title: "Gary's Confidence",
  startWeek: 2,
  npcId: 'garyNephew',
  stages: [
    {
      message: {
        sender: 'garyNephew',
        text: "Sorry I keep messing up. Uncle Pete only picks me cos no one else turns up. Im trying I promise.",
        time: 'Tue 11:14pm',
        choices: [
          { text: 'You belong here Gary. Heads up.',          effect: { relationship: { garyNephew: 12, pete: 3 }, vibes: 1 } },
          { text: "Just keep it simple. Don't overthink it.", effect: { relationship: { garyNephew: 6 } } },
          { text: 'Mate, train harder. It is what it is.',    effect: { relationship: { garyNephew: -5 } } },
        ],
      },
      resolves: true,
    },
  ],
}

// ---------------------------------------------------------------------------
// MID-SEASON SUBPLOTS (weeks 6-14)
// ---------------------------------------------------------------------------

const deanoForm: SubplotDefinition = {
  id: 'deano-form',
  title: "Deano's Slump",
  startWeek: 6,
  npcId: 'deano',
  stages: [
    {
      message: {
        sender: 'deano',
        text: "Been a bit off this month. Head's not right. Nothing to do with the two pints last Thursday, before you say it.",
        time: 'Mon 7:45pm',
        choices: [
          { text: 'Talk to Pete about giving you a run.',         effect: { relationship: { deano: 6, pete: -2 } } },
          { text: 'Maybe it is the two pints.',                   effect: { relationship: { deano: -4 } } },
          { text: "Alright, what's really going on?",             effect: { relationship: { deano: 10 }, vibes: 1 } },
        ],
      },
      resolves: true,
    },
  ],
}

const dazzaPenalty: SubplotDefinition = {
  id: 'dazza-penalty',
  title: "Dazza's Penalty Nerves",
  startWeek: 7,
  npcId: 'dazza',
  stages: [
    {
      message: {
        sender: 'dazza',
        text: "Pete says I'm taking the next penalty. I have never taken one in me life. I'm sweating already.",
        time: 'Wed 6:00pm',
        choices: [
          { text: 'Five to the left, full power. Every time.',    effect: { relationship: { dazza: 8 } } },
          { text: 'Do the Panenka. Trust yourself.',              effect: { relationship: { dazza: 4, pete: 2 } } },
          { text: 'Practice in the car park tomorrow night.',     effect: { relationship: { dazza: 10 }, vibes: 1 } },
        ],
      },
      resolves: true,
    },
  ],
}

const cliveInjury: SubplotDefinition = {
  id: 'clive-injury-cover',
  title: "Clive's Knee",
  startWeek: 8,
  npcId: 'clive',
  stages: [
    {
      message: {
        sender: 'clive',
        text: "Knee's gone. Doc says six to eight weeks. Bloody typical. Any chance you'd mention me to Pete? Just a word.",
        time: 'Tue 8:20pm',
        choices: [
          { text: "I'll put a word in. No promises.",             effect: { relationship: { clive: 10, pete: 3 } } },
          { text: "That's tough. What's the physio plan?",       effect: { relationship: { clive: 6 } } },
          { text: 'Happens to everyone eventually.',             effect: { relationship: { clive: -5 } } },
        ],
      },
      resolves: true,
    },
  ],
}

const shazCaptain: SubplotDefinition = {
  id: 'shaz-captain',
  title: "Shaz Steps Up",
  startWeek: 9,
  npcId: 'shaz',
  stages: [
    {
      message: {
        sender: 'shaz',
        text: "Club need a new vice-captain. I think I'm the right person but Pete keeps ignoring me. Could you back me up?",
        time: 'Thu 9:10pm',
        choices: [
          { text: "You've earned it, I'll tell Pete.",           effect: { relationship: { shaz: 12, pete: -2 }, teamChemistry: 3 } },
          { text: 'Maybe nominate yourself in the meeting?',     effect: { relationship: { shaz: 6 } } },
          { text: "I'd rather stay out of club politics.",       effect: { relationship: { shaz: -4 } } },
        ],
      },
      resolves: true,
    },
  ],
}

const bevBurnout: SubplotDefinition = {
  id: 'bev-burnout',
  title: "Bev's Burnout",
  startWeek: 10,
  npcId: 'bev',
  stages: [
    {
      message: {
        sender: 'bev',
        text: "I tape you lot up every week, wash the kit, run the line. Nobody says thanks. I'm one bad Sunday away from walking.",
        time: 'Fri 7:30pm',
        choices: [
          { text: "Bev, you hold this club together. Genuinely.", effect: { relationship: { bev: 15 }, teamChemistry: 5 } },
          { text: "Noted. I'll say something at the pub.",        effect: { relationship: { bev: 8 } } },
          { text: 'Speak to Pete about it.',                      effect: { relationship: { bev: 4, pete: 3 } } },
        ],
      },
      resolves: true,
    },
  ],
}

const gavBet: SubplotDefinition = {
  id: 'gav-bet',
  title: "Gav's Side Bet",
  startWeek: 11,
  npcId: 'gav',
  stages: [
    {
      message: {
        sender: 'gav',
        text: "Put a tenner on us to win the league. Long odds. Now I'm going mad watching the table every night. Don't tell Pete.",
        time: 'Mon 10:40pm',
        choices: [
          { text: 'Your secret is safe. Just focus on the match.', effect: { relationship: { gav: 8 }, confidence: 3 } },
          { text: "That's a mug's game. You're better than that.", effect: { relationship: { gav: -3 } } },
          { text: 'Double down. Nothing to lose.',                  effect: { relationship: { gav: 5 }, vibes: 2 } },
        ],
      },
      resolves: true,
    },
  ],
}

const peteUltimatum: SubplotDefinition = {
  id: 'pete-ultimatum',
  title: "Pete's Ultimatum",
  startWeek: 12,
  npcId: 'pete',
  stages: [
    {
      message: {
        sender: 'pete',
        text: "The committee want me to make three cuts after the season. I'll fight for the boys but I need wins. Simple as that.",
        time: 'Wed 8:00pm',
        choices: [
          { text: "We'll get you the wins. Trust us.",       effect: { relationship: { pete: 8 }, confidence: 5 } },
          { text: "Who's on the list? I need to know.",      effect: { relationship: { pete: -5 }, confidence: 3 } },
          { text: "I've got your back either way.",          effect: { relationship: { pete: 12 } } },
        ],
      },
      resolves: true,
    },
  ],
}

const dazzaFinalPush: SubplotDefinition = {
  id: 'dazza-final-push',
  title: "Dazza's Three AM",
  startWeek: 13,
  npcId: 'dazza',
  stages: [
    {
      message: {
        sender: 'dazza',
        text: "Last two matches. I keep waking up at three in the morning thinking about the table. Is that normal?",
        time: 'Tue 3:02am',
        choices: [
          { text: 'Total normal. It means you care.',              effect: { relationship: { dazza: 8 }, teamChemistry: 3 } },
          { text: 'Sleep is for the summer. Focus now.',           effect: { relationship: { dazza: 4 } } },
          { text: 'Have a chat with Bev, she will sort you out.',  effect: { relationship: { dazza: 6, bev: 4 } } },
        ],
      },
      resolves: true,
    },
  ],
}

// ---------------------------------------------------------------------------
// GATED FOLLOW-UP SUBPLOTS
// These only trigger if a specific earlier subplot resolved with a certain choice.
// ---------------------------------------------------------------------------

const deanoComeback: SubplotDefinition = {
  id: 'deano-comeback',
  title: "Deano Turns It Around",
  startWeek: 10,
  npcId: 'deano',
  gate: (active) => active.some(
    a => a.id === 'deano-form' && a.resolved && a.outcome === "Alright, what's really going on?"
  ),
  stages: [
    {
      message: {
        sender: 'deano',
        text: "Had a proper chat with you. Sorted out the stuff at home. Feeling like meself again. Thanks.",
        time: 'Mon 9:15pm',
        choices: [
          { text: 'Knew you would get there. Lets go.',            effect: { relationship: { deano: 10 }, vibes: 2, confidence: 3 } },
          { text: 'Look after yourself first, football second.',   effect: { relationship: { deano: 8 } } },
          { text: 'Score a few then, pay me back.',                effect: { relationship: { deano: 5 }, vibes: 1 } },
        ],
      },
      resolves: true,
    },
  ],
}

const callumReturn: SubplotDefinition = {
  id: 'callum-return',
  title: "Callum's Choice",
  startWeek: 14,
  npcId: 'callum',
  gate: (active) => active.some(
    a => a.id === 'callum-trial' && a.resolved && a.outcome === 'Stay. We need you for the Tankard run.'
  ),
  stages: [
    {
      message: {
        sender: 'callum',
        text: "Heard from Brewers Town again. Better offer this time. But I stayed when you asked me to. What do you reckon?",
        time: 'Thu 7:50pm',
        choices: [
          { text: 'Go. You have done your bit for this club.',        effect: { relationship: { callum: 8 }, teamChemistry: -3 } },
          { text: 'One more season then make the call.',              effect: { relationship: { callum: 5 }, vibes: 2 } },
          { text: 'This is your home, not a stepping stone.',         effect: { relationship: { callum: 12 }, teamChemistry: 5 } },
        ],
      },
      resolves: true,
    },
  ],
}

export const SUBPLOTS: SubplotDefinition[] = [
  // weeks 2-5
  gary, pete, callum, taz,
  // weeks 6-14
  deanoForm, dazzaPenalty, cliveInjury, shazCaptain, bevBurnout,
  gavBet, peteUltimatum, dazzaFinalPush,
  // gated follow-ups
  deanoComeback, callumReturn,
]

export function subplotsToTriggerThisWeek(
  week: number,
  active: SubplotProgress[],
): SubplotDefinition[] {
  return SUBPLOTS.filter(s => {
    if (s.startWeek !== week) return false
    if (active.find(a => a.id === s.id)) return false
    if (s.gate && !s.gate(active)) return false
    return true
  })
}

export function findSubplot(id: string): SubplotDefinition | undefined {
  return SUBPLOTS.find(s => s.id === id)
}

import type { ChatMessage, SubplotProgress } from '../types/game'

export interface SubplotStage {
  message: ChatMessage
  // The stage advances next week, even without an explicit choice.
  autoAdvance?: boolean
  // When a choice is made, the resulting effect applies and the subplot resolves.
  resolves?: boolean
}

export interface SubplotDefinition {
  id: string
  title: string
  startWeek: number
  npcId: string
  stages: SubplotStage[]
  // Optional gate: a function name that the engine maps to runtime predicates.
  // Currently every subplot starts on its `startWeek` if not already running.
}

// Pete the Gaffer is weighing up retirement. The cup run (or league finish)
// decides whether he stays for another season. Resolves at week 10.
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
          { text: "Gaffer no. Win the Tankard with us first.",                effect: { relationship: { pete: 8 }, vibes: 1 } },
          { text: "Fair play. You've done your time.",                       effect: { relationship: { pete: 4 } } },
          { text: 'Hand the reins to Big Taz then. He fancies it.',          effect: { relationship: { pete: -3, bigtaz: 8 } } },
        ],
      },
      resolves: true,
    },
  ],
}

// Big Taz's knee is going. By week 7 he is doubtful; week 11 he is gone unless protected.
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

// Callum has a scout watching. The subplot resolves at week 6: stay or leave.
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

// Gary's confidence arc. Pete keeps starting him. The team is fuming. Gary is fragile.
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
          { text: 'You belong here Gary. Heads up.',         effect: { relationship: { garyNephew: 12, pete: 3 }, vibes: 1 } },
          { text: "Just keep it simple. Don't overthink it.", effect: { relationship: { garyNephew: 6 } } },
          { text: 'Mate, train harder. It is what it is.',   effect: { relationship: { garyNephew: -5 } } },
        ],
      },
      resolves: true,
    },
  ],
}

export const SUBPLOTS: SubplotDefinition[] = [pete, taz, callum, gary]

export function subplotsToTriggerThisWeek(
  week: number,
  active: SubplotProgress[],
): SubplotDefinition[] {
  return SUBPLOTS.filter(s => {
    if (s.startWeek !== week) return false
    const existing = active.find(a => a.id === s.id)
    return !existing
  })
}

export function findSubplot(id: string): SubplotDefinition | undefined {
  return SUBPLOTS.find(s => s.id === id)
}

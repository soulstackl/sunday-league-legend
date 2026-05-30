import type { SaveState, ChatMessage } from '../types/game'

const clamp = (v: number, lo: number, hi: number): number => Math.max(lo, Math.min(hi, v))

interface JobWeeklyEvent {
  mutate: (state: SaveState) => void
  chat?: ChatMessage
}

type JobWeeklyHandler = (week: number) => JobWeeklyEvent | null

const JOB_WEEKLY_HANDLERS: Record<string, JobWeeklyHandler> = {
  builder: (week) => {
    if (week <= 1 || week % 4 !== 0) return null
    return {
      mutate: (s) => {
        s.player.states.fatigue = clamp(s.player.states.fatigue + 5, 0, 100)
        s.player.states.confidence = clamp(s.player.states.confidence + 3, 0, 100)
      },
      chat: { sender: 'system', text: 'Long week on site. Knackered legs, hardened mind.', time: 'Mon' },
    }
  },
  nurse: (week) => {
    if (week <= 1 || week % 3 !== 0) return null
    return {
      mutate: (s) => {
        s.player.states.fitness = clamp(s.player.states.fitness - 10, 0, 100)
        s.player.states.fatigue = clamp(s.player.states.fatigue + 5, 0, 100)
      },
      chat: { sender: 'system', text: 'Run of nights on the ward. Sleep schedule is wrecked.', time: 'Tue' },
    }
  },
  teacher: (week) => {
    if (week <= 1 || week % 4 !== 0) return null
    return {
      mutate: (s) => {
        s.player.states.confidence = clamp(s.player.states.confidence - 3, 0, 100)
        s.player.states.teamChemistry = clamp(s.player.states.teamChemistry + 3, 0, 100)
      },
      chat: { sender: 'system', text: "Parents evening. Year 8 are a tougher dressing room than the Dog and Duck.", time: 'Wed' },
    }
  },
  office: (week) => {
    if (week <= 1 || week % 5 !== 0) return null
    return {
      mutate: (s) => {
        s.player.states.fatigue = clamp(s.player.states.fatigue + 5, 0, 100)
        s.player.states.teamChemistry = clamp(s.player.states.teamChemistry + 2, 0, 100)
      },
      chat: { sender: 'system', text: 'Friday drinks ran long. Worth it for the gossip.', time: 'Fri' },
    }
  },
  delivery: (week) => {
    if (week <= 1 || week % 4 !== 0) return null
    return {
      mutate: (s) => {
        s.player.states.fatigue = clamp(s.player.states.fatigue + 5, 0, 100)
        s.player.states.injuryRisk = clamp(s.player.states.injuryRisk + 5, 0, 100)
      },
      chat: { sender: 'system', text: 'Big route this week. Legs lighter, knees older.', time: 'Thu' },
    }
  },
  student: (week) => {
    if (week <= 1 || week % 6 !== 0) return null
    return {
      mutate: (s) => {
        s.player.stats.vibes = clamp(s.player.stats.vibes - 1, 1, 20)
      },
      chat: { sender: 'system', text: 'Skint week. Living on beans and noodles.', time: 'Wed' },
    }
  },
  selfemployed: (week) => {
    if (week <= 1 || week % 3 !== 0) return null
    return {
      mutate: (s) => {
        s.player.states.confidence = clamp(s.player.states.confidence + 3, 0, 100)
      },
      chat: { sender: 'system', text: "Booked a tidy job this week. Feeling like the boss.", time: 'Mon' },
    }
  },
}

export function applyJobWeeklyTick(state: SaveState): void {
  const handler = JOB_WEEKLY_HANDLERS[state.player.job]
  if (!handler) return
  const event = handler(state.season.week)
  if (!event) return
  event.mutate(state)
  if (event.chat) state.groupChatLog.push(event.chat)
}

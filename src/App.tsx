import { useState, useEffect } from 'react'
import type {
  SaveState,
  MidweekAction,
  ChatChoice,
  ChaosCard,
  ChaosCardChoice,
  MomentResult,
  MatchStats,
  StatKey,
  HallOfFameEntry,
} from './types/game'
import { ARCHETYPES } from './data/archetypes'
import { JOBS } from './data/jobs'
import { MESSAGE_TEMPLATES, CHOICE_MESSAGES } from './data/message-templates'
import { NPCS } from './data/npcs'
import { mulberry32 } from './engine/rng'
import { simulateMatch } from './engine/match'
import { getFixture, nextWeekNumber, TOTAL_WEEKS } from './engine/schedule'
import { advanceAiTable, buildStandings, ourLeaguePosition, resolvePromotionRelegation, initialTable } from './engine/league'
import { subplotsToTriggerThisWeek, findSubplot } from './data/subplots'
import { deepClone, saveGame, loadGame } from './store/persistence'
import { initialSaveState, SAVE_KEY, LEGACY_KEYS } from './store/initial-state'
import { platformAdapter } from './platform/standalone'
import { AudioManager } from './audio/AudioManager'
import { resolveCareerEnding } from './engine/endings'
import {
  applyWeeklyTraitTick,
  pickSignatureTrait,
  getTrainingExtraStat,
  getPubFatigueReduction,
  getPubHangoverImmune,
  getOvertimeFatigueReduction,
} from './engine/traits'
import { applyJobWeeklyTick } from './engine/jobs-weekly'

import { TitleScreen } from './screens/TitleScreen'
import { NameScreen } from './screens/NameScreen'
import { ArchetypeScreen } from './screens/ArchetypeScreen'
import { JobScreen } from './screens/JobScreen'
import { IntroScreen } from './screens/IntroScreen'
import { HubScreen } from './screens/HubScreen'
import { MidweekScreen } from './screens/MidweekScreen'
import { ChatScreen } from './screens/ChatScreen'
import { ChaosScreen } from './screens/ChaosScreen'
import { BriefingScreen } from './screens/BriefingScreen'
import { ArenaScreen } from './screens/arena/index'
import { PostMatchScreen } from './screens/PostMatchScreen'
import { TableScreen } from './screens/TableScreen'
import { CompleteScreen } from './screens/CompleteScreen'
import { HallOfFameScreen } from './screens/HallOfFameScreen'
import { SettingsScreen } from './screens/SettingsScreen'
import { SquadScreen } from './screens/SquadScreen'
import { StatGrowthScreen } from './screens/StatGrowthScreen'
import { PlayerScreen } from './screens/PlayerScreen'

type Screen =
  | 'title' | 'name' | 'archetype' | 'job' | 'intro'
  | 'hub' | 'midweek' | 'chat' | 'chaos' | 'briefing' | 'arena'
  | 'postmatch' | 'table' | 'complete' | 'hall' | 'settings'
  | 'squad' | 'growth' | 'player'

interface MatchReportLocal {
  ourGoals: number
  theirGoals: number
  rating: number
  stats: MatchStats
  kind: 'league' | 'cup'
  cupRound?: 'quarter-final' | 'semi-final' | 'final'
  opponentName: string
}

const STAT_KEYS: StatKey[] = ['touch', 'strike', 'pass', 'engine', 'graft', 'head', 'pace', 'vibes']

const ARCHETYPE_POSITION: Record<string, string> = {
  unit: 'ST',
  winger: 'LW',
  organiser: 'CM',
}

const ARCHETYPE_GROWTH_PRIORITY: Record<string, StatKey[]> = {
  unit: ['head', 'strike', 'graft', 'engine'],
  winger: ['pace', 'touch', 'strike', 'vibes'],
  organiser: ['pass', 'engine', 'vibes', 'graft'],
}

const SUCCESS_OUTCOMES = new Set(['GOAL', 'SUCCESS', 'TOP CORNER', 'CHIPPED HIM', 'TUCKED AWAY', 'BANGER', 'RECOVERY'])

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v))

function applyTextSize(size: 'small' | 'normal' | 'large') {
  const root = document.documentElement
  const map = { small: '14px', normal: '16px', large: '18px' } as const
  root.style.fontSize = map[size]
}

export function App() {
  const [platform, setPlatform] = useState({ isDiscord: false })

  const [store, setStoreRaw] = useState<SaveState>(() => {
    const loaded = loadGame()
    if (loaded && loaded.player && loaded.player.name) return loaded
    return deepClone(initialSaveState)
  })

  const [currentScreen, setCurrentScreen] = useState<Screen>(() => {
    const loaded = loadGame()
    return (loaded && loaded.player && loaded.player.name) ? 'hub' : 'title'
  })

  const [activeCards, setActiveCards] = useState<ChaosCard[]>([])
  const [matchReport, setMatchReport] = useState<MatchReportLocal | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [pendingStatGrowth, setPendingStatGrowth] = useState(false)
  const [growthChoices, setGrowthChoices] = useState<StatKey[]>([])
  const [tableCanAdvance, setTableCanAdvance] = useState(false)

  useEffect(() => {
    platformAdapter.init().then(() => setPlatform({ isDiscord: platformAdapter.isDiscord }))
  }, [])

  useEffect(() => {
    applyTextSize(store.settings.textSize)
  }, [store.settings.textSize])

  useEffect(() => {
    if (!store.settings.soundEnabled && !AudioManager.getIsMuted()) AudioManager.toggleMute()
    if (store.settings.soundEnabled && AudioManager.getIsMuted()) AudioManager.toggleMute()
  }, [store.settings.soundEnabled])

  const hasSave = store.player.name.length > 0

  const updateStore = (updater: (s: SaveState) => void, opts: { silent?: boolean } = {}) => {
    setStoreRaw(prev => {
      const next = deepClone(prev)
      updater(next)
      saveGame(next)
      if (!opts.silent) {
        setToast('Saved')
        setTimeout(() => setToast(null), 1000)
      }
      return next
    })
  }

  const fixture = getFixture(store.season.week, store.season.tier, store.season.cupExited)

  const triggerMidweekAction = (action: MidweekAction, statChoice?: StatKey, npcTarget?: string) => {
    updateStore(s => {
      const traits = s.player.traits
      const pubFatigueRelief = action.id === 'pub' ? getPubFatigueReduction(traits) : 0
      const overtimeFatigueRelief = action.id === 'overtime' ? getOvertimeFatigueReduction(traits) : 0
      const fatigueDelta = (action.effects.fatigue ?? 0) - pubFatigueRelief - overtimeFatigueRelief

      s.player.states.fatigue = clamp(s.player.states.fatigue + fatigueDelta, 0, 100)
      s.player.states.fitness = clamp(s.player.states.fitness + (action.effects.fitness ?? 0), 0, 100)
      s.player.states.managerTrust = clamp(s.player.states.managerTrust + (action.effects.managerTrust ?? 0), 0, 100)
      s.player.states.confidence = clamp(s.player.states.confidence + (action.effects.confidence ?? 0), 0, 100)
      s.player.states.teamChemistry = clamp(s.player.states.teamChemistry + (action.effects.teamChemistry ?? 0), 0, 100)
      s.player.states.injuryRisk = clamp(s.player.states.injuryRisk + (action.effects.injuryRisk ?? 0), 0, 100)
      if (action.effects.vibes) s.player.stats.vibes = clamp(s.player.stats.vibes + action.effects.vibes, 1, 20)
      if (action.effects.strike) s.player.stats.strike = clamp(s.player.stats.strike + action.effects.strike, 1, 20)

      if (action.effects.statBoost === 'random') {
        const rng = mulberry32(s.seed + s.season.week * 17 + s.careerEvents.length)
        const k = STAT_KEYS[Math.floor(rng() * STAT_KEYS.length)]
        s.player.stats[k] = Math.min(20, s.player.stats[k] + 1)
        if (getTrainingExtraStat(traits)) {
          const k2 = STAT_KEYS[Math.floor(rng() * STAT_KEYS.length)]
          s.player.stats[k2] = Math.min(20, s.player.stats[k2] + 1)
        }
      }
      if (statChoice && action.effects.statBoostOptions?.includes(statChoice)) {
        s.player.stats[statChoice] = Math.min(20, s.player.stats[statChoice] + 1)
      }
      if (action.effects.targetRelationship && npcTarget && s.npcs[npcTarget]) {
        s.npcs[npcTarget].relationshipScore = clamp(s.npcs[npcTarget].relationshipScore + action.effects.targetRelationship, 0, 100)
      }
      if (action.effects.contextModifier === 'opposition-scouted') s.contextModifiers.oppositionScouted = true
      if (action.effects.contextModifier === 'set-piece-ready') s.contextModifiers.setPieceReady = true
      if (action.effects.hangoverRisk && !getPubHangoverImmune(traits)) s.contextModifiers.hangoverPending = true

      s.careerEvents.push({ type: 'midweek_action', action: action.id, week: s.season.week })

      const choiceMsg = action.groupChatTrigger ? CHOICE_MESSAGES[action.groupChatTrigger] : null
      if (choiceMsg) s.groupChatLog.push({ ...choiceMsg })
      else {
        const banter = MESSAGE_TEMPLATES.midweek[Math.floor(Math.random() * MESSAGE_TEMPLATES.midweek.length)]
        s.groupChatLog.push({ sender: banter.sender, text: banter.text, time: banter.time })
      }
      const label = npcTarget && s.npcs[npcTarget] ? action.name + ' with ' + (NPCS[npcTarget]?.name ?? npcTarget) : action.name
      s.groupChatLog.push({ sender: 'system', text: s.player.name + ' chose: ' + label, time: 'Now' })

      const newSubplots = subplotsToTriggerThisWeek(s.season.week, s.subplots)
      for (const sub of newSubplots) {
        s.subplots.push({ id: sub.id, stage: 0, startedWeek: s.season.week, resolved: false })
        const stage = sub.stages[0]
        if (stage) s.groupChatLog.push({ ...stage.message })
      }
    })
    setCurrentScreen('hub')
  }

  const kickOffMatch = (cards: ChaosCard[], choiceEffects: ChaosCardChoice['effect'][] = []) => {
    updateStore(s => {
      if (s.contextModifiers.hangoverPending) {
        s.player.states.confidence = clamp(s.player.states.confidence - 5, 0, 100)
        s.player.states.fatigue = clamp(s.player.states.fatigue + 5, 0, 100)
        s.groupChatLog.push({ sender: 'system', text: 'Saturday night caught up with you. Head fuzzy, legs heavy.', time: 'Sun' })
        s.contextModifiers.hangoverPending = false
      }
      choiceEffects.forEach(effect => {
        if (!effect) return
        if (effect.confidence) s.player.states.confidence = clamp(s.player.states.confidence + effect.confidence, 0, 100)
        if (effect.refereeRep) s.player.states.refereeRep = clamp(s.player.states.refereeRep + effect.refereeRep, 0, 100)
        if (effect.teamChemistry) s.player.states.teamChemistry = clamp(s.player.states.teamChemistry + effect.teamChemistry, 0, 100)
        if (effect.fatigue) s.player.states.fatigue = clamp(s.player.states.fatigue + effect.fatigue, 0, 100)
        if (effect.strike) s.player.stats.strike = clamp(s.player.stats.strike + effect.strike, 1, 20)
        if (effect.vibes) s.player.stats.vibes = clamp(s.player.stats.vibes + effect.vibes, 1, 20)
        if (effect.relationship) {
          Object.entries(effect.relationship).forEach(([npcId, delta]) => {
            if (s.npcs[npcId]) s.npcs[npcId].relationshipScore = clamp(s.npcs[npcId].relationshipScore + delta, 0, 100)
          })
        }
      })
      cards.forEach(c => { s.chaosCardHistory.push({ id: c.id, week: s.season.week }) })
    })
    setActiveCards(cards)
    setCurrentScreen('briefing')
  }

  const completeMatch = (results: MomentResult[], stats: MatchStats) => {
    const week = store.season.week
    if (!fixture) return
    const opponent = fixture.opponent
    const rng = mulberry32(store.seed + week * 3)
    const outcome = simulateMatch(results, store.player.states, activeCards, opponent, rng)
    const successfulMoments = results.filter(r => SUCCESS_OUTCOMES.has(r.outcome)).length
    const rating = Math.min(10, Math.max(3, Math.round(successfulMoments * 2.5 + rng() * 3)))
    const won = outcome.ourGoals > outcome.theirGoals
    const drew = outcome.ourGoals === outcome.theirGoals

    updateStore(s => {
      s.season.results.push({
        week,
        competition: fixture.kind,
        ourGoals: outcome.ourGoals,
        theirGoals: outcome.theirGoals,
        rating,
        stats: stats ?? { shots: 0, goals: 0, passes: 0, passSuccess: 0, tackles: 0, tackleSuccess: 0 },
        opponentId: opponent.id,
        cupRound: fixture.cupRound,
        cupExit: fixture.kind === 'cup' && !won,
        cupWin: fixture.kind === 'cup' && fixture.cupRound === 'final' && won,
      })

      if (fixture.kind === 'cup' && !won) s.season.cupExited = true
      if (fixture.kind === 'cup' && fixture.cupRound === 'final' && won) s.season.cupWon = true

      s.player.states.confidence = clamp(s.player.states.confidence + (won ? 10 : drew ? 2 : -5), 0, 100)
      s.player.states.fatigue = Math.min(100, s.player.states.fatigue + (fixture.kind === 'cup' ? 18 : 15))
      s.player.states.managerTrust = clamp(s.player.states.managerTrust + (rating > 6 ? 8 : -4), 0, 100)
      s.player.states.teamChemistry = clamp(s.player.states.teamChemistry + (won ? 5 : drew ? 1 : -5), 0, 100)
      s.player.states.localFame = Math.min(100, s.player.states.localFame + (won ? 4 : 1) + (stats?.goals ?? 0) * 2)
      s.player.states.form = Math.max(-3, Math.min(3, s.player.states.form + (won ? 0.7 : drew ? 0 : -0.6)))

      const trustNudge = won ? 3 : drew ? 0 : -2
      Object.keys(s.npcs).forEach(id => {
        s.npcs[id].relationshipScore = clamp(s.npcs[id].relationshipScore + trustNudge, 0, 100)
      })

      s.contextModifiers.oppositionScouted = false
      s.contextModifiers.setPieceReady = false

      s.careerEvents.push({ type: 'match_complete', week, result: won ? 'win' : drew ? 'draw' : 'loss' })

      const templates = won ? MESSAGE_TEMPLATES.postMatchWin : drew ? MESSAGE_TEMPLATES.postMatchDraw : MESSAGE_TEMPLATES.postMatchLoss
      templates.forEach(t => s.groupChatLog.push({ ...t }))
    })
    setMatchReport({
      ourGoals: outcome.ourGoals,
      theirGoals: outcome.theirGoals,
      rating,
      stats,
      kind: fixture.kind,
      cupRound: fixture.cupRound,
      opponentName: opponent.name,
    })
    setTableCanAdvance(true)
    setCurrentScreen('postmatch')
  }

  const handleChatChoice = (choice: ChatChoice) => {
    updateStore(s => {
      const lastIdx = [...s.groupChatLog].reverse().findIndex(m => m.choices)
      if (lastIdx >= 0) {
        const actualIdx = s.groupChatLog.length - 1 - lastIdx
        s.groupChatLog[actualIdx] = { ...s.groupChatLog[actualIdx], choices: undefined }
      }
      s.groupChatLog.push({ sender: 'player', text: choice.text, time: 'Now' })

      if (choice.effect.relationship) {
        Object.entries(choice.effect.relationship).forEach(([npcId, delta]) => {
          if (s.npcs[npcId]) s.npcs[npcId].relationshipScore = clamp(s.npcs[npcId].relationshipScore + delta, 0, 100)
        })
      }
      if (choice.effect.vibes) s.player.stats.vibes = clamp(s.player.stats.vibes + choice.effect.vibes, 1, 20)
      if (choice.effect.confidence) s.player.states.confidence = clamp(s.player.states.confidence + choice.effect.confidence, 0, 100)

      for (const sub of s.subplots.filter(x => !x.resolved)) {
        const def = findSubplot(sub.id)
        if (!def) continue
        const stage = def.stages[sub.stage]
        if (stage?.message.choices?.some(c => c.text === choice.text)) {
          sub.resolved = true
          sub.outcome = choice.text
          s.careerEvents.push({ type: 'subplot_resolved', subplotId: sub.id, outcome: choice.text, week: s.season.week })
        }
      }
    })
    AudioManager.playPing()
  }

  const handleNextWeek = () => {
    if (store.season.week < TOTAL_WEEKS) {
      updateStore(s => {
        const completedWeek = s.season.week
        const completedFixture = getFixture(completedWeek, s.season.tier, s.season.cupExited)
        if (completedFixture?.kind === 'league' && completedFixture.leagueIndex !== undefined) {
          s.season.aiTable = advanceAiTable(s.season.aiTable, s.season.tier, completedFixture.leagueIndex, s.seed)
        }

        s.season.week = nextWeekNumber(s.season.week)
        s.groupChatLog = []

        const rng = mulberry32(s.seed + s.season.week * 113)
        const nextFx = getFixture(s.season.week, s.season.tier, s.season.cupExited)
        const oppName = nextFx?.opponent.name ?? 'TBD'
        const count = 3 + Math.floor(rng() * 3)
        MESSAGE_TEMPLATES.preMatch.slice(0, count).forEach(t => {
          s.groupChatLog.push({ sender: t.sender, text: t.text.replace('Anchor Athletic', oppName), time: t.time })
        })

        s.player.states.fatigue = Math.max(0, s.player.states.fatigue - 8)
        s.player.states.fitness = Math.min(100, s.player.states.fitness + 3)
        if (s.player.states.form > 0) s.player.states.form = Math.max(0, s.player.states.form - 0.3)
        if (s.player.states.form < 0) s.player.states.form = Math.min(0, s.player.states.form + 0.3)

        applyWeeklyTraitTick(s)
        applyJobWeeklyTick(s)

        const newSubs = subplotsToTriggerThisWeek(s.season.week, s.subplots)
        for (const sub of newSubs) {
          s.subplots.push({ id: sub.id, stage: 0, startedWeek: s.season.week, resolved: false })
          const stage = sub.stages[0]
          if (stage) s.groupChatLog.push({ ...stage.message })
        }
      })
      setCurrentScreen('hub')
    } else {
      updateStore(s => {
        const completedFixture = getFixture(s.season.week, s.season.tier, s.season.cupExited)
        if (completedFixture?.kind === 'league' && completedFixture.leagueIndex !== undefined) {
          s.season.aiTable = advanceAiTable(s.season.aiTable, s.season.tier, completedFixture.leagueIndex, s.seed)
        }
        s.careerEvents.push({ type: 'season_complete', week: s.season.week })
      })
      setCurrentScreen('complete')
    }
  }

  const recordHallOfFame = (title: string) => {
    const standings = buildStandings(store.season.aiTable, store.season.tier, store.season.results)
    const position = ourLeaguePosition(standings)
    const promo = resolvePromotionRelegation(position, standings.length, store.season.tier)

    const entry: HallOfFameEntry = {
      name: store.player.name,
      archetype: store.player.archetype,
      job: store.player.job,
      title,
      date: Date.now(),
      seasons: store.season.number,
      goals: store.season.results.reduce((acc, r) => acc + (r.stats?.goals ?? 0), 0),
      points: standings.find(r => r.isUs)?.points ?? 0,
      cupWon: store.season.cupWon,
      finalTier: promo.newTier,
      signatureTrait: pickSignatureTrait(store.player.traits),
    }
    const hof = [...store.hallOfFame, entry]
    const fresh = deepClone(initialSaveState)
    fresh.hallOfFame = hof
    fresh.seed = Math.floor(Math.random() * 1000000)
    fresh.settings = deepClone(store.settings)
    saveGame(fresh)
    setStoreRaw(fresh)
    setCurrentScreen('title')
  }

  const deleteSave = () => {
    localStorage.removeItem(SAVE_KEY)
    LEGACY_KEYS.forEach(k => localStorage.removeItem(k))
    const fresh = deepClone(initialSaveState)
    fresh.seed = Math.floor(Math.random() * 1000000)
    fresh.settings = deepClone(store.settings)
    setStoreRaw(fresh)
    setCurrentScreen('title')
  }

  const startNewCareer = () => {
    const fresh = deepClone(initialSaveState)
    fresh.seed = Math.floor(Math.random() * 1000000)
    fresh.hallOfFame = store.hallOfFame ? [...store.hallOfFame] : []
    fresh.settings = deepClone(store.settings)
    fresh.season.aiTable = initialTable(fresh.season.tier)
    setStoreRaw(fresh)
    setCurrentScreen('name')
  }

  const startNextSeason = () => {
    const standings = buildStandings(store.season.aiTable, store.season.tier, store.season.results)
    const position = ourLeaguePosition(standings)
    const promo = resolvePromotionRelegation(position, standings.length, store.season.tier)

    updateStore(s => {
      s.careerEvents.push({ type: 'season_summary', week: s.season.week, result: promo.movement, pts: standings.find(r => r.isUs)?.points })
      s.season.number += 1
      s.season.tier = promo.newTier
      s.season.week = 1
      s.season.results = []
      s.season.cupExited = false
      s.season.cupWon = false
      s.season.aiTable = initialTable(s.season.tier)
      s.groupChatLog = []
      s.chaosCardHistory = []
      s.subplots = []
      s.contextModifiers = { oppositionScouted: false, setPieceReady: false, hangoverPending: false }
      s.player.states.fatigue = 0
      s.player.states.fitness = 100
      s.player.states.confidence = 55
      s.player.states.form = 0
      s.player.states.injuryRisk = Math.max(0, s.player.states.injuryRisk - 30)
    })
    setPendingStatGrowth(true)
    setGrowthChoices(deriveGrowthOffers(store))
    setCurrentScreen('growth')
    AudioManager.playWhistle()
  }

  const confirmStatGrowth = (chosen: StatKey) => {
    updateStore(s => {
      s.player.stats[chosen] = Math.min(20, s.player.stats[chosen] + 1)
      s.careerEvents.push({ type: 'stat_growth', action: chosen, week: 1 })
    })
    setPendingStatGrowth(false)
    setCurrentScreen('hub')
  }

  return (
    <div style={{ maxWidth: '430px', margin: '0 auto', minHeight: '100dvh', display: 'flex', flexDirection: 'column', background: 'transparent', position: 'relative' }}>
      {currentScreen === 'title' && (
        <TitleScreen
          hasSave={hasSave}
          onNew={startNewCareer}
          onContinue={() => setCurrentScreen('hub')}
          onHall={() => setCurrentScreen('hall')}
          onSettings={() => setCurrentScreen('settings')}
        />
      )}

      {currentScreen === 'name' && (
        <NameScreen onNext={(name) => {
          updateStore(s => { s.player.name = name })
          setCurrentScreen('archetype')
        }} />
      )}

      {currentScreen === 'archetype' && (
        <ArchetypeScreen onNext={(archetypeId) => {
          const arch = ARCHETYPES.find(a => a.id === archetypeId)
          if (arch) {
            updateStore(s => {
              s.player.archetype = archetypeId
              s.player.stats = { ...arch.stats }
              s.player.traits = [...arch.traits]
              s.player.position = ARCHETYPE_POSITION[archetypeId] ?? s.player.position
            })
          }
          setCurrentScreen('job')
        }} />
      )}

      {currentScreen === 'job' && (
        <JobScreen onNext={(jobId) => {
          const jobData = JOBS.find(j => j.id === jobId)
          updateStore(s => {
            s.player.job = jobId
            if (jobData) {
              Object.entries(jobData.modifier).forEach(([k, v]) => {
                const key = k as StatKey
                s.player.stats[key] = Math.min(20, s.player.stats[key] + (v ?? 0))
              })
              if (!s.player.traits.includes(jobData.trait)) s.player.traits.push(jobData.trait)
            }
            s.season.aiTable = initialTable(s.season.tier)
            s.groupChatLog = []
            const rng = mulberry32(s.seed)
            const count = 4 + Math.floor(rng() * 2)
            const nextFx = getFixture(s.season.week, s.season.tier, s.season.cupExited)
            const oppName = nextFx?.opponent.name ?? 'TBD'
            MESSAGE_TEMPLATES.preMatch.slice(0, count).forEach(t => {
              s.groupChatLog.push({ sender: t.sender, text: t.text.replace('Anchor Athletic', oppName), time: t.time })
            })
          })
          setCurrentScreen('intro')
        }} />
      )}

      {currentScreen === 'intro' && <IntroScreen onNext={() => setCurrentScreen('hub')} />}

      {currentScreen === 'hub' && (
        <HubScreen
          store={store}
          fixture={fixture}
          onMidweek={() => setCurrentScreen('midweek')}
          onGroupChat={() => setCurrentScreen('chat')}
          onSettings={() => setCurrentScreen('settings')}
          onNextMatch={() => setCurrentScreen('chaos')}
          onHall={() => setCurrentScreen('hall')}
          onSquad={() => setCurrentScreen('squad')}
          onTable={() => { setTableCanAdvance(false); setCurrentScreen('table') }}
          onPlayer={() => setCurrentScreen('player')}
          isDiscord={platform.isDiscord}
        />
      )}

      {currentScreen === 'midweek' && (
        <MidweekScreen
          store={store}
          onConfirm={triggerMidweekAction}
          onBack={() => setCurrentScreen('hub')}
          isDiscord={platform.isDiscord}
        />
      )}

      {currentScreen === 'chat' && (
        <ChatScreen
          store={store}
          onBack={() => setCurrentScreen('hub')}
          onSendMessage={(text) => updateStore(s => { s.groupChatLog.push({ sender: 'player', text, time: 'Now' }) }, { silent: true })}
          onChoice={handleChatChoice}
        />
      )}

      {currentScreen === 'chaos' && fixture && (
        <ChaosScreen store={store} fixture={fixture} onKickOff={kickOffMatch} />
      )}

      {currentScreen === 'briefing' && fixture && (
        <BriefingScreen
          store={store}
          fixture={fixture}
          activeCards={activeCards}
          onStartMatch={() => setCurrentScreen('arena')}
        />
      )}

      {currentScreen === 'arena' && fixture && (
        <ArenaScreen
          store={store}
          fixture={fixture}
          activeCards={activeCards}
          onCompleteMatch={completeMatch}
        />
      )}

      {currentScreen === 'postmatch' && matchReport && (
        <PostMatchScreen
          store={store}
          matchReport={matchReport}
          onContinue={() => setCurrentScreen('table')}
        />
      )}

      {currentScreen === 'table' && (
        <TableScreen
          store={store}
          onContinue={() => { setTableCanAdvance(false); handleNextWeek() }}
          onBack={() => setCurrentScreen('hub')}
          canAdvance={tableCanAdvance}
        />
      )}

      {currentScreen === 'complete' && (
        <CompleteScreen
          store={store}
          onHallOfFame={recordHallOfFame}
          onNextSeason={startNextSeason}
          resolveEnding={() => resolveCareerEnding(store)}
        />
      )}

      {currentScreen === 'growth' && pendingStatGrowth && (
        <StatGrowthScreen
          store={store}
          options={growthChoices}
          onConfirm={confirmStatGrowth}
        />
      )}

      {currentScreen === 'squad' && (
        <SquadScreen
          store={store}
          onBack={() => setCurrentScreen('hub')}
        />
      )}

      {currentScreen === 'player' && (
        <PlayerScreen
          store={store}
          onBack={() => setCurrentScreen('hub')}
        />
      )}

      {currentScreen === 'hall' && (
        <HallOfFameScreen
          hallOfFame={store.hallOfFame}
          onBack={() => setCurrentScreen('title')}
        />
      )}

      {currentScreen === 'settings' && (
        <SettingsScreen
          store={store}
          onBack={() => setCurrentScreen(hasSave ? 'hub' : 'title')}
          onSaveSettings={(settings) => updateStore(s => { s.settings = settings })}
          onDeleteSave={deleteSave}
        />
      )}

      {toast && (
        <div style={{ position: 'fixed', bottom: '20px', right: '20px', background: 'var(--success)', color: '#fff', padding: '6px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', animation: 'fadeIn 0.2s ease', zIndex: 999 }}>
          {toast}
        </div>
      )}
    </div>
  )
}

function deriveGrowthOffers(store: SaveState): StatKey[] {
  const ranked: StatKey[] = (Object.entries(store.player.stats) as [StatKey, number][])
    .sort((a, b) => a[1] - b[1])
    .map(([k]) => k)

  const weakest = ranked[0]
  const middle = ranked[Math.floor(ranked.length / 2)]
  const priority = ARCHETYPE_GROWTH_PRIORITY[store.player.archetype] ?? STAT_KEYS
  const heroStat = priority.find(k => k !== weakest && k !== middle) ?? priority[0]

  const set = new Set<StatKey>([weakest, middle, heroStat])
  for (const k of priority) {
    if (set.size >= 3) break
    set.add(k)
  }
  for (const k of STAT_KEYS) {
    if (set.size >= 3) break
    set.add(k)
  }
  return Array.from(set).slice(0, 3)
}

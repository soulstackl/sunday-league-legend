import React, { useState, useEffect } from 'react'
import type { SaveState, MidweekAction, ChatChoice, ChaosCard, ChaosCardChoice, MomentResult, MatchStats } from './types/game'
import { ARCHETYPES } from './data/archetypes'
import { JOBS } from './data/jobs'
import { OPPONENTS } from './data/opponents'
import { MESSAGE_TEMPLATES, CHOICE_MESSAGES } from './data/message-templates'
import { mulberry32 } from './engine/rng'
import { simulateMatch } from './engine/match'
import { deepClone, saveGame, loadGame } from './store/persistence'
import { initialSaveState, SAVE_KEY } from './store/initial-state'
import { platformAdapter } from './platform/standalone'
import { AudioManager } from './audio/AudioManager'

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

type Screen = 'title' | 'name' | 'archetype' | 'job' | 'intro' | 'hub' | 'midweek' | 'chat' |
  'chaos' | 'briefing' | 'arena' | 'postmatch' | 'table' | 'complete' | 'hall' | 'settings'

interface MatchReport {
  ourGoals: number
  theirGoals: number
  rating: number
  stats: { shots: number; goals: number; passes: number; passSuccess: number; tackles: number; tackleSuccess: number }
}

export function App() {
  const [platform, setPlatform] = useState({ isDiscord: false })

  useEffect(() => {
    platformAdapter.init().then(() => {
      setPlatform({ isDiscord: platformAdapter.isDiscord })
    })
  }, [])

  useEffect(() => {
    if (!store.settings.soundEnabled) AudioManager.toggleMute()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
  const [matchReport, setMatchReport] = useState<MatchReport | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const hasSave = store.player.name.length > 0

  const updateStore = (updater: (s: SaveState) => void) => {
    setStoreRaw(prev => {
      const next = deepClone(prev)
      updater(next)
      saveGame(next)
      setToast('Saved')
      setTimeout(() => setToast(null), 1200)
      return next
    })
  }

  const triggerMidweekAction = (action: MidweekAction) => {
    updateStore(s => {
      s.player.states.fatigue = Math.min(100, Math.max(0, s.player.states.fatigue + (action.effects.fatigue ?? 0)))
      s.player.states.fitness = Math.min(100, Math.max(0, s.player.states.fitness + (action.effects.fitness ?? 0)))
      s.player.states.managerTrust = Math.min(100, Math.max(0, s.player.states.managerTrust + (action.effects.managerTrust ?? 0)))
      s.player.states.confidence = Math.min(100, Math.max(0, s.player.states.confidence + (action.effects.confidence ?? 0)))
      s.player.states.teamChemistry = Math.min(100, Math.max(0, s.player.states.teamChemistry + (action.effects.teamChemistry ?? 0)))

      s.careerEvents.push({ type: 'midweek_action', action: action.id, week: s.season.week })

      const choiceMsg = action.groupChatTrigger ? CHOICE_MESSAGES[action.groupChatTrigger] : null
      if (choiceMsg) {
        s.groupChatLog.push({ ...choiceMsg })
      } else {
        const banter = MESSAGE_TEMPLATES.midweek[Math.floor(Math.random() * MESSAGE_TEMPLATES.midweek.length)]
        s.groupChatLog.push({ sender: banter.sender, text: banter.text, time: banter.time })
      }
      s.groupChatLog.push({ sender: 'system', text: s.player.name + ' chose: ' + action.name, time: 'Now' })
    })
    setCurrentScreen('hub')
  }

  const kickOffMatch = (cards: ChaosCard[], choiceEffects: ChaosCardChoice['effect'][] = []) => {
    if (choiceEffects.length > 0) {
      updateStore(s => {
        choiceEffects.forEach(effect => {
          if (!effect) return
          if (effect.confidence) s.player.states.confidence = Math.min(100, Math.max(0, s.player.states.confidence + effect.confidence))
          if (effect.refereeRep) s.player.states.refereeRep = Math.min(100, Math.max(0, (s.player.states.refereeRep ?? 50) + effect.refereeRep))
          if (effect.teamChemistry) s.player.states.teamChemistry = Math.min(100, Math.max(0, s.player.states.teamChemistry + effect.teamChemistry))
          if (effect.strike) s.player.stats.strike = Math.min(20, Math.max(1, s.player.stats.strike + effect.strike))
          if (effect.relationship) {
            Object.entries(effect.relationship).forEach(([npcId, delta]) => {
              if (s.npcs[npcId]) s.npcs[npcId].relationshipScore = Math.min(100, Math.max(0, s.npcs[npcId].relationshipScore + delta))
            })
          }
        })
        cards.forEach(c => { s.chaosCardHistory.push({ id: c.id, week: s.season.week }) })
      })
    } else {
      updateStore(s => {
        cards.forEach(c => { s.chaosCardHistory.push({ id: c.id, week: s.season.week }) })
      })
    }
    setActiveCards(cards)
    setCurrentScreen('briefing')
  }

  const completeMatch = (results: MomentResult[], stats: MatchStats) => {
    const week = store.season.week
    const opponent = OPPONENTS[week - 1]
    const rng = mulberry32(store.seed + week)
    const outcome = simulateMatch(results, store.player.states, activeCards, opponent, rng)
    const rating = Math.min(10, Math.max(3, Math.round(results.filter(r => r.outcome === 'GOAL' || r.outcome === 'SUCCESS').length * 2.5 + rng() * 3)))

    updateStore(s => {
      s.season.results.push({
        week,
        ourGoals: outcome.ourGoals,
        theirGoals: outcome.theirGoals,
        rating,
        stats: stats ?? { shots: 0, goals: 0, passes: 0, passSuccess: 0, tackles: 0, tackleSuccess: 0 },
      })
      s.player.states.confidence = Math.min(100, Math.max(0, s.player.states.confidence + (outcome.ourGoals > outcome.theirGoals ? 10 : -5)))
      s.player.states.fatigue = Math.min(100, s.player.states.fatigue + 15)
      s.player.states.managerTrust = Math.min(100, Math.max(0, s.player.states.managerTrust + (rating > 6 ? 8 : -4)))
      s.player.states.teamChemistry = Math.min(100, Math.max(0, s.player.states.teamChemistry + (outcome.ourGoals > outcome.theirGoals ? 5 : -5)))

      s.careerEvents.push({ type: 'match_complete', week, result: outcome.ourGoals > outcome.theirGoals ? 'win' : outcome.ourGoals === outcome.theirGoals ? 'draw' : 'loss' })

      const templates = outcome.ourGoals > outcome.theirGoals ? MESSAGE_TEMPLATES.postMatchWin : MESSAGE_TEMPLATES.postMatchLoss
      templates.forEach(t => {
        s.groupChatLog.push({ sender: t.sender, text: t.text, time: t.time })
      })
    })
    setMatchReport({ ourGoals: outcome.ourGoals, theirGoals: outcome.theirGoals, rating, stats })
    setCurrentScreen('postmatch')
  }

  const handleChatChoice = (choice: ChatChoice) => {
    updateStore(s => {
      const lastMsg = s.groupChatLog[s.groupChatLog.length - 1]
      if (lastMsg) lastMsg.choices = undefined

      s.groupChatLog.push({ sender: 'player', text: choice.text, time: 'Now' })

      if (choice.effect) {
        if (choice.effect.relationship) {
          Object.entries(choice.effect.relationship).forEach(([npcId, delta]) => {
            if (s.npcs[npcId]) s.npcs[npcId].relationshipScore = Math.min(100, Math.max(0, s.npcs[npcId].relationshipScore + delta))
          })
        }
        if (choice.effect.vibes) s.player.stats.vibes = Math.min(20, Math.max(1, s.player.stats.vibes + choice.effect.vibes))
      }
    })
    AudioManager.playPing()
  }

  const handleNextWeek = () => {
    if (store.season.week < 12) {
      updateStore(s => {
        s.season.week += 1
        s.groupChatLog = []
        const rng = mulberry32(s.seed + s.season.week)
        const count = 3 + Math.floor(rng() * 3)
        const oppName = OPPONENTS[s.season.week - 1]?.name ?? 'TBD'
        MESSAGE_TEMPLATES.preMatch.slice(0, count).forEach(t => {
          s.groupChatLog.push({ sender: t.sender, text: t.text.replace('Anchor Athletic', oppName), time: t.time })
        })
        s.player.states.fatigue = Math.max(0, s.player.states.fatigue - 8)
        s.player.states.fitness = Math.min(100, s.player.states.fitness + 3)
        if (s.player.states.form > 0) s.player.states.form -= 0.5
        if (s.player.states.form < 0) s.player.states.form += 0.5
      })
      setCurrentScreen('hub')
    } else {
      const pts = store.season.results.reduce((acc, r) => {
        if (r.ourGoals > r.theirGoals) return acc + 3
        if (r.ourGoals === r.theirGoals) return acc + 1
        return acc
      }, 0)
      updateStore(s => {
        s.careerEvents.push({ type: 'season_complete', week: s.season.week, pts })
      })
      setCurrentScreen('complete')
    }
  }

  const recordHallOfFame = (title: string) => {
    const entry = { name: store.player.name, archetype: store.player.archetype, title, date: Date.now() }
    const hof = [...store.hallOfFame, entry]
    const fresh = deepClone(initialSaveState)
    fresh.hallOfFame = hof
    fresh.seed = Math.floor(Math.random() * 1000000)
    saveGame(fresh)
    setStoreRaw(fresh)
    setCurrentScreen('title')
  }

  const deleteSave = () => {
    localStorage.removeItem(SAVE_KEY)
    const fresh = deepClone(initialSaveState)
    fresh.seed = Math.floor(Math.random() * 1000000)
    setStoreRaw(fresh)
    setCurrentScreen('title')
  }

  const startNewCareer = () => {
    const fresh = deepClone(initialSaveState)
    fresh.seed = Math.floor(Math.random() * 1000000)
    fresh.hallOfFame = store.hallOfFame ? [...store.hallOfFame] : []
    setStoreRaw(fresh)
    setCurrentScreen('name')
  }

  const startNextSeason = () => {
    updateStore(s => {
      s.season.week = 1
      s.season.results = []
      s.groupChatLog = []
      s.chaosCardHistory = []
      s.player.states.fatigue = 0
      s.player.states.fitness = 100
      s.player.states.confidence = 50
    })
    setCurrentScreen('hub')
    AudioManager.playWhistle()
  }

  return (
    <div style={{ maxWidth: '430px', margin: '0 auto', minHeight: '100dvh', display: 'flex', flexDirection: 'column', background: 'var(--charcoal)', position: 'relative' }}>
      {currentScreen === 'title' && (
        <TitleScreen
          hasSave={hasSave}
          onNew={startNewCareer}
          onContinue={() => setCurrentScreen('hub')}
          onHall={() => setCurrentScreen('hall')}
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
                const stats = s.player.stats as unknown as Record<string, number>
                if (stats[k] !== undefined) stats[k] += v
              })
              s.player.traits.push(jobData.trait)
            }
            s.groupChatLog = []
            MESSAGE_TEMPLATES.preMatch.slice(0, 4).forEach(t => {
              s.groupChatLog.push({ sender: t.sender, text: t.text, time: t.time })
            })
          })
          setCurrentScreen('intro')
        }} />
      )}

      {currentScreen === 'intro' && <IntroScreen onNext={() => setCurrentScreen('hub')} />}

      {currentScreen === 'hub' && (
        <HubScreen
          store={store}
          onMidweek={() => setCurrentScreen('midweek')}
          onGroupChat={() => setCurrentScreen('chat')}
          onSettings={() => setCurrentScreen('settings')}
          onNextMatch={() => setCurrentScreen('chaos')}
          onHall={() => setCurrentScreen('hall')}
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
          onSendMessage={(text) => {
            updateStore(s => {
              s.groupChatLog.push({ sender: 'player', text, time: 'Now' })
            })
          }}
          onChoice={handleChatChoice}
        />
      )}

      {currentScreen === 'chaos' && (
        <ChaosScreen store={store} onKickOff={kickOffMatch} />
      )}

      {currentScreen === 'briefing' && (
        <BriefingScreen
          store={store}
          activeCards={activeCards}
          onStartMatch={() => setCurrentScreen('arena')}
        />
      )}

      {currentScreen === 'arena' && (
        <ArenaScreen
          store={store}
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
        <TableScreen store={store} onContinue={handleNextWeek} />
      )}

      {currentScreen === 'complete' && (
        <CompleteScreen
          store={store}
          onHallOfFame={recordHallOfFame}
          onNextSeason={startNextSeason}
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
          onBack={() => setCurrentScreen('hub')}
          onSaveSettings={(settings) => {
            updateStore(s => { s.settings = settings })
          }}
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

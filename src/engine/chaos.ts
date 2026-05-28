import type { ChaosCard, ChaosModifiers } from '../types/game'

export function getChaosModifiers(activeCards: ChaosCard[]): ChaosModifiers {
  const mods: ChaosModifiers = { accuracyPenalty: 0, powerPenalty: 0, keeperBonus: 0 }

  activeCards.forEach(card => {
    if (card.id === 'rain' || card.id === 'boggy') {
      mods.accuracyPenalty += 0.08; mods.powerPenalty += 0.05
    } else if (card.id === 'frozen' || card.id === 'frosthalf') {
      mods.accuracyPenalty += 0.12
    } else if (card.id === 'fog') {
      mods.accuracyPenalty += 0.06; mods.keeperBonus += 5
    } else if (card.id === 'sunshine') {
      mods.keeperBonus -= 10
    } else if (card.id === 'hail') {
      mods.accuracyPenalty += 0.05; mods.powerPenalty += 0.03
    } else if (card.id === 'mudbox') {
      mods.accuracyPenalty += 0.1
    } else if (card.id === 'slope') {
      mods.powerPenalty += 0.05
    } else if (card.id === 'goals') {
      mods.keeperBonus += 8
    } else if (card.id === 'double') {
      mods.accuracyPenalty += 0.1; mods.powerPenalty += 0.08
    } else if (card.id === 'rel_drama') {
      mods.accuracyPenalty += 0.08
    } else if (card.id === 'hangover') {
      mods.accuracyPenalty += 0.07; mods.powerPenalty += 0.05
    } else if (card.id === 'hamstring') {
      mods.powerPenalty += 0.12
    } else if (card.id === 'horses' || card.id === 'legendary_train') {
      mods.accuracyPenalty -= 0.05
    } else if (card.id === 'bollocking') {
      mods.accuracyPenalty -= 0.03
    }
  })

  mods.accuracyPenalty = Math.max(-0.15, Math.min(0.3, mods.accuracyPenalty))
  mods.powerPenalty = Math.max(-0.1, Math.min(0.25, mods.powerPenalty))

  return mods
}

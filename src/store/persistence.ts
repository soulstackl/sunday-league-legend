import type { SaveState } from '../types/game'
import { SAVE_KEY } from './initial-state'

export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj))
}

export function saveGame(state: SaveState): void {
  try {
    const toSave = deepClone(state) as SaveState & { savedAt: number }
    toSave.savedAt = Date.now()
    localStorage.setItem(SAVE_KEY, JSON.stringify(toSave))
  } catch (e) {
    console.warn('Save failed', e)
  }
}

export function loadGame(): SaveState | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY)
    if (!raw) {
      const v1 = localStorage.getItem('sll_save_v1')
      if (v1) return JSON.parse(v1) as SaveState
      return null
    }
    return JSON.parse(raw) as SaveState
  } catch {
    return null
  }
}

import React, { createContext, useContext, useState, useCallback } from 'react'
import type { SaveState } from '../types/game'
import { initialSaveState } from './initial-state'
import { deepClone, saveGame, loadGame } from './persistence'

interface StoreContextValue {
  store: SaveState
  setStore: React.Dispatch<React.SetStateAction<SaveState>>
  updateStore: (updater: (draft: SaveState) => void) => void
}

export const StoreCtx = createContext<StoreContextValue | null>(null)

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [store, setStore] = useState<SaveState>(() => loadGame() ?? deepClone(initialSaveState))

  const updateStore = useCallback((updater: (draft: SaveState) => void) => {
    setStore(prev => {
      const next = deepClone(prev)
      updater(next)
      saveGame(next)
      return next
    })
  }, [])

  return React.createElement(StoreCtx.Provider, { value: { store, setStore, updateStore } }, children)
}

export function useStore(): StoreContextValue {
  const ctx = useContext(StoreCtx)
  if (!ctx) throw new Error('useStore must be used inside StoreProvider')
  return ctx
}

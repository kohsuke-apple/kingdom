'use client'

import { createContext, useCallback, useContext, useState } from 'react'

export type Mode = 'ALL' | 'CA' | 'RA' | 'HIRING' | 'EXT_CA'

type ModeContextValue = {
  mode: Mode
  setMode: (mode: Mode) => void
  toggleMode: () => void
}

const ModeContext = createContext<ModeContextValue | undefined>(undefined)

export function ModeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<Mode>('ALL')

  const setMode = useCallback((nextMode: Mode) => {
    setModeState(nextMode)
    localStorage.setItem('dealeragent-mode', nextMode)
  }, [])

  const toggleMode = useCallback(() => {
    if (mode === 'ALL') {
      setMode('CA')
      return
    }
    if (mode === 'CA') {
      setMode('RA')
      return
    }
    if (mode === 'RA') {
      setMode('EXT_CA')
      return
    }
    if (mode === 'EXT_CA') {
      setMode('HIRING')
      return
    }
    setMode('ALL')
  }, [mode, setMode])

  const value: ModeContextValue = { mode, setMode, toggleMode }

  return <ModeContext.Provider value={value}>{children}</ModeContext.Provider>
}

export function useMode() {
  const ctx = useContext(ModeContext)
  if (!ctx) throw new Error('useMode は ModeProvider 内で使用してください')
  return ctx
}

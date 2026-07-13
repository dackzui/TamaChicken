import { useCallback, useEffect, useState } from 'react'
import {
  applyAction,
  applyDecay,
  clearGame,
  createNewGame,
  loadGame,
  saveGame,
  tapEgg,
  type CareAction,
  type GameState,
  type Stage,
} from './game'

export function useGame() {
  const [state, setState] = useState<GameState | null>(() => loadGame())
  const [burst, setBurst] = useState<CareAction | 'hatch' | null>(null)

  useEffect(() => {
    if (!state) return
    saveGame(state)
  }, [state])

  useEffect(() => {
    if (!state || state.stage !== 'chick') return
    const id = window.setInterval(() => {
      setState((prev) => (prev ? applyDecay(prev) : prev))
    }, 5_000)
    return () => window.clearInterval(id)
  }, [state?.stage])

  useEffect(() => {
    if (!burst) return
    const id = window.setTimeout(() => setBurst(null), 900)
    return () => window.clearTimeout(id)
  }, [burst])

  const startGame = useCallback((name: string) => {
    setState(createNewGame(name))
  }, [])

  const onTapEgg = useCallback(() => {
    setState((prev) => {
      if (!prev) return prev
      const next = tapEgg(prev)
      if (next.stage === 'chick' && prev.stage === 'egg') {
        setBurst('hatch')
      }
      return next
    })
  }, [])

  const doCare = useCallback((action: CareAction) => {
    setBurst(action)
    setState((prev) => (prev ? applyAction(prev, action) : prev))
  }, [])

  const resetGame = useCallback(() => {
    clearGame()
    setState(null)
    setBurst(null)
  }, [])

  const stage: Stage | 'name' = state?.stage ?? 'name'

  return {
    state,
    stage,
    burst,
    startGame,
    onTapEgg,
    doCare,
    resetGame,
  }
}

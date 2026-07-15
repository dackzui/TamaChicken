import { useCallback, useEffect, useRef, useState } from 'react'
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
import { playSong, stopSong } from './playSong'
import { pickRandomSong, songDurationMs, type Song } from './songs'

export function useGame() {
  const [state, setState] = useState<GameState | null>(() => loadGame())
  const [burst, setBurst] = useState<CareAction | 'hatch' | null>(null)
  const [performance, setPerformance] = useState<Song | null>(null)
  const lastSongId = useRef<string | undefined>(undefined)
  const danceTimer = useRef<number | null>(null)

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
    if (!burst || burst === 'play') return
    const ms =
      burst === 'sleep' ? 3200 : burst === 'hatch' ? 2200 : burst === 'meds' ? 1400 : 900
    const id = window.setTimeout(() => setBurst(null), ms)
    return () => window.clearTimeout(id)
  }, [burst])

  useEffect(() => {
    return () => {
      stopSong()
      if (danceTimer.current !== null) {
        window.clearTimeout(danceTimer.current)
      }
    }
  }, [])

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
    if (action === 'meds') {
      stopSong()
      if (danceTimer.current !== null) {
        window.clearTimeout(danceTimer.current)
        danceTimer.current = null
      }
      setPerformance(null)
      setState((prev) => {
        if (!prev?.sick) return prev
        setBurst('meds')
        return applyAction(prev, action)
      })
      return
    }

    if (action === 'play') {
      if (danceTimer.current !== null) {
        window.clearTimeout(danceTimer.current)
      }
      const song = pickRandomSong(lastSongId.current)
      lastSongId.current = song.id
      setBurst('play')
      setPerformance(song)
      void playSong(song)
      danceTimer.current = window.setTimeout(() => {
        setBurst(null)
        setPerformance(null)
        danceTimer.current = null
      }, songDurationMs(song))
    } else {
      stopSong()
      if (danceTimer.current !== null) {
        window.clearTimeout(danceTimer.current)
        danceTimer.current = null
      }
      setPerformance(null)
      setBurst(action)
    }
    setState((prev) => (prev ? applyAction(prev, action) : prev))
  }, [])

  const resetGame = useCallback(() => {
    stopSong()
    if (danceTimer.current !== null) {
      window.clearTimeout(danceTimer.current)
      danceTimer.current = null
    }
    clearGame()
    setState(null)
    setBurst(null)
    setPerformance(null)
  }, [])

  const stage: Stage | 'name' = state?.stage ?? 'name'

  return {
    state,
    stage,
    burst,
    performance,
    startGame,
    onTapEgg,
    doCare,
    resetGame,
  }
}

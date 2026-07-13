import { motion } from 'framer-motion'
import type { Mood } from './game'
import type { Song } from './songs'

interface ChickenProps {
  mood: Mood
  name: string
  burst: string | null
  performance?: Song | null
}

const eyesByMood: Record<Mood, string> = {
  happy: '◠ ◠',
  ok: '● ●',
  sad: '╥ ╥',
  sleepy: '— —',
  dirty: '● ●',
  hungry: '◉ ◉',
}

const beakByMood: Record<Mood, string> = {
  happy: '▽',
  ok: '▼',
  sad: '︵',
  sleepy: '…',
  dirty: '▼',
  hungry: '△',
}

export function Chicken({ mood, name, burst, performance = null }: ChickenProps) {
  const isDancing = burst === 'play' && Boolean(performance)
  const isActing = Boolean(burst && burst !== 'hatch' && !isDancing)

  return (
    <div className="chicken-stage" aria-label={`${name} is ${mood}`}>
      {isDancing && performance && (
        <div className="song-banner" aria-live="polite">
          <p className="song-banner__title">{performance.title}</p>
          <p className="song-banner__lyric">{performance.lyric}</p>
        </div>
      )}

      <motion.div
        className={`chicken chicken--${mood} ${isDancing ? 'chicken--dance' : ''}`}
        animate={
          isDancing
            ? {
                y: [0, -22, 0, -18, 0, -24, 0],
                rotate: [0, -14, 12, -16, 10, -8, 0],
                scale: [1, 1.08, 1.02, 1.1, 1.04, 1.08, 1],
              }
            : isActing
              ? { y: [0, -18, 0], rotate: [0, -6, 6, 0], scale: [1, 1.08, 1] }
              : mood === 'sleepy'
                ? { y: [0, 4, 0] }
                : { y: [0, -8, 0] }
        }
        transition={
          isDancing
            ? { duration: 0.85, repeat: Infinity, ease: 'easeInOut' }
            : isActing
              ? { duration: 0.7 }
              : { duration: mood === 'sleepy' ? 2.4 : 1.6, repeat: Infinity, ease: 'easeInOut' }
        }
      >
        <div className="chicken__comb" />
        <div className="chicken__body">
          <div className="chicken__cheek chicken__cheek--left" />
          <div className="chicken__cheek chicken__cheek--right" />
          <div className="chicken__eyes" aria-hidden>
            {isDancing ? '◠ ◠' : eyesByMood[mood]}
          </div>
          <div className={`chicken__beak ${isDancing ? 'chicken__beak--sing' : ''}`} aria-hidden>
            {isDancing ? 'O' : beakByMood[mood]}
          </div>
          {mood === 'dirty' && !isDancing && <div className="chicken__mud" aria-hidden />}
          {mood === 'hungry' && !isDancing && <div className="chicken__rumble" aria-hidden />}
        </div>
        <div
          className={`chicken__wing chicken__wing--left ${isDancing ? 'chicken__wing--flap' : ''}`}
        />
        <div
          className={`chicken__wing chicken__wing--right ${isDancing ? 'chicken__wing--flap' : ''}`}
        />
        <div className="chicken__feet" aria-hidden>
          <span /><span />
        </div>
      </motion.div>

      {isDancing && (
        <>
          <span className="note note--a" aria-hidden>
            ♪
          </span>
          <span className="note note--b" aria-hidden>
            ♫
          </span>
          <span className="note note--c" aria-hidden>
            ♪
          </span>
        </>
      )}

      {burst === 'feed' && <span className="fx fx--feed">Yum!</span>}
      {burst === 'bath' && <span className="fx fx--bath">Splash!</span>}
      {burst === 'pet' && <span className="fx fx--pet">Love!</span>}
      {burst === 'sleep' && <span className="fx fx--sleep">Zzz</span>}
    </div>
  )
}

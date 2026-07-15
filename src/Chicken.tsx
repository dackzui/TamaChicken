import { motion } from 'framer-motion'
import type { Growth, Mood } from './game'
import type { Song } from './songs'

interface ChickenProps {
  mood: Mood
  growth: Growth
  hunger: number
  name: string
  burst: string | null
  performance?: Song | null
  sick?: boolean
}

const eyesByMood: Record<Mood, string> = {
  happy: '◠ ◠',
  ok: '● ●',
  sad: '╥ ╥',
  sleepy: '— —',
  dirty: '● ●',
  hungry: '╥ ╥',
  sick: 'x x',
}

const beakByMood: Record<Mood, string> = {
  happy: '▽',
  ok: '▼',
  sad: '︵',
  sleepy: '…',
  dirty: '▼',
  hungry: '︵',
  sick: '~',
}

export function Chicken({
  mood,
  growth,
  hunger,
  name,
  burst,
  performance = null,
  sick = false,
}: ChickenProps) {
  const isDancing = burst === 'play' && Boolean(performance)
  const isSleeping = burst === 'sleep' || mood === 'sleepy'
  const isHungrySkinny = hunger < 35 && !isDancing
  const isSickLook = (sick || mood === 'sick') && !isDancing
  const isActing = Boolean(
    burst && burst !== 'hatch' && !isDancing && burst !== 'sleep',
  )

  const eyes = isDancing
    ? '◠ ◠'
    : isSleeping
      ? '— —'
      : isSickLook
        ? 'x x'
        : eyesByMood[mood]
  const beak = isDancing
    ? '◡'
    : isSleeping
      ? '‿'
      : isSickLook
        ? '~'
        : beakByMood[mood]

  return (
    <div
      className="chicken-stage"
      aria-label={`${name} is ${isSleeping ? 'sleeping' : isDancing ? 'playing' : mood}`}
    >
      {isDancing && performance && (
        <div className="song-banner" aria-live="polite">
          <p className="song-banner__title">{performance.title}</p>
          <p className="song-banner__lyric">{performance.lyric}</p>
        </div>
      )}

      {isSleeping && (
        <div className="zzz" aria-hidden>
          <span className="zzz__bubble zzz__bubble--1">Z</span>
          <span className="zzz__bubble zzz__bubble--2">z</span>
          <span className="zzz__bubble zzz__bubble--3">z</span>
        </div>
      )}

      {isSickLook && !isSleeping && (
        <div className="sick-cloud" aria-hidden>
          <span className="sick-cloud__dot">+</span>
        </div>
      )}

      <motion.div
        className={[
          'chicken',
          `chicken--${mood}`,
          `chicken--growth-${growth}`,
          isDancing ? 'chicken--dance' : '',
          isSleeping ? 'chicken--sleeping' : '',
          isHungrySkinny ? 'chicken--skinny' : '',
          isSickLook ? 'chicken--ill' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        animate={
          isDancing
            ? {
                x: [0, 28, -24, 32, -20, 16, 0],
                y: [0, -36, -8, -42, -6, -30, 0],
                rotate: [0, -18, 16, -20, 14, -10, 0],
                scale: [1, 1.12, 1.04, 1.14, 1.05, 1.1, 1],
              }
            : isSleeping
              ? { y: [0, 6, 0], rotate: [0, 2, 0], scale: 1 }
              : isSickLook
                ? { y: [0, 3, 0], rotate: [0, -3, 3, 0], scale: 1 }
                : isActing
                  ? { y: [0, -18, 0], rotate: [0, -6, 6, 0], scale: [1, 1.08, 1] }
                  : { y: [0, -8, 0] }
        }
        transition={
          isDancing
            ? { duration: 0.7, repeat: Infinity, ease: 'easeInOut' }
            : isSleeping
              ? { duration: 2.8, repeat: Infinity, ease: 'easeInOut' }
              : isSickLook
                ? { duration: 1.8, repeat: Infinity, ease: 'easeInOut' }
                : isActing
                  ? { duration: 0.7 }
                  : { duration: 1.6, repeat: Infinity, ease: 'easeInOut' }
        }
      >
        <div className="chicken__comb" />
        <div className="chicken__body">
          <div className="chicken__cheek chicken__cheek--left" />
          <div className="chicken__cheek chicken__cheek--right" />
          <div
            className={`chicken__eyes ${isSleeping ? 'chicken__eyes--closed' : ''} ${isDancing ? 'chicken__eyes--smile' : ''} ${isHungrySkinny || mood === 'sad' ? 'chicken__eyes--sad' : ''}`}
            aria-hidden
          >
            {eyes}
          </div>
          <div
            className={`chicken__beak ${isDancing ? 'chicken__beak--smile' : ''} ${isSleeping ? 'chicken__beak--sleep' : ''}`}
            aria-hidden
          >
            {beak}
          </div>
          {mood === 'dirty' && !isDancing && !isSleeping && (
            <div className="chicken__mud" aria-hidden />
          )}
          {(mood === 'hungry' || isHungrySkinny) && !isDancing && !isSleeping && (
            <div className="chicken__rumble" aria-hidden />
          )}
        </div>
        <div
          className={`chicken__wing chicken__wing--left ${isDancing ? 'chicken__wing--flap' : ''}`}
        />
        <div
          className={`chicken__wing chicken__wing--right ${isDancing ? 'chicken__wing--flap' : ''}`}
        />
        <div className="chicken__feet" aria-hidden>
          <span />
          <span />
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
      {burst === 'meds' && <span className="fx fx--meds">Better!</span>}
      {burst === 'hatch' && <span className="fx fx--hatch">Peep!</span>}
    </div>
  )
}

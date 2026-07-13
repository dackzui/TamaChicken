import { motion } from 'framer-motion'
import type { Mood } from './game'

interface ChickenProps {
  mood: Mood
  name: string
  burst: string | null
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

export function Chicken({ mood, name, burst }: ChickenProps) {
  const isActing = Boolean(burst && burst !== 'hatch')

  return (
    <div className="chicken-stage" aria-label={`${name} is ${mood}`}>
      <motion.div
        className={`chicken chicken--${mood}`}
        animate={
          isActing
            ? { y: [0, -18, 0], rotate: [0, -6, 6, 0], scale: [1, 1.08, 1] }
            : mood === 'sleepy'
              ? { y: [0, 4, 0] }
              : { y: [0, -8, 0] }
        }
        transition={
          isActing
            ? { duration: 0.7 }
            : { duration: mood === 'sleepy' ? 2.4 : 1.6, repeat: Infinity, ease: 'easeInOut' }
        }
      >
        <div className="chicken__comb" />
        <div className="chicken__body">
          <div className="chicken__cheek chicken__cheek--left" />
          <div className="chicken__cheek chicken__cheek--right" />
          <div className="chicken__eyes" aria-hidden>
            {eyesByMood[mood]}
          </div>
          <div className="chicken__beak" aria-hidden>
            {beakByMood[mood]}
          </div>
          {mood === 'dirty' && <div className="chicken__mud" aria-hidden />}
          {mood === 'hungry' && <div className="chicken__rumble" aria-hidden />}
        </div>
        <div className="chicken__wing chicken__wing--left" />
        <div className="chicken__wing chicken__wing--right" />
        <div className="chicken__feet" aria-hidden>
          <span /><span />
        </div>
      </motion.div>

      {burst === 'feed' && <span className="fx fx--feed">Yum!</span>}
      {burst === 'bath' && <span className="fx fx--bath">Splash!</span>}
      {burst === 'play' && <span className="fx fx--play">Whee!</span>}
      {burst === 'pet' && <span className="fx fx--pet">Love!</span>}
      {burst === 'sleep' && <span className="fx fx--sleep">Zzz</span>}
    </div>
  )
}

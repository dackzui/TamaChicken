import { motion } from 'framer-motion'
import type { Growth, Mood, PetKind } from './game'
import { getPetOption } from './pets'
import type { Song } from './songs'

interface PetProps {
  kind: PetKind
  mood: Mood
  growth: Growth
  hunger: number
  name: string
  burst: string | null
  performance?: Song | null
  sick?: boolean
  sleeping?: boolean
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

const mouthByMood: Record<Mood, string> = {
  happy: '▽',
  ok: '▼',
  sad: '︵',
  sleepy: '…',
  dirty: '▼',
  hungry: '︵',
  sick: '~',
}

export function Pet({
  kind,
  mood,
  growth,
  hunger,
  name,
  burst,
  performance = null,
  sick = false,
  sleeping = false,
}: PetProps) {
  const pet = getPetOption(kind)
  const isDancing =
    (burst === 'play' || burst === 'birthday') && Boolean(performance)
  const isSleeping = sleeping || burst === 'sleep'
  const isHungrySkinny = hunger < 35 && !isDancing && !isSleeping
  const isSickLook = (sick || mood === 'sick') && !isDancing && !isSleeping
  const isActing = Boolean(
    burst &&
      burst !== 'hatch' &&
      !isDancing &&
      burst !== 'sleep' &&
      burst !== 'wake' &&
      !isSleeping,
  )

  const eyes = isDancing
    ? '◠ ◠'
    : isSleeping
      ? '— —'
      : isSickLook
        ? 'x x'
        : eyesByMood[mood]
  const mouth = isDancing
    ? '◡'
    : isSleeping
      ? '‿'
      : isSickLook
        ? '~'
        : mouthByMood[mood]

  return (
    <div
      className="pet-stage"
      aria-label={`${name} the ${pet.label} is ${isSleeping ? 'sleeping' : isDancing ? 'playing' : mood}`}
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
          'pet',
          `pet--${kind}`,
          `pet--${mood}`,
          `pet--growth-${growth}`,
          isDancing ? 'pet--dance' : '',
          isSleeping ? 'pet--sleeping' : '',
          isHungrySkinny ? 'pet--skinny' : '',
          isSickLook ? 'pet--ill' : '',
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
        {kind === 'chicken' && <div className="pet__comb" />}
        {kind === 'dog' && (
          <>
            <div className="pet__ear pet__ear--dog-left" />
            <div className="pet__ear pet__ear--dog-right" />
            <div className="pet__tail pet__tail--dog" />
          </>
        )}
        {kind === 'cat' && (
          <>
            <div className="pet__ear pet__ear--cat-left" />
            <div className="pet__ear pet__ear--cat-right" />
            <div className="pet__tail pet__tail--cat" />
          </>
        )}

        <div className="pet__body">
          <div className="pet__cheek pet__cheek--left" />
          <div className="pet__cheek pet__cheek--right" />
          {kind === 'cat' && <div className="pet__whiskers" aria-hidden />}
          <div
            className={`pet__eyes ${isSleeping ? 'pet__eyes--closed' : ''} ${isDancing ? 'pet__eyes--smile' : ''} ${isHungrySkinny || mood === 'sad' ? 'pet__eyes--sad' : ''}`}
            aria-hidden
          >
            {eyes}
          </div>
          <div
            className={`pet__mouth ${kind === 'chicken' ? 'pet__mouth--beak' : ''} ${isDancing ? 'pet__mouth--smile' : ''} ${isSleeping ? 'pet__mouth--sleep' : ''}`}
            aria-hidden
          >
            {kind === 'dog' || kind === 'cat' ? (
              <span className="pet__nose" />
            ) : null}
            {mouth}
          </div>
          {mood === 'dirty' && !isDancing && !isSleeping && (
            <div className="pet__mud" aria-hidden />
          )}
          {(mood === 'hungry' || isHungrySkinny) && !isDancing && !isSleeping && (
            <div className="pet__rumble" aria-hidden />
          )}
        </div>

        {kind === 'chicken' ? (
          <>
            <div
              className={`pet__wing pet__wing--left ${isDancing ? 'pet__wing--flap' : ''}`}
            />
            <div
              className={`pet__wing pet__wing--right ${isDancing ? 'pet__wing--flap' : ''}`}
            />
          </>
        ) : (
          <>
            <div className="pet__paw pet__paw--left" />
            <div className="pet__paw pet__paw--right" />
          </>
        )}

        <div className="pet__feet" aria-hidden>
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
      {burst === 'wake' && <span className="fx fx--wake">Up!</span>}
      {burst === 'hatch' && (
        <span className="fx fx--hatch">{pet.hatchCue}</span>
      )}
    </div>
  )
}

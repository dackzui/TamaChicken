import { motion } from 'framer-motion'
import { HATCH_TAPS_NEEDED } from './game'

interface EggProps {
  taps: number
  onTap: () => void
}

export function Egg({ taps, onTap }: EggProps) {
  const cracked = taps >= 2
  const almost = taps >= 4

  return (
    <button type="button" className="egg-wrap" onClick={onTap} aria-label="Tap the egg to hatch">
      <motion.div
        className={`egg ${cracked ? 'egg--crack' : ''} ${almost ? 'egg--almost' : ''}`}
        whileTap={{ scale: 0.94, rotate: taps % 2 === 0 ? -8 : 8 }}
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className="egg__shell" />
        {cracked && <div className="egg__crack" aria-hidden />}
        {almost && <div className="egg__peek" aria-hidden />}
      </motion.div>
      <p className="egg__hint">
        Tap! {taps}/{HATCH_TAPS_NEEDED}
      </p>
    </button>
  )
}

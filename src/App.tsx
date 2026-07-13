import { motion, AnimatePresence } from 'framer-motion'
import { CarePad } from './CarePad'
import { Chicken } from './Chicken'
import { Egg } from './Egg'
import { getMood } from './game'
import { NameScreen } from './NameScreen'
import { useGame } from './useGame'

const moodCopy: Record<string, string> = {
  happy: 'so happy!',
  ok: 'is okay',
  sad: 'misses you',
  sleepy: 'is sleepy',
  dirty: 'needs a bath',
  hungry: 'is hungry',
}

export default function App() {
  const { state, stage, burst, performance, startGame, onTapEgg, doCare, resetGame } = useGame()

  return (
    <div className="app">
      <div className="sky" aria-hidden />
      <div className="hills" aria-hidden />

      <AnimatePresence mode="wait">
        {stage === 'name' && (
          <motion.div
            key="name"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="panel"
          >
            <NameScreen onStart={startGame} />
          </motion.div>
        )}

        {stage === 'egg' && state && (
          <motion.div
            key="egg"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.04 }}
            className="panel panel--play"
          >
            <header className="topbar">
              <p className="brand brand--small">TamaChicken</p>
              <p className="pet-name">{state.name}</p>
            </header>
            <p className="prompt">Tap the egg!</p>
            <Egg taps={state.hatchTaps} onTap={onTapEgg} />
          </motion.div>
        )}

        {stage === 'chick' && state && (
          <motion.div
            key="chick"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            className="panel panel--play"
          >
            <header className="topbar">
              <p className="brand brand--small">TamaChicken</p>
              <p className="pet-name">{state.name}</p>
              <button type="button" className="reset" onClick={resetGame}>
                New
              </button>
            </header>

            <p className="prompt">
              {performance
                ? `${state.name} is singing!`
                : `${state.name} ${moodCopy[getMood(state.needs)]}`}
            </p>

            <Chicken
              mood={getMood(state.needs)}
              name={state.name}
              burst={burst}
              performance={performance}
            />
            <CarePad needs={state.needs} onCare={doCare} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

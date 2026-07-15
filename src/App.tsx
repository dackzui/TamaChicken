import { motion, AnimatePresence } from 'framer-motion'
import { CarePad } from './CarePad'
import { Egg } from './Egg'
import { APP_NAME } from './brand'
import { getGrowth, getGrowthLabel, getMood } from './game'
import { getPetOption } from './pets'
import { NameScreen } from './NameScreen'
import { Pet } from './Pet'
import { useGame } from './useGame'

const moodCopy: Record<string, string> = {
  happy: 'so happy!',
  ok: 'is okay',
  sad: 'misses you',
  sleepy: 'is sleepy',
  dirty: 'needs a bath',
  hungry: 'is hungry',
  sick: 'is sick!',
}

export default function App() {
  const { state, stage, burst, performance, startGame, onTapEgg, doCare, resetGame } =
    useGame()

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
              <p className="brand brand--small">{APP_NAME}</p>
              <p className="pet-name">{state.name}</p>
            </header>
            <p className="prompt">{getPetOption(state.kind).eggHint}</p>
            <Egg taps={state.hatchTaps} onTap={onTapEgg} kind={state.kind} />
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
              <p className="brand brand--small">{APP_NAME}</p>
              <p className="pet-name">{state.name}</p>
              <button type="button" className="reset" onClick={resetGame}>
                New
              </button>
            </header>

            <p className="prompt">
              {(() => {
                const mood = getMood(state)
                const growth = getGrowth(state)
                const pet = getPetOption(state.kind)
                if (performance?.id === 'birthday') {
                  return `${state.name} sings Happy Birthday!`
                }
                if (performance) return `${state.name} is singing!`
                if (burst === 'hatch') {
                  return `A ${pet.babyLabel}! Meet ${state.name}!`
                }
                if (state.sleeping) {
                  return `${state.name} is sleeping... Tap Wake or Play!`
                }
                if (burst === 'wake') return `${state.name} woke up!`
                if (mood === 'sick') return `${state.name} is sick — give Meds!`
                if (mood === 'hungry') return `${state.name} is hungry and sad`
                return `${state.name} (${getGrowthLabel(growth, state.kind)}) ${moodCopy[mood]}`
              })()}
            </p>

            <Pet
              kind={state.kind}
              mood={getMood(state)}
              growth={getGrowth(state)}
              hunger={state.needs.hunger}
              name={state.name}
              burst={burst}
              performance={performance}
              sick={state.sick}
              sleeping={state.sleeping}
            />
            <CarePad
              needs={state.needs}
              onCare={doCare}
              sick={state.sick}
              sleeping={state.sleeping}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

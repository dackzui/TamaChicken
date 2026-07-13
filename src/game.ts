export type Stage = 'name' | 'egg' | 'chick'

export type Mood = 'happy' | 'ok' | 'sad' | 'sleepy' | 'dirty' | 'hungry'

export type CareAction = 'feed' | 'bath' | 'play' | 'pet' | 'sleep'

export interface Needs {
  hunger: number
  cleanliness: number
  happiness: number
  energy: number
}

export interface GameState {
  name: string
  stage: Stage
  needs: Needs
  hatchTaps: number
  lastTick: number
  createdAt: number
}

export const STORAGE_KEY = 'tamachicken-save-v1'

export const HATCH_TAPS_NEEDED = 5

/** Classic pace: needs drop noticeably within a few minutes of play. */
export const DECAY_PER_MINUTE: Needs = {
  hunger: 8,
  cleanliness: 5,
  happiness: 7,
  energy: 4,
}

export const ACTION_EFFECTS: Record<CareAction, Partial<Needs>> = {
  feed: { hunger: 35, energy: 5 },
  bath: { cleanliness: 45, happiness: 5 },
  play: { happiness: 30, energy: -12, hunger: -5 },
  pet: { happiness: 20 },
  sleep: { energy: 50, hunger: -8 },
}

export function clampNeed(value: number): number {
  return Math.max(0, Math.min(100, value))
}

export function createNewGame(name: string): GameState {
  const now = Date.now()
  return {
    name: name.trim() || 'Chickie',
    stage: 'egg',
    needs: {
      hunger: 80,
      cleanliness: 90,
      happiness: 85,
      energy: 90,
    },
    hatchTaps: 0,
    lastTick: now,
    createdAt: now,
  }
}

export function applyDecay(state: GameState, now = Date.now()): GameState {
  if (state.stage !== 'chick') {
    return { ...state, lastTick: now }
  }

  const elapsedMs = Math.max(0, now - state.lastTick)
  const minutes = elapsedMs / 60_000
  if (minutes < 0.05) return state

  return {
    ...state,
    lastTick: now,
    needs: {
      hunger: clampNeed(state.needs.hunger - DECAY_PER_MINUTE.hunger * minutes),
      cleanliness: clampNeed(
        state.needs.cleanliness - DECAY_PER_MINUTE.cleanliness * minutes,
      ),
      happiness: clampNeed(
        state.needs.happiness - DECAY_PER_MINUTE.happiness * minutes,
      ),
      energy: clampNeed(state.needs.energy - DECAY_PER_MINUTE.energy * minutes),
    },
  }
}

export function applyAction(state: GameState, action: CareAction): GameState {
  if (state.stage !== 'chick') return state

  const effects = ACTION_EFFECTS[action]
  const nextNeeds = { ...state.needs }

  for (const key of Object.keys(effects) as (keyof Needs)[]) {
    const delta = effects[key]
    if (delta !== undefined) {
      nextNeeds[key] = clampNeed(nextNeeds[key] + delta)
    }
  }

  return {
    ...state,
    needs: nextNeeds,
    lastTick: Date.now(),
  }
}

export function tapEgg(state: GameState): GameState {
  if (state.stage !== 'egg') return state
  const taps = state.hatchTaps + 1
  if (taps >= HATCH_TAPS_NEEDED) {
    return {
      ...state,
      hatchTaps: taps,
      stage: 'chick',
      needs: {
        hunger: 70,
        cleanliness: 85,
        happiness: 95,
        energy: 80,
      },
      lastTick: Date.now(),
    }
  }
  return { ...state, hatchTaps: taps }
}

export function getMood(needs: Needs): Mood {
  const { hunger, cleanliness, happiness, energy } = needs
  if (energy < 25) return 'sleepy'
  if (hunger < 30) return 'hungry'
  if (cleanliness < 30) return 'dirty'
  if (happiness < 30 || Math.min(hunger, cleanliness, happiness, energy) < 35) {
    return 'sad'
  }
  if (Math.min(hunger, cleanliness, happiness, energy) >= 70) return 'happy'
  return 'ok'
}

export function loadGame(): GameState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as GameState
    if (!parsed?.name || !parsed?.needs) return null
    return applyDecay(parsed)
  } catch {
    return null
  }
}

export function saveGame(state: GameState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export function clearGame(): void {
  localStorage.removeItem(STORAGE_KEY)
}

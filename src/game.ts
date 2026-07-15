export type Stage = 'name' | 'egg' | 'chick'

export type Growth = 'baby' | 'teen' | 'adult'

export type Mood =
  | 'happy'
  | 'ok'
  | 'sad'
  | 'sleepy'
  | 'dirty'
  | 'hungry'
  | 'sick'

export type CareAction = 'feed' | 'bath' | 'play' | 'pet' | 'sleep' | 'wake' | 'meds'

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
  /** When the egg hatched into a chick */
  hatchedAt: number | null
  sick: boolean
  lastSickRoll: number
  /** Recent play count — too much play makes the pet filthy/sad/hungry */
  playStreak: number
  lastPlayAt: number
  /** Stays asleep until woken (Play, Wake, feed, etc.) */
  sleeping: boolean
}

export const STORAGE_KEY = 'pawchi-save-v2'

export const HATCH_TAPS_NEEDED = 5

/** Classic pace: needs drop noticeably within a few minutes of play. */
export const DECAY_PER_MINUTE: Needs = {
  hunger: 8,
  cleanliness: 5,
  happiness: 7,
  energy: 4,
}

/**
 * Slow growth after hatch (real time):
 * - baby chick: 0–16 hours
 * - growing chick: 16–48 hours
 * - full chicken: after 48 hours
 */
export const GROWTH_MINUTES = {
  teen: 16 * 60,
  adult: 48 * 60,
} as const

/** Chance each minute (while healthy) to become sick. */
export const SICK_CHANCE_PER_MINUTE = 0.06

export const ACTION_EFFECTS: Record<CareAction, Partial<Needs>> = {
  feed: { hunger: 35, energy: 5, happiness: 5 },
  bath: { cleanliness: 45, happiness: 5 },
  play: { happiness: 28, energy: -14, hunger: -10, cleanliness: -12 },
  pet: { happiness: 20 },
  sleep: { energy: 15, hunger: -4 },
  wake: { happiness: 5 },
  meds: { happiness: 10, energy: 8 },
}

/** While asleep, energy recovers and other needs drop slowly. */
export const SLEEP_PER_MINUTE = {
  energy: 14,
  hunger: 3,
  cleanliness: 1,
  happiness: 1,
} as const

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
    hatchedAt: null,
    sick: false,
    lastSickRoll: now,
    playStreak: 0,
    lastPlayAt: 0,
    sleeping: false,
  }
}

export function getGrowth(state: GameState, now = Date.now()): Growth {
  if (state.stage !== 'chick' || !state.hatchedAt) return 'baby'
  const minutes = (now - state.hatchedAt) / 60_000
  if (minutes >= GROWTH_MINUTES.adult) return 'adult'
  if (minutes >= GROWTH_MINUTES.teen) return 'teen'
  return 'baby'
}

export function getGrowthLabel(growth: Growth): string {
  if (growth === 'baby') return 'baby chick'
  if (growth === 'teen') return 'growing chick'
  return 'big chicken'
}

function decayPlayStreak(state: GameState, now: number): number {
  if (state.playStreak <= 0 || !state.lastPlayAt) return 0
  const minutesSincePlay = (now - state.lastPlayAt) / 60_000
  // Cool down ~1 streak every 90 seconds without play
  const cooled = Math.floor(minutesSincePlay / 1.5)
  return Math.max(0, state.playStreak - cooled)
}

export function applyDecay(state: GameState, now = Date.now()): GameState {
  if (state.stage !== 'chick') {
    return { ...state, lastTick: now }
  }

  const elapsedMs = Math.max(0, now - state.lastTick)
  const minutes = elapsedMs / 60_000
  if (minutes < 0.05) return state

  if (state.sleeping) {
    return {
      ...state,
      lastTick: now,
      playStreak: decayPlayStreak(state, now),
      needs: {
        hunger: clampNeed(state.needs.hunger - SLEEP_PER_MINUTE.hunger * minutes),
        cleanliness: clampNeed(
          state.needs.cleanliness - SLEEP_PER_MINUTE.cleanliness * minutes,
        ),
        happiness: clampNeed(
          state.needs.happiness - SLEEP_PER_MINUTE.happiness * minutes,
        ),
        energy: clampNeed(state.needs.energy + SLEEP_PER_MINUTE.energy * minutes),
      },
    }
  }

  const sickMul = state.sick ? 1.45 : 1
  let next: GameState = {
    ...state,
    lastTick: now,
    playStreak: decayPlayStreak(state, now),
    needs: {
      hunger: clampNeed(
        state.needs.hunger - DECAY_PER_MINUTE.hunger * minutes * sickMul,
      ),
      cleanliness: clampNeed(
        state.needs.cleanliness - DECAY_PER_MINUTE.cleanliness * minutes,
      ),
      happiness: clampNeed(
        state.needs.happiness - DECAY_PER_MINUTE.happiness * minutes * sickMul,
      ),
      energy: clampNeed(
        state.needs.energy - DECAY_PER_MINUTE.energy * minutes * (state.sick ? 1.3 : 1),
      ),
    },
  }

  next = maybeGetSick(next, now)
  return next
}

function maybeGetSick(state: GameState, now: number): GameState {
  if (state.sick || state.stage !== 'chick') return state

  const sinceRoll = (now - state.lastSickRoll) / 60_000
  if (sinceRoll < 1) return state

  // More likely when messy or very hungry
  let chance = SICK_CHANCE_PER_MINUTE
  if (state.needs.cleanliness < 35) chance += 0.04
  if (state.needs.hunger < 35) chance += 0.03

  // Roll once per elapsed minute since last check
  const rolls = Math.min(5, Math.floor(sinceRoll))
  let sick = false
  for (let i = 0; i < rolls; i++) {
    if (Math.random() < chance) {
      sick = true
      break
    }
  }

  return {
    ...state,
    sick,
    lastSickRoll: now,
    needs: sick
      ? {
          ...state.needs,
          happiness: clampNeed(state.needs.happiness - 15),
          energy: clampNeed(state.needs.energy - 10),
        }
      : state.needs,
  }
}

export function applyAction(state: GameState, action: CareAction): GameState {
  if (state.stage !== 'chick') return state

  const now = Date.now()

  if (action === 'sleep') {
    if (state.sleeping) return state
    return {
      ...state,
      sleeping: true,
      lastTick: now,
      needs: {
        ...state.needs,
        energy: clampNeed(state.needs.energy + (ACTION_EFFECTS.sleep.energy ?? 0)),
        hunger: clampNeed(state.needs.hunger + (ACTION_EFFECTS.sleep.hunger ?? 0)),
      },
    }
  }

  if (action === 'wake') {
    if (!state.sleeping) return state
    return {
      ...state,
      sleeping: false,
      lastTick: now,
      needs: {
        ...state.needs,
        happiness: clampNeed(state.needs.happiness + (ACTION_EFFECTS.wake.happiness ?? 0)),
      },
    }
  }

  if (action === 'meds') {
    if (!state.sick) return state
    return {
      ...state,
      sick: false,
      sleeping: false,
      lastSickRoll: now,
      lastTick: now,
      needs: {
        ...state.needs,
        happiness: clampNeed(state.needs.happiness + 12),
        energy: clampNeed(state.needs.energy + 10),
      },
    }
  }

  const effects = { ...ACTION_EFFECTS[action] }
  let playStreak = decayPlayStreak(state, now)
  let lastPlayAt = state.lastPlayAt

  if (action === 'play') {
    playStreak += 1
    lastPlayAt = now
    // Too much play: filthier, hungrier, sadder
    if (playStreak >= 2) {
      effects.cleanliness = (effects.cleanliness ?? 0) - 10
      effects.hunger = (effects.hunger ?? 0) - 8
      effects.happiness = (effects.happiness ?? 0) - 6
    }
    if (playStreak >= 3) {
      effects.cleanliness = (effects.cleanliness ?? 0) - 12
      effects.hunger = (effects.hunger ?? 0) - 10
      effects.happiness = (effects.happiness ?? 0) - 10
      effects.energy = (effects.energy ?? 0) - 8
    }
  }

  const nextNeeds = { ...state.needs }
  for (const key of Object.keys(effects) as (keyof Needs)[]) {
    const delta = effects[key]
    if (delta !== undefined) {
      nextNeeds[key] = clampNeed(nextNeeds[key] + delta)
    }
  }

  return {
    ...state,
    sleeping: false,
    needs: nextNeeds,
    playStreak,
    lastPlayAt,
    lastTick: now,
  }
}

export function tapEgg(state: GameState): GameState {
  if (state.stage !== 'egg') return state
  const taps = state.hatchTaps + 1
  const now = Date.now()
  if (taps >= HATCH_TAPS_NEEDED) {
    return {
      ...state,
      hatchTaps: taps,
      stage: 'chick',
      hatchedAt: now,
      sick: false,
      playStreak: 0,
      lastPlayAt: 0,
      lastSickRoll: now,
      sleeping: false,
      needs: {
        hunger: 70,
        cleanliness: 90,
        happiness: 95,
        energy: 80,
      },
      lastTick: now,
    }
  }
  return { ...state, hatchTaps: taps }
}

export function getMood(state: GameState): Mood {
  if (state.sleeping) return 'sleepy'
  if (state.sick) return 'sick'
  const { hunger, cleanliness, happiness, energy } = state.needs
  if (energy < 25) return 'sleepy'
  if (hunger < 30) return 'hungry'
  if (cleanliness < 30) return 'dirty'
  if (happiness < 30 || Math.min(hunger, cleanliness, happiness, energy) < 35) {
    return 'sad'
  }
  if (Math.min(hunger, cleanliness, happiness, energy) >= 70) return 'happy'
  return 'ok'
}

function migrateLoaded(raw: Record<string, unknown>): GameState | null {
  if (typeof raw.name !== 'string' || !raw.needs || typeof raw.needs !== 'object') {
    return null
  }
  const needs = raw.needs as Needs
  const now = Date.now()
  const stage = (raw.stage as Stage) ?? 'egg'
  return {
    name: raw.name,
    stage,
    needs: {
      hunger: clampNeed(Number(needs.hunger) || 50),
      cleanliness: clampNeed(Number(needs.cleanliness) || 50),
      happiness: clampNeed(Number(needs.happiness) || 50),
      energy: clampNeed(Number(needs.energy) || 50),
    },
    hatchTaps: Number(raw.hatchTaps) || 0,
    lastTick: Number(raw.lastTick) || now,
    createdAt: Number(raw.createdAt) || now,
    hatchedAt:
      typeof raw.hatchedAt === 'number'
        ? raw.hatchedAt
        : stage === 'chick'
          ? Number(raw.createdAt) || now
          : null,
    sick: Boolean(raw.sick),
    lastSickRoll: Number(raw.lastSickRoll) || now,
    playStreak: Number(raw.playStreak) || 0,
    lastPlayAt: Number(raw.lastPlayAt) || 0,
    sleeping: Boolean(raw.sleeping),
  }
}

export function loadGame(): GameState | null {
  try {
    const raw =
      localStorage.getItem(STORAGE_KEY) ??
      localStorage.getItem('tamachicken-save-v2') ??
      localStorage.getItem('tamachicken-save-v1')
    if (!raw) return null
    const parsed = migrateLoaded(JSON.parse(raw) as Record<string, unknown>)
    if (!parsed) return null
    const next = applyDecay(parsed)
    saveGame(next)
    return next
  } catch {
    return null
  }
}

export function saveGame(state: GameState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export function clearGame(): void {
  localStorage.removeItem(STORAGE_KEY)
  localStorage.removeItem('tamachicken-save-v2')
  localStorage.removeItem('tamachicken-save-v1')
}

export interface Note {
  /** Frequency in Hz; null = rest */
  freq: number | null
  /** Duration in beats */
  beats: number
}

export interface Song {
  id: string
  title: string
  lyric: string
  tempo: number
  notes: Note[]
}

/** Toddler-friendly public-domain style melodies (approx). */
export const SONGS: Song[] = [
  {
    id: 'twinkle',
    title: 'Twinkle Twinkle',
    lyric: 'Twinkle, twinkle, little star!',
    tempo: 120,
    notes: [
      { freq: 262, beats: 1 },
      { freq: 262, beats: 1 },
      { freq: 392, beats: 1 },
      { freq: 392, beats: 1 },
      { freq: 440, beats: 1 },
      { freq: 440, beats: 1 },
      { freq: 392, beats: 2 },
      { freq: 349, beats: 1 },
      { freq: 349, beats: 1 },
      { freq: 330, beats: 1 },
      { freq: 330, beats: 1 },
      { freq: 294, beats: 1 },
      { freq: 294, beats: 1 },
      { freq: 262, beats: 2 },
    ],
  },
  {
    id: 'macdonald',
    title: 'Old MacDonald',
    lyric: 'E-I-E-I-O!',
    tempo: 130,
    notes: [
      { freq: 392, beats: 1 },
      { freq: 392, beats: 1 },
      { freq: 392, beats: 1 },
      { freq: 294, beats: 1 },
      { freq: 330, beats: 1 },
      { freq: 330, beats: 1 },
      { freq: 294, beats: 2 },
      { freq: 494, beats: 1 },
      { freq: 494, beats: 1 },
      { freq: 440, beats: 1 },
      { freq: 440, beats: 1 },
      { freq: 392, beats: 2 },
    ],
  },
  {
    id: 'boat',
    title: 'Row Your Boat',
    lyric: 'Row, row, row your boat!',
    tempo: 110,
    notes: [
      { freq: 262, beats: 1.5 },
      { freq: 262, beats: 0.5 },
      { freq: 262, beats: 1 },
      { freq: 294, beats: 1 },
      { freq: 330, beats: 1.5 },
      { freq: 330, beats: 0.5 },
      { freq: 330, beats: 1 },
      { freq: 294, beats: 0.5 },
      { freq: 330, beats: 0.5 },
      { freq: 349, beats: 1 },
      { freq: 392, beats: 2 },
    ],
  },
  {
    id: 'spider',
    title: 'Itsy Bitsy Spider',
    lyric: 'Up the water spout!',
    tempo: 115,
    notes: [
      { freq: 262, beats: 0.5 },
      { freq: 294, beats: 0.5 },
      { freq: 330, beats: 0.5 },
      { freq: 262, beats: 0.5 },
      { freq: 330, beats: 0.5 },
      { freq: 262, beats: 0.5 },
      { freq: 330, beats: 1 },
      { freq: 349, beats: 0.5 },
      { freq: 392, beats: 1.5 },
      { freq: 349, beats: 0.5 },
      { freq: 330, beats: 0.5 },
      { freq: 262, beats: 1 },
    ],
  },
  {
    id: 'baa',
    title: 'Baa Baa Black Sheep',
    lyric: 'Have you any wool?',
    tempo: 118,
    notes: [
      { freq: 262, beats: 1 },
      { freq: 262, beats: 1 },
      { freq: 392, beats: 1 },
      { freq: 392, beats: 1 },
      { freq: 440, beats: 0.5 },
      { freq: 494, beats: 0.5 },
      { freq: 440, beats: 0.5 },
      { freq: 392, beats: 0.5 },
      { freq: 349, beats: 1 },
      { freq: 330, beats: 1 },
      { freq: 294, beats: 1 },
      { freq: 262, beats: 1 },
    ],
  },
  {
    id: 'birthday',
    title: 'Happy Birthday',
    lyric: 'Happy birthday to you!',
    tempo: 100,
    notes: [
      // Happy birthday to you
      { freq: 262, beats: 0.75 },
      { freq: 262, beats: 0.25 },
      { freq: 294, beats: 1 },
      { freq: 262, beats: 1 },
      { freq: 349, beats: 1 },
      { freq: 330, beats: 2 },
      // Happy birthday to you
      { freq: 262, beats: 0.75 },
      { freq: 262, beats: 0.25 },
      { freq: 294, beats: 1 },
      { freq: 262, beats: 1 },
      { freq: 392, beats: 1 },
      { freq: 349, beats: 2 },
      // Happy birthday dear friend
      { freq: 262, beats: 0.75 },
      { freq: 262, beats: 0.25 },
      { freq: 523, beats: 1 },
      { freq: 440, beats: 1 },
      { freq: 349, beats: 1 },
      { freq: 330, beats: 1 },
      { freq: 294, beats: 2 },
      // Happy birthday to you
      { freq: 466, beats: 0.75 },
      { freq: 466, beats: 0.25 },
      { freq: 440, beats: 1 },
      { freq: 349, beats: 1 },
      { freq: 392, beats: 1 },
      { freq: 349, beats: 2 },
    ],
  },
]

export const HAPPY_BIRTHDAY =
  SONGS.find((s) => s.id === 'birthday') ?? SONGS[0]

export function pickRandomSong(excludeId?: string): Song {
  const pool = excludeId ? SONGS.filter((s) => s.id !== excludeId) : SONGS
  return pool[Math.floor(Math.random() * pool.length)] ?? SONGS[0]
}

export function songDurationMs(song: Song): number {
  const beatMs = 60_000 / song.tempo
  const beats = song.notes.reduce((sum, n) => sum + n.beats, 0)
  return Math.round(beats * beatMs + 200)
}

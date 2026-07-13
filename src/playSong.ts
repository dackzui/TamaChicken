import type { Song } from './songs'

let sharedCtx: AudioContext | null = null
let activeNodes: AudioScheduledSourceNode[] = []

function getCtx(): AudioContext {
  if (!sharedCtx) {
    sharedCtx = new AudioContext()
  }
  return sharedCtx
}

export function stopSong(): void {
  for (const node of activeNodes) {
    try {
      node.stop()
    } catch {
      // already stopped
    }
  }
  activeNodes = []
}

/** Plays a short melody with a soft triangle voice (toddler-friendly). */
export async function playSong(song: Song): Promise<void> {
  const ctx = getCtx()
  if (ctx.state === 'suspended') {
    await ctx.resume()
  }

  stopSong()

  const beatSec = 60 / song.tempo
  let t = ctx.currentTime + 0.05
  const master = ctx.createGain()
  master.gain.value = 0.18
  master.connect(ctx.destination)

  for (const note of song.notes) {
    const dur = note.beats * beatSec
    if (note.freq !== null) {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'triangle'
      osc.frequency.value = note.freq
      gain.gain.setValueAtTime(0.0001, t)
      gain.gain.exponentialRampToValueAtTime(0.9, t + 0.03)
      gain.gain.exponentialRampToValueAtTime(0.0001, t + dur * 0.92)
      osc.connect(gain)
      gain.connect(master)
      osc.start(t)
      osc.stop(t + dur)
      activeNodes.push(osc)
    }
    t += dur
  }
}

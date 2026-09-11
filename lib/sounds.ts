'use client'

let audioCtx: AudioContext | null = null
let isMuted = true // Default muted

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
  }
  return audioCtx
}

export function setMuted(muted: boolean) {
  isMuted = muted
  if (typeof window !== 'undefined') {
    localStorage.setItem('portfolio-sounds-muted', muted ? '1' : '0')
  }
}

export function getMuted(): boolean {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('portfolio-sounds-muted')
    if (stored !== null) {
      isMuted = stored === '1'
    }
  }
  return isMuted
}

export function playClickSound() {
  if (isMuted) return
  const ctx = getAudioContext()
  if (!ctx) return

  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.connect(gain)
  gain.connect(ctx.destination)

  osc.type = 'sine'
  osc.frequency.setValueAtTime(800, ctx.currentTime)
  osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.08)

  gain.gain.setValueAtTime(0.08, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1)

  osc.start(ctx.currentTime)
  osc.stop(ctx.currentTime + 0.1)
}

export function playSwooshSound() {
  if (isMuted) return
  const ctx = getAudioContext()
  if (!ctx) return

  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.connect(gain)
  gain.connect(ctx.destination)

  osc.type = 'sine'
  osc.frequency.setValueAtTime(300, ctx.currentTime)
  osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.15)

  gain.gain.setValueAtTime(0.05, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2)

  osc.start(ctx.currentTime)
  osc.stop(ctx.currentTime + 0.2)
}

export function playPopSound() {
  if (isMuted) return
  const ctx = getAudioContext()
  if (!ctx) return

  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.connect(gain)
  gain.connect(ctx.destination)

  osc.type = 'sine'
  osc.frequency.setValueAtTime(1200, ctx.currentTime)
  osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.12)

  gain.gain.setValueAtTime(0.1, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15)

  osc.start(ctx.currentTime)
  osc.stop(ctx.currentTime + 0.15)
}

export function playToggleSound() {
  if (isMuted) return
  const ctx = getAudioContext()
  if (!ctx) return

  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.connect(gain)
  gain.connect(ctx.destination)

  osc.type = 'triangle'
  osc.frequency.setValueAtTime(500, ctx.currentTime)
  osc.frequency.setValueAtTime(700, ctx.currentTime + 0.05)

  gain.gain.setValueAtTime(0.06, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12)

  osc.start(ctx.currentTime)
  osc.stop(ctx.currentTime + 0.12)
}

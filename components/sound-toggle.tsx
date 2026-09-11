'use client'

import React, { useState, useEffect } from 'react'
import { Volume2, VolumeX } from 'lucide-react'
import { getMuted, setMuted, playClickSound } from '@/lib/sounds'

export function SoundToggle() {
  const [muted, setMutedState] = useState(true)

  useEffect(() => {
    setMutedState(getMuted())
  }, [])

  const toggle = () => {
    const newMuted = !muted
    setMutedState(newMuted)
    setMuted(newMuted)
    if (!newMuted) {
      // Play a click to confirm sound is on
      setTimeout(() => playClickSound(), 50)
    }
  }

  return (
    <button
      onClick={toggle}
      className="relative p-2 rounded-lg bg-white/5 border border-white/10 text-white/50 hover:text-white hover:border-white/20 transition-all duration-200 group"
      title={muted ? 'Enable UI sounds' : 'Mute UI sounds'}
      aria-label={muted ? 'Enable UI sounds' : 'Mute UI sounds'}
    >
      {muted ? (
        <VolumeX className="w-3.5 h-3.5" />
      ) : (
        <>
          <Volume2 className="w-3.5 h-3.5 text-[#a3e635]" />
          {/* Animated sound waves */}
          <span className="absolute -right-0.5 top-1/2 -translate-y-1/2 flex gap-0.5">
            <span className="w-0.5 h-1.5 bg-[#a3e635] rounded-full animate-[pulse_0.8s_infinite]" />
            <span className="w-0.5 h-2 bg-[#a3e635]/60 rounded-full animate-[pulse_0.8s_infinite_200ms]" />
          </span>
        </>
      )}
    </button>
  )
}

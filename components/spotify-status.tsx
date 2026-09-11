'use client'

import React, { useState } from 'react'
import { Music, ExternalLink } from 'lucide-react'

export function SpotifyStatus() {
  const [isPlaying] = useState(true)

  return (
    <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-[#101015]/80 border border-white/10 backdrop-blur-md text-xs group hover:border-[#1DB954]/40 transition-all">
      {/* Spotify Icon */}
      <div className="w-5 h-5 rounded-full bg-[#1DB954]/15 border border-[#1DB954]/30 flex items-center justify-center text-[#1DB954] shrink-0">
        <Music className="w-3 h-3" />
      </div>

      {/* Song details */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-white/40 font-mono hidden sm:inline">Listening:</span>
        <span className="text-white/90 font-medium text-[11px] truncate max-w-[150px] sm:max-w-[200px]">
          synthwave focus • lofi coding
        </span>
      </div>

      {/* Audio Equalizer Waves */}
      <div className="flex items-end gap-0.5 h-3 shrink-0 px-1">
        <span className="w-0.5 bg-[#1DB954] rounded-full animate-[bounce_0.8s_infinite_100ms] h-full" />
        <span className="w-0.5 bg-[#1DB954] rounded-full animate-[bounce_1.2s_infinite_300ms] h-2/3" />
        <span className="w-0.5 bg-[#1DB954] rounded-full animate-[bounce_0.6s_infinite_200ms] h-4/5" />
        <span className="w-0.5 bg-[#1DB954] rounded-full animate-[bounce_1s_infinite_400ms] h-1/2" />
      </div>
    </div>
  )
}

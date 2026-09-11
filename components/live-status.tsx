'use client'

import React, { useState, useEffect } from 'react'
import { Clock, MapPin, Sparkles } from 'lucide-react'

export function LiveStatus() {
  const [timeStr, setTimeStr] = useState<string>('')

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Dhaka',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      })
      setTimeStr(formatter.format(now))
    }

    updateTime()
    const timer = setInterval(updateTime, 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="inline-flex flex-wrap items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#121218]/80 border border-white/10 backdrop-blur-md text-xs">
      {/* Availability pulse */}
      <div className="flex items-center gap-1.5">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#a3e635] opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#a3e635]" />
        </span>
        <span className="text-white/90 font-medium text-[11px]">Available for Projects</span>
      </div>

      <span className="text-white/20">•</span>

      {/* Dhaka Location & Clock */}
      <div className="flex items-center gap-1.5 text-white/50 text-[11px] font-mono">
        <MapPin className="w-3 h-3 text-white/40" />
        <span>Dhaka</span>
        <span className="text-white/20">|</span>
        <Clock className="w-3 h-3 text-[#a3e635]/70" />
        <span className="text-[#a3e635] font-semibold">{timeStr || 'Loading...'}</span>
        <span className="text-white/30 text-[10px]">(GMT+6)</span>
      </div>
    </div>
  )
}

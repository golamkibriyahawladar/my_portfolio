'use client'

import React from 'react'

interface DeviceFrameProps {
  src: string
  alt?: string
  device?: 'macbook' | 'iphone'
  className?: string
}

export function DeviceFrame({ src, alt = 'Screenshot', device = 'macbook', className = '' }: DeviceFrameProps) {
  if (device === 'iphone') {
    return (
      <div className={`relative mx-auto ${className}`} style={{ maxWidth: 240 }}>
        {/* iPhone Frame */}
        <div className="relative rounded-[32px] border-[6px] border-[#1a1a1a] bg-[#0a0a0a] overflow-hidden shadow-2xl">
          {/* Notch / Dynamic Island */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-5 bg-[#1a1a1a] rounded-b-2xl z-10" />
          {/* Screen */}
          <div className="relative overflow-hidden group" style={{ aspectRatio: '9/19.5' }}>
            <img
              src={src}
              alt={alt}
              className="w-full h-full object-cover object-top transition-transform duration-[3s] ease-in-out group-hover:object-bottom"
              loading="lazy"
            />
          </div>
          {/* Home indicator */}
          <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1/3 h-1 bg-white/30 rounded-full" />
        </div>
      </div>
    )
  }

  // Macbook
  return (
    <div className={`relative mx-auto ${className}`}>
      {/* MacBook Frame */}
      <div className="relative rounded-t-xl border-[6px] border-[#1a1a1a] bg-[#0a0a0a] overflow-hidden shadow-2xl">
        {/* Webcam dot */}
        <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#2a2a2a] z-10" />
        {/* Screen */}
        <div className="relative overflow-hidden group" style={{ aspectRatio: '16/10' }}>
          <img
            src={src}
            alt={alt}
            className="w-full h-full object-cover object-top transition-transform duration-[3s] ease-in-out group-hover:translate-y-[-20%]"
            loading="lazy"
          />
        </div>
      </div>
      {/* MacBook Base */}
      <div className="relative">
        <div className="h-3 bg-[#1a1a1a] rounded-b-sm mx-auto" style={{ width: '102%', marginLeft: '-1%' }}>
          <div className="absolute left-1/2 -translate-x-1/2 top-0 w-16 h-1 bg-[#2a2a2a] rounded-b-md" />
        </div>
        <div className="h-1 bg-[#111] rounded-b-lg mx-auto" style={{ width: '110%', marginLeft: '-5%' }} />
      </div>
    </div>
  )
}

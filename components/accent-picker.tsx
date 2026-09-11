'use client'

import React, { useState, useEffect } from 'react'
import { Palette, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const ACCENTS = [
  { name: 'Neon Lime', color: '#a3e635', glow: '163, 230, 53' },
  { name: 'Cyber Cyan', color: '#06b6d4', glow: '6, 182, 212' },
  { name: 'Electric Purple', color: '#a855f7', glow: '168, 85, 247' },
  { name: 'Sunset Amber', color: '#f59e0b', glow: '245, 158, 11' },
] as const

export function AccentPicker() {
  const [open, setOpen] = useState(false)
  const [activeIdx, setActiveIdx] = useState(0)

  useEffect(() => {
    const saved = localStorage.getItem('portfolio-accent')
    if (saved) {
      const idx = ACCENTS.findIndex((a) => a.color === saved)
      if (idx >= 0) {
        setActiveIdx(idx)
        applyAccent(idx)
      }
    }
  }, [])

  const applyAccent = (idx: number) => {
    const accent = ACCENTS[idx]
    document.documentElement.style.setProperty('--accent', accent.color)
    document.documentElement.style.setProperty('--accent-glow', accent.glow)
    localStorage.setItem('portfolio-accent', accent.color)
  }

  const selectAccent = (idx: number) => {
    setActiveIdx(idx)
    applyAccent(idx)
    setOpen(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="p-2 rounded-lg bg-white/5 border border-white/10 text-white/50 hover:text-white hover:border-white/20 transition-all duration-200"
        title="Change accent color"
        aria-label="Change accent color"
      >
        <Palette className="w-3.5 h-3.5" style={{ color: ACCENTS[activeIdx].color }} />
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* Click-away overlay */}
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -5 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -5 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-2 z-50 w-48 rounded-xl bg-[#0e0e14] border border-white/15 shadow-2xl overflow-hidden"
            >
              <div className="p-2.5 border-b border-white/5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-white/40">Accent Color</span>
              </div>
              <div className="p-1.5 space-y-0.5">
                {ACCENTS.map((accent, idx) => (
                  <button
                    key={accent.name}
                    onClick={() => selectAccent(idx)}
                    className="w-full flex items-center gap-3 p-2 rounded-lg text-xs transition-colors hover:bg-white/5 group"
                  >
                    <span
                      className="w-4 h-4 rounded-full border-2 shrink-0 transition-shadow"
                      style={{
                        backgroundColor: accent.color,
                        borderColor: activeIdx === idx ? accent.color : 'rgba(255,255,255,0.15)',
                        boxShadow: activeIdx === idx ? `0 0 8px ${accent.color}40` : 'none',
                      }}
                    />
                    <span className={`font-medium ${activeIdx === idx ? 'text-white' : 'text-white/60'}`}>
                      {accent.name}
                    </span>
                    {activeIdx === idx && <Check className="w-3 h-3 ml-auto" style={{ color: accent.color }} />}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

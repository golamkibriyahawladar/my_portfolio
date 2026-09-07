'use client'

import { useEffect, useState } from 'react'

export function ReadingProgressBar() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight
      if (totalHeight <= 0) return
      const currentScroll = window.scrollY
      const currentProgress = (currentScroll / totalHeight) * 100
      setProgress(Math.min(100, Math.max(0, currentProgress)))
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="fixed top-0 left-0 right-0 h-1 bg-white/5 z-50 pointer-events-none">
      <div
        className="h-full bg-gradient-to-r from-[#a3e635] to-[#bef264] transition-all duration-75 ease-out shadow-[0_0_12px_rgba(163,230,53,0.6)]"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}

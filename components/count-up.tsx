'use client'

import React, { useEffect, useRef, useState } from 'react'

interface CountUpProps {
  value: string
  className?: string
}

export function CountUp({ value, className = '' }: CountUpProps) {
  const [display, setDisplay] = useState('0')
  const ref = useRef<HTMLSpanElement>(null)
  const animatedRef = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // Parse numeric part and suffix (e.g. "40+" -> number 40, suffix "+")
    const match = value.match(/^(\d+)(.*)$/)
    if (!match) {
      setDisplay(value)
      return
    }

    const targetNumber = parseInt(match[1], 10)
    const suffix = match[2] || ''

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !animatedRef.current) {
          animatedRef.current = true

          const duration = 1200 // ms
          const startTime = performance.now()

          const update = (now: number) => {
            const elapsed = now - startTime
            const progress = Math.min(elapsed / duration, 1)
            // Ease out cubic
            const easeProgress = 1 - Math.pow(1 - progress, 3)
            const current = Math.floor(easeProgress * targetNumber)
            setDisplay(`${current}${suffix}`)

            if (progress < 1) {
              requestAnimationFrame(update)
            } else {
              setDisplay(`${targetNumber}${suffix}`)
            }
          }

          requestAnimationFrame(update)
        }
      },
      { threshold: 0.2 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [value])

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  )
}

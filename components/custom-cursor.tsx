'use client'

import React, { useEffect, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

export function CustomCursor() {
  const [isVisible, setIsVisible] = useState(false)
  const [cursorText, setCursorText] = useState('')
  const [cursorVariant, setCursorVariant] = useState<'default' | 'action' | 'pointer' | 'hidden'>('default')

  const mouseX = useMotionValue(-100)
  const mouseY = useMotionValue(-100)

  // Spring physics for smooth trailing cursor
  const springConfig = { damping: 28, stiffness: 350, mass: 0.5 }
  const cursorX = useSpring(mouseX, springConfig)
  const cursorY = useSpring(mouseY, springConfig)

  useEffect(() => {
    // Only enable on desktop pointer devices
    if (window.matchMedia('(pointer: coarse)').matches) {
      return
    }

    const moveMouse = (e: MouseEvent) => {
      mouseX.set(e.clientX)
      mouseY.set(e.clientY)
      if (!isVisible) setIsVisible(true)
    }

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null
      if (!target) return

      // Form inputs: hide custom cursor for comfortable typing
      if (target.closest('input, textarea, select, [contenteditable="true"]')) {
        setCursorVariant('hidden')
        setCursorText('')
        return
      }

      // Check for explicit data-cursor attribute
      const cursorTarget = target.closest('[data-cursor]') as HTMLElement | null
      if (cursorTarget) {
        const type = cursorTarget.getAttribute('data-cursor')
        if (type === 'view') {
          setCursorVariant('action')
          setCursorText('View')
          return
        } else if (type === 'read') {
          setCursorVariant('action')
          setCursorText('Read')
          return
        } else if (type === 'send') {
          setCursorVariant('action')
          setCursorText('Send')
          return
        } else if (type === 'external') {
          setCursorVariant('action')
          setCursorText('Open ↗')
          return
        }
      }

      // Standard links and buttons
      if (target.closest('a, button, [role="button"]')) {
        setCursorVariant('pointer')
        setCursorText('')
        return
      }

      setCursorVariant('default')
      setCursorText('')
    }

    const handleMouseLeave = () => {
      setIsVisible(false)
    }

    window.addEventListener('mousemove', moveMouse)
    window.addEventListener('mouseover', handleMouseOver)
    document.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      window.removeEventListener('mousemove', moveMouse)
      window.removeEventListener('mouseover', handleMouseOver)
      document.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [isVisible, mouseX, mouseY])

  if (!isVisible || cursorVariant === 'hidden') {
    return null
  }

  return (
    <motion.div
      className="fixed top-0 left-0 pointer-events-none z-[9999] flex items-center justify-center font-mono font-bold select-none"
      style={{
        x: cursorX,
        y: cursorY,
        translateX: '-50%',
        translateY: '-50%',
      }}
      animate={{
        width: cursorVariant === 'action' ? 68 : cursorVariant === 'pointer' ? 36 : 10,
        height: cursorVariant === 'action' ? 68 : cursorVariant === 'pointer' ? 36 : 10,
        backgroundColor:
          cursorVariant === 'action'
            ? '#a3e635'
            : cursorVariant === 'pointer'
            ? 'rgba(163, 230, 53, 0.25)'
            : '#a3e635',
        border:
          cursorVariant === 'pointer'
            ? '1.5px solid rgba(163, 230, 53, 0.8)'
            : 'none',
        borderRadius: '9999px',
        boxShadow:
          cursorVariant === 'default'
            ? '0 0 14px rgba(163, 230, 53, 0.7)'
            : '0 0 24px rgba(163, 230, 53, 0.3)',
      }}
      transition={{ type: 'spring', damping: 25, stiffness: 350 }}
    >
      {cursorVariant === 'action' && (
        <span className="text-[11px] uppercase tracking-wider text-black font-extrabold animate-in fade-in duration-150">
          {cursorText}
        </span>
      )}
    </motion.div>
  )
}

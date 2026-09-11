'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Volume2, VolumeX, Play, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface SectionVoiceConfig {
  id: string
  label: string
  text: string
}

const DEFAULT_SECTION_SCRIPTS: SectionVoiceConfig[] = [
  {
    id: 'hero',
    label: 'Welcome',
    text: "Welcome to Golam Kibriya Hawladar's portfolio. Senior AI Engineer and Full-Stack Architect.",
  },
  {
    id: 'work',
    label: 'Featured Projects',
    text: 'Explore selected engineering work featuring autonomous AI agents, SaaS apps, and high performance web architectures.',
  },
  {
    id: 'about',
    label: 'About Golam',
    text: 'Golam specializes in Generative Engine Optimization, agentic workflows, and scalable cloud systems.',
  },
  {
    id: 'services',
    label: 'Services & Estimations',
    text: 'Check out specialized engineering services or calculate your project budget with the live estimator tool.',
  },
  {
    id: 'contact',
    label: 'Contact & Booking',
    text: "Ready to build something together? Send a direct message or schedule a discovery call.",
  },
]

export function VoiceGuide() {
  const [enabled, setEnabled] = useState(true)
  const [currentText, setCurrentText] = useState<string | null>(null)
  const [currentSection, setCurrentSection] = useState<string>('hero')
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [showAutoplayPrompt, setShowAutoplayPrompt] = useState(true)

  const spokenSectionsRef = useRef<Set<string>>(new Set())
  const synthRef = useRef<SpeechSynthesis | null>(null)
  const hasStartedRef = useRef(false)

  // Core Speak Function
  const speak = useCallback(
    (text: string, sectionId?: string) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window) || !enabled) return

      window.speechSynthesis.cancel()

      const utterance = new SpeechSynthesisUtterance(text)

      // Retrieve Voice settings configured from Admin Panel (or default)
      const adminConfigRaw = localStorage.getItem('portfolio-admin-voice')
      const adminConfig = adminConfigRaw ? JSON.parse(adminConfigRaw) : null

      utterance.rate = adminConfig?.rate || 0.92
      utterance.pitch = adminConfig?.pitch || 1.02
      utterance.volume = 1.0

      const avail = window.speechSynthesis.getVoices()
      const preferredVoiceName = adminConfig?.voiceName

      const chosenVoice =
        (preferredVoiceName && avail.find((v) => v.name === preferredVoiceName)) ||
        avail.find(
          (v) =>
            v.lang.startsWith('en') &&
            (v.name.includes('Natural') ||
              v.name.includes('Google') ||
              v.name.includes('Samantha') ||
              v.name.includes('Jenny') ||
              v.name.includes('Aria') ||
              v.name.includes('Daniel'))
        ) ||
        avail.find((v) => v.lang.startsWith('en'))

      if (chosenVoice) {
        utterance.voice = chosenVoice
      }

      utterance.onstart = () => {
        setIsSpeaking(true)
        setCurrentText(text)
        setShowAutoplayPrompt(false)
        if (sectionId) {
          spokenSectionsRef.current.add(sectionId)
        }
      }

      utterance.onend = () => {
        setIsSpeaking(false)
        setTimeout(() => setCurrentText(null), 3000)
      }

      utterance.onerror = () => {
        setIsSpeaking(false)
        setCurrentText(null)
      }

      window.speechSynthesis.speak(utterance)
    },
    [enabled]
  )

  // Setup Initial Autoplay Listener & Client Mount
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return

    synthRef.current = window.speechSynthesis
    const savedState = localStorage.getItem('portfolio-voice-guide')
    if (savedState === 'false') {
      setEnabled(false)
      setShowAutoplayPrompt(false)
    }

    const triggerSpeech = () => {
      if (hasStartedRef.current) return
      hasStartedRef.current = true

      const saved = localStorage.getItem('portfolio-voice-guide')
      if (saved !== 'false' && !spokenSectionsRef.current.has('hero')) {
        speak(DEFAULT_SECTION_SCRIPTS[0].text, 'hero')
      }
    }

    // Try playing immediately if browser permits
    triggerSpeech()

    // Bypasses browser autoplay restrictions: triggers on ANY user gesture (mouse move, touch, scroll, click)
    const handleGesture = () => {
      triggerSpeech()
      window.removeEventListener('pointerdown', handleGesture)
      window.removeEventListener('mousemove', handleGesture)
      window.removeEventListener('scroll', handleGesture)
      window.removeEventListener('keydown', handleGesture)
      window.removeEventListener('touchstart', handleGesture)
    }

    window.addEventListener('pointerdown', handleGesture, { once: true })
    window.addEventListener('mousemove', handleGesture, { once: true })
    window.addEventListener('scroll', handleGesture, { once: true })
    window.addEventListener('keydown', handleGesture, { once: true })
    window.addEventListener('touchstart', handleGesture, { once: true })

    return () => {
      window.removeEventListener('pointerdown', handleGesture)
      window.removeEventListener('mousemove', handleGesture)
      window.removeEventListener('scroll', handleGesture)
      window.removeEventListener('keydown', handleGesture)
      window.removeEventListener('touchstart', handleGesture)
    }
  }, [speak])

  // Section Intersection Observer
  useEffect(() => {
    if (!enabled) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const sectionId = entry.target.id
            if (sectionId && !spokenSectionsRef.current.has(sectionId)) {
              setCurrentSection(sectionId)
              const script = DEFAULT_SECTION_SCRIPTS.find((s) => s.id === sectionId)
              if (script) {
                speak(script.text, sectionId)
              }
            }
          }
        })
      },
      { threshold: 0.35 }
    )

    DEFAULT_SECTION_SCRIPTS.forEach((s) => {
      const el = document.getElementById(s.id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [enabled, speak])

  const toggleVoiceGuide = () => {
    const nextState = !enabled
    setEnabled(nextState)
    localStorage.setItem('portfolio-voice-guide', String(nextState))
    setShowAutoplayPrompt(false)

    if (nextState) {
      const script = DEFAULT_SECTION_SCRIPTS.find((s) => s.id === currentSection) || DEFAULT_SECTION_SCRIPTS[0]
      speak(script.text, script.id)
    } else {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel()
      }
      setIsSpeaking(false)
      setCurrentText(null)
    }
  }

  const replayCurrent = () => {
    setShowAutoplayPrompt(false)
    const script = DEFAULT_SECTION_SCRIPTS.find((s) => s.id === currentSection) || DEFAULT_SECTION_SCRIPTS[0]
    speak(script.text, script.id)
  }

  return (
    <>
      {/* Floating Prompt on Cold Load */}
      <AnimatePresence>
        {enabled && showAutoplayPrompt && !isSpeaking && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            onClick={replayCurrent}
            className="fixed bottom-20 left-6 z-40 cursor-pointer flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-[#0e0e14]/95 border border-[#a3e635]/40 text-[#a3e635] text-xs font-mono shadow-2xl backdrop-blur-xl hover:bg-[#a3e635]/10 transition-all"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#a3e635] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#a3e635]" />
            </span>
            <span>Tap anywhere to start AI Audio Guide 🔊</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Controller Widget */}
      <div className="fixed bottom-6 left-6 z-40 flex items-center gap-2">
        <button
          onClick={toggleVoiceGuide}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-full border text-xs font-mono transition-all duration-300 shadow-xl backdrop-blur-md ${
            enabled
              ? 'bg-[#a3e635]/15 border-[#a3e635]/40 text-[#a3e635] shadow-[#a3e635]/10'
              : 'bg-[#121218]/90 border-white/10 text-white/60 hover:text-white hover:border-white/20'
          }`}
          title={enabled ? 'Mute AI Voice Guide' : 'Enable AI Voice Guide'}
        >
          {enabled ? (
            <>
              <Volume2 className="w-3.5 h-3.5 text-[#a3e635]" />
              <span className="font-semibold">Voice Guide ON</span>
              {isSpeaking && (
                <span className="flex items-end gap-0.5 h-3 px-1">
                  <span className="w-0.5 bg-[#a3e635] rounded-full animate-[bounce_0.8s_infinite] h-full" />
                  <span className="w-0.5 bg-[#a3e635] rounded-full animate-[bounce_1.1s_infinite_200ms] h-2/3" />
                  <span className="w-0.5 bg-[#a3e635] rounded-full animate-[bounce_0.7s_infinite_400ms] h-4/5" />
                </span>
              )}
            </>
          ) : (
            <>
              <VolumeX className="w-3.5 h-3.5 text-white/40" />
              <span>Voice Guide</span>
            </>
          )}
        </button>

        {enabled && (
          <button
            onClick={replayCurrent}
            className="p-2 rounded-full bg-[#121218]/90 border border-white/10 text-white/60 hover:text-white transition-all text-xs"
            title="Replay section audio"
          >
            <Play className="w-3 h-3 text-[#a3e635]" />
          </button>
        )}
      </div>

      {/* Subtitle HUD Banner */}
      <AnimatePresence>
        {enabled && currentText && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-20 left-6 right-6 md:left-auto md:right-6 md:max-w-md z-40 p-4 rounded-2xl bg-[#0e0e14]/95 border border-[#a3e635]/30 shadow-2xl backdrop-blur-xl"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-[#a3e635]/10 border border-[#a3e635]/20 shrink-0 text-[#a3e635]">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#a3e635]">
                    AI Voice Guide • {currentSection.toUpperCase()}
                  </span>
                  <span className="flex h-1.5 w-1.5 rounded-full bg-[#a3e635] animate-ping" />
                </div>
                <p className="text-xs text-white/90 leading-relaxed font-sans font-medium">{currentText}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

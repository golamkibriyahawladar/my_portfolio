'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Volume2, VolumeX, Mic, Play, Pause, Sparkles, MessageSquare } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface SectionVoiceConfig {
  id: string
  label: string
  text: string
}

const SECTION_SCRIPTS: SectionVoiceConfig[] = [
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
  const [enabled, setEnabled] = useState(false)
  const [currentText, setCurrentText] = useState<string | null>(null)
  const [currentSection, setCurrentSection] = useState<string>('hero')
  const [isSpeaking, setIsSpeaking] = useState(false)
  const spokenSectionsRef = useRef<Set<string>>(new Set())
  const synthRef = useRef<SpeechSynthesis | null>(null)

  // Initialize SpeechSynthesis on client
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis
      const saved = localStorage.getItem('portfolio-voice-guide')
      if (saved === 'true') {
        setEnabled(true)
      }
    }
  }, [])

  const speak = useCallback(
    (text: string, sectionId?: string) => {
      if (!synthRef.current || !enabled) return

      // Cancel previous speech
      synthRef.current.cancel()

      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.95
      utterance.pitch = 1.0
      utterance.volume = 1.0

      // Try selecting an English natural voice if available
      const voices = synthRef.current.getVoices()
      const preferredVoice =
        voices.find((v) => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('Daniel'))) ||
        voices.find((v) => v.lang.startsWith('en'))

      if (preferredVoice) {
        utterance.voice = preferredVoice
      }

      utterance.onstart = () => {
        setIsSpeaking(true)
        setCurrentText(text)
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

      synthRef.current.speak(utterance)
    },
    [enabled]
  )

  const toggleVoiceGuide = () => {
    const nextState = !enabled
    setEnabled(nextState)
    localStorage.setItem('portfolio-voice-guide', String(nextState))

    if (nextState) {
      // Speak current section script immediately
      const script = SECTION_SCRIPTS.find((s) => s.id === currentSection) || SECTION_SCRIPTS[0]
      speak(script.text, script.id)
    } else {
      if (synthRef.current) {
        synthRef.current.cancel()
      }
      setIsSpeaking(false)
      setCurrentText(null)
    }
  }

  // Section Observer
  useEffect(() => {
    if (!enabled) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const sectionId = entry.target.id
            if (sectionId && !spokenSectionsRef.current.has(sectionId)) {
              setCurrentSection(sectionId)
              const script = SECTION_SCRIPTS.find((s) => s.id === sectionId)
              if (script) {
                speak(script.text, sectionId)
              }
            }
          }
        })
      },
      { threshold: 0.35 }
    )

    SECTION_SCRIPTS.forEach((s) => {
      const el = document.getElementById(s.id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [enabled, speak])

  const replayCurrent = () => {
    const script = SECTION_SCRIPTS.find((s) => s.id === currentSection) || SECTION_SCRIPTS[0]
    speak(script.text, script.id)
  }

  return (
    <>
      {/* Floating Toggle Button */}
      <div className="fixed bottom-6 left-6 z-40 flex items-center gap-2">
        <button
          onClick={toggleVoiceGuide}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-full border text-xs font-mono transition-all duration-300 shadow-xl backdrop-blur-md ${
            enabled
              ? 'bg-[#a3e635]/15 border-[#a3e635]/40 text-[#a3e635] shadow-[#a3e635]/10'
              : 'bg-[#121218]/90 border-white/10 text-white/60 hover:text-white hover:border-white/20'
          }`}
          title={enabled ? 'Mute AI Voice Narrator' : 'Enable AI Voice Narrator'}
        >
          {enabled ? (
            <>
              <Volume2 className="w-3.5 h-3.5 text-[#a3e635]" />
              <span className="font-semibold">Voice Narrator ON</span>
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

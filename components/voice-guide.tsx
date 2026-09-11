'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Volume2, VolumeX, Play, Sparkles, Settings2, Check, User } from 'lucide-react'
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
  const [enabled, setEnabled] = useState(true)
  const [currentText, setCurrentText] = useState<string | null>(null)
  const [currentSection, setCurrentSection] = useState<string>('hero')
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [selectedVoiceName, setSelectedVoiceName] = useState<string>('')
  const [showVoiceMenu, setShowVoiceMenu] = useState(false)

  const spokenSectionsRef = useRef<Set<string>>(new Set())
  const synthRef = useRef<SpeechSynthesis | null>(null)
  const hasStartedRef = useRef(false)

  // Populate available English voices
  const populateVoices = useCallback(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return

    const available = window.speechSynthesis.getVoices()
    const englishVoices = available.filter(
      (v) => v.lang.startsWith('en') || v.lang.startsWith('en-US') || v.lang.startsWith('en-GB')
    )

    setVoices(englishVoices.length > 0 ? englishVoices : available)

    const savedVoice = localStorage.getItem('portfolio-voice-name')
    if (savedVoice && available.some((v) => v.name === savedVoice)) {
      setSelectedVoiceName(savedVoice)
    } else {
      // Pick best natural voice automatically
      const best =
        available.find(
          (v) =>
            v.lang.startsWith('en') &&
            (v.name.includes('Natural') ||
              v.name.includes('Google') ||
              v.name.includes('Samantha') ||
              v.name.includes('Jenny') ||
              v.name.includes('Aria') ||
              v.name.includes('Daniel'))
        ) || available.find((v) => v.lang.startsWith('en'))

      if (best) {
        setSelectedVoiceName(best.name)
      }
    }
  }, [])

  // Core Speech Dispatcher
  const speak = useCallback(
    (text: string, sectionId?: string, forceVoiceName?: string) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window) || !enabled) return

      window.speechSynthesis.cancel()

      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.92
      utterance.pitch = 1.02
      utterance.volume = 1.0

      const avail = window.speechSynthesis.getVoices()
      const targetName = forceVoiceName || selectedVoiceName

      const chosenVoice =
        avail.find((v) => v.name === targetName) ||
        avail.find(
          (v) =>
            v.lang.startsWith('en') &&
            (v.name.includes('Natural') ||
              v.name.includes('Google') ||
              v.name.includes('Samantha') ||
              v.name.includes('Jenny'))
        ) ||
        avail.find((v) => v.lang.startsWith('en'))

      if (chosenVoice) {
        utterance.voice = chosenVoice
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

      window.speechSynthesis.speak(utterance)
    },
    [enabled, selectedVoiceName]
  )

  // Initialize Speech & Auto-Play on page enter / gesture
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return

    synthRef.current = window.speechSynthesis
    const savedState = localStorage.getItem('portfolio-voice-guide')
    if (savedState === 'false') {
      setEnabled(false)
    }

    populateVoices()
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = populateVoices
    }

    const startWelcome = () => {
      if (hasStartedRef.current) return
      hasStartedRef.current = true

      const saved = localStorage.getItem('portfolio-voice-guide')
      if (saved !== 'false' && !spokenSectionsRef.current.has('hero')) {
        speak(SECTION_SCRIPTS[0].text, 'hero')
      }
    }

    // Modern browsers allow speech synthesis immediately or upon any gesture
    startWelcome()

    const handleUserGesture = () => {
      startWelcome()
      window.removeEventListener('pointerdown', handleUserGesture)
      window.removeEventListener('scroll', handleUserGesture)
      window.removeEventListener('keydown', handleUserGesture)
    }

    window.addEventListener('pointerdown', handleUserGesture, { once: true })
    window.addEventListener('scroll', handleUserGesture, { once: true })
    window.addEventListener('keydown', handleUserGesture, { once: true })

    return () => {
      window.removeEventListener('pointerdown', handleUserGesture)
      window.removeEventListener('scroll', handleUserGesture)
      window.removeEventListener('keydown', handleUserGesture)
    }
  }, [populateVoices, speak])

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

  const toggleVoiceGuide = () => {
    const nextState = !enabled
    setEnabled(nextState)
    localStorage.setItem('portfolio-voice-guide', String(nextState))

    if (nextState) {
      const script = SECTION_SCRIPTS.find((s) => s.id === currentSection) || SECTION_SCRIPTS[0]
      speak(script.text, script.id)
    } else {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel()
      }
      setIsSpeaking(false)
      setCurrentText(null)
    }
  }

  const changeVoice = (voiceName: string) => {
    setSelectedVoiceName(voiceName)
    localStorage.setItem('portfolio-voice-name', voiceName)
    setShowVoiceMenu(false)

    // Replay sample using newly chosen voice
    const sampleText = `Voice changed to ${voiceName.split(' ')[0]}. Here is a preview of the audio guide.`
    speak(sampleText, undefined, voiceName)
  }

  const replayCurrent = () => {
    const script = SECTION_SCRIPTS.find((s) => s.id === currentSection) || SECTION_SCRIPTS[0]
    speak(script.text, script.id)
  }

  return (
    <>
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
          <>
            <button
              onClick={replayCurrent}
              className="p-2 rounded-full bg-[#121218]/90 border border-white/10 text-white/60 hover:text-white transition-all text-xs"
              title="Replay section audio"
            >
              <Play className="w-3 h-3 text-[#a3e635]" />
            </button>

            {/* Voice Accent & Voice Selector Button */}
            <div className="relative">
              <button
                onClick={() => setShowVoiceMenu(!showVoiceMenu)}
                className="p-2 rounded-full bg-[#121218]/90 border border-white/10 text-white/60 hover:text-white transition-all text-xs"
                title="Choose AI Voice / Accent"
              >
                <Settings2 className="w-3 h-3 text-white/70" />
              </button>

              {/* Voice Choice Dropdown */}
              <AnimatePresence>
                {showVoiceMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowVoiceMenu(false)} />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: 10 }}
                      className="absolute bottom-full left-0 mb-2 z-50 w-72 rounded-2xl bg-[#0e0e14] border border-white/15 shadow-2xl overflow-hidden p-2 backdrop-blur-xl"
                    >
                      <div className="px-3 py-2 border-b border-white/10 flex items-center justify-between">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-white/50">
                          Select AI Voice Accent
                        </span>
                        <User className="w-3 h-3 text-[#a3e635]" />
                      </div>
                      <div className="max-h-56 overflow-y-auto py-1 space-y-1">
                        {voices.length > 0 ? (
                          voices.map((v) => {
                            const isSelected = v.name === selectedVoiceName
                            return (
                              <button
                                key={v.name}
                                onClick={() => changeVoice(v.name)}
                                className={`w-full flex items-center justify-between p-2 rounded-xl text-left text-xs transition-colors ${
                                  isSelected ? 'bg-[#a3e635]/15 text-[#a3e635]' : 'hover:bg-white/5 text-white/70'
                                }`}
                              >
                                <div className="truncate pr-2">
                                  <p className="font-medium text-[11px] truncate">{v.name}</p>
                                  <p className="text-[9px] text-white/40 font-mono">{v.lang}</p>
                                </div>
                                {isSelected && <Check className="w-3.5 h-3.5 text-[#a3e635] shrink-0" />}
                              </button>
                            )
                          })
                        ) : (
                          <p className="p-3 text-xs text-white/40 text-center">Loading browser voices...</p>
                        )}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </>
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

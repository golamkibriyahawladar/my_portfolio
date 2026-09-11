'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calculator, ChevronRight, Send, DollarSign, Clock, Zap, X, Check, Sparkles } from 'lucide-react'
import { toast } from 'sonner'

const PROJECT_TYPES = [
  { id: 'saas', label: 'SaaS Web App', base: 800, time: 4 },
  { id: 'ecom', label: 'E-Commerce Store', base: 600, time: 3 },
  { id: 'portfolio', label: 'Portfolio / Landing', base: 300, time: 2 },
  { id: 'automation', label: 'Custom Automation', base: 500, time: 3 },
]

const FEATURES = [
  { id: 'auth', label: 'Database & Auth', price: 200 },
  { id: 'ai', label: 'AI Integration', price: 350 },
  { id: 'payments', label: 'Payment Gateway', price: 250 },
  { id: 'cms', label: 'Admin CMS', price: 300 },
  { id: 'api', label: 'REST / GraphQL API', price: 200 },
  { id: 'analytics', label: 'Analytics Dashboard', price: 180 },
]

const TIMELINES = [
  { id: 'rush', label: 'Rush (1-2 weeks)', multiplier: 1.5, icon: Zap },
  { id: 'standard', label: 'Standard (3-4 weeks)', multiplier: 1.0, icon: Clock },
  { id: 'flexible', label: 'Flexible', multiplier: 0.85, icon: Clock },
]

export function ProjectEstimator() {
  const [isOpen, setIsOpen] = useState(false)
  const [step, setStep] = useState(0)
  const [projectType, setProjectType] = useState('')
  const [features, setFeatures] = useState<string[]>([])
  const [timeline, setTimeline] = useState('')

  const toggleFeature = (id: string) => {
    setFeatures((prev) => (prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]))
  }

  const getEstimate = () => {
    const type = PROJECT_TYPES.find((t) => t.id === projectType)
    const tl = TIMELINES.find((t) => t.id === timeline)
    if (!type || !tl) return { min: 0, max: 0, weeks: 0 }

    const featuresCost = features.reduce((sum, fId) => {
      const f = FEATURES.find((feat) => feat.id === fId)
      return sum + (f?.price || 0)
    }, 0)

    const base = (type.base + featuresCost) * tl.multiplier
    return {
      min: Math.round(base * 0.9),
      max: Math.round(base * 1.3),
      weeks: Math.round(type.time * tl.multiplier),
    }
  }

  const handleSubmitProposal = () => {
    const estimate = getEstimate()
    const type = PROJECT_TYPES.find((t) => t.id === projectType)
    const tl = TIMELINES.find((t) => t.id === timeline)
    const selectedFeatures = features.map((f) => FEATURES.find((feat) => feat.id === f)?.label).join(', ')

    toast.success('Proposal scope captured! Redirecting to contact form...')
    setIsOpen(false)

    // Scroll to contact section
    setTimeout(() => {
      const contactEl = document.getElementById('contact')
      contactEl?.scrollIntoView({ behavior: 'smooth' })
    }, 500)
  }

  const reset = () => {
    setStep(0)
    setProjectType('')
    setFeatures([])
    setTimeline('')
  }

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="group flex items-center gap-2 px-4 py-2 rounded-full bg-[#a3e635]/10 border border-[#a3e635]/30 text-[#a3e635] text-sm font-semibold hover:bg-[#a3e635]/20 hover:border-[#a3e635]/50 transition-all duration-300"
      >
        <Calculator className="w-4 h-4" />
        <span>Estimate Your Project</span>
        <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
      </button>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative z-10 w-full max-w-lg bg-[#0e0e14] border border-white/15 rounded-2xl shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#a3e635]/15 border border-[#a3e635]/30 flex items-center justify-center">
                    <DollarSign className="w-4 h-4 text-[#a3e635]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Project Estimator</h3>
                    <p className="text-[10px] text-white/40 font-mono">Step {step + 1} of 3</p>
                  </div>
                </div>
                <button onClick={() => setIsOpen(false)} className="p-1.5 rounded-lg hover:bg-white/5 text-white/40 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Progress */}
              <div className="h-0.5 bg-white/5">
                <motion.div
                  className="h-full bg-[#a3e635]"
                  animate={{ width: `${((step + 1) / 3) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>

              {/* Content */}
              <div className="p-5 min-h-[280px]">
                <AnimatePresence mode="wait">
                  {/* Step 1: Project Type */}
                  {step === 0 && (
                    <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                      <p className="text-xs text-white/50 mb-4 font-mono uppercase tracking-wider">What are you building?</p>
                      <div className="grid grid-cols-2 gap-2">
                        {PROJECT_TYPES.map((type) => (
                          <button
                            key={type.id}
                            onClick={() => { setProjectType(type.id); setStep(1) }}
                            className={`p-3.5 rounded-xl border text-left transition-all text-xs ${
                              projectType === type.id
                                ? 'border-[#a3e635]/50 bg-[#a3e635]/10 text-white'
                                : 'border-white/10 bg-white/[0.02] text-white/70 hover:border-white/20 hover:bg-white/5'
                            }`}
                          >
                            <span className="font-semibold block">{type.label}</span>
                            <span className="text-[10px] text-white/40 font-mono mt-1 block">~{type.time} weeks</span>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Step 2: Features */}
                  {step === 1 && (
                    <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                      <p className="text-xs text-white/50 mb-4 font-mono uppercase tracking-wider">Select core capabilities</p>
                      <div className="grid grid-cols-2 gap-2">
                        {FEATURES.map((feat) => (
                          <button
                            key={feat.id}
                            onClick={() => toggleFeature(feat.id)}
                            className={`p-3 rounded-xl border text-left transition-all text-xs flex items-center gap-2 ${
                              features.includes(feat.id)
                                ? 'border-[#a3e635]/50 bg-[#a3e635]/10 text-white'
                                : 'border-white/10 bg-white/[0.02] text-white/70 hover:border-white/20 hover:bg-white/5'
                            }`}
                          >
                            <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                              features.includes(feat.id) ? 'bg-[#a3e635] border-[#a3e635]' : 'border-white/20'
                            }`}>
                              {features.includes(feat.id) && <Check className="w-3 h-3 text-black" />}
                            </div>
                            <span className="font-medium">{feat.label}</span>
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={() => setStep(2)}
                        className="mt-4 w-full py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-white hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                      >
                        Continue <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </motion.div>
                  )}

                  {/* Step 3: Timeline & Result */}
                  {step === 2 && (
                    <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                      <p className="text-xs text-white/50 mb-4 font-mono uppercase tracking-wider">Choose timeline</p>
                      <div className="space-y-2 mb-5">
                        {TIMELINES.map((tl) => {
                          const Icon = tl.icon
                          return (
                            <button
                              key={tl.id}
                              onClick={() => setTimeline(tl.id)}
                              className={`w-full p-3 rounded-xl border text-left transition-all text-xs flex items-center gap-3 ${
                                timeline === tl.id
                                  ? 'border-[#a3e635]/50 bg-[#a3e635]/10 text-white'
                                  : 'border-white/10 bg-white/[0.02] text-white/70 hover:border-white/20 hover:bg-white/5'
                              }`}
                            >
                              <Icon className="w-4 h-4 shrink-0" />
                              <span className="font-medium">{tl.label}</span>
                              {tl.multiplier !== 1.0 && (
                                <span className="ml-auto text-[10px] text-white/40 font-mono">
                                  {tl.multiplier > 1 ? '+50%' : '-15%'}
                                </span>
                              )}
                            </button>
                          )
                        })}
                      </div>

                      {/* Result */}
                      {timeline && (() => {
                        const est = getEstimate()
                        return (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-4 rounded-xl bg-[#a3e635]/5 border border-[#a3e635]/20"
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <Sparkles className="w-4 h-4 text-[#a3e635]" />
                              <span className="text-xs font-bold text-white">Estimated Range</span>
                            </div>
                            <div className="flex items-baseline gap-1">
                              <span className="text-2xl font-black text-[#a3e635]">${est.min}</span>
                              <span className="text-white/40">—</span>
                              <span className="text-2xl font-black text-[#a3e635]">${est.max}</span>
                            </div>
                            <p className="text-[10px] text-white/40 mt-1 font-mono">~{est.weeks} weeks delivery</p>

                            <button
                              onClick={handleSubmitProposal}
                              className="mt-3 w-full py-2.5 rounded-xl bg-[#a3e635] text-black text-xs font-bold hover:bg-[#b5f03d] transition-colors flex items-center justify-center gap-2"
                            >
                              <Send className="w-3.5 h-3.5" />
                              Send this scope to Golam
                            </button>
                          </motion.div>
                        )
                      })()}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Footer */}
              <div className="p-3 border-t border-white/5 flex items-center justify-between text-[10px] text-white/30 font-mono">
                {step > 0 ? (
                  <button onClick={() => setStep(step - 1)} className="hover:text-white/60 transition-colors">
                    ← Back
                  </button>
                ) : (
                  <span />
                )}
                <button onClick={reset} className="hover:text-white/60 transition-colors">Reset</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}

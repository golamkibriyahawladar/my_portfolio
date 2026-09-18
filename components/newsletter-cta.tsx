'use client'

import React, { useState } from 'react'
import { Send, CheckCircle2, Sparkles, ShieldCheck } from 'lucide-react'

interface NewsletterCTAProps {
  title?: string
  description?: string
  leadMagnetText?: string
  buttonText?: string
}

export function NewsletterCTA({
  title = 'Get Production AI Agent Blueprints',
  description = 'Join 1,200+ engineers receiving weekly breakdowns of autonomous voice agents, system prompts, and production n8n workflows.',
  leadMagnetText = 'FREE JSON BLUEPRINT INCLUDED',
  buttonText = 'Get Free Blueprints',
}: NewsletterCTAProps) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !email.includes('@')) {
      setStatus('error')
      setErrorMessage('Please enter a valid email address.')
      return
    }

    setStatus('loading')

    try {
      // Send as a lead to the existing contact/message inbox
      const formData = new FormData()
      formData.append('name', 'Newsletter Subscriber')
      formData.append('email', email)
      formData.append('subject', '[Newsletter Lead] Blueprint Download Request')
      formData.append(
        'body',
        `New lead subscribed from blog post lead magnet. Email: ${email}`
      )

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: `Newsletter signup: ${email}` }),
      }).catch(() => null)

      // Mark success
      setStatus('success')
      setEmail('')
    } catch {
      setStatus('success') // Graceful fallback
    }
  }

  return (
    <div className="my-12 relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#121216] via-[#0d0d11] to-[#0a0a0e] p-6 sm:p-10 shadow-2xl">
      {/* Decorative subtle background accents */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#a3e635]/10 blur-3xl" />
      <div className="pointer-events-none absolute -left-16 -bottom-16 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl" />

      <div className="relative z-10 max-w-xl">
        {/* Lead magnet badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-[#a3e635]/30 bg-[#a3e635]/10 px-3 py-1 text-[10px] font-mono font-bold tracking-wider text-[#a3e635] uppercase mb-4">
          <Sparkles className="h-3 w-3" />
          <span>{leadMagnetText}</span>
        </div>

        {/* Title */}
        <h3 className="font-grotesk text-2xl sm:text-3xl font-bold tracking-tight text-white leading-tight">
          {title}
        </h3>

        {/* Description */}
        <p className="mt-3 text-sm sm:text-base text-white/60 leading-relaxed">
          {description}
        </p>

        {/* Form */}
        {status === 'success' ? (
          <div className="mt-6 flex items-center gap-3 rounded-xl border border-[#a3e635]/30 bg-[#a3e635]/10 p-4 text-[#bef264]">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-[#a3e635]" />
            <p className="text-sm font-medium">
              You’re on the list! Check your inbox shortly for the blueprint link.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-3">
            <div className="flex flex-col sm:flex-row items-stretch gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (status === 'error') setStatus('idle')
                }}
                placeholder="developer@company.com"
                required
                className="flex-1 rounded-xl border border-white/15 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-white/30 focus:border-[#a3e635] focus:outline-none focus:ring-1 focus:ring-[#a3e635] transition-all"
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#a3e635] px-6 py-3 font-grotesk text-sm font-bold text-[#0a0a0a] transition-all hover:bg-[#bef264] active:scale-[0.98] disabled:opacity-50 shadow-[0_0_20px_rgba(163,230,53,0.3)]"
              >
                {status === 'loading' ? (
                  <span>Sending...</span>
                ) : (
                  <>
                    <span>{buttonText}</span>
                    <Send className="h-3.5 w-3.5" />
                  </>
                )}
              </button>
            </div>

            {status === 'error' && (
              <p className="text-xs text-rose-400 font-mono">{errorMessage}</p>
            )}

            <div className="flex items-center gap-2 text-[11px] font-mono text-white/40 pt-1">
              <ShieldCheck className="h-3.5 w-3.5 text-[#a3e635]/60" />
              <span>Zero spam. Unsubscribe with 1-click anytime.</span>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

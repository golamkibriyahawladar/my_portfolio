'use client'

import { useActionState } from 'react'
import { sendMessage, type ContactState } from '@/app/actions/contact'
import { MagneticButton } from '@/components/magnetic-button'

const inputClass =
  'w-full border-b border-white/20 bg-transparent py-3 text-white placeholder:text-white/30 focus:border-lime-300 focus:outline-none transition-colors duration-200'

export function ContactForm() {
  const [state, action, pending] = useActionState<ContactState, FormData>(sendMessage, { status: 'idle' })

  if (state.status === 'success') {
    return (
      <div className="rounded-xl border border-lime-300/40 bg-lime-300/10 p-8 animate-in fade-in zoom-in-95 duration-200" role="status">
        <p className="font-grotesk text-2xl text-white">Message received.</p>
        <p className="mt-2 text-white/60">Thanks for reaching out! I will review your note and respond within 24 hours.</p>
      </div>
    )
  }

  return (
    <form action={action} className="grid gap-6 md:grid-cols-2">
      <div>
        <label htmlFor="name" className="font-mono text-xs uppercase tracking-[0.2em] text-white/40">
          Name
        </label>
        <input id="name" name="name" required maxLength={120} className={inputClass} placeholder="Your name" />
      </div>
      <div>
        <label htmlFor="email" className="font-mono text-xs uppercase tracking-[0.2em] text-white/40">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          maxLength={255}
          className={inputClass}
          placeholder="you@company.com"
        />
      </div>
      <div className="md:col-span-2">
        <label htmlFor="subject" className="font-mono text-xs uppercase tracking-[0.2em] text-white/40">
          Subject
        </label>
        <input id="subject" name="subject" maxLength={200} className={inputClass} placeholder="What are we building?" />
      </div>
      <div className="md:col-span-2">
        <label htmlFor="body" className="font-mono text-xs uppercase tracking-[0.2em] text-white/40">
          Message
        </label>
        <textarea
          id="body"
          name="body"
          required
          rows={5}
          maxLength={5000}
          className={`${inputClass} resize-none`}
          placeholder="Tell me about the project, timeline and budget."
        />
      </div>
      {state.status === 'error' && (
        <p className="text-sm text-red-400 md:col-span-2" role="alert">
          {state.message}
        </p>
      )}
      <div className="md:col-span-2">
        <MagneticButton strength={0.3}>
          <button
            type="submit"
            disabled={pending}
            data-cursor="send"
            className="inline-flex items-center gap-4 rounded-full bg-white px-8 py-4 font-mono text-sm uppercase tracking-[0.15em] text-black transition-all hover:bg-lime-300 disabled:opacity-60 shadow-lg shadow-white/5 active:scale-95"
          >
            {pending ? 'Sending…' : 'Send message →'}
          </button>
        </MagneticButton>
      </div>
    </form>
  )
}

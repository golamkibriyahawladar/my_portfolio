'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle, RotateCcw, Home } from 'lucide-react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Unhandled runtime error caught by boundary:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col justify-center items-center px-6 selection:bg-lime-300 selection:text-black font-sans relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,rgba(239,68,68,0.08),transparent)]"
      />

      <div className="relative z-10 max-w-xl text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-red-500/30 bg-red-500/10 font-mono text-xs text-red-400 uppercase tracking-widest">
          <AlertTriangle className="w-3.5 h-3.5" />
          System Interrupt
        </div>

        <h1 className="font-grotesk text-4xl sm:text-5xl font-medium tracking-tight text-white">
          An unexpected error occurred.
        </h1>

        <p className="text-sm sm:text-base text-white/60 leading-relaxed max-w-md mx-auto">
          The runtime encountered an uncaught exception. You can attempt to re-render the page or navigate back to safety.
        </p>

        {error.digest && (
          <p className="font-mono text-[11px] text-white/30 bg-white/5 py-1.5 px-3 rounded border border-white/5 inline-block">
            Digest: {error.digest}
          </p>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-3 font-mono text-xs uppercase tracking-wider text-black font-semibold hover:bg-lime-300 transition-all shadow-lg active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Try Again
          </button>
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-7 py-3 font-mono text-xs uppercase tracking-wider text-white hover:bg-white/10 transition-all active:scale-95"
          >
            <Home className="w-3.5 h-3.5" />
            Homepage
          </Link>
        </div>
      </div>
    </div>
  )
}

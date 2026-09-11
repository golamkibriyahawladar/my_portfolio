import Link from 'next/link'
import { ArrowLeft, Home, BookOpen, Compass } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col justify-between selection:bg-lime-300 selection:text-black font-sans relative overflow-hidden">
      {/* Background ambient radial gradients */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_30%,rgba(163,230,53,0.08),transparent)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)]"
      />

      {/* Top bar branding */}
      <header className="relative z-10 px-6 py-6 md:px-10 max-w-[1600px] mx-auto w-full flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-white">
          <span className="h-2 w-2 rounded-full bg-lime-300 animate-pulse" aria-hidden="true" />
          Golam Kibriya Hawladar
        </Link>
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">
          Error 404
        </span>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-2xl mx-auto px-6 text-center my-auto py-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-lime-300/30 bg-lime-300/10 font-mono text-xs text-lime-300 uppercase tracking-widest mb-6">
          <Compass className="w-3.5 h-3.5" />
          404 // Signal Disconnected
        </div>

        <h1 className="font-grotesk text-[clamp(2.5rem,7vw,6rem)] font-medium leading-[0.95] tracking-tight text-white mb-6">
          Lost in the <span className="text-lime-300">void</span>.
        </h1>

        <p className="text-base sm:text-lg text-white/60 leading-relaxed max-w-lg mx-auto mb-10">
          The requested coordinate or document does not exist, was renamed, or has expired from the cache.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-full bg-lime-300 px-7 py-3.5 font-mono text-xs uppercase tracking-wider text-black font-semibold hover:bg-lime-400 transition-all shadow-lg shadow-lime-300/20 active:scale-95"
          >
            <Home className="w-4 h-4" />
            Back to Homepage
          </Link>
          <Link
            href="/blog"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-full border border-white/20 bg-white/5 px-7 py-3.5 font-mono text-xs uppercase tracking-wider text-white hover:bg-white/10 hover:border-white/30 transition-all active:scale-95"
          >
            <BookOpen className="w-4 h-4 text-lime-300" />
            Explore Articles
          </Link>
        </div>
      </main>

      {/* Footer subtle text */}
      <footer className="relative z-10 px-6 py-6 md:px-10 max-w-[1600px] mx-auto w-full text-center sm:text-left font-mono text-[11px] text-white/30 uppercase tracking-widest">
        &copy; {new Date().getFullYear()} Golam Kibriya Hawladar · All rights reserved.
      </footer>
    </div>
  )
}

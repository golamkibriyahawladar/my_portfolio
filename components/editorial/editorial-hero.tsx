'use client'

import { motion } from 'framer-motion'
import { ArrowDown } from 'lucide-react'
import { SplitWords } from '@/components/reveal'
import { profile } from '@/lib/portfolio-data'

export function EditorialHero() {
  return (
    <section className="mx-auto max-w-7xl px-6 pb-24 pt-20 md:px-10 md:pb-32 md:pt-28">
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.8 }}
        className="mb-8 flex items-center gap-3 text-sm text-stone-500"
      >
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-600" />
        </span>
        {profile.availability}
      </motion.p>

      <h1 className="font-serif text-[clamp(2.75rem,8vw,7rem)] leading-[0.98] tracking-tight text-stone-900">
        <SplitWords text="Web developer" />
        <br />
        <SplitWords text="& AI automation" delay={0.15} className="italic text-stone-500" />
        <br />
        <SplitWords text="expert." delay={0.3} />
      </h1>

      <div className="mt-12 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-xl text-lg leading-relaxed text-stone-600 md:text-xl"
        >
          {profile.tagline}
        </motion.p>
        <motion.a
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
          href="#work"
          className="group inline-flex items-center gap-3 text-sm uppercase tracking-[0.2em] text-stone-900"
        >
          Selected work
          <span className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-900 transition-transform duration-500 group-hover:translate-y-1">
            <ArrowDown className="h-4 w-4" aria-hidden="true" />
          </span>
        </motion.a>
      </div>
    </section>
  )
}

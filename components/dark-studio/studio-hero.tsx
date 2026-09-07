'use client'

import { motion } from 'framer-motion'
import type { Profile, Skill } from '@/lib/db/schema'

export function StudioHero({ profile, skills }: { profile: Profile; skills: Skill[] }) {
  const marqueeItems = skills.length ? skills.map((skill) => skill.name) : [profile.role]

  return (
    <section className="relative flex min-h-screen flex-col justify-end overflow-hidden px-6 pb-12 pt-32 md:px-10">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_70%_20%,rgba(190,242,100,0.12),transparent)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:80px_80px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_80%)]"
      />

      <div className="relative mx-auto w-full max-w-[1600px]">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 1 }}
          className="mb-10 font-mono text-xs uppercase tracking-[0.2em] text-white/50"
        >
          Portfolio — {new Date().getFullYear()} · {profile.location}
        </motion.p>

        <h1 className="font-grotesk text-[clamp(3rem,11vw,11rem)] font-medium leading-[0.9] tracking-[-0.04em] text-white">
          {['Building', 'the web,', 'automating'].map((line, i) => (
            <span key={line} className="block overflow-hidden">
              <motion.span
                className="block"
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                transition={{ duration: 1, delay: 0.1 + i * 0.12, ease: [0.22, 1, 0.36, 1] }}
              >
                {line}
              </motion.span>
            </span>
          ))}
          <span className="block overflow-hidden">
            <motion.span
              className="block text-lime-300"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              transition={{ duration: 1, delay: 0.46, ease: [0.22, 1, 0.36, 1] }}
            >
              the rest.
            </motion.span>
          </span>
        </h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.8 }}
          className="mt-14 grid gap-8 border-t border-white/10 pt-8 md:grid-cols-3"
        >
          <div className="font-mono text-xs uppercase tracking-[0.2em] text-white/50">
            <p>{profile.role}</p>
            <p className="mt-3 flex items-center gap-2 text-lime-300">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-lime-300" aria-hidden="true" />
              {profile.availability}
            </p>
          </div>
          <p className="max-w-md text-base leading-relaxed text-white/70 md:col-span-2">{profile.tagline}</p>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 1 }}
        className="relative mt-16 -mx-6 overflow-hidden border-y border-white/10 py-4 md:-mx-10"
        aria-hidden="true"
      >
        <div className="flex w-max animate-marquee gap-12 whitespace-nowrap font-mono text-xs uppercase tracking-[0.25em] text-white/40">
          {[...marqueeItems, ...marqueeItems].map((item, i) => (
            <span key={i} className="flex items-center gap-12">
              {item}
              <span className="h-1 w-1 rounded-full bg-lime-300" />
            </span>
          ))}
        </div>
      </motion.div>
    </section>
  )
}

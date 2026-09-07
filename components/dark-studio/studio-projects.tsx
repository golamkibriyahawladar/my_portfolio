'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRef, useState } from 'react'
import { motion, useScroll, useTransform, useSpring, useMotionValue, AnimatePresence } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import type { Project } from '@/lib/db/schema'

function ProjectCard({ project, index }: { project: Project; index: number }) {
  return (
    <Link
      href={`/work/${project.slug}`}
      data-cursor="view"
      className="group relative flex w-[80vw] shrink-0 flex-col md:w-[46vw] lg:w-[38vw]"
      aria-label={`View ${project.title}`}
    >
      <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-white/10 bg-white/5">
        <Image
          src={project.image}
          alt={`${project.title} preview`}
          fill
          sizes="(min-width: 1024px) 38vw, (min-width: 768px) 46vw, 80vw"
          className="object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a]/60 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        <span className="absolute left-4 top-4 rounded-full border border-white/20 bg-black/40 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-white backdrop-blur">
          {project.category}
        </span>
      </div>
      <div className="mt-6 flex items-start justify-between gap-6">
        <div>
          <p className="font-mono text-xs text-white/40">
            {String(index + 1).padStart(2, '0')} / {project.year}
          </p>
          <h3 className="mt-2 font-grotesk text-3xl font-medium tracking-tight text-white md:text-4xl">
            {project.title}
          </h3>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-white/60">{project.description}</p>
        </div>
        <span className="mt-2 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/20 text-white transition-all duration-500 group-hover:border-lime-300 group-hover:bg-lime-300 group-hover:text-black">
          <ArrowUpRight className="h-5 w-5" aria-hidden="true" />
        </span>
      </div>
      <ul className="mt-5 flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs text-white/40" aria-label="Technologies">
        {project.stack.map((tech) => (
          <li key={tech}>{tech}</li>
        ))}
        {project.result && <li className="ml-auto text-lime-300">{project.result}</li>}
      </ul>
    </Link>
  )
}

export function StudioProjects({ projects }: { projects: Project[] }) {
  const trackRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: trackRef })
  const shift = Math.max(0, projects.length - 1) * 22
  const x = useTransform(scrollYProgress, [0, 1], ['0%', `-${shift}%`])
  const smoothX = useSpring(x, { stiffness: 80, damping: 25, mass: 0.4 })
  const progressWidth = useTransform(scrollYProgress, [0, 1], ['0%', '100%'])

  const trackHeight = `${Math.max(200, projects.length * 100)}vh`

  return (
    <section id="work" ref={trackRef} className="relative" style={{ height: trackHeight }}>
      <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden">
        <div className="mx-auto mb-10 flex w-full max-w-[1600px] items-end justify-between px-6 md:px-10">
          <h2 className="font-grotesk text-4xl font-medium tracking-tight text-white md:text-6xl">
            Selected work
          </h2>
          <p className="hidden font-mono text-xs uppercase tracking-[0.2em] text-white/40 md:block">
            Scroll to explore
          </p>
        </div>

        <motion.div style={{ x: smoothX }} className="flex gap-8 pl-6 md:gap-12 md:pl-10">
          {projects.map((project, i) => (
            <ProjectCard key={project.id} project={project} index={i} />
          ))}
          <div className="flex w-[40vw] shrink-0 items-center justify-center">
            <Link
              href="/#contact"
              className="font-grotesk text-3xl text-white/40 transition-colors hover:text-lime-300 md:text-5xl"
            >
              Your project here →
            </Link>
          </div>
        </motion.div>

        <div className="mx-auto mt-12 w-full max-w-[1600px] px-6 md:px-10">
          <div className="h-px w-full bg-white/10">
            <motion.div style={{ width: progressWidth }} className="h-px bg-lime-300" />
          </div>
        </div>
      </div>
    </section>
  )
}

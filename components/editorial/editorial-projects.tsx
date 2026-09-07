'use client'

import Image from 'next/image'
import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { Reveal } from '@/components/reveal'
import { projects, type Project } from '@/lib/portfolio-data'

function ProjectRow({ project, index }: { project: Project; index: number }) {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], ['-6%', '6%'])
  const reversed = index % 2 === 1

  return (
    <article
      ref={ref}
      className="group grid items-center gap-8 border-t border-stone-900/10 py-16 md:grid-cols-12 md:gap-12 md:py-24"
    >
      <Reveal
        className={`overflow-hidden rounded-sm bg-stone-200 md:col-span-7 ${reversed ? 'md:order-2' : ''}`}
      >
        <a href="#" aria-label={`View ${project.title}`} className="block">
          <div className="relative aspect-[4/3] overflow-hidden">
            <motion.div style={{ y }} className="absolute inset-[-8%]">
              <Image
                src={project.image}
                alt={`${project.title} preview`}
                fill
                sizes="(min-width: 768px) 60vw, 100vw"
                className="object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
              />
            </motion.div>
          </div>
        </a>
      </Reveal>

      <Reveal delay={0.15} className={`md:col-span-5 ${reversed ? 'md:order-1' : ''}`}>
        <div className="mb-6 flex items-center gap-4 text-xs uppercase tracking-[0.2em] text-stone-500">
          <span className="font-serif text-2xl normal-case tracking-normal text-stone-300">
            0{index + 1}
          </span>
          <span>{project.category}</span>
          <span aria-hidden="true">—</span>
          <span>{project.year}</span>
        </div>
        <h3 className="font-serif text-3xl tracking-tight text-stone-900 md:text-4xl">
          {project.title}
        </h3>
        <p className="mt-5 leading-relaxed text-stone-600">{project.description}</p>
        <ul className="mt-6 flex flex-wrap gap-2" aria-label="Technologies">
          {project.stack.map((tech) => (
            <li
              key={tech}
              className="rounded-full border border-stone-900/15 px-3 py-1 text-xs text-stone-600"
            >
              {tech}
            </li>
          ))}
        </ul>
        <div className="mt-8 flex items-center justify-between border-t border-stone-900/10 pt-6">
          <p className="text-sm text-stone-500">
            Result <span className="ml-2 font-medium text-stone-900">{project.result}</span>
          </p>
          <a
            href="#"
            className="inline-flex items-center gap-1 text-sm text-stone-900 underline-offset-4 hover:underline"
          >
            Case study
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </a>
        </div>
      </Reveal>
    </article>
  )
}

export function EditorialProjects() {
  return (
    <section id="work" className="mx-auto max-w-7xl px-6 md:px-10">
      <Reveal className="mb-6 flex items-end justify-between">
        <h2 className="font-serif text-4xl tracking-tight text-stone-900 md:text-6xl">
          Selected <span className="italic text-stone-500">work</span>
        </h2>
        <p className="hidden text-sm text-stone-500 md:block">{projects.length} projects, 2024 — 2026</p>
      </Reveal>
      {projects.map((project, i) => (
        <ProjectRow key={project.slug} project={project} index={i} />
      ))}
    </section>
  )
}

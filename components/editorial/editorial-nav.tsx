'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { profile } from '@/lib/portfolio-data'

const links = [
  { label: 'Work', href: '#work' },
  { label: 'About', href: '#about' },
  { label: 'Services', href: '#services' },
  { label: 'Contact', href: '#contact' },
]

export function EditorialNav() {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="sticky top-0 z-40 border-b border-stone-900/10 bg-[#f5f1ea]/80 backdrop-blur-md"
    >
      <nav
        aria-label="Primary"
        className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 md:px-10"
      >
        <Link href="/" className="font-serif text-xl tracking-tight text-stone-900">
          {profile.name.split(' ')[0]}
          <span className="text-stone-400">.</span>
        </Link>
        <ul className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="group relative text-sm text-stone-600 transition-colors hover:text-stone-900"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 h-px w-0 bg-stone-900 transition-all duration-300 group-hover:w-full" />
              </a>
            </li>
          ))}
        </ul>
        <a
          href="#contact"
          className="rounded-full border border-stone-900 px-4 py-2 text-sm text-stone-900 transition-colors hover:bg-stone-900 hover:text-[#f5f1ea]"
        >
          Let&apos;s talk
        </a>
      </nav>
    </motion.header>
  )
}

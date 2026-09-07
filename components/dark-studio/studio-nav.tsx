'use client'

import Link from 'next/link'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'

const links = [
  { label: 'Work', href: '/#work' },
  { label: 'About', href: '/#about' },
  { label: 'Services', href: '/#services' },
  { label: 'Blog', href: '/blog' },
  { label: 'Contact', href: '/#contact' },
]

export function StudioNav({ name, email }: { name: string; email: string }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="fixed inset-x-0 top-0 z-40 mix-blend-difference"
      >
        <nav
          aria-label="Primary"
          className="mx-auto flex max-w-[1600px] items-center justify-between px-6 py-6 font-mono text-xs uppercase tracking-[0.15em] text-white md:px-10"
        >
          <Link href="/" className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-lime-300" aria-hidden="true" />
            {name}
          </Link>
          <ul className="hidden items-center gap-8 md:flex">
            {links.map((link, i) => (
              <li key={link.href}>
                <Link href={link.href} className="transition-opacity hover:opacity-60">
                  <span className="mr-1 text-white/40">0{i + 1}</span>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <a href={`mailto:${email}`} className="hidden transition-opacity hover:opacity-60 md:block">
            {email}
          </a>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="md:hidden"
            aria-label="Open menu"
            aria-expanded={open}
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </button>
        </nav>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col bg-[#0a0a0a] px-6 py-6 text-white md:hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
          >
            <div className="flex items-center justify-between font-mono text-xs uppercase tracking-[0.15em]">
              <span>{name}</span>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close menu">
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            <ul className="mt-16 flex flex-col gap-6">
              {links.map((link, i) => (
                <motion.li
                  key={link.href}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * i }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="font-grotesk text-4xl font-medium tracking-tight"
                  >
                    {link.label}
                  </Link>
                </motion.li>
              ))}
            </ul>
            <a href={`mailto:${email}`} className="mt-auto font-mono text-xs uppercase tracking-[0.15em] text-white/60">
              {email}
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

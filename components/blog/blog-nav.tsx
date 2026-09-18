'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  Rss,
  Terminal,
  Menu,
  X,
  Sparkles,
  Command,
} from 'lucide-react'
import { AccentPicker } from '@/components/accent-picker'

interface BlogNavProps {
  name?: string
  role?: string
}

export function BlogNav({
  name = 'Golam Kibriya Hawladar',
  role = 'AI Engineer & Architect',
}: BlogNavProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  const triggerCommandPalette = () => {
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))
  }

  const navLinks = [
    { label: 'All Articles', href: '/blog' },
    { label: 'AI Voice Agents', href: '/blog?cat=voice' },
    { label: 'Automation Blueprints', href: '/blog?cat=automation' },
    { label: 'RSS Feed', href: '/feed.xml', external: true },
  ]

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-40 bg-[#0a0a0e]/80 backdrop-blur-xl border-b border-white/10 transition-all">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-6 py-3.5 md:px-10">
          {/* Brand / Publication Title */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="group inline-flex items-center gap-1.5 text-xs font-mono text-white/50 hover:text-[#a3e635] transition-colors pr-3 border-r border-white/10"
              title="Return to Portfolio Homepage"
            >
              <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
              <span className="hidden sm:inline">Portfolio</span>
            </Link>

            <Link href="/blog" className="flex items-center gap-2.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#a3e635] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#a3e635]" />
              </span>
              <div className="flex flex-col">
                <span className="font-grotesk text-sm font-bold tracking-tight text-white group-hover:text-[#bef264] transition-colors">
                  {name}
                </span>
                <span className="text-[10px] font-mono text-[#a3e635] uppercase tracking-wider font-semibold">
                  Engineering &amp; AI Dispatch
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-6">
            <ul className="flex items-center gap-6 text-xs font-mono">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    target={link.external ? '_blank' : undefined}
                    rel={link.external ? 'noopener noreferrer' : undefined}
                    className={`transition-colors hover:text-[#a3e635] flex items-center gap-1.5 ${
                      pathname === link.href ? 'text-[#a3e635] font-semibold' : 'text-white/70'
                    }`}
                  >
                    {link.external && <Rss className="w-3 h-3 text-[#bef264]" />}
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Quick Actions */}
          <div className="flex items-center gap-3">
            {/* Quick Command Palette Button */}
            <button
              onClick={triggerCommandPalette}
              className="hidden sm:flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/50 hover:text-white hover:border-white/20 transition-all text-[11px] font-mono lowercase"
              title="Search articles & commands (Cmd+K)"
            >
              <Command className="w-3 h-3 text-[#a3e635]" />
              <span>⌘K</span>
            </button>

            <AccentPicker />

            {/* Back to Portfolio CTA */}
            <Link
              href="/"
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-[#a3e635]/15 text-white/80 hover:text-[#a3e635] border border-white/10 hover:border-[#a3e635]/30 text-xs font-mono font-medium transition-all"
            >
              <Terminal className="w-3 h-3" />
              <span>hire me</span>
            </Link>

            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg bg-white/5 border border-white/10 text-white"
              aria-label="Open Blog Navigation"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-50 flex flex-col bg-[#0a0a0e] px-6 py-6 text-white lg:hidden"
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#a3e635]" />
                <span className="font-grotesk font-bold text-sm">Engineering Dispatch</span>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 rounded-lg text-white/60 hover:text-white"
                aria-label="Close menu"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <ul className="mt-8 flex flex-col gap-5 text-base font-grotesk">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-2 text-white/80 hover:text-[#a3e635] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li className="pt-4 border-t border-white/10">
                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 text-sm font-mono text-[#a3e635]"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Return to Portfolio Homepage
                </Link>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

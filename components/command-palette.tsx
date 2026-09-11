'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Terminal,
  FileText,
  Briefcase,
  Mail,
  User,
  Home,
  ArrowRight,
  ExternalLink,
  Sparkles,
  Command,
  X,
} from 'lucide-react'
import { toast } from 'sonner'

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [terminalOutput, setTerminalOutput] = useState<string | null>(null)
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)

  // Toggle open on Cmd+K or Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen((prev) => !prev)
      } else if (e.key === 'Escape') {
        setOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50)
    } else {
      setQuery('')
      setTerminalOutput(null)
    }
  }, [open])

  const handleCommandRun = (cmd: string) => {
    const c = cmd.trim().toLowerCase()

    if (c === 'help') {
      setTerminalOutput('Available commands: bio, projects, blog, contact, cv, clear')
      return
    }
    if (c === 'bio') {
      setTerminalOutput(
        'Golam Kibriya Hawladar — Full-Stack Engineer specializing in modern web applications, Next.js, and autonomous AI systems.'
      )
      return
    }
    if (c === 'projects') {
      setOpen(false)
      router.push('/#projects')
      return
    }
    if (c === 'blog') {
      setOpen(false)
      router.push('/blog')
      return
    }
    if (c === 'contact') {
      setOpen(false)
      router.push('/#contact')
      return
    }
    if (c === 'cv') {
      toast.success('Downloading CV...')
      return
    }
    if (c === 'clear') {
      setTerminalOutput(null)
      setQuery('')
      return
    }

    // Default search or navigate
    if (query.trim()) {
      setTerminalOutput(`Command '${query}' executed. Press Escape to close.`)
    }
  }

  const actions = [
    {
      label: 'Home',
      icon: Home,
      category: 'Navigation',
      onSelect: () => {
        router.push('/')
        setOpen(false)
      },
    },
    {
      label: 'Featured Projects',
      icon: Briefcase,
      category: 'Navigation',
      onSelect: () => {
        router.push('/#projects')
        setOpen(false)
      },
    },
    {
      label: 'Technical Blog',
      icon: FileText,
      category: 'Navigation',
      onSelect: () => {
        router.push('/blog')
        setOpen(false)
      },
    },
    {
      label: 'About & Background',
      icon: User,
      category: 'Navigation',
      onSelect: () => {
        router.push('/#about')
        setOpen(false)
      },
    },
    {
      label: 'Get in Touch / Hire',
      icon: Mail,
      category: 'Navigation',
      onSelect: () => {
        router.push('/#contact')
        setOpen(false)
      },
    },
    {
      label: 'Admin Control Panel',
      icon: Terminal,
      category: 'CMS',
      onSelect: () => {
        router.push('/admin')
        setOpen(false)
      },
    },
    {
      label: 'Copy Portfolio URL',
      icon: ExternalLink,
      category: 'Quick Actions',
      onSelect: () => {
        navigator.clipboard.writeText(window.location.origin)
        toast.success('Portfolio URL copied to clipboard!')
        setOpen(false)
      },
    },
  ]

  const filteredActions = actions.filter((a) =>
    a.label.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <>
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md"
            />

            {/* Modal Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="relative w-full max-w-lg rounded-2xl bg-[#0e0e14] border border-white/15 shadow-2xl overflow-hidden text-white z-10"
            >
              {/* Search Bar */}
              <div className="p-4 border-b border-white/10 flex items-center gap-3">
                <Search className="w-4 h-4 text-white/40 shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      if (filteredActions.length > 0 && !query.startsWith('terminal:')) {
                        filteredActions[0].onSelect()
                      } else {
                        handleCommandRun(query)
                      }
                    }
                  }}
                  placeholder="Type a command or search... (or 'help', 'bio', 'projects')"
                  className="flex-1 bg-transparent text-sm text-white placeholder:text-white/30 focus:outline-none"
                />
                <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-white/10 text-[10px] font-mono text-white/40">
                  ESC
                </kbd>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="p-1 rounded text-white/40 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Terminal Output Banner */}
              {terminalOutput && (
                <div className="p-3.5 bg-black/40 border-b border-white/10 font-mono text-xs text-[#a3e635] flex items-center justify-between">
                  <span>&gt; {terminalOutput}</span>
                  <button
                    onClick={() => setTerminalOutput(null)}
                    className="text-white/40 hover:text-white text-[10px]"
                  >
                    Dismiss
                  </button>
                </div>
              )}

              {/* Action List */}
              <div className="max-h-72 overflow-y-auto p-2 divide-y divide-white/5 scrollbar-thin">
                {filteredActions.length === 0 ? (
                  <div className="p-6 text-center text-xs text-white/40 space-y-1">
                    <p>No results found for &quot;{query}&quot;</p>
                    <p className="text-[11px] text-white/25">Press Enter to run as terminal command</p>
                  </div>
                ) : (
                  filteredActions.map((action, idx) => {
                    const Icon = action.icon
                    return (
                      <button
                        key={action.label}
                        type="button"
                        onClick={action.onSelect}
                        className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs transition-colors group text-left ${
                          idx === 0
                            ? 'bg-white/5 text-white'
                            : 'text-white/70 hover:bg-white/[0.04] hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/60 group-hover:text-[#a3e635] group-hover:border-[#a3e635]/30 transition-colors">
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <span className="font-medium text-white block">
                              {action.label}
                            </span>
                            <span className="text-[10px] text-white/40 block font-mono">
                              {action.category}
                            </span>
                          </div>
                        </div>

                        <ArrowRight className="w-3.5 h-3.5 text-white/20 group-hover:text-white/70 group-hover:translate-x-0.5 transition-all" />
                      </button>
                    )
                  })
                )}
              </div>

              {/* Footer */}
              <div className="p-2.5 border-t border-white/5 bg-[#0a0a0e] flex items-center justify-between text-[11px] text-white/40 font-mono">
                <div className="flex items-center gap-2">
                  <span>Navigate:</span>
                  <span className="text-white/60">↑ ↓</span>
                  <span>Select:</span>
                  <span className="text-white/60">↵</span>
                </div>
                <div className="flex items-center gap-1 text-[#a3e635]">
                  <Sparkles className="w-3 h-3" />
                  <span>Interactive Command Palette</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}

'use client'

import React, { useEffect, useState } from 'react'
import { HeadingItem } from '@/lib/geo'
import { List, ChevronDown } from 'lucide-react'

interface TableOfContentsProps {
  headings: HeadingItem[]
}

export function TableOfContents({ headings }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>('')
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (headings.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      },
      { rootMargin: '-80px 0% -60% 0%' }
    )

    headings.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [headings])

  if (headings.length === 0) return null

  return (
    <>
      {/* Mobile Collapsible ToC */}
      <div className="lg:hidden mb-8 rounded-xl border border-white/10 bg-[#121216]/60 overflow-hidden">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full p-4 flex items-center justify-between text-xs font-semibold text-white/90"
        >
          <span className="flex items-center gap-2">
            <List className="w-4 h-4 text-[#a3e635]" />
            Table of Contents
          </span>
          <ChevronDown
            className={`w-4 h-4 text-white/40 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {isOpen && (
          <nav className="p-4 pt-0 border-t border-white/5 space-y-2">
            {headings.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={() => setIsOpen(false)}
                className={`block text-xs transition-colors ${
                  item.level === 3 ? 'pl-4' : ''
                } ${
                  activeId === item.id
                    ? 'text-[#a3e635] font-semibold'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                {item.text}
              </a>
            ))}
          </nav>
        )}
      </div>

      {/* Desktop Sticky Sidebar ToC */}
      <div className="hidden lg:block sticky top-28 space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white/40 font-mono">
          <List className="w-3.5 h-3.5 text-[#a3e635]" />
          On this page
        </div>

        <nav className="space-y-2 border-l border-white/10 pl-3">
          {headings.map((item) => {
            const isActive = activeId === item.id
            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={`block text-xs leading-relaxed transition-all ${
                  item.level === 3 ? 'pl-3' : ''
                } ${
                  isActive
                    ? 'text-[#a3e635] font-semibold -ml-[13px] pl-[13px] border-l-2 border-[#a3e635]'
                    : 'text-white/50 hover:text-white'
                }`}
              >
                {item.text}
              </a>
            )
          })}
        </nav>
      </div>
    </>
  )
}

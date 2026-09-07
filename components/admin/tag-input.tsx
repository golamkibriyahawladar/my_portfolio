'use client'

import React, { useState } from 'react'
import { X, Plus } from 'lucide-react'

interface TagInputProps {
  value: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
  label?: string
}

export function TagInput({
  value = [],
  onChange,
  placeholder = 'Add tag and press Enter...',
  label,
}: TagInputProps) {
  const [input, setInput] = useState('')

  const addTag = (text: string) => {
    const trimmed = text.trim()
    if (!trimmed) return
    if (!value.includes(trimmed)) {
      onChange([...value, trimmed])
    }
    setInput('')
  }

  const removeTag = (indexToRemove: number) => {
    onChange(value.filter((_, i) => i !== indexToRemove))
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag(input)
    } else if (e.key === 'Backspace' && !input && value.length > 0) {
      removeTag(value.length - 1)
    }
  }

  return (
    <div className="space-y-1.5">
      {label && <label className="text-xs font-medium text-white/80">{label}</label>}
      <div className="min-h-[42px] p-2 bg-[#0c0c0f] border border-white/10 rounded-lg flex flex-wrap items-center gap-1.5 focus-within:border-[#a3e635]/50 focus-within:ring-1 focus-within:ring-[#a3e635]/30 transition-all">
        {value.map((tag, i) => (
          <span
            key={`${tag}-${i}`}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-[#a3e635]/10 text-[#a3e635] border border-[#a3e635]/20 animate-in fade-in zoom-in-95 duration-100"
          >
            <span>{tag}</span>
            <button
              type="button"
              onClick={() => removeTag(i)}
              className="text-[#a3e635]/60 hover:text-[#a3e635] transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        <div className="flex-1 min-w-[120px] flex items-center gap-1">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => addTag(input)}
            placeholder={value.length === 0 ? placeholder : ''}
            className="w-full bg-transparent text-xs text-white placeholder:text-white/30 outline-none px-1"
          />
          {input.trim() && (
            <button
              type="button"
              onClick={() => addTag(input)}
              className="px-2 py-0.5 text-[10px] bg-[#a3e635]/20 text-[#a3e635] rounded font-medium hover:bg-[#a3e635]/30"
            >
              <Plus className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

'use client'

import React, { useState } from 'react'
import { Markdown } from '@/components/markdown'
import { Eye, Edit3, Columns, Bold, Italic, Heading2, Code, Link as LinkIcon } from 'lucide-react'

interface MarkdownEditorProps {
  value: string
  onChange: (value: string) => void
  label?: string
  placeholder?: string
  rows?: number
}

export function MarkdownEditor({
  value,
  onChange,
  label = 'Content (Markdown)',
  placeholder = 'Write your content in Markdown...',
  rows = 14,
}: MarkdownEditorProps) {
  const [mode, setMode] = useState<'edit' | 'preview' | 'split'>('split')

  const insertFormatting = (prefix: string, suffix: string = '') => {
    const textarea = document.getElementById('markdown-textarea') as HTMLTextAreaElement | null
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const text = textarea.value
    const selected = text.substring(start, end)
    const replacement = prefix + (selected || 'text') + suffix

    const nextValue = text.substring(0, start) + replacement + text.substring(end)
    onChange(nextValue)

    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + (selected.length || 4))
    }, 0)
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-white/80">{label}</label>

        {/* Mode Selector */}
        <div className="flex items-center gap-1 bg-[#121216] border border-white/10 rounded-lg p-0.5">
          <button
            type="button"
            onClick={() => setMode('edit')}
            className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium transition-colors ${
              mode === 'edit'
                ? 'bg-white/10 text-white'
                : 'text-white/40 hover:text-white'
            }`}
          >
            <Edit3 className="w-3 h-3" />
            Edit
          </button>
          <button
            type="button"
            onClick={() => setMode('preview')}
            className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium transition-colors ${
              mode === 'preview'
                ? 'bg-white/10 text-white'
                : 'text-white/40 hover:text-white'
            }`}
          >
            <Eye className="w-3 h-3" />
            Preview
          </button>
          <button
            type="button"
            onClick={() => setMode('split')}
            className={`hidden md:flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium transition-colors ${
              mode === 'split'
                ? 'bg-white/10 text-white'
                : 'text-white/40 hover:text-white'
            }`}
          >
            <Columns className="w-3 h-3" />
            Split
          </button>
        </div>
      </div>

      {/* Formatting Toolbar (shown when editing or split) */}
      {(mode === 'edit' || mode === 'split') && (
        <div className="flex items-center gap-1 px-2 py-1.5 bg-[#121216] border border-white/10 rounded-t-lg border-b-0">
          <button
            type="button"
            onClick={() => insertFormatting('**', '**')}
            className="p-1 rounded text-white/50 hover:text-white hover:bg-white/5"
            title="Bold"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => insertFormatting('*', '*')}
            className="p-1 rounded text-white/50 hover:text-white hover:bg-white/5"
            title="Italic"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => insertFormatting('## ')}
            className="p-1 rounded text-white/50 hover:text-white hover:bg-white/5"
            title="Heading"
          >
            <Heading2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => insertFormatting('```ts\n', '\n```')}
            className="p-1 rounded text-white/50 hover:text-white hover:bg-white/5"
            title="Code Block"
          >
            <Code className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => insertFormatting('[', '](https://)')}
            className="p-1 rounded text-white/50 hover:text-white hover:bg-white/5"
            title="Link"
          >
            <LinkIcon className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Content Area */}
      <div
        className={`border border-white/10 rounded-lg overflow-hidden bg-[#0a0a0d] ${
          (mode === 'edit' || mode === 'split') ? 'rounded-t-none' : ''
        }`}
      >
        {mode === 'split' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-white/10">
            <textarea
              id="markdown-textarea"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              rows={rows}
              className="w-full p-4 bg-transparent font-mono text-xs text-white/90 placeholder:text-white/30 resize-y outline-none leading-relaxed"
            />
            <div className="p-4 overflow-y-auto max-h-[500px] bg-[#0c0c10]">
              {value.trim() ? (
                <Markdown content={value} />
              ) : (
                <p className="text-xs text-white/30 italic">Markdown preview will render here...</p>
              )}
            </div>
          </div>
        ) : mode === 'edit' ? (
          <textarea
            id="markdown-textarea"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={rows}
            className="w-full p-4 bg-transparent font-mono text-xs text-white/90 placeholder:text-white/30 resize-y outline-none leading-relaxed"
          />
        ) : (
          <div className="p-6 overflow-y-auto max-h-[600px] bg-[#0c0c10]">
            {value.trim() ? (
              <Markdown content={value} />
            ) : (
              <p className="text-xs text-white/30 italic">No content to preview.</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

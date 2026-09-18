'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Markdown } from '@/components/markdown'
import {
  Eye,
  Edit3,
  Columns,
  Bold,
  Italic,
  Heading2,
  Heading3,
  Code,
  Link as LinkIcon,
  Maximize2,
  Minimize2,
  Table as TableIcon,
  Sparkles,
  ShoppingBag,
  RotateCcw,
  Quote,
  Minus,
  CheckCircle2,
} from 'lucide-react'

interface MarkdownEditorProps {
  value: string
  onChange: (value: string) => void
  label?: string
  placeholder?: string
  rows?: number
  draftKey?: string
}

export function MarkdownEditor({
  value,
  onChange,
  label = 'Content (Markdown)',
  placeholder = 'Write your in-depth technical post in Markdown...',
  rows = 24,
  draftKey = 'admin_blog_editor_draft',
}: MarkdownEditorProps) {
  const [mode, setMode] = useState<'edit' | 'preview' | 'split'>('split')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [savedLocally, setSavedLocally] = useState(false)
  const [hasRecoverableDraft, setHasRecoverableDraft] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Document live statistics
  const trimmed = value.trim()
  const wordCount = trimmed ? trimmed.split(/\s+/).filter(Boolean).length : 0
  const charCount = value.length
  const lineCount = value ? value.split('\n').length : 0
  const readTimeMinutes = Math.max(1, Math.ceil(wordCount / 200))
  const meetsTarget = wordCount >= 2000

  // Check for existing local draft on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(draftKey)
      if (saved && saved.trim() && saved.trim() !== value.trim()) {
        setHasRecoverableDraft(saved)
      }
    } catch {
      // Ignore localStorage restrictions
    }
  }, [draftKey])

  // Auto-save draft to localStorage (debounced)
  useEffect(() => {
    if (!value.trim()) return
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(draftKey, value)
        setSavedLocally(true)
        setTimeout(() => setSavedLocally(false), 2000)
      } catch {
        // Ignore quota/storage errors
      }
    }, 1500)
    return () => clearTimeout(timer)
  }, [value, draftKey])

  // Exit fullscreen on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isFullscreen])

  const insertFormatting = (prefix: string, suffix: string = '', defaultPlaceholder: string = 'text') => {
    const textarea = textareaRef.current || (document.getElementById('markdown-textarea') as HTMLTextAreaElement | null)
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const text = textarea.value
    const selected = text.substring(start, end)
    const replacement = prefix + (selected || defaultPlaceholder) + suffix

    const nextValue = text.substring(0, start) + replacement + text.substring(end)
    onChange(nextValue)

    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(
        start + prefix.length,
        start + prefix.length + (selected.length || defaultPlaceholder.length)
      )
    }, 0)
  }

  const insertProductCheckout = () => {
    const snippet = `\n<ProductCheckout \n  title="AI Automation Production Blueprint" \n  price="$97" \n  productId="ai-workflow-blueprint" \n/>\n`
    insertFormatting(snippet, '', '')
  }

  const insertTable = () => {
    const tableSnippet = `\n| Metric / Feature | Method A | Method B (AI Pipeline) |\n| :--- | :--- | :--- |\n| Latency | 2,400ms | 450ms (Ultra-Low) |\n| Unit Cost | $0.25 / run | $0.03 / run |\n| Reliability | 82% | 99.4% (Self-Healing) |\n\n`
    insertFormatting(tableSnippet, '', '')
  }

  const insertCallout = () => {
    const callout = `\n> [!IMPORTANT]\n> **Production Guardrail**: Ensure Redis idempotency locking is enabled before dispatching real-time calls.\n\n`
    insertFormatting(callout, '', '')
  }

  const restoreDraft = () => {
    if (hasRecoverableDraft) {
      onChange(hasRecoverableDraft)
      setHasRecoverableDraft(null)
    }
  }

  const discardDraft = () => {
    try {
      localStorage.removeItem(draftKey)
    } catch {}
    setHasRecoverableDraft(null)
  }

  return (
    <div
      className={`space-y-2 transition-all ${
        isFullscreen
          ? 'fixed inset-0 z-50 bg-[#09090d] p-6 flex flex-col overflow-hidden'
          : 'relative'
      }`}
    >
      {/* Recoverable draft alert banner */}
      {hasRecoverableDraft && (
        <div className="flex items-center justify-between px-3.5 py-2 rounded-lg border border-amber-500/20 bg-amber-500/10 text-xs text-amber-200">
          <div className="flex items-center gap-2">
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
            <span>
              Unsaved draft recovered from local storage ({hasRecoverableDraft.split(/\s+/).filter(Boolean).length} words).
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={restoreDraft}
              className="px-2.5 py-1 rounded bg-amber-400 text-black font-semibold text-[11px] hover:bg-amber-300 transition-colors"
            >
              Restore Draft
            </button>
            <button
              type="button"
              onClick={discardDraft}
              className="px-2 py-1 rounded text-white/50 hover:text-white text-[11px]"
            >
              Discard
            </button>
          </div>
        </div>
      )}

      {/* Top Header & Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold uppercase tracking-wider text-white/80">
            {label}
          </label>

          {/* Word count & Reading time pill */}
          <div className="flex items-center gap-2 text-[11px] font-mono">
            <span
              className={`px-2 py-0.5 rounded-md border font-medium ${
                meetsTarget
                  ? 'border-lime-500/30 bg-lime-500/10 text-[#bef264]'
                  : 'border-white/10 bg-white/[0.04] text-white/60'
              }`}
            >
              {wordCount.toLocaleString()} words {meetsTarget && '🎯'}
            </span>
            <span className="text-white/40 hidden sm:inline">
              ~{readTimeMinutes} min read • {lineCount} lines
            </span>
            {savedLocally && (
              <span className="flex items-center gap-1 text-[10px] text-lime-400 animate-pulse">
                <CheckCircle2 className="w-3 h-3" />
                Saved
              </span>
            )}
          </div>
        </div>

        {/* View Mode & Zen Mode Selectors */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-0.5 bg-[#121216] border border-white/10 rounded-lg p-0.5">
            <button
              type="button"
              onClick={() => setMode('edit')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
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
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
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
              className={`hidden md:flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                mode === 'split'
                  ? 'bg-white/10 text-white'
                  : 'text-white/40 hover:text-white'
              }`}
            >
              <Columns className="w-3 h-3" />
              Split
            </button>
          </div>

          {/* Fullscreen Zen Mode Button */}
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-[11px] font-medium transition-all ${
              isFullscreen
                ? 'border-[#a3e635] bg-[#a3e635]/10 text-[#a3e635]'
                : 'border-white/10 bg-[#121216] text-white/60 hover:text-white hover:bg-white/5'
            }`}
            title={isFullscreen ? 'Exit Zen Mode (Esc)' : 'Enter Zen Fullscreen Writing Mode'}
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Exit Zen</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Zen Mode</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Formatting & Insert Toolbar */}
      {(mode === 'edit' || mode === 'split') && (
        <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-1.5 bg-[#121216] border border-white/10 rounded-t-xl border-b-0">
          <div className="flex flex-wrap items-center gap-1">
            <button
              type="button"
              onClick={() => insertFormatting('**', '**', 'bold text')}
              className="p-1.5 rounded text-white/60 hover:text-white hover:bg-white/10 transition-colors"
              title="Bold"
            >
              <Bold className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('*', '*', 'italic text')}
              className="p-1.5 rounded text-white/60 hover:text-white hover:bg-white/10 transition-colors"
              title="Italic"
            >
              <Italic className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('## ', '', 'Section Title')}
              className="p-1.5 rounded text-white/60 hover:text-white hover:bg-white/10 transition-colors"
              title="Heading 2"
            >
              <Heading2 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('### ', '', 'Subsection Title')}
              className="p-1.5 rounded text-white/60 hover:text-white hover:bg-white/10 transition-colors"
              title="Heading 3"
            >
              <Heading3 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('`', '`', 'inlineCode')}
              className="p-1.5 rounded text-white/60 hover:text-white hover:bg-white/10 transition-colors"
              title="Inline Code"
            >
              <Code className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('\n```typescript\n', '\n```\n', '// Your code here')}
              className="px-2 py-1 rounded text-[11px] font-mono text-white/60 hover:text-white hover:bg-white/10 transition-colors"
              title="Code Block"
            >
              {`\`\`\`ts`}
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('\n```python\n', '\n```\n', '# Python code here')}
              className="px-2 py-1 rounded text-[11px] font-mono text-white/60 hover:text-white hover:bg-white/10 transition-colors"
              title="Python Code Block"
            >
              {`\`\`\`py`}
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('\n```bash\n', '\n```\n', 'npm install')}
              className="px-2 py-1 rounded text-[11px] font-mono text-white/60 hover:text-white hover:bg-white/10 transition-colors"
              title="Bash Command"
            >
              {`\`\`\`sh`}
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('[', '](https://example.com)', 'link text')}
              className="p-1.5 rounded text-white/60 hover:text-white hover:bg-white/10 transition-colors"
              title="Link"
            >
              <LinkIcon className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={insertTable}
              className="p-1.5 rounded text-white/60 hover:text-white hover:bg-white/10 transition-colors"
              title="Insert Markdown Table"
            >
              <TableIcon className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={insertCallout}
              className="p-1.5 rounded text-white/60 hover:text-white hover:bg-white/10 transition-colors"
              title="Insert Note / Callout"
            >
              <Quote className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('\n---\n\n', '', '')}
              className="p-1.5 rounded text-white/60 hover:text-white hover:bg-white/10 transition-colors"
              title="Horizontal Rule"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick Technical Inserts */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={insertProductCheckout}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-[#a3e635]/30 bg-[#a3e635]/10 text-[11px] font-medium text-[#bef264] hover:bg-[#a3e635]/20 transition-all"
              title="Insert Product Checkout MDX Card"
            >
              <ShoppingBag className="w-3 h-3" />
              <span>+ Product Card</span>
            </button>
          </div>
        </div>
      )}

      {/* Editor & Preview Workspace */}
      <div
        className={`border border-white/10 rounded-xl overflow-hidden bg-[#0a0a0d] ${
          (mode === 'edit' || mode === 'split') ? 'rounded-t-none' : ''
        } ${isFullscreen ? 'flex-1 flex flex-col min-h-0' : ''}`}
      >
        {mode === 'split' ? (
          <div className={`grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-white/10 ${
            isFullscreen ? 'flex-1 min-h-0' : ''
          }`}>
            <textarea
              ref={textareaRef}
              id="markdown-textarea"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              rows={isFullscreen ? undefined : rows}
              className={`w-full p-4 bg-transparent font-mono text-xs sm:text-sm text-white/90 placeholder:text-white/30 resize-none outline-none leading-relaxed custom-scrollbar ${
                isFullscreen ? 'h-full overflow-y-auto' : 'min-h-[550px]'
              }`}
            />
            <div
              className={`p-6 overflow-y-auto bg-[#0c0c10] custom-scrollbar ${
                isFullscreen ? 'h-full' : 'max-h-[650px]'
              }`}
            >
              {value.trim() ? (
                <Markdown content={value} />
              ) : (
                <div className="flex flex-col items-center justify-center h-48 text-white/30 text-xs gap-2">
                  <Sparkles className="w-5 h-5 text-white/20" />
                  <p className="italic">Markdown live preview will render here...</p>
                </div>
              )}
            </div>
          </div>
        ) : mode === 'edit' ? (
          <textarea
            ref={textareaRef}
            id="markdown-textarea"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={isFullscreen ? undefined : rows}
            className={`w-full p-5 bg-transparent font-mono text-xs sm:text-sm text-white/90 placeholder:text-white/30 outline-none leading-relaxed custom-scrollbar ${
              isFullscreen ? 'flex-1 h-full overflow-y-auto resize-none' : 'min-h-[550px] resize-y'
            }`}
          />
        ) : (
          <div
            className={`p-8 overflow-y-auto bg-[#0c0c10] custom-scrollbar ${
              isFullscreen ? 'flex-1 h-full' : 'max-h-[750px]'
            }`}
          >
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

'use client'

import { useState } from 'react'
import { Copy, Check, Terminal } from 'lucide-react'
import { toast } from 'sonner'

interface CurlSnippetProps {
  title: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  endpoint: string
  description?: string
  command: string
}

export function CurlSnippet({
  title,
  method,
  endpoint,
  description,
  command,
}: CurlSnippetProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(command)
      setCopied(true)
      toast.success('cURL command copied to clipboard')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Failed to copy command')
    }
  }

  const methodColors: Record<string, string> = {
    GET: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    POST: 'bg-[#a3e635]/10 text-[#a3e635] border-[#a3e635]/20',
    PUT: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    DELETE: 'bg-red-500/10 text-red-400 border-red-500/20',
  }

  return (
    <div className="rounded-xl border border-white/10 bg-[#121216] overflow-hidden transition-all hover:border-white/20">
      {/* Header bar */}
      <div className="px-4 py-3 bg-white/[0.02] border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Terminal className="w-4 h-4 text-white/40" />
          <span className="text-xs font-semibold text-white">{title}</span>
          <span
            className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded border ${
              methodColors[method] || 'bg-white/10 text-white'
            }`}
          >
            {method}
          </span>
          <span className="text-xs text-white/40 font-mono hidden sm:inline">{endpoint}</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-all active:scale-95"
          title="Copy cURL command"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-[#a3e635]" />
              <span className="text-[#a3e635]">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-white/60" />
              <span>Copy cURL</span>
            </>
          )}
        </button>
      </div>

      {description && (
        <div className="px-4 pt-3 pb-1 text-xs text-white/50">
          {description}
        </div>
      )}

      {/* Monospace Code Display */}
      <div className="p-4 bg-[#08080a] overflow-x-auto">
        <pre className="text-[11px] font-mono leading-relaxed text-lime-400/90 whitespace-pre">
          <code>{command}</code>
        </pre>
      </div>
    </div>
  )
}

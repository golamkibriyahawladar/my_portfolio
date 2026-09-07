'use client'

import React, { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Check, Copy } from 'lucide-react'

function CodeBlock({ node, inline, className, children, ...props }: any) {
  const [copied, setCopied] = useState(false)
  const match = /language-(\w+)/.exec(className || '')
  const language = match ? match[1] : ''
  const codeText = String(children).replace(/\n$/, '')

  const handleCopy = async () => {
    await navigator.clipboard.writeText(codeText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (inline) {
    return (
      <code
        className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[0.85em] text-[#bef264]"
        {...props}
      >
        {children}
      </code>
    )
  }

  return (
    <div className="relative group my-6 rounded-xl border border-white/10 bg-[#0d0d11] overflow-hidden">
      {/* Header bar with language badge and copy button */}
      <div className="flex items-center justify-between px-4 py-2 bg-white/[0.03] border-b border-white/10">
        <span className="text-[11px] font-mono uppercase font-semibold text-white/40 tracking-wider">
          {language || 'code'}
        </span>
        <button
          onClick={handleCopy}
          type="button"
          className="flex items-center gap-1.5 px-2 py-1 rounded text-[11px] font-medium text-white/60 hover:text-white hover:bg-white/10 transition-all active:scale-95"
          title="Copy code"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-[#a3e635]" />
              <span className="text-[#a3e635]">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code contents */}
      <div className="p-4 overflow-x-auto text-xs font-mono leading-relaxed text-lime-200/90">
        <pre {...props}>
          <code>{children}</code>
        </pre>
      </div>
    </div>
  )
}

function HeadingRenderer({ level, children }: { level: number; children: React.ReactNode }) {
  const text = React.Children.toArray(children)
    .map((c) => (typeof c === 'string' ? c : ''))
    .join('')
  const id = text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')

  if (level === 2) {
    return (
      <h2
        id={id}
        className="scroll-mt-24 mt-12 mb-4 text-2xl sm:text-3xl font-bold font-grotesk tracking-tight text-white group flex items-center gap-2"
      >
        <span>{children}</span>
        <a
          href={`#${id}`}
          className="text-white/20 group-hover:text-[#a3e635] text-lg transition-colors"
          aria-hidden="true"
        >
          #
        </a>
      </h2>
    )
  }

  return (
    <h3
      id={id}
      className="scroll-mt-24 mt-8 mb-3 text-xl sm:text-2xl font-semibold font-grotesk tracking-tight text-white group flex items-center gap-2"
    >
      <span>{children}</span>
      <a
        href={`#${id}`}
        className="text-white/20 group-hover:text-[#a3e635] text-base transition-colors"
        aria-hidden="true"
      >
        #
      </a>
    </h3>
  )
}

export function Markdown({ content, className = '' }: { content: string; className?: string }) {
  return (
    <div
      className={`prose-custom max-w-none text-white/80 text-[16px] sm:text-[17px] leading-[1.8] [&_a]:text-[#bef264] [&_a]:underline [&_a]:underline-offset-4 [&_blockquote]:border-l-2 [&_blockquote]:border-[#a3e635] [&_blockquote]:pl-5 [&_blockquote]:italic [&_blockquote]:text-white/60 [&_hr]:my-10 [&_hr]:border-white/10 [&_img]:rounded-xl [&_img]:border [&_img]:border-white/10 [&_img]:my-8 [&_li]:my-1.5 [&_ol]:my-5 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:my-5 [&_strong]:text-white [&_strong]:font-semibold [&_table]:my-6 [&_table]:w-full [&_td]:border-b [&_td]:border-white/10 [&_td]:py-3 [&_th]:border-b [&_th]:border-white/20 [&_th]:py-3 [&_th]:text-left [&_th]:text-white [&_ul]:my-5 [&_ul]:list-disc [&_ul]:pl-6 ${className}`}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code: CodeBlock,
          h2: ({ children }) => <HeadingRenderer level={2}>{children}</HeadingRenderer>,
          h3: ({ children }) => <HeadingRenderer level={3}>{children}</HeadingRenderer>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}

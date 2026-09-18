'use client'

import React, { useState, useEffect, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import hljs from 'highlight.js/lib/core'
import { Check, Copy } from 'lucide-react'
import { ProductCheckout } from '@/components/product-checkout'

// Register commonly used languages for AI/Automation blog niche
import javascript from 'highlight.js/lib/languages/javascript'
import typescript from 'highlight.js/lib/languages/typescript'
import python from 'highlight.js/lib/languages/python'
import json from 'highlight.js/lib/languages/json'
import bash from 'highlight.js/lib/languages/bash'
import yaml from 'highlight.js/lib/languages/yaml'
import xml from 'highlight.js/lib/languages/xml'
import css from 'highlight.js/lib/languages/css'
import markdown from 'highlight.js/lib/languages/markdown'
import sql from 'highlight.js/lib/languages/sql'
import dockerfile from 'highlight.js/lib/languages/dockerfile'

hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('js', javascript)
hljs.registerLanguage('typescript', typescript)
hljs.registerLanguage('ts', typescript)
hljs.registerLanguage('python', python)
hljs.registerLanguage('py', python)
hljs.registerLanguage('json', json)
hljs.registerLanguage('bash', bash)
hljs.registerLanguage('sh', bash)
hljs.registerLanguage('shell', bash)
hljs.registerLanguage('yaml', yaml)
hljs.registerLanguage('yml', yaml)
hljs.registerLanguage('xml', xml)
hljs.registerLanguage('html', xml)
hljs.registerLanguage('css', css)
hljs.registerLanguage('markdown', markdown)
hljs.registerLanguage('md', markdown)
hljs.registerLanguage('sql', sql)
hljs.registerLanguage('dockerfile', dockerfile)
hljs.registerLanguage('docker', dockerfile)

function CodeBlock({ language, codeText }: { language: string; codeText: string }) {
  const [copied, setCopied] = useState(false)
  const codeRef = useRef<HTMLElement>(null)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(codeText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  useEffect(() => {
    if (codeRef.current) {
      // Remove previous highlighting data attribute so hljs re-highlights
      codeRef.current.removeAttribute('data-highlighted')
      try {
        hljs.highlightElement(codeRef.current)
      } catch {
        // Silently fail if language isn't registered
      }
    }
  }, [codeText, language])

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
          className="flex items-center gap-1.5 px-2 py-1 rounded text-[11px] font-medium text-white/60 hover:text-white hover:bg-white/10 transition-all active:scale-95 cursor-pointer"
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

      {/* Code contents with syntax highlighting */}
      <div className="p-4 overflow-x-auto text-[13px] font-mono leading-[1.7]">
        <pre className="!bg-transparent !p-0 !m-0">
          <code
            ref={codeRef}
            className={language ? `language-${language} !bg-transparent !p-0` : '!bg-transparent !p-0'}
          >
            {codeText}
          </code>
        </pre>
      </div>
    </div>
  )
}

function PreBlock({ children, ...props }: any) {
  // In react-markdown v10, fenced code blocks render as <pre><code>...</code></pre>
  if (React.isValidElement(children)) {
    const codeProps = (children.props as any) || {}
    const match = /language-(\w+)/.exec(codeProps.className || '')
    const language = match ? match[1] : ''
    const codeText = String(codeProps.children || '').replace(/\n$/, '')

    return <CodeBlock language={language} codeText={codeText} />
  }

  return (
    <pre
      className="my-6 p-4 rounded-xl border border-white/10 bg-[#0d0d11] overflow-x-auto text-[13px] font-mono leading-[1.7]"
      {...props}
    >
      {children}
    </pre>
  )
}

function InlineCode({ children, className, ...props }: any) {
  return (
    <code
      className="rounded bg-white/[0.08] px-1.5 py-0.5 font-mono text-[0.85em] text-[#bef264] border border-white/5"
      {...props}
    >
      {children}
    </code>
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

  if (level === 2 || level === 1) {
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

  if (level === 3) {
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

  return (
    <h4
      id={id}
      className="scroll-mt-24 mt-6 mb-2 text-base sm:text-lg font-semibold font-grotesk tracking-tight text-white/90 group flex items-center gap-2"
    >
      <span>{children}</span>
      <a
        href={`#${id}`}
        className="text-white/20 group-hover:text-[#a3e635] text-sm transition-colors"
        aria-hidden="true"
      >
        #
      </a>
    </h4>
  )
}

// Handle external links with security attributes
function LinkRenderer({ href, children, ...props }: any) {
  const isExternal = href && (href.startsWith('http://') || href.startsWith('https://'))

  if (isExternal) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
        {children}
      </a>
    )
  }

  return (
    <a href={href} {...props}>
      {children}
    </a>
  )
}

function parseAttributes(tag: string): Record<string, string> {
  const attrs: Record<string, string> = {}
  const regex = /([a-zA-Z0-9_-]+)="([^"]*)"/g
  let match
  while ((match = regex.exec(tag)) !== null) {
    attrs[match[1]] = match[2]
  }
  return attrs
}

const markdownComponents = {
  pre: PreBlock,
  code: InlineCode,
  a: LinkRenderer,
  h1: ({ children }: any) => <HeadingRenderer level={1}>{children}</HeadingRenderer>,
  h2: ({ children }: any) => <HeadingRenderer level={2}>{children}</HeadingRenderer>,
  h3: ({ children }: any) => <HeadingRenderer level={3}>{children}</HeadingRenderer>,
  h4: ({ children }: any) => <HeadingRenderer level={4}>{children}</HeadingRenderer>,
  blockquote: ({ children, ...props }: any) => (
    <blockquote
      className="my-6 rounded-r-2xl border-l-[3px] border-[#a3e635] bg-white/[0.02] px-5 py-4 italic text-white/70 shadow-sm"
      {...props}
    >
      {children}
    </blockquote>
  ),
  table: ({ children, ...props }: any) => (
    <div className="my-8 w-full overflow-x-auto rounded-xl border border-white/10 bg-[#0d0d11]/60">
      <table className="w-full text-left text-sm" {...props}>
        {children}
      </table>
    </div>
  ),
  thead: ({ children, ...props }: any) => (
    <thead
      className="bg-white/[0.04] text-white font-mono text-xs uppercase tracking-wider border-b border-white/10"
      {...props}
    >
      {children}
    </thead>
  ),
  th: ({ children, ...props }: any) => (
    <th className="px-4 py-3 font-semibold text-white/90" {...props}>
      {children}
    </th>
  ),
  td: ({ children, ...props }: any) => (
    <td className="px-4 py-3 border-b border-white/5 text-white/75" {...props}>
      {children}
    </td>
  ),
}

export function Markdown({ content, className = '' }: { content: string; className?: string }) {
  const containerClasses = `prose-custom max-w-none text-white/80 text-[16px] sm:text-[17px] leading-[1.85] tracking-[0.01em] [&_a]:text-[#bef264] [&_a]:underline [&_a]:underline-offset-4 [&_a:hover]:text-[#a3e635] [&_hr]:my-10 [&_hr]:border-white/10 [&_img]:rounded-xl [&_img]:border [&_img]:border-white/10 [&_img]:my-8 [&_li]:my-2 [&_ol]:my-5 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:my-5 [&_strong]:text-white [&_strong]:font-semibold [&_ul]:my-5 [&_ul]:list-disc [&_ul]:pl-6 ${className}`

  if (content && content.includes('<ProductCheckout')) {
    const parts = content.split(
      /(<ProductCheckout\b[^>]*\/>|<ProductCheckout\b[^>]*>[\s\S]*?<\/ProductCheckout>)/g
    )

    return (
      <div className={containerClasses}>
        {parts.map((part, index) => {
          if (part.startsWith('<ProductCheckout')) {
            const attrs = parseAttributes(part)
            return (
              <ProductCheckout
                key={index}
                title={attrs.title || 'Production Workflow Blueprint'}
                price={attrs.price || '$97'}
                productId={attrs.productId || 'blueprint'}
                description={attrs.description}
                href={attrs.href}
              />
            )
          }

          if (!part.trim()) return null

          return (
            <ReactMarkdown
              key={index}
              remarkPlugins={[remarkGfm]}
              components={markdownComponents}
            >
              {part}
            </ReactMarkdown>
          )
        })}
      </div>
    )
  }

  return (
    <div className={containerClasses}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={markdownComponents}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}

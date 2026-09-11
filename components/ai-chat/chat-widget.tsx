'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bot, X, Send, Sparkles, User, Minimize2, ArrowRight } from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

const QUICK_PROMPTS = [
  "What are Golam's skills?",
  'Show his recent projects',
  'How can I hire Golam?',
  'What services does he offer?',
]

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        "Hi there! 👋 I'm **Golam's AI Assistant**.\n\nAsk me anything about Golam's **projects**, **tech stack**, or **work availability**.",
    },
  ])

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      setTimeout(() => inputRef.current?.focus(), 150)
    }
  }, [isOpen, messages, loading])

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim()
    if (!text || loading) return

    const userMsg: Message = {
      id: String(Date.now()),
      role: 'user',
      content: text,
    }

    setMessages((prev) => [...prev, userMsg])
    if (!textToSend) setInput('')
    setLoading(true)

    try {
      const history = [...messages, userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }))

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history }),
      })

      if (!res.ok) throw new Error('Failed to get reply')
      const data = await res.json()

      const assistantMsg: Message = {
        id: String(Date.now() + 1),
        role: 'assistant',
        content: data.reply || "I couldn't process that. Feel free to try again or reach out to Golam directly!",
      }

      setMessages((prev) => [...prev, assistantMsg])
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: String(Date.now() + 1),
          role: 'assistant',
          content: 'Sorry, I encountered a temporary connection issue. You can email Golam directly at **golamkibriyahawladar@gmail.com**!',
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Floating Trigger Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Open AI Assistant"
          className="relative group flex items-center gap-2.5 px-4 py-3 rounded-full bg-[#0e0e12] border border-[#a3e635]/40 text-white shadow-xl shadow-black/60 backdrop-blur-xl hover:border-[#a3e635] transition-all"
        >
          {/* Subtle glowing ring */}
          <span className="absolute -inset-0.5 rounded-full bg-[#a3e635]/20 blur-sm group-hover:bg-[#a3e635]/30 transition-all pointer-events-none" />

          <div className="w-6 h-6 rounded-full bg-[#a3e635]/15 border border-[#a3e635]/30 flex items-center justify-center text-[#a3e635] relative z-10">
            <Bot className="w-3.5 h-3.5" />
          </div>

          <span className="text-xs font-semibold tracking-wide relative z-10 hidden sm:inline">
            Ask AI
          </span>

          <span className="relative flex h-2 w-2 z-10">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#a3e635] opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#a3e635]" />
          </span>
        </motion.button>
      </div>

      {/* Expandable Chat Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-20 right-4 sm:right-6 w-[calc(100vw-32px)] sm:w-[400px] h-[550px] max-h-[80vh] z-50 rounded-2xl bg-[#0b0b0e]/95 border border-white/10 shadow-2xl backdrop-blur-2xl flex flex-col overflow-hidden text-white"
          >
            {/* Modal Header */}
            <div className="p-4 border-b border-white/10 bg-[#121218]/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#a3e635]/10 border border-[#a3e635]/30 flex items-center justify-center text-[#a3e635]">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold tracking-tight text-white flex items-center gap-1.5">
                    Golam&apos;s AI Assistant
                    <span className="w-1.5 h-1.5 rounded-full bg-[#a3e635]" />
                  </div>
                  <div className="text-[10px] text-white/40 font-mono">
                    Powered by Gemini &amp; Portfolio DB
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/5 transition-colors"
                  aria-label="Close Chat"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Message Stream */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3.5 scrollbar-thin text-xs">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-2.5 ${
                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-6 h-6 rounded-lg bg-[#a3e635]/15 border border-[#a3e635]/30 flex items-center justify-center text-[#a3e635] shrink-0 mt-0.5">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                  )}

                  <div
                    className={`max-w-[82%] px-3.5 py-2.5 rounded-2xl whitespace-pre-wrap leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-[#a3e635] text-black font-medium rounded-tr-none'
                        : 'bg-[#15151c] text-white/90 border border-white/5 rounded-tl-none'
                    }`}
                  >
                    {msg.content}
                  </div>

                  {msg.role === 'user' && (
                    <div className="w-6 h-6 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center text-white/70 shrink-0 mt-0.5">
                      <User className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              ))}

              {loading && (
                <div className="flex gap-2.5 items-center text-white/50 text-xs">
                  <div className="w-6 h-6 rounded-lg bg-[#a3e635]/15 border border-[#a3e635]/30 flex items-center justify-center text-[#a3e635] shrink-0">
                    <Bot className="w-3.5 h-3.5 animate-spin" />
                  </div>
                  <span className="animate-pulse">Thinking...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggestion Chips */}
            {messages.length <= 2 && (
              <div className="px-3 py-2 border-t border-white/5 bg-black/20 flex flex-wrap gap-1.5">
                {QUICK_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => handleSend(prompt)}
                    className="text-[11px] px-2.5 py-1 rounded-full bg-white/5 hover:bg-[#a3e635]/10 hover:text-[#a3e635] hover:border-[#a3e635]/30 border border-white/10 text-white/70 transition-all text-left"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}

            {/* Input Area */}
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSend()
              }}
              className="p-3 border-t border-white/10 bg-[#0d0d12] flex items-center gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about projects, skills, hire..."
                disabled={loading}
                className="flex-1 bg-[#15151c] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-[#a3e635]/50 transition-colors"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="w-8 h-8 rounded-xl bg-[#a3e635] hover:bg-[#bef264] disabled:opacity-30 disabled:hover:bg-[#a3e635] text-black flex items-center justify-center transition-all shrink-0 active:scale-95"
                aria-label="Send message"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

'use client'

import React, { useState } from 'react'
import { Message } from '@/lib/db/schema'
import { markMessageRead, deleteMessage } from '@/app/actions/admin'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/admin/confirm-dialog'
import { Mail, MailOpen, Trash2, Reply, ChevronDown, ChevronUp } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface MessagesInboxProps {
  initialMessages: Message[]
}

export function MessagesInbox({ initialMessages }: MessagesInboxProps) {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  const [deleteTarget, setDeleteTarget] = useState<Message | null>(null)
  const [deleting, setDeleting] = useState(false)

  const toggleExpand = async (msg: Message) => {
    const isNowExpanded = expandedId !== msg.id
    setExpandedId(isNowExpanded ? msg.id : null)

    // Auto mark as read when expanding
    if (isNowExpanded && !msg.read) {
      try {
        await markMessageRead(msg.id, true)
        setMessages(messages.map((m) => (m.id === msg.id ? { ...m, read: true } : m)))
        router.refresh()
      } catch (err) {
        console.error('Failed to mark read', err)
      }
    }
  }

  const handleToggleRead = async (msg: Message, e: React.MouseEvent) => {
    e.stopPropagation()
    const nextRead = !msg.read
    try {
      await markMessageRead(msg.id, nextRead)
      setMessages(messages.map((m) => (m.id === msg.id ? { ...m, read: nextRead } : m)))
      toast.success(nextRead ? 'Marked as read' : 'Marked as unread')
      router.refresh()
    } catch {
      toast.error('Failed to update status')
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deleteMessage(deleteTarget.id)
      setMessages(messages.filter((m) => m.id !== deleteTarget.id))
      toast.success('Message deleted')
      router.refresh()
    } catch {
      toast.error('Failed to delete message')
    } finally {
      setDeleting(false)
      setDeleteTarget(null)
    }
  }

  const filteredMessages = messages.filter((m) => (filter === 'unread' ? !m.read : true))

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Filter tabs */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={filter === 'all' ? 'secondary' : 'ghost'}
            onClick={() => setFilter('all')}
            className={`text-xs ${filter === 'all' ? 'bg-white/10 text-white' : 'text-white/50'}`}
          >
            All Inquiries ({messages.length})
          </Button>
          <Button
            size="sm"
            variant={filter === 'unread' ? 'secondary' : 'ghost'}
            onClick={() => setFilter('unread')}
            className={`text-xs ${filter === 'unread' ? 'bg-white/10 text-white' : 'text-white/50'}`}
          >
            Unread ({messages.filter((m) => !m.read).length})
          </Button>
        </div>
      </div>

      {/* Messages List */}
      <div className="rounded-xl border border-white/10 bg-[#121216]/60 divide-y divide-white/5 overflow-hidden">
        {filteredMessages.length === 0 ? (
          <div className="p-12 text-center text-xs text-white/40">
            {filter === 'unread' ? 'No unread inquiries!' : 'Your inbox is empty.'}
          </div>
        ) : (
          filteredMessages.map((msg) => {
            const isExpanded = expandedId === msg.id

            return (
              <div
                key={msg.id}
                className={`transition-colors ${
                  !msg.read ? 'bg-[#a3e635]/[0.03]' : 'hover:bg-white/[0.01]'
                }`}
              >
                {/* Header row */}
                <div
                  onClick={() => toggleExpand(msg)}
                  className="p-4 flex items-center justify-between gap-4 cursor-pointer select-none"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      type="button"
                      onClick={(e) => handleToggleRead(msg, e)}
                      className="text-white/40 hover:text-white transition-colors shrink-0"
                      title={msg.read ? 'Mark unread' : 'Mark read'}
                    >
                      {msg.read ? (
                        <MailOpen className="w-4 h-4 text-white/30" />
                      ) : (
                        <Mail className="w-4 h-4 text-[#a3e635]" />
                      )}
                    </button>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-semibold ${!msg.read ? 'text-white' : 'text-white/70'}`}>
                          {msg.name}
                        </span>
                        <span className="text-[11px] text-white/40 font-mono hidden sm:inline">
                          &lt;{msg.email}&gt;
                        </span>
                        {!msg.read && (
                          <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-[#a3e635] text-black">
                            NEW
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-white/60 truncate mt-0.5">
                        {msg.subject ? `${msg.subject} — ` : ''}{msg.body}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[10px] text-white/30 font-mono">
                      {new Date(msg.createdAt).toLocaleDateString()}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-white/40" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-white/40" />
                    )}
                  </div>
                </div>

                {/* Expanded Message Body */}
                {isExpanded && (
                  <div className="px-11 pb-5 pt-1 space-y-4 border-t border-white/5 bg-black/20 animate-in fade-in-50 duration-150">
                    <div className="flex items-center justify-between text-xs text-white/50 border-b border-white/5 pb-2">
                      <div>
                        From: <span className="text-white font-medium">{msg.name}</span> ({msg.email})
                      </div>
                      <div className="flex items-center gap-2">
                        <a
                          href={`mailto:${msg.email}?subject=${encodeURIComponent(
                            `Re: ${msg.subject || 'Portfolio Inquiry'}`
                          )}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#a3e635] text-black font-semibold text-[11px] hover:bg-[#bef264] transition-colors"
                        >
                          <Reply className="w-3 h-3" />
                          Reply via Email
                        </a>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteTarget(msg)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-1.5 h-7"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>

                    <div className="text-xs text-white/90 whitespace-pre-wrap leading-relaxed">
                      {msg.body}
                    </div>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Inquiry?"
        description={`Delete message from "${deleteTarget?.name}"?`}
        confirmText="Delete"
        destructive
        loading={deleting}
        onConfirm={handleDelete}
      />
    </div>
  )
}

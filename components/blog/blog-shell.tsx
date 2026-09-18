import React from 'react'
import { BlogNav } from './blog-nav'
import { BlogFooter } from './blog-footer'
import { ChatWidget } from '@/components/ai-chat/chat-widget'
import type { Profile } from '@/lib/db/schema'

interface BlogShellProps {
  profile: Profile
  children: React.ReactNode
}

export function BlogShell({ profile, children }: BlogShellProps) {
  return (
    <div className="min-h-screen bg-[#0a0a0e] font-sans text-white selection:bg-[#bef264] selection:text-black">
      {/* Dedicated standalone blog navigation */}
      <BlogNav name={profile.name} role={profile.role} />

      {/* Main publication content area with top offset for fixed navbar */}
      <main className="pt-24 md:pt-28">{children}</main>

      {/* Dedicated blog publication footer */}
      <BlogFooter profile={profile} />

      {/* AI Chat Assistant */}
      <ChatWidget />
    </div>
  )
}

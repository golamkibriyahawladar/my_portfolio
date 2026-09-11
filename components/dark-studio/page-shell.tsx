import { StudioNav } from '@/components/dark-studio/studio-nav'
import { StudioContact } from '@/components/dark-studio/studio-contact'
import { ChatWidget } from '@/components/ai-chat/chat-widget'
import type { Profile } from '@/lib/db/schema'

export function PageShell({ profile, children }: { profile: Profile; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] font-sans text-white selection:bg-lime-300 selection:text-black">
      <StudioNav name={profile.name} email={profile.email} />
      <main className="pt-32">{children}</main>
      <StudioContact profile={profile} showForm={false} />
      <ChatWidget />
    </div>
  )
}

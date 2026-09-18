import React from 'react'
import Link from 'next/link'
import { ArrowUpRight, Rss, ArrowLeft, Shield, Terminal } from 'lucide-react'
import { Profile } from '@/lib/db/schema'

interface BlogFooterProps {
  profile: Profile
}

export function BlogFooter({ profile }: BlogFooterProps) {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="mt-24 border-t border-white/10 bg-[#07070a] text-white/60">
      <div className="mx-auto max-w-[1600px] px-6 py-16 md:px-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-white/10">
          {/* Col 1: About the Publication */}
          <div className="md:col-span-6 space-y-4">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#a3e635]" />
              <span className="font-grotesk font-bold text-white tracking-tight text-base">
                {profile.name} — Engineering &amp; AI Dispatch
              </span>
            </div>
            <p className="text-xs sm:text-sm text-white/50 leading-relaxed max-w-md">
              A specialized technical publication dedicated to autonomous AI voice agents, sub-second streaming pipelines, fault-tolerant n8n workflows, and Generative Engine Optimization.
            </p>
            <div className="pt-2 flex items-center gap-3">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-white transition-all"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Main Portfolio</span>
              </Link>
              <Link
                href="/feed.xml"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#a3e635]/10 hover:bg-[#a3e635]/20 border border-[#a3e635]/30 text-xs font-mono text-[#a3e635] transition-all"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Rss className="w-3.5 h-3.5" />
                <span>RSS Feed</span>
              </Link>
            </div>
          </div>

          {/* Col 2: Topics / Navigation */}
          <div className="md:col-span-3 space-y-3 font-mono text-xs">
            <span className="text-white/40 uppercase tracking-widest text-[11px] block font-semibold">
              Topics &amp; Blueprints
            </span>
            <ul className="space-y-2">
              <li>
                <Link href="/blog" className="hover:text-[#a3e635] transition-colors">
                  All Publications
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-[#a3e635] transition-colors">
                  AI Voice Agents (Vapi &amp; Twilio)
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-[#a3e635] transition-colors">
                  Self-Healing Workflows (n8n &amp; Claude)
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-[#a3e635] transition-colors">
                  Generative Engine Optimization (GEO)
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Connect & Socials */}
          <div className="md:col-span-3 space-y-3 font-mono text-xs">
            <span className="text-white/40 uppercase tracking-widest text-[11px] block font-semibold">
              Connect
            </span>
            <ul className="space-y-2">
              {profile.socials?.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#a3e635] transition-colors inline-flex items-center gap-1"
                  >
                    <span>{s.label}</span>
                    <ArrowUpRight className="w-3 h-3 text-white/30" />
                  </a>
                </li>
              ))}
              <li>
                <a
                  href={`mailto:${profile.email}`}
                  className="hover:text-[#a3e635] transition-colors inline-flex items-center gap-1 text-[#bef264]"
                >
                  <span>{profile.email}</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-white/40">
          <p>© {currentYear} {profile.name}. All technical blueprints and articles reserved.</p>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1 text-[#a3e635]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#a3e635]" />
              Production Systems Active
            </span>
            <span>•</span>
            <Link href="/feed.xml" className="hover:underline">
              XML Feed
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

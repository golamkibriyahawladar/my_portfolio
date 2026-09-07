'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  User, 
  Briefcase, 
  FileText, 
  Wrench, 
  Sparkles, 
  Mail, 
  Key, 
  ExternalLink,
  LogOut
} from 'lucide-react'
import { signOut } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'

interface AdminSidebarProps {
  unreadMessagesCount?: number
}

export function AdminSidebar({ unreadMessagesCount = 0 }: AdminSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  const navItems = [
    { label: 'Dashboard', href: '/admin', icon: LayoutDashboard, exact: true },
    { label: 'Profile & Bio', href: '/admin/profile', icon: User },
    { label: 'Projects', href: '/admin/projects', icon: Briefcase },
    { label: 'Blog Posts', href: '/admin/blog', icon: FileText },
    { label: 'Services', href: '/admin/services', icon: Wrench },
    { label: 'Skills', href: '/admin/skills', icon: Sparkles },
    { 
      label: 'Messages', 
      href: '/admin/messages', 
      icon: Mail, 
      badge: unreadMessagesCount > 0 ? unreadMessagesCount : undefined 
    },
    { label: 'API Keys & cURL', href: '/admin/api-keys', icon: Key },
  ]

  const handleSignOut = async () => {
    await signOut()
    router.push('/admin/login')
  }

  return (
    <aside className="w-64 bg-[#0a0a0c] border-r border-white/10 flex flex-col shrink-0 min-h-screen">
      {/* Brand Header */}
      <div className="h-16 border-b border-white/10 px-6 flex items-center justify-between">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#a3e635]/15 border border-[#a3e635]/30 flex items-center justify-center font-mono font-bold text-[#a3e635] text-sm">
            GK
          </div>
          <div>
            <span className="font-semibold text-white tracking-tight text-sm block">Portfolio CMS</span>
            <span className="text-[10px] text-white/40 block font-mono">Control Panel</span>
          </div>
        </Link>
      </div>

      {/* Nav links */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = item.exact 
            ? pathname === item.href 
            : pathname === item.href || pathname.startsWith(`${item.href}/`)
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all group ${
                isActive
                  ? 'bg-[#a3e635]/10 text-[#a3e635] border border-[#a3e635]/20'
                  : 'text-white/60 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-[#a3e635]' : 'text-white/40 group-hover:text-white/80'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-[#a3e635] text-black">
                  {item.badge}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Footer / Quick Actions */}
      <div className="p-4 border-t border-white/10 space-y-2">
        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-between px-3 py-2 rounded-lg text-xs text-white/50 hover:text-white hover:bg-white/[0.04] transition-colors"
        >
          <span className="flex items-center gap-2">
            <ExternalLink className="w-3.5 h-3.5" />
            Live Site
          </span>
          <span className="text-[10px] text-white/30 font-mono">↗</span>
        </Link>

        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-red-400/70 hover:text-red-300 hover:bg-red-500/10 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign Out
        </button>
      </div>
    </aside>
  )
}

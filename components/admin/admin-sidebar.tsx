'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { 
  LayoutDashboard, 
  User, 
  Briefcase, 
  FileText, 
  Wrench, 
  Sparkles, 
  Mail, 
  Key, 
  Cpu,
  ExternalLink, 
  LogOut,
  Menu,
  X
} from 'lucide-react'
import { signOut } from '@/lib/auth-client'
import { motion, AnimatePresence } from 'framer-motion'

interface AdminSidebarProps {
  unreadMessagesCount?: number
}

export function AdminSidebar({ unreadMessagesCount = 0 }: AdminSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)

  // Auto-close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

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
    { label: 'MCP Server', href: '/admin/mcp', icon: Cpu },
  ]

  const handleSignOut = async () => {
    await signOut()
    router.push('/admin/login')
  }

  const navContent = (
    <>
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
        {mobileOpen && (
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="md:hidden p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/5"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        )}
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
              onClick={() => setMobileOpen(false)}
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
    </>
  )

  return (
    <>
      {/* Mobile Topbar */}
      <div className="md:hidden flex items-center justify-between h-14 px-4 bg-[#0a0a0c] border-b border-white/10 sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-[#a3e635]/15 border border-[#a3e635]/30 flex items-center justify-center font-mono font-bold text-[#a3e635] text-xs">
            GK
          </div>
          <span className="font-semibold text-white tracking-tight text-xs">Portfolio CMS</span>
        </div>
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/5 transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 md:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 280 }}
              className="fixed inset-y-0 left-0 w-72 bg-[#0a0a0c] border-r border-white/10 z-50 flex flex-col md:hidden"
            >
              {navContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:flex md:w-64 bg-[#0a0a0c] border-r border-white/10 flex-col shrink-0 min-h-screen">
        {navContent}
      </aside>
    </>
  )
}


'use client'

import React from 'react'

interface AdminHeaderProps {
  title: string
  description?: string
  action?: React.ReactNode
}

export function AdminHeader({ title, description, action }: AdminHeaderProps) {
  return (
    <header className="h-16 border-b border-white/10 px-8 flex items-center justify-between bg-[#0e0e11]/60 backdrop-blur-md sticky top-0 z-20">
      <div>
        <h1 className="text-base font-semibold text-white tracking-tight">{title}</h1>
        {description && <p className="text-xs text-white/50">{description}</p>}
      </div>
      {action && <div className="flex items-center gap-3">{action}</div>}
    </header>
  )
}

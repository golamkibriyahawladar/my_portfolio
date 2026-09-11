import React from 'react'
import { LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  badge?: string
}

export function StatCard({ title, value, subtitle, icon: Icon, badge }: StatCardProps) {
  return (
    <div className="p-5 rounded-xl border border-white/10 bg-[#121216]/80 hover:border-white/20 transition-all">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-white/50">{title}</span>
        <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/70">
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className="mt-4 flex items-baseline gap-2">
        <span className="text-2xl font-bold tracking-tight text-white">{value}</span>
        {badge && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#a3e635]/15 text-[#a3e635] font-semibold border border-[#a3e635]/30">
            {badge}
          </span>
        )}
      </div>
      {subtitle && <p className="mt-1 text-xs text-white/40">{subtitle}</p>}
    </div>
  )
}

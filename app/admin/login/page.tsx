'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signIn } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('golamkibriyahawladar@gmail.com')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await signIn.email({
        email,
        password,
      })

      if (res.error) {
        setError(res.error.message || 'Invalid email or password')
        setLoading(false)
        return
      }

      toast.success('Logged in successfully')
      router.push('/admin')
      router.refresh()
    } catch (err: any) {
      setError(err?.message || 'Something went wrong')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#070709] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#a3e635]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-sm relative z-10">
        {/* Card */}
        <div className="rounded-2xl border border-white/10 bg-[#0e0e12]/90 backdrop-blur-xl p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-xl bg-[#a3e635]/10 border border-[#a3e635]/30 mx-auto flex items-center justify-center text-[#a3e635]">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">Admin Login</h1>
            <p className="text-xs text-white/50">Enter your credentials to access the portfolio CMS</p>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-white/70">Email address</Label>
              <div className="relative">
                <Mail className="w-4 h-4 text-white/30 absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  type="email"
                  required
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9 bg-[#14141a] border-white/10 text-white text-xs h-10 focus-visible:border-[#a3e635]/50 focus-visible:ring-1 focus-visible:ring-[#a3e635]/30"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-white/70">Password</Label>
              <div className="relative">
                <Lock className="w-4 h-4 text-white/30 absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9 bg-[#14141a] border-white/10 text-white text-xs h-10 focus-visible:border-[#a3e635]/50 focus-visible:ring-1 focus-visible:ring-[#a3e635]/30"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-10 bg-[#a3e635] hover:bg-[#bef264] text-black font-semibold text-xs transition-all active:scale-[0.98]"
            >
              {loading ? (
                'Signing in...'
              ) : (
                <span className="flex items-center justify-center gap-1.5">
                  Sign In
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              )}
            </Button>
          </form>

          <div className="pt-3 text-center border-t border-white/5">
            <span className="text-[11px] text-white/30 font-mono">
              Protected CMS Area • Single Administrator
            </span>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link href="/" className="text-xs text-white/40 hover:text-white transition-colors">
            ← Back to portfolio
          </Link>
        </div>
      </div>
    </div>
  )
}

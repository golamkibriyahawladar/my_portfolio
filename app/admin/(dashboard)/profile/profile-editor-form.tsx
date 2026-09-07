'use client'

import React, { useState } from 'react'
import { Profile, SocialLink, Stat } from '@/lib/db/schema'
import { updateProfile } from '@/app/actions/admin'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Plus, Trash2, Save, Check } from 'lucide-react'
import { toast } from 'sonner'

interface ProfileEditorProps {
  initialProfile: Profile
}

export function ProfileEditorForm({ initialProfile }: ProfileEditorProps) {
  const [name, setName] = useState(initialProfile.name || '')
  const [role, setRole] = useState(initialProfile.role || '')
  const [tagline, setTagline] = useState(initialProfile.tagline || '')
  const [bio, setBio] = useState(initialProfile.bio || '')
  const [location, setLocation] = useState(initialProfile.location || '')
  const [email, setEmail] = useState(initialProfile.email || '')
  const [availability, setAvailability] = useState(initialProfile.availability || '')
  const [portrait, setPortrait] = useState(initialProfile.portrait || '')
  const [socials, setSocials] = useState<SocialLink[]>(initialProfile.socials || [])
  const [stats, setStats] = useState<Stat[]>(initialProfile.stats || [])
  const [saving, setSaving] = useState(false)

  // Social Links Helpers
  const addSocial = () => {
    setSocials([...socials, { label: '', href: '' }])
  }
  const updateSocial = (index: number, field: keyof SocialLink, value: string) => {
    const updated = [...socials]
    updated[index] = { ...updated[index], [field]: value }
    setSocials(updated)
  }
  const removeSocial = (index: number) => {
    setSocials(socials.filter((_, i) => i !== index))
  }

  // Stats Helpers
  const addStat = () => {
    setStats([...stats, { value: '', label: '' }])
  }
  const updateStat = (index: number, field: keyof Stat, value: string) => {
    const updated = [...stats]
    updated[index] = { ...updated[index], [field]: value }
    setStats(updated)
  }
  const removeStat = (index: number) => {
    setStats(stats.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      await updateProfile({
        name,
        role,
        tagline,
        bio,
        location,
        email,
        availability,
        portrait,
        socials: socials.filter((s) => s.label.trim() && s.href.trim()),
        stats: stats.filter((s) => s.value.trim() && s.label.trim()),
      })

      toast.success('Profile updated successfully!')
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
      {/* Basic Info */}
      <div className="rounded-xl border border-white/10 bg-[#121216]/60 p-6 space-y-4">
        <h3 className="text-sm font-semibold text-white">General Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs text-white/70">Full Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="bg-[#0c0c0f] border-white/10 text-white text-xs h-9"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-white/70">Role / Designation</Label>
            <Input
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
              placeholder="e.g. Senior AI Engineer & Full-Stack Architect"
              className="bg-[#0c0c0f] border-white/10 text-white text-xs h-9"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-white/70">Hero Tagline</Label>
          <Input
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            required
            className="bg-[#0c0c0f] border-white/10 text-white text-xs h-9"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-white/70">Full Bio</Label>
          <Textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            required
            rows={4}
            className="bg-[#0c0c0f] border-white/10 text-white text-xs leading-relaxed"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs text-white/70">Location</Label>
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="bg-[#0c0c0f] border-white/10 text-white text-xs h-9"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-white/70">Contact Email</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-[#0c0c0f] border-white/10 text-white text-xs h-9"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-white/70">Availability Status</Label>
            <Input
              value={availability}
              onChange={(e) => setAvailability(e.target.value)}
              placeholder="Available for contracts"
              className="bg-[#0c0c0f] border-white/10 text-white text-xs h-9"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-white/70">Portrait Image URL</Label>
          <Input
            value={portrait}
            onChange={(e) => setPortrait(e.target.value)}
            placeholder="/portrait.png or https://..."
            className="bg-[#0c0c0f] border-white/10 text-white text-xs h-9 font-mono"
          />
        </div>
      </div>

      {/* Stats Counter */}
      <div className="rounded-xl border border-white/10 bg-[#121216]/60 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white">Highlighted Stats</h3>
            <p className="text-xs text-white/50">Experience metrics shown on the hero and about section</p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addStat}
            className="border-white/10 text-xs text-white hover:bg-white/5 gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Stat
          </Button>
        </div>

        <div className="space-y-2">
          {stats.map((stat, i) => (
            <div key={i} className="flex items-center gap-3">
              <Input
                value={stat.value}
                onChange={(e) => updateStat(i, 'value', e.target.value)}
                placeholder="e.g. 6+"
                className="w-32 bg-[#0c0c0f] border-white/10 text-white text-xs h-9 font-mono"
              />
              <Input
                value={stat.label}
                onChange={(e) => updateStat(i, 'label', e.target.value)}
                placeholder="e.g. Years experience"
                className="flex-1 bg-[#0c0c0f] border-white/10 text-white text-xs h-9"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeStat(i)}
                className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-2 h-9"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Social Links */}
      <div className="rounded-xl border border-white/10 bg-[#121216]/60 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white">Social & Profile Links</h3>
            <p className="text-xs text-white/50">Links to GitHub, LinkedIn, Twitter/X, etc.</p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addSocial}
            className="border-white/10 text-xs text-white hover:bg-white/5 gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Link
          </Button>
        </div>

        <div className="space-y-2">
          {socials.map((social, i) => (
            <div key={i} className="flex items-center gap-3">
              <Input
                value={social.label}
                onChange={(e) => updateSocial(i, 'label', e.target.value)}
                placeholder="e.g. GitHub"
                className="w-40 bg-[#0c0c0f] border-white/10 text-white text-xs h-9"
              />
              <Input
                value={social.href}
                onChange={(e) => updateSocial(i, 'href', e.target.value)}
                placeholder="https://..."
                className="flex-1 bg-[#0c0c0f] border-white/10 text-white text-xs h-9 font-mono"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeSocial(i)}
                className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-2 h-9"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Save action */}
      <div className="sticky bottom-6 flex justify-end">
        <Button
          type="submit"
          disabled={saving}
          className="bg-[#a3e635] text-black hover:bg-[#bef264] text-xs font-semibold px-6 h-10 shadow-lg shadow-[#a3e635]/10 gap-2"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving changes...' : 'Save Profile Changes'}
        </Button>
      </div>
    </form>
  )
}

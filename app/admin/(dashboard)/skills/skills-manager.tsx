'use client'

import React, { useState } from 'react'
import { Skill } from '@/lib/db/schema'
import { createSkill, deleteSkill } from '@/app/actions/admin'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Plus, X, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface SkillsManagerProps {
  initialSkills: Skill[]
}

export function SkillsManager({ initialSkills }: SkillsManagerProps) {
  const router = useRouter()
  const [skills, setSkills] = useState<Skill[]>(initialSkills)
  const [newSkillName, setNewSkillName] = useState('')
  const [loading, setLoading] = useState(false)

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault()
    const name = newSkillName.trim()
    if (!name) return

    setLoading(true)
    try {
      await createSkill(name)
      setSkills([...skills, { id: Date.now(), name, sortOrder: skills.length }])
      setNewSkillName('')
      toast.success(`Added "${name}"`)
      router.refresh()
    } catch {
      toast.error('Failed to add skill')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteSkill = async (skill: Skill) => {
    try {
      await deleteSkill(skill.id)
      setSkills(skills.filter((s) => s.id !== skill.id))
      toast.success(`Removed "${skill.name}"`)
      router.refresh()
    } catch {
      toast.error('Failed to remove skill')
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Add Skill Bar */}
      <form onSubmit={handleAddSkill} className="flex gap-2">
        <Input
          value={newSkillName}
          onChange={(e) => setNewSkillName(e.target.value)}
          placeholder="e.g. PyTorch, Kubernetes, LangChain, Next.js..."
          className="bg-[#0c0c0f] border-white/10 text-white text-xs h-10 flex-1"
        />
        <Button
          type="submit"
          disabled={loading || !newSkillName.trim()}
          className="bg-[#a3e635] text-black hover:bg-[#bef264] text-xs font-semibold px-4 h-10 gap-1.5"
        >
          <Plus className="w-4 h-4" />
          Add Skill
        </Button>
      </form>

      {/* Skills Badges Container */}
      <div className="rounded-xl border border-white/10 bg-[#121216]/60 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#a3e635]" />
            Active Technical Skills ({skills.length})
          </h3>
          <span className="text-[11px] text-white/40">Click the X icon to remove</span>
        </div>

        {skills.length === 0 ? (
          <p className="text-xs text-white/40 py-4 text-center">No skills added yet.</p>
        ) : (
          <div className="flex flex-wrap gap-2 pt-2">
            {skills.map((skill) => (
              <span
                key={skill.id}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#1a1a22] border border-white/10 text-white/90 group hover:border-[#a3e635]/40 transition-all"
              >
                <span>{skill.name}</span>
                <button
                  type="button"
                  onClick={() => handleDeleteSkill(skill)}
                  className="text-white/30 hover:text-red-400 transition-colors"
                  title={`Delete ${skill.name}`}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

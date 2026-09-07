'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Project } from '@/lib/db/schema'
import { createProject, updateProject } from '@/app/actions/admin'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { TagInput } from '@/components/admin/tag-input'
import { MarkdownEditor } from '@/components/admin/markdown-editor'
import { Save, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import slugify from 'slugify'

interface ProjectFormProps {
  initialData?: Project
}

export function ProjectForm({ initialData }: ProjectFormProps) {
  const router = useRouter()
  const isEditing = Boolean(initialData)

  const [title, setTitle] = useState(initialData?.title || '')
  const [slug, setSlug] = useState(initialData?.slug || '')
  const [category, setCategory] = useState(initialData?.category || 'AI & Full-Stack')
  const [year, setYear] = useState(initialData?.year || new Date().getFullYear().toString())
  const [description, setDescription] = useState(initialData?.description || '')
  const [content, setContent] = useState(initialData?.content || '')
  const [stack, setStack] = useState<string[]>(initialData?.stack || ['Next.js', 'TypeScript', 'TailwindCSS'])
  const [image, setImage] = useState(initialData?.image || '/projects/ai-support-agent.png')
  const [result, setResult] = useState(initialData?.result || '')
  const [liveUrl, setLiveUrl] = useState(initialData?.liveUrl || '')
  const [repoUrl, setRepoUrl] = useState(initialData?.repoUrl || '')
  const [featured, setFeatured] = useState(initialData?.featured ?? true)
  const [published, setPublished] = useState(initialData?.published ?? true)
  const [saving, setSaving] = useState(false)

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setTitle(val)
    if (!isEditing) {
      setSlug(slugify(val, { lower: true, strict: true }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      if (isEditing && initialData) {
        await updateProject(initialData.id, {
          slug,
          title,
          category,
          year,
          description,
          content,
          stack,
          image,
          result: result || undefined,
          liveUrl: liveUrl || null,
          repoUrl: repoUrl || null,
          featured,
          published,
        })
        toast.success('Project updated successfully!')
      } else {
        await createProject({
          slug,
          title,
          category,
          year,
          description,
          content,
          stack,
          image,
          result: result || undefined,
          liveUrl: liveUrl || null,
          repoUrl: repoUrl || null,
          featured,
          published,
        })
        toast.success('Project created successfully!')
      }

      router.push('/admin/projects')
      router.refresh()
    } catch (err: any) {
      toast.error(err?.message || 'Failed to save project')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
      <div className="flex items-center justify-between">
        <Link
          href="/admin/projects"
          className="inline-flex items-center gap-1.5 text-xs text-white/50 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to all projects
        </Link>
        <Button
          type="submit"
          disabled={saving}
          className="bg-[#a3e635] text-black hover:bg-[#bef264] text-xs font-semibold px-5 h-9 gap-1.5"
        >
          <Save className="w-3.5 h-3.5" />
          {saving ? 'Saving...' : isEditing ? 'Update Project' : 'Create Project'}
        </Button>
      </div>

      <div className="rounded-xl border border-white/10 bg-[#121216]/60 p-6 space-y-4">
        <h3 className="text-sm font-semibold text-white">Project Information</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs text-white/70">Project Title</Label>
            <Input
              value={title}
              onChange={handleTitleChange}
              required
              placeholder="e.g. AI Customer Support Agent"
              className="bg-[#0c0c0f] border-white/10 text-white text-xs h-9"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-white/70">URL Slug</Label>
            <Input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              required
              placeholder="e.g. ai-customer-support-agent"
              className="bg-[#0c0c0f] border-white/10 text-white text-xs h-9 font-mono"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs text-white/70">Category</Label>
            <Input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              placeholder="e.g. AI / Automation"
              className="bg-[#0c0c0f] border-white/10 text-white text-xs h-9"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-white/70">Year</Label>
            <Input
              value={year}
              onChange={(e) => setYear(e.target.value)}
              required
              placeholder="2026"
              className="bg-[#0c0c0f] border-white/10 text-white text-xs h-9 font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-white/70">Highlight / Result</Label>
            <Input
              value={result}
              onChange={(e) => setResult(e.target.value)}
              placeholder="e.g. 74% automated resolution"
              className="bg-[#0c0c0f] border-white/10 text-white text-xs h-9"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-white/70">Short Summary</Label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={2}
            placeholder="Brief 1-2 sentence description shown in cards"
            className="bg-[#0c0c0f] border-white/10 text-white text-xs leading-relaxed"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-white/70">Project Cover Image URL</Label>
          <Input
            value={image}
            onChange={(e) => setImage(e.target.value)}
            required
            placeholder="/projects/your-project.png"
            className="bg-[#0c0c0f] border-white/10 text-white text-xs h-9 font-mono"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs text-white/70">Live Website URL (Optional)</Label>
            <Input
              value={liveUrl}
              onChange={(e) => setLiveUrl(e.target.value)}
              placeholder="https://..."
              className="bg-[#0c0c0f] border-white/10 text-white text-xs h-9 font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-white/70">GitHub / Code Repository URL (Optional)</Label>
            <Input
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              placeholder="https://github.com/..."
              className="bg-[#0c0c0f] border-white/10 text-white text-xs h-9 font-mono"
            />
          </div>
        </div>

        {/* Tech Stack */}
        <TagInput
          label="Technologies & Tools (Tech Stack)"
          value={stack}
          onChange={setStack}
          placeholder="Add tech (e.g. Next.js) and press Enter..."
        />

        {/* Visibility Toggles */}
        <div className="pt-2 flex flex-wrap gap-8">
          <div className="flex items-center gap-3">
            <Switch
              id="featured-switch"
              checked={featured}
              onCheckedChange={setFeatured}
            />
            <Label htmlFor="featured-switch" className="text-xs text-white/80 cursor-pointer">
              Featured on Homepage
            </Label>
          </div>

          <div className="flex items-center gap-3">
            <Switch
              id="published-switch"
              checked={published}
              onCheckedChange={setPublished}
            />
            <Label htmlFor="published-switch" className="text-xs text-white/80 cursor-pointer">
              Published (Visible to public)
            </Label>
          </div>
        </div>
      </div>

      {/* Case Study Markdown Content */}
      <div className="rounded-xl border border-white/10 bg-[#121216]/60 p-6 space-y-4">
        <h3 className="text-sm font-semibold text-white">Full Case Study / Project Write-up</h3>
        <p className="text-xs text-white/50">
          Detailed write-up displayed on the project page (`/work/{slug}`). Markdown is supported.
        </p>

        <MarkdownEditor
          value={content}
          onChange={setContent}
          rows={16}
          placeholder="## The Challenge&#10;&#10;Explain the problem...&#10;&#10;## The Architecture&#10;&#10;How it was built..."
        />
      </div>
    </form>
  )
}

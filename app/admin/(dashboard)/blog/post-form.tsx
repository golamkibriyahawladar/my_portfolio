'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Post } from '@/lib/db/schema'
import { createPost, updatePost } from '@/app/actions/admin'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { TagInput } from '@/components/admin/tag-input'
import { MarkdownEditor } from '@/components/admin/markdown-editor'
import { ImageUpload } from '@/components/admin/image-upload'
import { Save, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import slugify from 'slugify'

interface PostFormProps {
  initialData?: Post
}

export function PostForm({ initialData }: PostFormProps) {
  const router = useRouter()
  const isEditing = Boolean(initialData)

  const [title, setTitle] = useState(initialData?.title || '')
  const [slug, setSlug] = useState(initialData?.slug || '')
  const [category, setCategory] = useState(initialData?.category || 'AI & Automation')
  const [excerpt, setExcerpt] = useState(initialData?.excerpt || '')
  const [content, setContent] = useState(initialData?.content || '')
  const [cover, setCover] = useState(initialData?.cover || '/projects/ai-support-agent.png')
  const [tags, setTags] = useState<string[]>(initialData?.tags || ['AI', 'Tech'])
  const [published, setPublished] = useState(initialData?.published ?? false)
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
        await updatePost(initialData.id, {
          slug,
          title,
          category,
          excerpt,
          content,
          cover: cover || null,
          tags,
          published,
        })
        toast.success('Post updated successfully!')
      } else {
        await createPost({
          slug,
          title,
          category,
          excerpt,
          content,
          cover: cover || null,
          tags,
          published,
        })
        toast.success('Post created successfully!')
      }

      router.push('/admin/blog')
      router.refresh()
    } catch (err: any) {
      toast.error(err?.message || 'Failed to save post')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
      <div className="flex items-center justify-between">
        <Link
          href="/admin/blog"
          className="inline-flex items-center gap-1.5 text-xs text-white/50 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to all posts
        </Link>
        <Button
          type="submit"
          disabled={saving}
          className="bg-[#a3e635] text-black hover:bg-[#bef264] text-xs font-semibold px-5 h-9 gap-1.5"
        >
          <Save className="w-3.5 h-3.5" />
          {saving ? 'Saving...' : isEditing ? 'Update Post' : 'Publish / Save'}
        </Button>
      </div>

      <div className="rounded-xl border border-white/10 bg-[#121216]/60 p-6 space-y-4">
        <h3 className="text-sm font-semibold text-white">Post Metadata & GEO Information</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs text-white/70">Post Title</Label>
            <Input
              value={title}
              onChange={handleTitleChange}
              required
              placeholder="e.g. Generative Engine Optimization: How to Rank in ChatGPT"
              className="bg-[#0c0c0f] border-white/10 text-white text-xs h-9"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-white/70">URL Slug</Label>
            <Input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              required
              placeholder="e.g. generative-engine-optimization-guide"
              className="bg-[#0c0c0f] border-white/10 text-white text-xs h-9 font-mono"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-white/70">Category</Label>
          <Input
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
            placeholder="e.g. AI & Automation, Web Development, GEO"
            className="bg-[#0c0c0f] border-white/10 text-white text-xs h-9"
          />
        </div>

        <ImageUpload
          label="Article Cover Image"
          value={cover}
          onChange={setCover}
          helperText="Upload a featured image from your device or paste a URL"
        />

        <div className="space-y-1.5">
          <Label className="text-xs text-white/70">Excerpt / Meta Description (SEO & GEO summary)</Label>
          <Textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            required
            rows={2}
            placeholder="A compelling 1-2 sentence summary that search engines and AI models cite..."
            className="bg-[#0c0c0f] border-white/10 text-white text-xs leading-relaxed"
          />
        </div>

        {/* Tags */}
        <TagInput
          label="Tags / Topic Keywords"
          value={tags}
          onChange={setTags}
          placeholder="Add tag (e.g. GEO, SEO, LLM) and press Enter..."
        />

        {/* Published Switch */}
        <div className="pt-2 flex items-center gap-3">
          <Switch
            id="post-published-switch"
            checked={published}
            onCheckedChange={setPublished}
          />
          <Label htmlFor="post-published-switch" className="text-xs text-white/80 cursor-pointer">
            Publish post live on `/blog/{slug}`
          </Label>
        </div>
      </div>

      {/* Markdown Content Editor */}
      <div className="rounded-xl border border-white/10 bg-[#121216]/60 p-6 space-y-4">
        <h3 className="text-sm font-semibold text-white">Article Content (Markdown)</h3>
        <p className="text-xs text-white/50">
          Write using headings (`##`), code blocks (` ```ts `), bold keywords, and bullet points to maximize AI engine citations.
        </p>

        <MarkdownEditor
          value={content}
          onChange={setContent}
          rows={20}
          placeholder="## Introduction&#10;&#10;Start with a clear, authoritative direct answer for GEO...&#10;&#10;## Key takeaways&#10;&#10;- Point 1&#10;- Point 2"
        />
      </div>
    </form>
  )
}

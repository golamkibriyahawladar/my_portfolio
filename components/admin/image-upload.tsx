'use client'

import React, { useState, useRef } from 'react'
import Image from 'next/image'
import { Upload, Check, Loader2, Image as ImageIcon, Link as LinkIcon } from 'lucide-react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface ImageUploadProps {
  label: string
  value: string
  onChange: (url: string) => void
  helperText?: string
}

export function ImageUpload({ label, value, onChange, helperText }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to upload image')
      }

      onChange(data.url)
      toast.success('Image uploaded successfully!')
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || 'Image upload failed')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-xs text-white/70">{label}</Label>
        {value && (
          <span className="text-[10px] font-mono text-[#a3e635] flex items-center gap-1">
            <Check className="w-3 h-3" /> Image set
          </span>
        )}
      </div>

      <div className="flex flex-col sm:flex-row items-start gap-4">
        {/* Preview box */}
        <div className="relative w-28 h-20 rounded-lg border border-white/10 bg-white/5 overflow-hidden shrink-0 flex items-center justify-center">
          {value ? (
            <Image
              src={value}
              alt="Preview"
              fill
              className="object-cover"
              sizes="112px"
            />
          ) : (
            <ImageIcon className="w-6 h-6 text-white/20" />
          )}
        </div>

        {/* Upload & text input */}
        <div className="flex-1 w-full space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif"
              className="hidden"
            />
            <button
              type="button"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 text-xs font-medium text-white transition-all disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#a3e635]" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-3.5 h-3.5 text-[#a3e635]" />
                  Upload from PC
                </>
              )}
            </button>
            <span className="text-[11px] text-white/40 font-mono">or paste URL below</span>
          </div>

          <div className="relative">
            <LinkIcon className="w-3.5 h-3.5 text-white/30 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <Input
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="/uploads/my-photo.png or https://..."
              className="pl-8 bg-white/5 border-white/10 text-xs text-white"
            />
          </div>
        </div>
      </div>

      {helperText && <p className="text-[11px] text-white/40">{helperText}</p>}
    </div>
  )
}

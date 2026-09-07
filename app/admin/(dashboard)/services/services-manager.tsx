'use client'

import React, { useState } from 'react'
import { Service } from '@/lib/db/schema'
import { createService, updateService, deleteService } from '@/app/actions/admin'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { TagInput } from '@/components/admin/tag-input'
import { ConfirmDialog } from '@/components/admin/confirm-dialog'
import { Plus, Edit2, Trash2, Save, X, Wrench } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface ServicesManagerProps {
  initialServices: Service[]
}

export function ServicesManager({ initialServices }: ServicesManagerProps) {
  const router = useRouter()
  const [services, setServices] = useState<Service[]>(initialServices)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Service | null>(null)
  const [loading, setLoading] = useState(false)

  // Form states
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [items, setItems] = useState<string[]>([])

  const startEdit = (service: Service) => {
    setEditingId(service.id)
    setIsAddingNew(false)
    setTitle(service.title)
    setDescription(service.description)
    setItems(service.items || [])
  }

  const startAdd = () => {
    setIsAddingNew(true)
    setEditingId(null)
    setTitle('')
    setDescription('')
    setItems([])
  }

  const cancelForm = () => {
    setIsAddingNew(false)
    setEditingId(null)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (isAddingNew) {
        await createService({
          title,
          description,
          items,
        })
        toast.success('Service created successfully')
      } else if (editingId) {
        await updateService(editingId, {
          title,
          description,
          items,
        })
        toast.success('Service updated successfully')
      }

      router.refresh()
      cancelForm()
    } catch {
      toast.error('Failed to save service')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setLoading(true)

    try {
      await deleteService(deleteTarget.id)
      setServices(services.filter((s) => s.id !== deleteTarget.id))
      toast.success('Service deleted')
      router.refresh()
    } catch {
      toast.error('Failed to delete service')
    } finally {
      setLoading(false)
      setDeleteTarget(null)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <span className="text-xs text-white/50">
          {services.length} services configured
        </span>
        {!isAddingNew && (
          <Button
            size="sm"
            onClick={startAdd}
            className="bg-[#a3e635] text-black hover:bg-[#bef264] text-xs font-semibold gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Add New Service
          </Button>
        )}
      </div>

      {/* Inline Form (Add or Edit) */}
      {(isAddingNew || editingId !== null) && (
        <form
          onSubmit={handleSave}
          className="rounded-xl border border-[#a3e635]/30 bg-[#121216] p-6 space-y-4 shadow-xl"
        >
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Wrench className="w-4 h-4 text-[#a3e635]" />
              {isAddingNew ? 'Add Service' : 'Edit Service'}
            </h3>
            <button
              type="button"
              onClick={cancelForm}
              className="text-white/40 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-white/70">Service Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="e.g. AI System Architecture"
              className="bg-[#0c0c0f] border-white/10 text-white text-xs h-9"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-white/70">Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={2}
              placeholder="What you deliver in this offering..."
              className="bg-[#0c0c0f] border-white/10 text-white text-xs"
            />
          </div>

          <TagInput
            label="Service Deliverables / Bullet Points"
            value={items}
            onChange={setItems}
            placeholder="Add deliverable (e.g. RAG pipelines) and press Enter..."
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={cancelForm}
              className="border-white/10 text-white text-xs hover:bg-white/5"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={loading}
              className="bg-[#a3e635] text-black hover:bg-[#bef264] text-xs font-semibold gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              {loading ? 'Saving...' : 'Save Service'}
            </Button>
          </div>
        </form>
      )}

      {/* Services List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {services.map((service) => (
          <div
            key={service.id}
            className="rounded-xl border border-white/10 bg-[#121216]/60 p-5 space-y-3 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <h4 className="text-sm font-semibold text-white">{service.title}</h4>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => startEdit(service)}
                    className="p-1 rounded text-white/40 hover:text-[#a3e635] hover:bg-white/5"
                    title="Edit"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(service)}
                    className="p-1 rounded text-red-400/60 hover:text-red-300 hover:bg-red-500/10"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <p className="text-xs text-white/60 mt-2 leading-relaxed">{service.description}</p>
            </div>

            <div className="pt-2 border-t border-white/5 flex flex-wrap gap-1.5">
              {service.items?.map((item, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded text-[11px] bg-white/5 text-white/70 border border-white/5"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Service?"
        description={`Are you sure you want to delete "${deleteTarget?.title}"?`}
        confirmText="Delete"
        destructive
        loading={loading}
        onConfirm={handleDelete}
      />
    </div>
  )
}

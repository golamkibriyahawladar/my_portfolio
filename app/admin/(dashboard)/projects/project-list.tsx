'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Project } from '@/lib/db/schema'
import { deleteProject, toggleProjectPublished, toggleProjectFeatured } from '@/app/actions/admin'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/admin/confirm-dialog'
import { Edit2, Trash2, ExternalLink, Plus, Star, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface ProjectListProps {
  initialProjects: Project[]
}

export function ProjectList({ initialProjects }: ProjectListProps) {
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>(initialProjects)
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null)
  const [deleting, setDeleting] = useState(false)

  const handleTogglePublish = async (project: Project) => {
    const nextState = !project.published
    try {
      await toggleProjectPublished(project.id, nextState)
      setProjects(projects.map((p) => (p.id === project.id ? { ...p, published: nextState } : p)))
      toast.success(nextState ? 'Project published' : 'Project unpublished')
    } catch {
      toast.error('Failed to update project status')
    }
  }

  const handleToggleFeatured = async (project: Project) => {
    const nextState = !project.featured
    try {
      await toggleProjectFeatured(project.id, nextState)
      setProjects(projects.map((p) => (p.id === project.id ? { ...p, featured: nextState } : p)))
      toast.success(nextState ? 'Added to featured' : 'Removed from featured')
    } catch {
      toast.error('Failed to update featured status')
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deleteProject(deleteTarget.id)
      setProjects(projects.filter((p) => p.id !== deleteTarget.id))
      toast.success('Project deleted successfully')
      router.refresh()
    } catch {
      toast.error('Failed to delete project')
    } finally {
      setDeleting(false)
      setDeleteTarget(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <span className="text-xs text-white/50">
          Showing {projects.length} {projects.length === 1 ? 'project' : 'projects'}
        </span>
        <Link href="/admin/projects/new">
          <Button size="sm" className="bg-[#a3e635] text-black hover:bg-[#bef264] text-xs font-semibold gap-1.5">
            <Plus className="w-3.5 h-3.5" />
            Add New Project
          </Button>
        </Link>
      </div>

      <div className="rounded-xl border border-white/10 bg-[#121216]/60 overflow-hidden">
        {projects.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <p className="text-sm text-white/50">No projects in database yet.</p>
            <Link href="/admin/projects/new">
              <Button size="sm" className="bg-[#a3e635] text-black text-xs font-medium">
                Add your first project
              </Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-white/10 bg-white/[0.02] text-white/50">
                <tr>
                  <th className="py-3 px-4 font-medium">Project</th>
                  <th className="py-3 px-4 font-medium">Category</th>
                  <th className="py-3 px-4 font-medium">Year</th>
                  <th className="py-3 px-4 font-medium text-center">Featured</th>
                  <th className="py-3 px-4 font-medium text-center">Status</th>
                  <th className="py-3 px-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-white/80">
                {projects.map((project) => (
                  <tr key={project.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white">{project.title}</div>
                      <div className="text-[11px] text-white/40 font-mono mt-0.5">/work/{project.slug}</div>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-white/60">{project.category}</td>
                    <td className="py-3 px-4 font-mono text-[11px] text-white/60">{project.year}</td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleToggleFeatured(project)}
                        className={`p-1.5 rounded transition-colors ${
                          project.featured
                            ? 'text-amber-400 hover:text-amber-300'
                            : 'text-white/20 hover:text-white/50'
                        }`}
                        title={project.featured ? 'Featured on Home' : 'Not featured'}
                      >
                        <Star className="w-4 h-4" fill={project.featured ? 'currentColor' : 'none'} />
                      </button>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleTogglePublish(project)}
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium border transition-colors ${
                          project.published
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20'
                        }`}
                      >
                        {project.published ? (
                          <>
                            <Eye className="w-3 h-3" /> Published
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3 h-3" /> Draft
                          </>
                        )}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/work/${project.slug}`}
                          target="_blank"
                          className="p-1.5 rounded text-white/40 hover:text-white hover:bg-white/5 transition-colors"
                          title="View live"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                        <Link
                          href={`/admin/projects/${project.id}`}
                          className="p-1.5 rounded text-white/40 hover:text-[#a3e635] hover:bg-white/5 transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => setDeleteTarget(project)}
                          className="p-1.5 rounded text-red-400/60 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Project?"
        description={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
        confirmText="Delete Project"
        destructive
        loading={deleting}
        onConfirm={handleDelete}
      />
    </div>
  )
}

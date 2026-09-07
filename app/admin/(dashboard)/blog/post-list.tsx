'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Post } from '@/lib/db/schema'
import { deletePost, togglePostPublished } from '@/app/actions/admin'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/admin/confirm-dialog'
import { Edit2, Trash2, ExternalLink, Plus, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface PostListProps {
  initialPosts: Post[]
}

export function PostList({ initialPosts }: PostListProps) {
  const router = useRouter()
  const [posts, setPosts] = useState<Post[]>(initialPosts)
  const [deleteTarget, setDeleteTarget] = useState<Post | null>(null)
  const [deleting, setDeleting] = useState(false)

  const handleTogglePublish = async (post: Post) => {
    const nextState = !post.published
    try {
      await togglePostPublished(post.id, nextState)
      setPosts(posts.map((p) => (p.id === post.id ? { ...p, published: nextState } : p)))
      toast.success(nextState ? 'Post published' : 'Post moved to drafts')
    } catch {
      toast.error('Failed to update post status')
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deletePost(deleteTarget.id)
      setPosts(posts.filter((p) => p.id !== deleteTarget.id))
      toast.success('Post deleted successfully')
      router.refresh()
    } catch {
      toast.error('Failed to delete post')
    } finally {
      setDeleting(false)
      setDeleteTarget(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <span className="text-xs text-white/50">
          Showing {posts.length} {posts.length === 1 ? 'post' : 'posts'}
        </span>
        <Link href="/admin/blog/new">
          <Button size="sm" className="bg-[#a3e635] text-black hover:bg-[#bef264] text-xs font-semibold gap-1.5">
            <Plus className="w-3.5 h-3.5" />
            Add New Post
          </Button>
        </Link>
      </div>

      <div className="rounded-xl border border-white/10 bg-[#121216]/60 overflow-hidden">
        {posts.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <p className="text-sm text-white/50">No blog posts found.</p>
            <Link href="/admin/blog/new">
              <Button size="sm" className="bg-[#a3e635] text-black text-xs font-medium">
                Write your first article
              </Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-white/10 bg-white/[0.02] text-white/50">
                <tr>
                  <th className="py-3 px-4 font-medium">Title</th>
                  <th className="py-3 px-4 font-medium">Category</th>
                  <th className="py-3 px-4 font-medium">Tags</th>
                  <th className="py-3 px-4 font-medium text-center">Status</th>
                  <th className="py-3 px-4 font-medium">Date</th>
                  <th className="py-3 px-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-white/80">
                {posts.map((post) => (
                  <tr key={post.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-4 max-w-[280px]">
                      <div className="font-semibold text-white truncate">{post.title}</div>
                      <div className="text-[11px] text-white/40 font-mono truncate mt-0.5">/blog/{post.slug}</div>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-white/60">
                      {post.category || 'General'}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {post.tags?.slice(0, 3).map((tag, i) => (
                          <span
                            key={i}
                            className="px-1.5 py-0.5 rounded text-[10px] bg-white/5 text-white/60 border border-white/5"
                          >
                            {tag}
                          </span>
                        ))}
                        {post.tags && post.tags.length > 3 && (
                          <span className="text-[10px] text-white/40">+{post.tags.length - 3}</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleTogglePublish(post)}
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium border transition-colors ${
                          post.published
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20'
                        }`}
                      >
                        {post.published ? (
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
                    <td className="py-3 px-4 font-mono text-[11px] text-white/40 whitespace-nowrap">
                      {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {post.published && (
                          <Link
                            href={`/blog/${post.slug}`}
                            target="_blank"
                            className="p-1.5 rounded text-white/40 hover:text-white hover:bg-white/5 transition-colors"
                            title="View live article"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                        )}
                        <Link
                          href={`/admin/blog/${post.id}`}
                          className="p-1.5 rounded text-white/40 hover:text-[#a3e635] hover:bg-white/5 transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => setDeleteTarget(post)}
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
        title="Delete Post?"
        description={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
        confirmText="Delete Post"
        destructive
        loading={deleting}
        onConfirm={handleDelete}
      />
    </div>
  )
}

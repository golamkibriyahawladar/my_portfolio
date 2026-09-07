import { notFound } from 'next/navigation'
import { getPostById } from '@/lib/content'
import { AdminHeader } from '@/components/admin/admin-header'
import { PostForm } from '../post-form'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditPostPage({ params }: PageProps) {
  const { id } = await params
  const numericId = parseInt(id, 10)
  if (isNaN(numericId)) notFound()

  const post = await getPostById(numericId)
  if (!post) notFound()

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader
        title={`Edit: ${post.title}`}
        description="Update article content, metadata, or GEO parameters"
      />
      <div className="p-8">
        <PostForm initialData={post} />
      </div>
    </div>
  )
}

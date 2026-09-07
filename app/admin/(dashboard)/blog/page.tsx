import { getAllPosts } from '@/lib/content'
import { AdminHeader } from '@/components/admin/admin-header'
import { PostList } from './post-list'

export const dynamic = 'force-dynamic'

export default async function AdminBlogPage() {
  const posts = await getAllPosts()

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader
        title="Blog Posts (GEO & SEO)"
        description="Publish, edit, and organize AI-optimized articles for generative search engines"
      />
      <div className="p-8">
        <PostList initialPosts={posts} />
      </div>
    </div>
  )
}

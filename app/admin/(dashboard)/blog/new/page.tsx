import { AdminHeader } from '@/components/admin/admin-header'
import { PostForm } from '../post-form'

export default function NewPostPage() {
  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader
        title="Write New Article"
        description="Draft a new technical article with Generative Engine Optimization"
      />
      <div className="p-8">
        <PostForm />
      </div>
    </div>
  )
}

import { getAllProjects } from '@/lib/content'
import { AdminHeader } from '@/components/admin/admin-header'
import { ProjectList } from './project-list'

export const dynamic = 'force-dynamic'

export default async function AdminProjectsPage() {
  const projects = await getAllProjects()

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader
        title="Projects"
        description="Manage your portfolio showcase items, case studies, live links, and stacks"
      />
      <div className="p-8">
        <ProjectList initialProjects={projects} />
      </div>
    </div>
  )
}

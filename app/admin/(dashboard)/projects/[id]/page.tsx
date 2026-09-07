import { notFound } from 'next/navigation'
import { getProjectById } from '@/lib/content'
import { AdminHeader } from '@/components/admin/admin-header'
import { ProjectForm } from '../project-form'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditProjectPage({ params }: PageProps) {
  const { id } = await params
  const numericId = parseInt(id, 10)
  if (isNaN(numericId)) notFound()

  const project = await getProjectById(numericId)
  if (!project) notFound()

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader
        title={`Edit: ${project.title}`}
        description="Update project details, stack tags, or full case study write-up"
      />
      <div className="p-8">
        <ProjectForm initialData={project} />
      </div>
    </div>
  )
}

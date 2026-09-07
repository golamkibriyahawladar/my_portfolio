import { AdminHeader } from '@/components/admin/admin-header'
import { ProjectForm } from '../project-form'

export default function NewProjectPage() {
  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader
        title="Add New Project"
        description="Create a new portfolio project or case study"
      />
      <div className="p-8">
        <ProjectForm />
      </div>
    </div>
  )
}

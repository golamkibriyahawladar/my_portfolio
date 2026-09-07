import { getProfile } from '@/lib/content'
import { AdminHeader } from '@/components/admin/admin-header'
import { ProfileEditorForm } from './profile-editor-form'

export const dynamic = 'force-dynamic'

export default async function AdminProfilePage() {
  const profile = await getProfile()

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader
        title="Profile & Bio"
        description="Update your personal details, designations, social accounts, and statistics"
      />
      <div className="p-8">
        <ProfileEditorForm initialProfile={profile} />
      </div>
    </div>
  )
}

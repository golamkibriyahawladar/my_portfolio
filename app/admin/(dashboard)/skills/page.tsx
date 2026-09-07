import { getSkills } from '@/lib/content'
import { AdminHeader } from '@/components/admin/admin-header'
import { SkillsManager } from './skills-manager'

export const dynamic = 'force-dynamic'

export default async function AdminSkillsPage() {
  const skills = await getSkills()

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader
        title="Technical Skills"
        description="Add, remove, or rearrange technical capabilities showcased across your portfolio"
      />
      <div className="p-8">
        <SkillsManager initialSkills={skills} />
      </div>
    </div>
  )
}

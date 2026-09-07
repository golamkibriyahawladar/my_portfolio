import { getServices } from '@/lib/content'
import { AdminHeader } from '@/components/admin/admin-header'
import { ServicesManager } from './services-manager'

export const dynamic = 'force-dynamic'

export default async function AdminServicesPage() {
  const services = await getServices()

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader
        title="Services & Offerings"
        description="Manage the service packages, engineering capabilities, and deliverables displayed on the homepage"
      />
      <div className="p-8">
        <ServicesManager initialServices={services} />
      </div>
    </div>
  )
}

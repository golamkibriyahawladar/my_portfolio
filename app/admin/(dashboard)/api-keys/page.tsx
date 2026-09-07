import { getApiKeys } from '@/app/actions/admin'
import { AdminHeader } from '@/components/admin/admin-header'
import { ApiKeysClient } from './api-keys-client'

export const dynamic = 'force-dynamic'

export default async function AdminApiKeysPage() {
  const keys = await getApiKeys()
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader
        title="API Access & Automation"
        description="Manage secret API keys and copy ready-made cURL requests for programmatic publishing"
      />
      <div className="p-8">
        <ApiKeysClient initialKeys={keys} baseUrl={baseUrl} />
      </div>
    </div>
  )
}

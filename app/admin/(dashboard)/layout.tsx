import { requireAdmin } from '@/lib/session'
import { getDb, schema } from '@/lib/db'
import { eq, count } from 'drizzle-orm'
import { AdminSidebar } from '@/components/admin/admin-sidebar'

export const dynamic = 'force-dynamic'

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireAdmin()

  let unreadCount = 0
  try {
    const db = getDb()
    const [row] = await db
      .select({ val: count() })
      .from(schema.messages)
      .where(eq(schema.messages.read, false))
    unreadCount = Number(row?.val ?? 0)
  } catch (err) {
    console.error('Failed to fetch unread messages count', err)
  }

  return (
    <div className="min-h-screen bg-[#070709] text-white flex flex-col md:flex-row">
      <AdminSidebar unreadMessagesCount={unreadCount} />
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}

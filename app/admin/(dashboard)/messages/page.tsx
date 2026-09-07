import { getMessages } from '@/lib/content'
import { AdminHeader } from '@/components/admin/admin-header'
import { MessagesInbox } from './messages-inbox'

export const dynamic = 'force-dynamic'

export default async function AdminMessagesPage() {
  const messages = await getMessages()

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader
        title="Inquiries & Messages"
        description="Review inbound client inquiries, project requests, and communication sent through your portfolio"
      />
      <div className="p-8">
        <MessagesInbox initialMessages={messages} />
      </div>
    </div>
  )
}

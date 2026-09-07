import Link from 'next/link'
import { getDb, schema } from '@/lib/db'
import { count, eq, desc } from 'drizzle-orm'
import { AdminHeader } from '@/components/admin/admin-header'
import { StatCard } from '@/components/admin/stat-card'
import { 
  Briefcase, 
  FileText, 
  Mail, 
  Key, 
  Plus, 
  ArrowRight,
  ExternalLink,
  Clock,
  Sparkles
} from 'lucide-react'
import { Button } from '@/components/ui/button'

export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  const db = getDb()

  const [
    [projectCount],
    [publishedProjectCount],
    [postCount],
    [publishedPostCount],
    [messageCount],
    [unreadMessageCount],
    [apiKeyCount],
    recentPosts,
    recentMessages,
  ] = await Promise.all([
    db.select({ val: count() }).from(schema.projects),
    db.select({ val: count() }).from(schema.projects).where(eq(schema.projects.published, true)),
    db.select({ val: count() }).from(schema.posts),
    db.select({ val: count() }).from(schema.posts).where(eq(schema.posts.published, true)),
    db.select({ val: count() }).from(schema.messages),
    db.select({ val: count() }).from(schema.messages).where(eq(schema.messages.read, false)),
    db.select({ val: count() }).from(schema.apiKeys),
    db.select().from(schema.posts).orderBy(desc(schema.posts.updatedAt)).limit(4),
    db.select().from(schema.messages).orderBy(desc(schema.messages.createdAt)).limit(4),
  ])

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader
        title="Dashboard"
        description="Overview of your portfolio content, inquiries, and API integrations"
        action={
          <div className="flex items-center gap-2">
            <Link href="/admin/blog/new">
              <Button size="sm" className="bg-[#a3e635] text-black hover:bg-[#bef264] text-xs font-semibold gap-1.5">
                <Plus className="w-3.5 h-3.5" />
                New Post
              </Button>
            </Link>
            <Link href="/admin/projects/new">
              <Button size="sm" variant="outline" className="border-white/10 text-white hover:bg-white/5 text-xs gap-1.5">
                <Plus className="w-3.5 h-3.5" />
                New Project
              </Button>
            </Link>
          </div>
        }
      />

      <div className="p-8 space-y-8 max-w-7xl w-full">
        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Projects"
            value={projectCount?.val ?? 0}
            subtitle={`${publishedProjectCount?.val ?? 0} published live`}
            icon={Briefcase}
            badge={`${publishedProjectCount?.val ?? 0} Live`}
          />
          <StatCard
            title="Blog Posts"
            value={postCount?.val ?? 0}
            subtitle={`${publishedPostCount?.val ?? 0} published articles`}
            icon={FileText}
            badge="GEO Ready"
          />
          <StatCard
            title="Inquiries"
            value={messageCount?.val ?? 0}
            subtitle={`${unreadMessageCount?.val ?? 0} unread`}
            icon={Mail}
            badge={unreadMessageCount?.val ? `${unreadMessageCount.val} New` : undefined}
          />
          <StatCard
            title="API Keys"
            value={apiKeyCount?.val ?? 0}
            subtitle="External posting integrations"
            icon={Key}
            badge="Active"
          />
        </div>

        {/* Quick Actions banner */}
        <div className="p-6 rounded-2xl border border-[#a3e635]/20 bg-gradient-to-r from-[#a3e635]/5 via-transparent to-transparent flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <Sparkles className="w-4 h-4 text-[#a3e635]" />
              Blog Automation & GEO API Active
            </div>
            <p className="text-xs text-white/60">
              You can publish blog posts directly from external scripts, n8n, or curl commands using your API key.
            </p>
          </div>
          <Link href="/admin/api-keys">
            <Button size="sm" className="bg-[#a3e635] text-black hover:bg-[#bef264] text-xs font-semibold">
              View Ready cURL Commands →
            </Button>
          </Link>
        </div>

        {/* Two-column layout: Recent Posts & Recent Inquiries */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Posts */}
          <div className="rounded-xl border border-white/10 bg-[#121216]/60 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-white/50" />
                Recent Blog Posts
              </h2>
              <Link href="/admin/blog" className="text-xs text-[#a3e635] hover:underline flex items-center gap-1">
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {recentPosts.length === 0 ? (
              <p className="text-xs text-white/40 py-6 text-center">No posts found. Create your first post!</p>
            ) : (
              <div className="divide-y divide-white/5">
                {recentPosts.map((post) => (
                  <div key={post.id} className="py-3 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <Link
                        href={`/admin/blog/${post.id}`}
                        className="text-xs font-medium text-white hover:text-[#a3e635] transition-colors truncate block"
                      >
                        {post.title}
                      </Link>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-white/40 font-mono">
                          {post.category || 'General'}
                        </span>
                        <span className="text-white/20">•</span>
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded ${
                            post.published
                              ? 'text-emerald-400 bg-emerald-500/10'
                              : 'text-amber-400 bg-amber-500/10'
                          }`}
                        >
                          {post.published ? 'Published' : 'Draft'}
                        </span>
                      </div>
                    </div>
                    <Link
                      href={`/admin/blog/${post.id}`}
                      className="text-[11px] text-white/40 hover:text-white shrink-0"
                    >
                      Edit →
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Inquiries */}
          <div className="rounded-xl border border-white/10 bg-[#121216]/60 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <Mail className="w-4 h-4 text-white/50" />
                Recent Inquiries
              </h2>
              <Link href="/admin/messages" className="text-xs text-[#a3e635] hover:underline flex items-center gap-1">
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {recentMessages.length === 0 ? (
              <p className="text-xs text-white/40 py-6 text-center">No messages yet.</p>
            ) : (
              <div className="divide-y divide-white/5">
                {recentMessages.map((msg) => (
                  <div key={msg.id} className="py-3 flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-white truncate">{msg.name}</span>
                        {!msg.read && (
                          <span className="w-2 h-2 rounded-full bg-[#a3e635] shrink-0" title="Unread" />
                        )}
                      </div>
                      <p className="text-[11px] text-white/50 truncate mt-0.5">{msg.subject || msg.body}</p>
                      <span className="text-[10px] text-white/30 font-mono mt-1 block">
                        {new Date(msg.createdAt).toLocaleDateString()} • {msg.email}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

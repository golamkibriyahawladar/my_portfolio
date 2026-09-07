import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { count } from 'drizzle-orm'
import { getAuth, isAuthConfigured } from '@/lib/auth'
import { getDb, schema } from '@/lib/db'

export async function getSession() {
  if (!isAuthConfigured) return null
  return getAuth().api.getSession({ headers: await headers() })
}

export async function requireAdmin() {
  const session = await getSession()
  if (!session?.user) redirect('/admin/login')
  return session
}

export async function adminExists() {
  if (!isAuthConfigured) return false
  const [row] = await getDb().select({ value: count() }).from(schema.user)
  return (row?.value ?? 0) > 0
}

'use server'

import { revalidatePath } from 'next/cache'
import { eq, desc, asc } from 'drizzle-orm'
import { getDb, schema } from '@/lib/db'
import { requireAdmin } from '@/lib/session'
import type { SocialLink, Stat } from '@/lib/db/schema'
import crypto from 'crypto'

// ==================== PROFILE ====================
export async function updateProfile(data: {
  name: string
  role: string
  tagline: string
  bio: string
  location: string
  email: string
  availability: string
  portrait?: string | null
  socials: SocialLink[]
  stats: Stat[]
}) {
  await requireAdmin()
  const db = getDb()

  await db
    .insert(schema.profile)
    .values({
      id: 1,
      name: data.name,
      role: data.role,
      tagline: data.tagline,
      bio: data.bio,
      location: data.location,
      email: data.email,
      availability: data.availability,
      portrait: data.portrait ?? null,
      socials: data.socials,
      stats: data.stats,
    })
    .onDuplicateKeyUpdate({
      set: {
        name: data.name,
        role: data.role,
        tagline: data.tagline,
        bio: data.bio,
        location: data.location,
        email: data.email,
        availability: data.availability,
        portrait: data.portrait ?? null,
        socials: data.socials,
        stats: data.stats,
      },
    })

  revalidatePath('/', 'layout')
  return { success: true }
}

// ==================== PROJECTS ====================
export async function createProject(data: {
  slug: string
  title: string
  category: string
  year: string
  description: string
  content?: string
  stack: string[]
  image: string
  result?: string
  liveUrl?: string | null
  repoUrl?: string | null
  featured?: boolean
  published?: boolean
}) {
  await requireAdmin()
  const db = getDb()

  const [res] = await db.insert(schema.projects).values({
    slug: data.slug,
    title: data.title,
    category: data.category,
    year: data.year,
    description: data.description,
    content: data.content ?? null,
    stack: data.stack,
    image: data.image,
    result: data.result ?? null,
    liveUrl: data.liveUrl || null,
    repoUrl: data.repoUrl || null,
    featured: data.featured ?? true,
    published: data.published ?? true,
  })

  revalidatePath('/', 'layout')
  revalidatePath('/work')
  return { success: true, id: res.insertId }
}

export async function updateProject(
  id: number,
  data: {
    slug: string
    title: string
    category: string
    year: string
    description: string
    content?: string
    stack: string[]
    image: string
    result?: string
    liveUrl?: string | null
    repoUrl?: string | null
    featured?: boolean
    published?: boolean
  }
) {
  await requireAdmin()
  const db = getDb()

  await db
    .update(schema.projects)
    .set({
      slug: data.slug,
      title: data.title,
      category: data.category,
      year: data.year,
      description: data.description,
      content: data.content ?? null,
      stack: data.stack,
      image: data.image,
      result: data.result ?? null,
      liveUrl: data.liveUrl || null,
      repoUrl: data.repoUrl || null,
      featured: data.featured ?? true,
      published: data.published ?? true,
    })
    .where(eq(schema.projects.id, id))

  revalidatePath('/', 'layout')
  revalidatePath('/work')
  revalidatePath(`/work/${data.slug}`)
  return { success: true }
}

export async function deleteProject(id: number) {
  await requireAdmin()
  const db = getDb()

  await db.delete(schema.projects).where(eq(schema.projects.id, id))

  revalidatePath('/', 'layout')
  revalidatePath('/work')
  return { success: true }
}

export async function toggleProjectPublished(id: number, published: boolean) {
  await requireAdmin()
  const db = getDb()

  await db.update(schema.projects).set({ published }).where(eq(schema.projects.id, id))

  revalidatePath('/', 'layout')
  revalidatePath('/work')
  return { success: true }
}

export async function toggleProjectFeatured(id: number, featured: boolean) {
  await requireAdmin()
  const db = getDb()

  await db.update(schema.projects).set({ featured }).where(eq(schema.projects.id, id))

  revalidatePath('/', 'layout')
  return { success: true }
}

// ==================== BLOG POSTS ====================
export async function createPost(data: {
  slug: string
  title: string
  excerpt: string
  content: string
  cover?: string | null
  category?: string
  tags: string[]
  published?: boolean
  publishedAt?: Date | null
}) {
  await requireAdmin()
  const db = getDb()

  const [res] = await db.insert(schema.posts).values({
    slug: data.slug,
    title: data.title,
    excerpt: data.excerpt,
    content: data.content,
    cover: data.cover ?? null,
    category: data.category || 'General',
    tags: data.tags,
    published: data.published ?? false,
    publishedAt: data.published ? (data.publishedAt ?? new Date()) : null,
  })

  revalidatePath('/', 'layout')
  revalidatePath('/blog')
  return { success: true, id: res.insertId }
}

export async function updatePost(
  id: number,
  data: {
    slug: string
    title: string
    excerpt: string
    content: string
    cover?: string | null
    category?: string
    tags: string[]
    published?: boolean
    publishedAt?: Date | null
  }
) {
  await requireAdmin()
  const db = getDb()

  await db
    .update(schema.posts)
    .set({
      slug: data.slug,
      title: data.title,
      excerpt: data.excerpt,
      content: data.content,
      cover: data.cover ?? null,
      category: data.category || 'General',
      tags: data.tags,
      published: data.published ?? false,
      publishedAt: data.published ? (data.publishedAt ?? new Date()) : null,
    })
    .where(eq(schema.posts.id, id))

  revalidatePath('/', 'layout')
  revalidatePath('/blog')
  revalidatePath(`/blog/${data.slug}`)
  return { success: true }
}

export async function deletePost(id: number) {
  await requireAdmin()
  const db = getDb()

  await db.delete(schema.posts).where(eq(schema.posts.id, id))

  revalidatePath('/', 'layout')
  revalidatePath('/blog')
  return { success: true }
}

export async function togglePostPublished(id: number, published: boolean) {
  await requireAdmin()
  const db = getDb()

  await db
    .update(schema.posts)
    .set({
      published,
      publishedAt: published ? new Date() : null,
    })
    .where(eq(schema.posts.id, id))

  revalidatePath('/', 'layout')
  revalidatePath('/blog')
  return { success: true }
}

// ==================== SERVICES ====================
export async function createService(data: {
  title: string
  description: string
  items: string[]
  sortOrder?: number
}) {
  await requireAdmin()
  const db = getDb()

  await db.insert(schema.services).values({
    title: data.title,
    description: data.description,
    items: data.items,
    sortOrder: data.sortOrder ?? 0,
  })

  revalidatePath('/', 'layout')
  return { success: true }
}

export async function updateService(
  id: number,
  data: {
    title: string
    description: string
    items: string[]
    sortOrder?: number
  }
) {
  await requireAdmin()
  const db = getDb()

  await db
    .update(schema.services)
    .set({
      title: data.title,
      description: data.description,
      items: data.items,
      sortOrder: data.sortOrder ?? 0,
    })
    .where(eq(schema.services.id, id))

  revalidatePath('/', 'layout')
  return { success: true }
}

export async function deleteService(id: number) {
  await requireAdmin()
  const db = getDb()

  await db.delete(schema.services).where(eq(schema.services.id, id))

  revalidatePath('/', 'layout')
  return { success: true }
}

// ==================== SKILLS ====================
export async function createSkill(name: string) {
  await requireAdmin()
  const db = getDb()

  await db.insert(schema.skills).values({
    name: name.trim(),
    sortOrder: 0,
  })

  revalidatePath('/', 'layout')
  return { success: true }
}

export async function deleteSkill(id: number) {
  await requireAdmin()
  const db = getDb()

  await db.delete(schema.skills).where(eq(schema.skills.id, id))

  revalidatePath('/', 'layout')
  return { success: true }
}

// ==================== MESSAGES ====================
export async function markMessageRead(id: number, read: boolean) {
  await requireAdmin()
  const db = getDb()

  await db.update(schema.messages).set({ read }).where(eq(schema.messages.id, id))
  revalidatePath('/admin', 'layout')
  revalidatePath('/admin/messages')
  return { success: true }
}

export async function deleteMessage(id: number) {
  await requireAdmin()
  const db = getDb()

  await db.delete(schema.messages).where(eq(schema.messages.id, id))
  revalidatePath('/admin', 'layout')
  revalidatePath('/admin/messages')
  return { success: true }
}

// ==================== API KEYS ====================
export async function createApiKey(name: string) {
  await requireAdmin()
  const db = getDb()

  // Generate secure random key: sk_ + 48 hex chars
  const rawKey = `sk_${crypto.randomBytes(24).toString('hex')}`

  const [res] = await db.insert(schema.apiKeys).values({
    name: name.trim(),
    key: rawKey,
  })

  return { success: true, id: res.insertId, key: rawKey }
}

export async function deleteApiKey(id: number) {
  await requireAdmin()
  const db = getDb()

  await db.delete(schema.apiKeys).where(eq(schema.apiKeys.id, id))
  return { success: true }
}

export async function getApiKeys() {
  await requireAdmin()
  const db = getDb()

  return db.select().from(schema.apiKeys).orderBy(desc(schema.apiKeys.createdAt))
}

export async function generateAutomationJwt(name: string = 'n8n-automation', expiresIn: string = '365d') {
  try {
    await requireAdmin()
    const { signJwt, verifyJwt } = await import('@/lib/jwt')
    const token = signJwt(
      {
        sub: 'admin',
        name: name.trim() || 'n8n-automation',
        scope: 'blog:read blog:write',
        issuer: 'portfolio-cms',
      },
      undefined,
      expiresIn
    )

    const verification = verifyJwt(token)
    return {
      success: true,
      token,
      authHeader: `Bearer ${token}`,
      expiresAt: verification.payload?.exp
        ? new Date(verification.payload.exp * 1000).toISOString()
        : 'never',
    }
  } catch (err: any) {
    if (err?.digest?.startsWith('NEXT_REDIRECT') || err?.message?.includes('NEXT_REDIRECT')) {
      throw err
    }
    return {
      success: false,
      error: err?.message || 'Failed to generate JWT token. Please check BETTER_AUTH_SECRET in environment variables.',
    }
  }
}

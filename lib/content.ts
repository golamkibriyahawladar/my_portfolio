import { and, asc, desc, eq } from 'drizzle-orm'
import { getDb, isDatabaseConfigured, schema } from '@/lib/db'
import type { Post, Profile, Project, Service, SocialLink, Stat } from '@/lib/db/schema'
import {
  demoPostRows,
  demoProfile,
  demoProjectRows,
  demoServiceRows,
  demoSkillRows,
} from '@/lib/demo-content'

export const usingDemoContent = !isDatabaseConfigured

function parseJson<T>(value: any, fallback: T): T {
  if (!value) return fallback
  if (Array.isArray(value) || typeof value === 'object') return value as T
  if (typeof value === 'string') {
    try {
      return JSON.parse(value) as T
    } catch {
      return fallback
    }
  }
  return fallback
}

function normalizeProfile(p: any): Profile {
  if (!p) return demoProfile
  return {
    ...p,
    socials: parseJson<SocialLink[]>(p.socials, demoProfile.socials),
    stats: parseJson<Stat[]>(p.stats, demoProfile.stats),
  }
}

function normalizeProject(p: any): Project {
  if (!p) return p
  return {
    ...p,
    stack: parseJson<string[]>(p.stack, []),
  }
}

function normalizePost(p: any): Post {
  if (!p) return p
  return {
    ...p,
    tags: parseJson<string[]>(p.tags, []),
  }
}

function normalizeService(s: any): Service {
  if (!s) return s
  return {
    ...s,
    items: parseJson<string[]>(s.items, []),
  }
}

export async function getProfile(): Promise<Profile> {
  if (!isDatabaseConfigured) return demoProfile
  const db = getDb()
  const [row] = await db.select().from(schema.profile).where(eq(schema.profile.id, 1)).limit(1)
  return normalizeProfile(row)
}

export async function getSkills() {
  if (!isDatabaseConfigured) return demoSkillRows
  return getDb().select().from(schema.skills).orderBy(asc(schema.skills.sortOrder))
}

export async function getServices(): Promise<Service[]> {
  if (!isDatabaseConfigured) return demoServiceRows
  const rows = await getDb().select().from(schema.services).orderBy(asc(schema.services.sortOrder))
  return rows.map(normalizeService)
}

export async function getPublishedProjects(): Promise<Project[]> {
  if (!isDatabaseConfigured) return demoProjectRows
  const rows = await getDb()
    .select()
    .from(schema.projects)
    .where(eq(schema.projects.published, true))
    .orderBy(asc(schema.projects.sortOrder), desc(schema.projects.createdAt))
  return rows.map(normalizeProject)
}

export async function getAllProjects(): Promise<Project[]> {
  if (!isDatabaseConfigured) return demoProjectRows
  const rows = await getDb()
    .select()
    .from(schema.projects)
    .orderBy(asc(schema.projects.sortOrder), desc(schema.projects.createdAt))
  return rows.map(normalizeProject)
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  if (!isDatabaseConfigured) return demoProjectRows.find((project) => project.slug === slug) ?? null
  const [row] = await getDb()
    .select()
    .from(schema.projects)
    .where(and(eq(schema.projects.slug, slug), eq(schema.projects.published, true)))
    .limit(1)
  return row ? normalizeProject(row) : null
}

export async function getProjectById(id: number): Promise<Project | null> {
  if (!isDatabaseConfigured) return demoProjectRows.find((project) => project.id === id) ?? null
  const [row] = await getDb().select().from(schema.projects).where(eq(schema.projects.id, id)).limit(1)
  return row ? normalizeProject(row) : null
}

export async function getPublishedPosts(): Promise<Post[]> {
  if (!isDatabaseConfigured) return demoPostRows
  const rows = await getDb()
    .select()
    .from(schema.posts)
    .where(eq(schema.posts.published, true))
    .orderBy(desc(schema.posts.publishedAt))
  return rows.map(normalizePost)
}

export async function getAllPosts(): Promise<Post[]> {
  if (!isDatabaseConfigured) return demoPostRows
  const rows = await getDb().select().from(schema.posts).orderBy(desc(schema.posts.updatedAt))
  return rows.map(normalizePost)
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  if (!isDatabaseConfigured) return demoPostRows.find((post) => post.slug === slug) ?? null
  const [row] = await getDb()
    .select()
    .from(schema.posts)
    .where(and(eq(schema.posts.slug, slug), eq(schema.posts.published, true)))
    .limit(1)
  return row ? normalizePost(row) : null
}

export async function getPostById(id: number): Promise<Post | null> {
  if (!isDatabaseConfigured) return demoPostRows.find((post) => post.id === id) ?? null
  const [row] = await getDb().select().from(schema.posts).where(eq(schema.posts.id, id)).limit(1)
  return row ? normalizePost(row) : null
}

export async function getMessages() {
  if (!isDatabaseConfigured) return []
  return getDb().select().from(schema.messages).orderBy(desc(schema.messages.createdAt))
}

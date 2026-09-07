import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { eq, desc } from 'drizzle-orm'
import { getDb, schema } from '@/lib/db'
import { verifyApiAuth } from '@/lib/api-auth'
import { revalidatePath } from 'next/cache'
import slugify from 'slugify'

const createProjectSchema = z.object({
  title: z.string().min(1).max(200),
  slug: z.string().max(160).optional(),
  category: z.string().min(1).max(80),
  year: z.string().min(1).max(8),
  description: z.string().min(1),
  content: z.string().optional().nullable(),
  stack: z.array(z.string()).min(1),
  image: z.string().min(1),
  result: z.string().max(120).optional().nullable(),
  liveUrl: z.string().optional().nullable(),
  repoUrl: z.string().optional().nullable(),
  featured: z.boolean().optional().default(true),
  published: z.boolean().optional().default(true),
})

// GET /api/projects — List all projects
export async function GET(request: NextRequest) {
  const auth = await verifyApiAuth()
  const db = getDb()

  if (auth.authenticated) {
    const projects = await db.select().from(schema.projects).orderBy(desc(schema.projects.createdAt))
    return NextResponse.json({ success: true, count: projects.length, data: projects })
  }

  const projects = await db
    .select()
    .from(schema.projects)
    .where(eq(schema.projects.published, true))
    .orderBy(desc(schema.projects.createdAt))

  return NextResponse.json({ success: true, count: projects.length, data: projects })
}

// POST /api/projects — Create new project (requires API key)
export async function POST(request: NextRequest) {
  const auth = await verifyApiAuth()
  if (!auth.authenticated) return auth.response

  try {
    const json = await request.json()
    const parsed = createProjectSchema.safeParse(json)

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: parsed.error.format() },
        { status: 400 }
      )
    }

    const {
      title,
      slug: customSlug,
      category,
      year,
      description,
      content,
      stack,
      image,
      result,
      liveUrl,
      repoUrl,
      featured,
      published,
    } = parsed.data

    const slug = customSlug?.trim() || slugify(title, { lower: true, strict: true })
    const db = getDb()

    const [existing] = await db
      .select({ id: schema.projects.id })
      .from(schema.projects)
      .where(eq(schema.projects.slug, slug))
      .limit(1)

    const finalSlug = existing ? `${slug}-${Date.now()}` : slug

    const [res] = await db.insert(schema.projects).values({
      slug: finalSlug,
      title,
      category,
      year,
      description,
      content: content ?? null,
      stack,
      image,
      result: result ?? null,
      liveUrl: liveUrl || null,
      repoUrl: repoUrl || null,
      featured,
      published,
    })

    revalidatePath('/', 'layout')
    revalidatePath('/work')
    revalidatePath(`/work/${finalSlug}`)

    const [created] = await db
      .select()
      .from(schema.projects)
      .where(eq(schema.projects.id, res.insertId))
      .limit(1)

    return NextResponse.json(
      {
        success: true,
        message: 'Project created successfully',
        data: created,
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Failed to create project via API:', error)
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to create project' },
      { status: 500 }
    )
  }
}

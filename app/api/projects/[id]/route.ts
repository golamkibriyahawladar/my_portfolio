import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { eq, or } from 'drizzle-orm'
import { getDb, schema } from '@/lib/db'
import { verifyApiAuth } from '@/lib/api-auth'
import { revalidatePath } from 'next/cache'

const updateProjectSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  slug: z.string().max(160).optional(),
  category: z.string().max(80).optional(),
  year: z.string().max(8).optional(),
  description: z.string().min(1).optional(),
  content: z.string().optional().nullable(),
  stack: z.array(z.string()).optional(),
  image: z.string().optional(),
  result: z.string().max(120).optional().nullable(),
  liveUrl: z.string().optional().nullable(),
  repoUrl: z.string().optional().nullable(),
  featured: z.boolean().optional(),
  published: z.boolean().optional(),
})

interface RouteContext {
  params: Promise<{ id: string }>
}

// GET /api/projects/:id — Fetch single project by ID or Slug
export async function GET(request: NextRequest, { params }: RouteContext) {
  const { id } = await params
  const db = getDb()
  const numericId = parseInt(id, 10)

  const [project] = await db
    .select()
    .from(schema.projects)
    .where(
      isNaN(numericId)
        ? eq(schema.projects.slug, id)
        : or(eq(schema.projects.id, numericId), eq(schema.projects.slug, id))
    )
    .limit(1)

  if (!project) {
    return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 })
  }

  return NextResponse.json({ success: true, data: project })
}

// PUT /api/projects/:id — Update project (requires API key)
export async function PUT(request: NextRequest, { params }: RouteContext) {
  const auth = await verifyApiAuth()
  if (!auth.authenticated) return auth.response

  const { id } = await params
  const numericId = parseInt(id, 10)
  if (isNaN(numericId)) {
    return NextResponse.json({ success: false, error: 'Invalid project ID' }, { status: 400 })
  }

  try {
    const json = await request.json()
    const parsed = updateProjectSchema.safeParse(json)

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: parsed.error.format() },
        { status: 400 }
      )
    }

    const db = getDb()
    const [existing] = await db
      .select()
      .from(schema.projects)
      .where(eq(schema.projects.id, numericId))
      .limit(1)

    if (!existing) {
      return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 })
    }

    await db.update(schema.projects).set(parsed.data).where(eq(schema.projects.id, numericId))

    revalidatePath('/', 'layout')
    revalidatePath('/work')
    revalidatePath(`/work/${existing.slug}`)
    if (parsed.data.slug) revalidatePath(`/work/${parsed.data.slug}`)

    const [updated] = await db
      .select()
      .from(schema.projects)
      .where(eq(schema.projects.id, numericId))
      .limit(1)

    return NextResponse.json({
      success: true,
      message: 'Project updated successfully',
      data: updated,
    })
  } catch (error: any) {
    console.error('Failed to update project via API:', error)
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to update project' },
      { status: 500 }
    )
  }
}

// DELETE /api/projects/:id — Delete project (requires API key)
export async function DELETE(request: NextRequest, { params }: RouteContext) {
  const auth = await verifyApiAuth()
  if (!auth.authenticated) return auth.response

  const { id } = await params
  const numericId = parseInt(id, 10)
  if (isNaN(numericId)) {
    return NextResponse.json({ success: false, error: 'Invalid project ID' }, { status: 400 })
  }

  const db = getDb()
  const [existing] = await db
    .select()
    .from(schema.projects)
    .where(eq(schema.projects.id, numericId))
    .limit(1)

  if (!existing) {
    return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 })
  }

  await db.delete(schema.projects).where(eq(schema.projects.id, numericId))

  revalidatePath('/', 'layout')
  revalidatePath('/work')
  revalidatePath(`/work/${existing.slug}`)

  return NextResponse.json({
    success: true,
    message: `Project "${existing.title}" deleted successfully`,
  })
}

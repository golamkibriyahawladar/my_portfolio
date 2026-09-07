import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { eq, or } from 'drizzle-orm'
import { getDb, schema } from '@/lib/db'
import { verifyApiAuth } from '@/lib/api-auth'
import { revalidatePath } from 'next/cache'

const updatePostSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  slug: z.string().max(160).optional(),
  category: z.string().max(80).optional(),
  excerpt: z.string().min(1).optional(),
  content: z.string().min(1).optional(),
  cover: z.string().optional().nullable(),
  tags: z.array(z.string()).optional(),
  published: z.boolean().optional(),
  publishedAt: z.string().optional().nullable(),
})

interface RouteContext {
  params: Promise<{ id: string }>
}

// GET /api/blog/:id — Fetch single post by ID or Slug
export async function GET(request: NextRequest, { params }: RouteContext) {
  const { id } = await params
  const db = getDb()
  const numericId = parseInt(id, 10)

  const [post] = await db
    .select()
    .from(schema.posts)
    .where(
      isNaN(numericId)
        ? eq(schema.posts.slug, id)
        : or(eq(schema.posts.id, numericId), eq(schema.posts.slug, id))
    )
    .limit(1)

  if (!post) {
    return NextResponse.json({ success: false, error: 'Post not found' }, { status: 404 })
  }

  return NextResponse.json({ success: true, data: post })
}

// PUT /api/blog/:id — Update post (requires API key)
export async function PUT(request: NextRequest, { params }: RouteContext) {
  const auth = await verifyApiAuth()
  if (!auth.authenticated) return auth.response

  const { id } = await params
  const numericId = parseInt(id, 10)
  if (isNaN(numericId)) {
    return NextResponse.json({ success: false, error: 'Invalid post ID' }, { status: 400 })
  }

  try {
    const json = await request.json()
    const parsed = updatePostSchema.safeParse(json)

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: parsed.error.format() },
        { status: 400 }
      )
    }

    const db = getDb()
    const [existing] = await db
      .select()
      .from(schema.posts)
      .where(eq(schema.posts.id, numericId))
      .limit(1)

    if (!existing) {
      return NextResponse.json({ success: false, error: 'Post not found' }, { status: 404 })
    }

    const updateData: any = {}
    if (parsed.data.title !== undefined) updateData.title = parsed.data.title
    if (parsed.data.slug !== undefined) updateData.slug = parsed.data.slug
    if (parsed.data.category !== undefined) updateData.category = parsed.data.category
    if (parsed.data.excerpt !== undefined) updateData.excerpt = parsed.data.excerpt
    if (parsed.data.content !== undefined) updateData.content = parsed.data.content
    if (parsed.data.cover !== undefined) updateData.cover = parsed.data.cover
    if (parsed.data.tags !== undefined) updateData.tags = parsed.data.tags
    if (parsed.data.published !== undefined) {
      updateData.published = parsed.data.published
      if (parsed.data.published && !existing.publishedAt) {
        updateData.publishedAt = new Date()
      }
    }
    if (parsed.data.publishedAt !== undefined) {
      updateData.publishedAt = parsed.data.publishedAt ? new Date(parsed.data.publishedAt) : null
    }

    await db.update(schema.posts).set(updateData).where(eq(schema.posts.id, numericId))

    revalidatePath('/', 'layout')
    revalidatePath('/blog')
    revalidatePath(`/blog/${existing.slug}`)
    if (updateData.slug) revalidatePath(`/blog/${updateData.slug}`)

    const [updated] = await db
      .select()
      .from(schema.posts)
      .where(eq(schema.posts.id, numericId))
      .limit(1)

    return NextResponse.json({
      success: true,
      message: 'Post updated successfully',
      data: updated,
    })
  } catch (error: any) {
    console.error('Failed to update post via API:', error)
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to update post' },
      { status: 500 }
    )
  }
}

// DELETE /api/blog/:id — Delete post (requires API key)
export async function DELETE(request: NextRequest, { params }: RouteContext) {
  const auth = await verifyApiAuth()
  if (!auth.authenticated) return auth.response

  const { id } = await params
  const numericId = parseInt(id, 10)
  if (isNaN(numericId)) {
    return NextResponse.json({ success: false, error: 'Invalid post ID' }, { status: 400 })
  }

  const db = getDb()
  const [existing] = await db
    .select()
    .from(schema.posts)
    .where(eq(schema.posts.id, numericId))
    .limit(1)

  if (!existing) {
    return NextResponse.json({ success: false, error: 'Post not found' }, { status: 404 })
  }

  await db.delete(schema.posts).where(eq(schema.posts.id, numericId))

  revalidatePath('/', 'layout')
  revalidatePath('/blog')
  revalidatePath(`/blog/${existing.slug}`)

  return NextResponse.json({
    success: true,
    message: `Post "${existing.title}" deleted successfully`,
  })
}

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { eq, desc } from 'drizzle-orm'
import { getDb, schema } from '@/lib/db'
import { verifyApiAuth } from '@/lib/api-auth'
import { revalidatePath } from 'next/cache'
import slugify from 'slugify'

const createPostSchema = z.object({
  title: z.string().min(1).max(200),
  slug: z.string().max(160).optional(),
  category: z.string().max(80).optional().default('General'),
  excerpt: z.string().min(1),
  content: z.string().min(1),
  cover: z.string().optional().nullable(),
  tags: z.array(z.string()).optional().default([]),
  published: z.boolean().optional().default(false),
  publishedAt: z.string().optional().nullable(),
})

// GET /api/blog — List all posts
export async function GET(request: NextRequest) {
  const auth = await verifyApiAuth()
  const db = getDb()

  // If authenticated with API key, return all posts (including drafts)
  // Otherwise, return only published posts
  if (auth.authenticated) {
    const posts = await db.select().from(schema.posts).orderBy(desc(schema.posts.createdAt))
    return NextResponse.json({ success: true, count: posts.length, data: posts })
  }

  // Public view: published only
  const posts = await db
    .select()
    .from(schema.posts)
    .where(eq(schema.posts.published, true))
    .orderBy(desc(schema.posts.publishedAt))

  return NextResponse.json({ success: true, count: posts.length, data: posts })
}

// POST /api/blog — Create new post (requires API key)
export async function POST(request: NextRequest) {
  const auth = await verifyApiAuth()
  if (!auth.authenticated) {
    return auth.response
  }

  try {
    const json = await request.json()
    const parsed = createPostSchema.safeParse(json)

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
      excerpt,
      content,
      cover,
      tags,
      published,
      publishedAt,
    } = parsed.data

    const slug = customSlug?.trim() || slugify(title, { lower: true, strict: true })
    const db = getDb()

    // Check slug uniqueness
    const [existing] = await db
      .select({ id: schema.posts.id })
      .from(schema.posts)
      .where(eq(schema.posts.slug, slug))
      .limit(1)

    const finalSlug = existing ? `${slug}-${Date.now()}` : slug

    const publishDate = published
      ? publishedAt
        ? new Date(publishedAt)
        : new Date()
      : null

    const [res] = await db.insert(schema.posts).values({
      slug: finalSlug,
      title,
      category,
      excerpt,
      content,
      cover: cover || null,
      tags,
      published,
      publishedAt: publishDate,
    })

    revalidatePath('/', 'layout')
    revalidatePath('/blog')
    revalidatePath(`/blog/${finalSlug}`)

    const [createdPost] = await db
      .select()
      .from(schema.posts)
      .where(eq(schema.posts.id, res.insertId))
      .limit(1)

    return NextResponse.json(
      {
        success: true,
        message: 'Post created successfully',
        data: createdPost,
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Failed to create post via API:', error)
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to create post' },
      { status: 500 }
    )
  }
}

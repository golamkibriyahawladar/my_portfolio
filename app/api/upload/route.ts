import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { getSession } from '@/lib/session'
import { verifyApiAuth } from '@/lib/api-auth'
import slugify from 'slugify'

export const dynamic = 'force-dynamic'

const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.svg', '.gif'])
const MAX_FILE_SIZE = 8 * 1024 * 1024 // 8MB

export async function POST(req: NextRequest) {
  // Check either Admin Session or API Key
  const session = await getSession()
  let isAuthorized = Boolean(session?.user)

  if (!isAuthorized) {
    const auth = await verifyApiAuth()
    if (auth.authenticated) {
      isAuthorized = true
    }
  }

  if (!isAuthorized) {
    return NextResponse.json(
      { error: 'Unauthorized: Admin session or API key required to upload assets' },
      { status: 401 }
    )
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded in form data' }, { status: 400 })
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File size exceeds limit (${(MAX_FILE_SIZE / (1024 * 1024)).toFixed(0)}MB)` },
        { status: 400 }
      )
    }

    const originalName = file.name || 'image.png'
    const ext = path.extname(originalName).toLowerCase()

    if (!ALLOWED_EXTENSIONS.has(ext)) {
      return NextResponse.json(
        { error: `Unsupported file extension. Allowed: ${Array.from(ALLOWED_EXTENSIONS).join(', ')}` },
        { status: 400 }
      )
    }

    const baseName = path.basename(originalName, ext)
    const cleanBaseName = slugify(baseName, { lower: true, strict: true }) || 'upload'
    const filename = `${Date.now()}-${cleanBaseName}${ext}`

    const uploadDir = path.join(process.cwd(), 'public', 'uploads')
    await mkdir(uploadDir, { recursive: true })

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const filePath = path.join(uploadDir, filename)
    await writeFile(filePath, buffer)

    const publicUrl = `/uploads/${filename}`

    return NextResponse.json(
      {
        success: true,
        url: publicUrl,
        filename,
        size: file.size,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Upload handler error:', error)
    return NextResponse.json(
      { error: 'Internal server error while processing image upload' },
      { status: 500 }
    )
  }
}

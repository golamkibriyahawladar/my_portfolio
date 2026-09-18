import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { verifyApiAuth } from '@/lib/api-auth'
import { signJwt, verifyJwt } from '@/lib/jwt'

const createTokenSchema = z.object({
  name: z.string().optional().default('n8n-automation'),
  sub: z.string().optional().default('admin'),
  scope: z.string().optional().default('blog:read blog:write'),
  expiresIn: z.union([z.string(), z.number()]).optional().default('365d'),
})

// GET /api/auth/token — Inspect / verify provided Bearer token or JWT
export async function GET(request: NextRequest) {
  const auth = await verifyApiAuth()
  if (!auth.authenticated) {
    return auth.response
  }

  return NextResponse.json({
    success: true,
    authenticated: true,
    authType: auth.authType,
    details: auth.authType === 'jwt' ? auth.user : {
      id: auth.apiKey?.id,
      name: auth.apiKey?.name,
      createdAt: auth.apiKey?.createdAt,
      lastUsedAt: auth.apiKey?.lastUsedAt,
    },
  })
}

// POST /api/auth/token — Generate a new signed JWT token
export async function POST(request: NextRequest) {
  // Requires valid existing API key or valid admin JWT
  const auth = await verifyApiAuth()
  if (!auth.authenticated) {
    return auth.response
  }

  try {
    const json = await request.json().catch(() => ({}))
    const parsed = createTokenSchema.safeParse(json)

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: parsed.error.format() },
        { status: 400 }
      )
    }

    const { name, sub, scope, expiresIn } = parsed.data

    const token = signJwt(
      {
        sub,
        name,
        scope,
        issuer: 'portfolio-cms',
      },
      undefined,
      expiresIn
    )

    const verification = verifyJwt(token)

    return NextResponse.json(
      {
        success: true,
        message: 'JWT token generated successfully for automation',
        token,
        authHeader: `Bearer ${token}`,
        expiresAt: verification.payload?.exp
          ? new Date(verification.payload.exp * 1000).toISOString()
          : 'never',
        payload: verification.payload,
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Failed to generate JWT token:', error)
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to generate token' },
      { status: 500 }
    )
  }
}

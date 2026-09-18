import { headers } from 'next/headers'
import { eq } from 'drizzle-orm'
import { getDb, schema } from '@/lib/db'
import { NextResponse } from 'next/server'
import { verifyJwt, JwtPayload } from '@/lib/jwt'
import { ApiKey } from '@/lib/db/schema'

export interface ApiAuthSuccess {
  authenticated: true
  authType: 'jwt' | 'api_key'
  apiKey?: ApiKey
  user?: JwtPayload
}

export interface ApiAuthFailure {
  authenticated: false
  response: NextResponse
}

export type ApiAuthResult = ApiAuthSuccess | ApiAuthFailure

export async function verifyApiAuth(): Promise<ApiAuthResult> {
  const headerList = await headers()
  const authHeader = headerList.get('authorization')

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      authenticated: false,
      response: NextResponse.json(
        {
          error: 'Unauthorized: Missing or invalid Authorization header. Expected format: Bearer <token_or_api_key>',
        },
        { status: 401 }
      ),
    }
  }

  const token = authHeader.replace('Bearer ', '').trim()
  if (!token) {
    return {
      authenticated: false,
      response: NextResponse.json(
        { error: 'Unauthorized: Empty token provided' },
        { status: 401 }
      ),
    }
  }

  // 1. Check if token is a JWT (3 dot-separated base64 segments)
  if (token.split('.').length === 3) {
    try {
      const jwtResult = verifyJwt(token)
      if (jwtResult.valid && jwtResult.payload) {
        return {
          authenticated: true,
          authType: 'jwt',
          user: jwtResult.payload,
        }
      }

      return {
        authenticated: false,
        response: NextResponse.json(
          { error: `Unauthorized: ${jwtResult.error || 'Invalid JWT token'}` },
          { status: 401 }
        ),
      }
    } catch (err: any) {
      console.error('JWT verification error in API auth:', err)
      return {
        authenticated: false,
        response: NextResponse.json(
          { error: `Unauthorized: ${err?.message || 'JWT validation failed'}` },
          { status: 401 }
        ),
      }
    }
  }

  // 2. Otherwise verify against database API Keys (sk_live_...)
  try {
    const db = getDb()
    const [apiKeyRecord] = await db
      .select()
      .from(schema.apiKeys)
      .where(eq(schema.apiKeys.key, token))
      .limit(1)

    if (!apiKeyRecord) {
      return {
        authenticated: false,
        response: NextResponse.json(
          { error: 'Unauthorized: Invalid API key or JWT token' },
          { status: 401 }
        ),
      }
    }

    // Update lastUsedAt asynchronously in background
    db.update(schema.apiKeys)
      .set({ lastUsedAt: new Date() })
      .where(eq(schema.apiKeys.id, apiKeyRecord.id))
      .catch((err) => console.error('Failed to update api key lastUsedAt:', err))

    return {
      authenticated: true,
      authType: 'api_key',
      apiKey: apiKeyRecord,
    }
  } catch (error) {
    console.error('API key auth database error:', error)
    return {
      authenticated: false,
      response: NextResponse.json(
        { error: 'Internal server error during authentication' },
        { status: 500 }
      ),
    }
  }
}

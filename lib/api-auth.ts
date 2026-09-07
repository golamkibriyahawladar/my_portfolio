import { headers } from 'next/headers'
import { eq } from 'drizzle-orm'
import { getDb, schema } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function verifyApiAuth() {
  const headerList = await headers()
  const authHeader = headerList.get('authorization')

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      authenticated: false,
      response: NextResponse.json(
        { error: 'Unauthorized: Missing or invalid Authorization header. Format: Bearer sk_...' },
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
          { error: 'Unauthorized: Invalid API key' },
          { status: 401 }
        ),
      }
    }

    // Update lastUsedAt in background without blocking
    db.update(schema.apiKeys)
      .set({ lastUsedAt: new Date() })
      .where(eq(schema.apiKeys.id, apiKeyRecord.id))
      .catch((err) => console.error('Failed to update api key lastUsedAt', err))

    return {
      authenticated: true,
      apiKey: apiKeyRecord,
    }
  } catch (error) {
    console.error('API auth error:', error)
    return {
      authenticated: false,
      response: NextResponse.json(
        { error: 'Internal server error during authentication' },
        { status: 500 }
      ),
    }
  }
}

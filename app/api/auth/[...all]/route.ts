import { NextResponse } from 'next/server'
import { toNextJsHandler } from 'better-auth/next-js'
import { getAuth, isAuthConfigured } from '@/lib/auth'

function notConfigured() {
  return NextResponse.json(
    { error: 'Authentication is not configured. Set DATABASE_URL and BETTER_AUTH_SECRET.' },
    { status: 503 },
  )
}

export async function GET(request: Request) {
  if (!isAuthConfigured) return notConfigured()
  return toNextJsHandler(getAuth()).GET(request)
}

export async function POST(request: Request) {
  if (!isAuthConfigured) return notConfigured()
  return toNextJsHandler(getAuth()).POST(request)
}

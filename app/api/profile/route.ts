import { NextRequest, NextResponse } from 'next/server'
import { getProfile } from '@/lib/content'
import { updateProfile } from '@/app/actions/admin'
import { verifyApiAuth } from '@/lib/api-auth'

// GET /api/profile — Public profile details
export async function GET() {
  const profile = await getProfile()
  return NextResponse.json({ success: true, data: profile })
}

// PUT /api/profile — Update profile details (requires API key)
export async function PUT(request: NextRequest) {
  const auth = await verifyApiAuth()
  if (!auth.authenticated) return auth.response

  try {
    const json = await request.json()
    const current = await getProfile()

    const updated = {
      name: json.name ?? current.name,
      role: json.role ?? current.role,
      tagline: json.tagline ?? current.tagline,
      bio: json.bio ?? current.bio,
      location: json.location ?? current.location,
      email: json.email ?? current.email,
      availability: json.availability ?? current.availability,
      portrait: json.portrait !== undefined ? json.portrait : current.portrait,
      socials: json.socials ?? current.socials,
      stats: json.stats ?? current.stats,
    }

    await updateProfile(updated)

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      data: updated,
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to update profile' },
      { status: 500 }
    )
  }
}

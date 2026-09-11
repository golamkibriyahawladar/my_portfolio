/**
 * Spotify Web API Integration
 * Uses OAuth Refresh Token flow to get currently playing track.
 * Requires SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REFRESH_TOKEN in .env.local
 */

const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token'
const SPOTIFY_NOW_PLAYING_URL = 'https://api.spotify.com/v1/me/player/currently-playing'
const SPOTIFY_RECENTLY_PLAYED_URL = 'https://api.spotify.com/v1/me/player/recently-played?limit=1'

interface SpotifyTrack {
  isPlaying: boolean
  title: string
  artist: string
  album: string
  albumArt?: string
  trackUrl?: string
}

async function getAccessToken(): Promise<string | null> {
  const clientId = process.env.SPOTIFY_CLIENT_ID
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET
  const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN

  if (!clientId || !clientSecret || !refreshToken) {
    return null
  }

  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')

  const response = await fetch(SPOTIFY_TOKEN_URL, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
  })

  if (!response.ok) return null
  const data = await response.json()
  return data.access_token
}

export async function getNowPlaying(): Promise<SpotifyTrack> {
  const fallback: SpotifyTrack = {
    isPlaying: false,
    title: 'Not playing',
    artist: '',
    album: '',
  }

  const accessToken = await getAccessToken()
  if (!accessToken) return fallback

  try {
    // Check currently playing
    const res = await fetch(SPOTIFY_NOW_PLAYING_URL, {
      headers: { Authorization: `Bearer ${accessToken}` },
      next: { revalidate: 30 },
    })

    if (res.status === 200) {
      const data = await res.json()
      if (data?.item) {
        return {
          isPlaying: data.is_playing,
          title: data.item.name,
          artist: data.item.artists.map((a: any) => a.name).join(', '),
          album: data.item.album?.name || '',
          albumArt: data.item.album?.images?.[0]?.url,
          trackUrl: data.item.external_urls?.spotify,
        }
      }
    }

    // Fallback: recently played
    const recentRes = await fetch(SPOTIFY_RECENTLY_PLAYED_URL, {
      headers: { Authorization: `Bearer ${accessToken}` },
      next: { revalidate: 60 },
    })

    if (recentRes.ok) {
      const recentData = await recentRes.json()
      const track = recentData?.items?.[0]?.track
      if (track) {
        return {
          isPlaying: false,
          title: track.name,
          artist: track.artists.map((a: any) => a.name).join(', '),
          album: track.album?.name || '',
          albumArt: track.album?.images?.[0]?.url,
          trackUrl: track.external_urls?.spotify,
        }
      }
    }
  } catch {
    // Silently fail
  }

  return fallback
}

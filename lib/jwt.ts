import crypto from 'node:crypto'

export interface JwtPayload {
  sub?: string
  role?: string
  scope?: string
  name?: string
  iat?: number
  exp?: number
  [key: string]: any
}

export interface VerifyJwtResult {
  valid: boolean
  payload?: JwtPayload
  error?: string
}

function base64UrlEncode(str: string | Buffer): string {
  const buf = typeof str === 'string' ? Buffer.from(str, 'utf8') : str
  return buf.toString('base64url')
}

function base64UrlDecode(str: string): string {
  return Buffer.from(str, 'base64url').toString('utf8')
}

export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET || process.env.BETTER_AUTH_SECRET
  if (!secret) {
    throw new Error('JWT_SECRET or BETTER_AUTH_SECRET must be configured in environment variables')
  }
  return secret
}

/**
 * Sign a JSON Web Token (HS256)
 * @param payload Object containing claims (e.g. sub, scope, name)
 * @param secret Secret key for signing (defaults to getJwtSecret())
 * @param expiresIn Expiration duration: number (seconds) or string ('30d', '365d', '1y', 'never')
 */
export function signJwt(
  payload: Record<string, any>,
  secret: string = getJwtSecret(),
  expiresIn: string | number = '365d'
): string {
  const header = {
    alg: 'HS256',
    typ: 'JWT',
  }

  const now = Math.floor(Date.now() / 1000)
  const finalPayload: JwtPayload = {
    ...payload,
    iat: now,
  }

  if (expiresIn !== 'never') {
    let seconds = 365 * 24 * 60 * 60 // default 1 year
    if (typeof expiresIn === 'number') {
      seconds = expiresIn
    } else if (typeof expiresIn === 'string') {
      const match = expiresIn.match(/^(\d+)([smhdwy]?)$/)
      if (match) {
        const val = parseInt(match[1], 10)
        const unit = match[2]
        switch (unit) {
          case 's':
            seconds = val
            break
          case 'm':
            seconds = val * 60
            break
          case 'h':
            seconds = val * 3600
            break
          case 'd':
            seconds = val * 86400
            break
          case 'w':
            seconds = val * 7 * 86400
            break
          case 'y':
            seconds = val * 365 * 86400
            break
          default:
            seconds = val
        }
      }
    }
    finalPayload.exp = now + seconds
  }

  const encodedHeader = base64UrlEncode(JSON.stringify(header))
  const encodedPayload = base64UrlEncode(JSON.stringify(finalPayload))
  const dataToSign = `${encodedHeader}.${encodedPayload}`

  const signature = crypto
    .createHmac('sha256', secret)
    .update(dataToSign)
    .digest()

  const encodedSignature = base64UrlEncode(signature)

  return `${dataToSign}.${encodedSignature}`
}

/**
 * Verify and decode an HS256 JSON Web Token
 * @param token Raw JWT string (header.payload.signature)
 * @param secret Secret key for verifying (defaults to getJwtSecret())
 */
export function verifyJwt(token: string, secret: string = getJwtSecret()): VerifyJwtResult {
  if (!token || typeof token !== 'string') {
    return { valid: false, error: 'Token is required' }
  }

  const parts = token.trim().split('.')
  if (parts.length !== 3) {
    return { valid: false, error: 'Invalid JWT format: expected 3 dot-separated segments' }
  }

  const [encodedHeader, encodedPayload, encodedSignature] = parts

  try {
    const headerStr = base64UrlDecode(encodedHeader)
    const header = JSON.parse(headerStr)
    if (header.alg !== 'HS256') {
      return { valid: false, error: `Unsupported algorithm: ${header.alg}. Only HS256 is supported.` }
    }

    const dataToSign = `${encodedHeader}.${encodedPayload}`
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(dataToSign)
      .digest()

    const actualSignature = Buffer.from(encodedSignature, 'base64url')

    if (expectedSignature.length !== actualSignature.length) {
      return { valid: false, error: 'Invalid token signature' }
    }

    const isValidSig = crypto.timingSafeEqual(expectedSignature, actualSignature)
    if (!isValidSig) {
      return { valid: false, error: 'Invalid token signature' }
    }

    const payloadStr = base64UrlDecode(encodedPayload)
    const payload = JSON.parse(payloadStr) as JwtPayload

    const now = Math.floor(Date.now() / 1000)
    if (payload.exp && payload.exp < now) {
      return { valid: false, error: 'Token has expired', payload }
    }

    return { valid: true, payload }
  } catch (err: any) {
    return { valid: false, error: `Token parsing failed: ${err?.message || 'Malformed token'}` }
  }
}

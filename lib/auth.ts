import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { nextCookies } from 'better-auth/next-js'
import { getDb, isDatabaseConfigured, schema } from '@/lib/db'

const DEFAULT_AUTH_SECRET = '9241bfa4918e9d40b7d76ad6e65a589cf49a0d8e8a9f3b145d27e997f70df9c8'
const PRODUCTION_URL = 'https://my-portfolio-ten-gules-54.vercel.app'

function createAuth() {
  const isProd = process.env.NODE_ENV === 'production'
  const envAuthUrl = process.env.BETTER_AUTH_URL?.trim().replace(/^['"]|['"]$/g, '')
  const isLocalhostAuthUrl = envAuthUrl?.includes('localhost') || envAuthUrl?.includes('127.0.0.1')

  const vercelBase = process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : undefined

  const baseURL =
    (isProd && !isLocalhostAuthUrl && envAuthUrl) ||
    (isProd ? (vercelBase || PRODUCTION_URL) : undefined) ||
    envAuthUrl ||
    'http://localhost:3000'

  const authSecret = (process.env.BETTER_AUTH_SECRET || DEFAULT_AUTH_SECRET).trim().replace(/^['"]|['"]$/g, '')

  return betterAuth({
    secret: authSecret,
    database: drizzleAdapter(getDb(), {
      provider: 'mysql',
      schema: {
        user: schema.user,
        session: schema.session,
        account: schema.account,
        verification: schema.verification,
      },
    }),
    baseURL,
    emailAndPassword: {
      enabled: true,
      autoSignIn: true,
    },
    trustedOrigins: [
      'http://localhost:3000',
      PRODUCTION_URL,
      `${PRODUCTION_URL}/`,
      baseURL,
      ...(process.env.NEXT_PUBLIC_APP_URL ? [process.env.NEXT_PUBLIC_APP_URL.trim().replace(/^['"]|['"]$/g, '')] : []),
      ...(process.env.VERCEL_URL ? [`https://${process.env.VERCEL_URL}`] : []),
      ...(process.env.VERCEL_PROJECT_PRODUCTION_URL
        ? [`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`]
        : []),
    ],
    session: {
      expiresIn: 60 * 60 * 24 * 7,
      updateAge: 60 * 60 * 24,
    },
    ...(process.env.NODE_ENV === 'development' && process.env.V0_RUNTIME_URL
      ? {
          advanced: {
            defaultCookieAttributes: {
              sameSite: 'none' as const,
              secure: true,
            },
          },
        }
      : {}),
    plugins: [nextCookies()],
  })
}

type Auth = ReturnType<typeof createAuth>
const globalForAuth = globalThis as unknown as { __portfolioAuth?: Auth }

export function getAuth(): Auth {
  if (!globalForAuth.__portfolioAuth) globalForAuth.__portfolioAuth = createAuth()
  return globalForAuth.__portfolioAuth
}

export const isAuthConfigured = isDatabaseConfigured && Boolean(process.env.BETTER_AUTH_SECRET || DEFAULT_AUTH_SECRET)

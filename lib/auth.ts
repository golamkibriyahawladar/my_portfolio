import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { nextCookies } from 'better-auth/next-js'
import { getDb, isDatabaseConfigured, schema } from '@/lib/db'

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
    (isProd && isLocalhostAuthUrl ? vercelBase : envAuthUrl) ||
    vercelBase ||
    process.env.V0_RUNTIME_URL ||
    'http://localhost:3000'

  return betterAuth({
    secret: process.env.BETTER_AUTH_SECRET,
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
      ...(baseURL ? [baseURL] : []),
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

export const isAuthConfigured = isDatabaseConfigured && Boolean(process.env.BETTER_AUTH_SECRET)

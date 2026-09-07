import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { nextCookies } from 'better-auth/next-js'
import { getDb, isDatabaseConfigured, schema } from '@/lib/db'

function createAuth() {
  return betterAuth({
    database: drizzleAdapter(getDb(), {
      provider: 'mysql',
      schema: {
        user: schema.user,
        session: schema.session,
        account: schema.account,
        verification: schema.verification,
      },
    }),
    baseURL:
      process.env.BETTER_AUTH_URL ??
      (process.env.VERCEL_PROJECT_PRODUCTION_URL
        ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
        : process.env.VERCEL_URL
          ? `https://${process.env.VERCEL_URL}`
          : process.env.V0_RUNTIME_URL),
    emailAndPassword: {
      enabled: true,
      autoSignIn: true,
    },
    trustedOrigins: [
      ...(process.env.NODE_ENV === 'development'
        ? [
            'http://localhost:3000',
            ...(process.env.V0_RUNTIME_URL ? [process.env.V0_RUNTIME_URL] : []),
            ...(process.env.V0_DEV_APP_URL ? [process.env.V0_DEV_APP_URL] : []),
            ...(process.env.V0_BUILD_URL ? [process.env.V0_BUILD_URL] : []),
            ...(process.env.V0_SANDBOX_URL ? [process.env.V0_SANDBOX_URL] : []),
          ]
        : []),
      ...(process.env.NODE_ENV === 'production'
        ? [
            ...(process.env.VERCEL_URL ? [`https://${process.env.VERCEL_URL}`] : []),
            ...(process.env.VERCEL_PROJECT_PRODUCTION_URL
              ? [`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`]
              : []),
          ]
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

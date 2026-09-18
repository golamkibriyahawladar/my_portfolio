import { drizzle, type MySql2Database } from 'drizzle-orm/mysql2'
import mysql from 'mysql2/promise'
import * as schema from './schema'

export const isDatabaseConfigured = Boolean(process.env.DATABASE_URL)

type Db = MySql2Database<typeof schema>

const globalForDb = globalThis as unknown as { __portfolioDb?: Db; __portfolioPool?: mysql.Pool }

function createDb(): Db {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set. Add your MySQL connection string in project settings.')
  }
  const cleanUri = process.env.DATABASE_URL.trim().replace(/^['"]|['"]$/g, '')
  const pool =
    globalForDb.__portfolioPool ??
    mysql.createPool({
      uri: cleanUri,
      connectionLimit: 5,
      waitForConnections: true,
    })
  globalForDb.__portfolioPool = pool
  return drizzle(pool, { schema, mode: 'default' })
}

export function getDb(): Db {
  if (!globalForDb.__portfolioDb) globalForDb.__portfolioDb = createDb()
  return globalForDb.__portfolioDb
}

export { schema }

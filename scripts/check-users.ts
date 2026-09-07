import { getDb, schema } from '../lib/db'

async function main() {
  const db = getDb()
  const users = await db.select().from(schema.user)
  const accounts = await db.select().from(schema.account)
  console.log("USERS:", JSON.stringify(users, null, 2))
  console.log("ACCOUNTS:", JSON.stringify(accounts, null, 2))
  process.exit(0)
}

main().catch(console.error)

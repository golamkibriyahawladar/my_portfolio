// Seeds the MySQL database with the demo content.
// Run after `pnpm db:push`: `pnpm db:seed`
import { getDb, schema } from '../lib/db'
import {
  demoPostRows,
  demoProfile,
  demoProjectRows,
  demoServiceRows,
  demoSkillRows,
} from '../lib/demo-content'

async function main() {
  const db = getDb()

  await db
    .insert(schema.profile)
    .values({ ...demoProfile, id: 1 })
    .onDuplicateKeyUpdate({ set: { name: demoProfile.name } })

  for (const { id: _id, createdAt: _c, updatedAt: _u, ...project } of demoProjectRows) {
    await db.insert(schema.projects).values(project).onDuplicateKeyUpdate({ set: { title: project.title } })
  }
  for (const { id: _id, ...service } of demoServiceRows) {
    await db.insert(schema.services).values(service)
  }
  for (const { id: _id, ...skill } of demoSkillRows) {
    await db.insert(schema.skills).values(skill)
  }
  for (const { id: _id, createdAt: _c, updatedAt: _u, ...post } of demoPostRows) {
    await db.insert(schema.posts).values(post).onDuplicateKeyUpdate({ set: { title: post.title } })
  }

  console.log('Seed complete')
  process.exit(0)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})

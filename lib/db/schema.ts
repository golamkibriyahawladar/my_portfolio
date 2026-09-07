import {
  mysqlTable,
  varchar,
  text,
  int,
  boolean,
  timestamp,
  datetime,
  json,
} from 'drizzle-orm/mysql-core'

// ---------- Better Auth tables ----------
export const user = mysqlTable('user', {
  id: varchar('id', { length: 36 }).primaryKey(),
  name: text('name').notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  emailVerified: boolean('email_verified').notNull().default(false),
  image: text('image'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
})

export const session = mysqlTable('session', {
  id: varchar('id', { length: 36 }).primaryKey(),
  expiresAt: datetime('expires_at').notNull(),
  token: varchar('token', { length: 255 }).notNull().unique(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: varchar('user_id', { length: 36 })
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
})

export const account = mysqlTable('account', {
  id: varchar('id', { length: 36 }).primaryKey(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  issuer: text('issuer'),
  userId: varchar('user_id', { length: 36 })
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: datetime('access_token_expires_at'),
  refreshTokenExpiresAt: datetime('refresh_token_expires_at'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
})

export const verification = mysqlTable('verification', {
  id: varchar('id', { length: 36 }).primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: datetime('expires_at').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
})

// ---------- Portfolio content ----------
export type SocialLink = { label: string; href: string }
export type Stat = { value: string; label: string }

export const profile = mysqlTable('profile', {
  id: int('id').primaryKey().default(1),
  name: varchar('name', { length: 120 }).notNull(),
  role: varchar('role', { length: 200 }).notNull(),
  tagline: text('tagline').notNull(),
  bio: text('bio').notNull(),
  location: varchar('location', { length: 120 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  availability: varchar('availability', { length: 120 }).notNull(),
  portrait: text('portrait'),
  socials: json('socials').$type<SocialLink[]>().notNull(),
  stats: json('stats').$type<Stat[]>().notNull(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
})

export const projects = mysqlTable('projects', {
  id: int('id').primaryKey().autoincrement(),
  slug: varchar('slug', { length: 160 }).notNull().unique(),
  title: varchar('title', { length: 200 }).notNull(),
  category: varchar('category', { length: 80 }).notNull(),
  year: varchar('year', { length: 8 }).notNull(),
  description: text('description').notNull(),
  content: text('content'),
  stack: json('stack').$type<string[]>().notNull(),
  image: text('image').notNull(),
  result: varchar('result', { length: 120 }),
  liveUrl: text('live_url'),
  repoUrl: text('repo_url'),
  featured: boolean('featured').notNull().default(true),
  published: boolean('published').notNull().default(true),
  sortOrder: int('sort_order').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
})

export const services = mysqlTable('services', {
  id: int('id').primaryKey().autoincrement(),
  title: varchar('title', { length: 120 }).notNull(),
  description: text('description').notNull(),
  items: json('items').$type<string[]>().notNull(),
  sortOrder: int('sort_order').notNull().default(0),
})

export const skills = mysqlTable('skills', {
  id: int('id').primaryKey().autoincrement(),
  name: varchar('name', { length: 80 }).notNull(),
  sortOrder: int('sort_order').notNull().default(0),
})

export const posts = mysqlTable('posts', {
  id: int('id').primaryKey().autoincrement(),
  slug: varchar('slug', { length: 160 }).notNull().unique(),
  title: varchar('title', { length: 200 }).notNull(),
  excerpt: text('excerpt').notNull(),
  content: text('content').notNull(),
  cover: text('cover'),
  category: varchar('category', { length: 80 }).notNull().default('General'),
  tags: json('tags').$type<string[]>().notNull(),
  published: boolean('published').notNull().default(false),
  publishedAt: datetime('published_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
})

export const messages = mysqlTable('messages', {
  id: int('id').primaryKey().autoincrement(),
  name: varchar('name', { length: 120 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  subject: varchar('subject', { length: 200 }),
  body: text('body').notNull(),
  read: boolean('read').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const apiKeys = mysqlTable('api_keys', {
  id: int('id').primaryKey().autoincrement(),
  name: varchar('name', { length: 120 }).notNull(),
  key: varchar('key', { length: 64 }).notNull().unique(),
  lastUsedAt: datetime('last_used_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export type Profile = typeof profile.$inferSelect
export type Project = typeof projects.$inferSelect
export type Service = typeof services.$inferSelect
export type Skill = typeof skills.$inferSelect
export type Post = typeof posts.$inferSelect
export type Message = typeof messages.$inferSelect
export type ApiKey = typeof apiKeys.$inferSelect


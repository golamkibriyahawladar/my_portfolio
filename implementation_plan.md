# Portfolio Enhancement — Final PRD

> সকল আলোচনা সম্পন্ন। এটি চূড়ান্ত implementation plan। Approve করলে কাজ শুরু হবে।

---

## 📋 Confirmed Decisions Summary

| বিষয় | সিদ্ধান্ত |
|---|---|
| Database | MySQL (Local XAMPP) |
| Email | golamkibriyahawladar@gmail.com |
| Personal Info | পরে আপডেট করবেন (admin panel থেকে) |
| Image Storage | Local `/public` folder |
| Blog API Auth | DB-stored API key + Admin panel থেকে ready cURL copy |
| Blog Categories | Category (DB column) + Tags (JSON array) — দুটোই |
| Blog Control | সবকিছু API দিয়ে control করা যাবে |
| Animations | 7 ধরনের (custom cursor, magnetic, spotlight, parallax, text reveal, nav, blog hover) |
| Blog Readability | ToC, reading time, author box, copy button, related posts, progress bar |

---

## 🔍 Conflict & Gap Analysis

> [!NOTE]
> **কোনো conflict পাওয়া যায়নি।** নিচে বিশদ চেক:

| Check | Status | Notes |
|---|---|---|
| Schema conflict | ✅ No conflict | নতুন `category` column ও `api_keys` table যুক্ত হবে — existing schema intact |
| Auth conflict | ✅ No conflict | Better-Auth already setup, শুধু DB connect + admin role logic যুক্ত করব |
| Route conflict | ✅ No conflict | `/admin/*`, `/api/blog/*`, `/api/projects/*` — সব নতুন routes |
| Component conflict | ✅ No conflict | `editorial/` theme untouched, শুধু `dark-studio/` modify হবে |
| Existing blog pages | ✅ No conflict | `/blog` ও `/blog/[slug]` enhance করব, মুছব না |
| Existing cursor (projects) | ✅ No conflict | Global cursor এটিকে replace করবে, একই pattern |
| `lib/content.ts` fallback | ✅ No conflict | Demo fallback logic intact থাকবে |

---

## Phase 1: MySQL Database Setup (XAMPP)

**লক্ষ্য:** XAMPP MySQL-এ connection establish + schema push + seed data

---

#### [NEW] `.env.local`
```env
DATABASE_URL=mysql://root:@localhost:3306/portfolio
BETTER_AUTH_SECRET=your-random-secret-here-min-32-chars
```

#### [MODIFY] [schema.ts](file:///e:/portfolio/lib/db/schema.ts)
নতুন additions:
```ts
// posts table-এ নতুন column
category: varchar('category', { length: 80 }).default('Uncategorized')

// নতুন table — API keys
export const apiKeys = mysqlTable('api_keys', {
  id: int('id').primaryKey().autoincrement(),
  name: varchar('name', { length: 120 }).notNull(),
  key: varchar('key', { length: 64 }).notNull().unique(),
  lastUsedAt: timestamp('last_used_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})
```

**Commands:**
```bash
# XAMPP MySQL start করুন, তারপর:
npx pnpm db:push    # Schema push
npx pnpm db:seed    # Demo data seed
```

**Files changed:** 2 modified, 1 new

---

## Phase 2: Admin Panel (Full CMS)

**লক্ষ্য:** সিকিউর admin dashboard — profile, projects, blog, services, skills, messages, API keys — সব CRUD সহ

---

### 2.1 — Auth & Layout

#### [NEW] `app/admin/layout.tsx`
- Dark admin layout — sidebar + top header
- Auth guard: `requireAdmin()` — লগইন না থাকলে `/admin/login` redirect
- Sidebar nav items: Dashboard, Profile, Projects, Blog, Services, Skills, Messages, API Access, Settings

#### [NEW] `app/admin/login/page.tsx`
- Email + Password login form
- Better-Auth `signIn.email()` call
- প্রথমবার কোনো user না থাকলে → signup form দেখাবে (`adminExists()` check)

#### [NEW] `app/admin/signup/page.tsx`
- শুধু প্রথমবার: admin account creation
- পরে এই route disable হয়ে যাবে (user exists check)

---

### 2.2 — Dashboard

#### [NEW] `app/admin/page.tsx`
- Quick stats cards:
  - Total Projects (published/draft)
  - Total Blog Posts (published/draft)
  - Unread Messages count
  - Active API Keys count
- Recent activity feed

---

### 2.3 — Profile Editor

#### [NEW] `app/admin/profile/page.tsx`
- Editable fields: name, role, tagline, bio, location, email, availability, portrait URL
- **Social Links:** Dynamic add/remove list — `{ label, href }`
- **Stats:** Dynamic add/remove — `{ value, label }`
- Save button → Server Action → DB update
- Live preview panel (optional)

---

### 2.4 — Projects Manager

#### [NEW] `app/admin/projects/page.tsx`
- Table: title, category, year, published, featured, sort order
- Actions: Edit, Delete, Toggle Published, Toggle Featured
- "Add New Project" button

#### [NEW] `app/admin/projects/new/page.tsx`
- Form: slug (auto-generate from title), title, category, year, description, content (Markdown textarea), stack (tag input), image URL, result, live URL, repo URL, featured toggle, published toggle

#### [NEW] `app/admin/projects/[id]/page.tsx`
- Same form as `new` but pre-filled for editing

---

### 2.5 — Blog Manager

#### [NEW] `app/admin/blog/page.tsx`
- Table: title, category, tags, published, date
- Actions: Edit, Delete, Publish/Unpublish
- "Add New Post" button

#### [NEW] `app/admin/blog/new/page.tsx`
- Form: slug, title, excerpt, content (Markdown textarea with side-by-side preview), cover image URL, category (dropdown), tags (multi-input), published toggle, published date picker

#### [NEW] `app/admin/blog/[id]/page.tsx`
- Same form as `new` but pre-filled for editing

---

### 2.6 — Services & Skills

#### [NEW] `app/admin/services/page.tsx`
- Inline add/edit/delete services
- Each service: title, description, items (list input)
- Sort order drag/reorder

#### [NEW] `app/admin/skills/page.tsx`
- Tag-style skill manager
- Add new skill, remove skill, reorder

---

### 2.7 — Messages Inbox

#### [NEW] `app/admin/messages/page.tsx`
- Table: name, email, subject, date, read/unread status
- Click → expand message body
- Mark read/unread, delete
- Unread count badge in sidebar

---

### 2.8 — API Access Page ⭐

#### [NEW] `app/admin/api-keys/page.tsx`
- **API Key Management:**
  - Create new API key (with custom name, e.g. "n8n Automation")
  - Key দেখানো হবে শুধু creation-এর সময় (পরে masked `sk_...***`)
  - Delete/Revoke key
  - Last used timestamp

- **Ready-to-copy cURL Commands:**
  ```
  ┌─────────────────────────────────────────────────┐
  │  📋 Create Post                          [Copy] │
  │  curl -X POST http://localhost:3000/api/blog \  │
  │    -H "Authorization: Bearer sk_abc123..." \    │
  │    -H "Content-Type: application/json" \        │
  │    -d '{"title":"...","content":"..."}'         │
  ├─────────────────────────────────────────────────┤
  │  📋 List All Posts                       [Copy] │
  │  curl http://localhost:3000/api/blog \          │
  │    -H "Authorization: Bearer sk_abc123..."      │
  ├─────────────────────────────────────────────────┤
  │  📋 Update Post                          [Copy] │
  │  curl -X PUT http://localhost:3000/api/blog/1 \ │
  │    -H "Authorization: Bearer sk_abc123..." \    │
  │    -d '{"title":"Updated Title"}'               │
  ├─────────────────────────────────────────────────┤
  │  📋 Delete Post                          [Copy] │
  │  curl -X DELETE http://localhost:3000/api/blog/1│
  │    -H "Authorization: Bearer sk_abc123..."      │
  ├─────────────────────────────────────────────────┤
  │  📋 Create Project                       [Copy] │
  │  curl -X POST .../api/projects \                │
  │    -H "Authorization: Bearer sk_abc123..." ...  │
  └─────────────────────────────────────────────────┘
  ```
- প্রতিটি cURL command-এ আপনার active API key auto-inject থাকবে
- Copy button ক্লিক করলে clipboard-এ কপি হয়ে "Copied!" toast দেখাবে

---

### 2.9 — Server Actions & Components

#### [NEW] `app/actions/admin.ts`
Server Actions (সব action-এ `requireAdmin()` check):
- `updateProfile(formData)` — profile update
- `createProject(formData)` / `updateProject(id, formData)` / `deleteProject(id)`
- `createPost(formData)` / `updatePost(id, formData)` / `deletePost(id)`
- `createService(formData)` / `updateService(id, formData)` / `deleteService(id)`
- `createSkill(formData)` / `deleteSkill(id)` / `reorderSkills(ids[])`
- `markMessageRead(id)` / `deleteMessage(id)`
- `createApiKey(name)` / `deleteApiKey(id)`

#### [NEW] `components/admin/` — reusable admin UI
| Component | কাজ |
|---|---|
| `admin-sidebar.tsx` | Nav sidebar with active state + unread badge |
| `admin-header.tsx` | Top bar: page title + user info + logout |
| `markdown-editor.tsx` | Split-pane: textarea (left) + live preview (right) |
| `tag-input.tsx` | Multi-tag input with backspace delete |
| `data-table.tsx` | Sortable, searchable table component |
| `stat-card.tsx` | Dashboard stat card |
| `curl-snippet.tsx` | cURL command display with copy button |
| `confirm-dialog.tsx` | Delete confirmation modal |

**Files changed:** ~25 new files

---

## Phase 3: Blog with GEO (Generative Engine Optimization)

**লক্ষ্য:** Blog-কে AI search engines + traditional SEO — উভয়ের জন্য optimize করা

---

### 3.1 — Structured Data (JSON-LD)

#### [NEW] `lib/geo.ts`
```ts
// Helper functions:
generatePersonSchema(profile)      // → Person JSON-LD
generateArticleSchema(post, profile) // → BlogPosting JSON-LD
generateBreadcrumbSchema(items)    // → BreadcrumbList JSON-LD
generateFAQSchema(faqs)            // → FAQPage JSON-LD
calculateReadingTime(content)      // → "5 min read"
extractHeadings(markdown)          // → ToC array [{id, text, level}]
```

#### [MODIFY] [layout.tsx](file:///e:/portfolio/app/layout.tsx)
- Updated metadata: canonical URL, OG image default, Twitter card
- `Person` JSON-LD schema inject (global)
- `WebSite` JSON-LD schema

#### [MODIFY] [blog/page.tsx](file:///e:/portfolio/app/blog/page.tsx)
- `CollectionPage` JSON-LD schema
- Category filter bar (top)
- Tag filter chips
- Proper `<h1>` + semantic structure

#### [MODIFY] [blog/[slug]/page.tsx](file:///e:/portfolio/app/blog/%5Bslug%5D/page.tsx)
- `BlogPosting` JSON-LD schema per post
- Enhanced `generateMetadata()`: OG image, article tags, author, publish date
- `BreadcrumbList` schema: Home → Blog → Post Title

---

### 3.2 — Blog Readability Enhancements

#### [MODIFY] [blog/[slug]/page.tsx](file:///e:/portfolio/app/blog/%5Bslug%5D/page.tsx)
নতুন features:
1. **📋 Table of Contents** — sticky left sidebar (desktop), collapsible top (mobile)
2. **⏱ Reading time** — "5 min read" badge (post header-এ)
3. **👤 Author box** — top + bottom (avatar, name, role, bio)
4. **📊 Progress bar** — lime-green thin bar at page top
5. **🔗 Related posts** — 2-3টি matching posts (tag-based) at bottom

#### [MODIFY] [markdown.tsx](file:///e:/portfolio/components/markdown.tsx)
- **Copy button** on code blocks (top-right corner)
- Language label badge on code blocks
- Enhanced typography:
  - Body: 18px desktop / 16px mobile
  - Line-height: 1.75
  - Paragraph spacing: increased
  - Heading spacing: mt-12 mb-4

---

### 3.3 — SEO Infrastructure

#### [NEW] `app/sitemap.ts`
- Dynamic sitemap: homepage + all published projects + all published blog posts
- `lastmod` dates from DB

#### [NEW] `app/robots.ts`
- Allow all crawlers
- Sitemap URL reference
- Disallow `/admin/*`

#### [NEW] `app/feed.xml/route.ts`
- RSS 2.0 feed — all published blog posts
- Auto-updates when posts publish

**Files changed:** 5 modified, 4 new

---

## Phase 4: Blog REST API

**লক্ষ্য:** বাইরের tools থেকে Blog + Projects CRUD — API key auth সহ

---

### 4.1 — API Auth Middleware

#### [NEW] `lib/api-auth.ts`
```ts
// Bearer token verification
// 1. Request header: Authorization: Bearer sk_xxxxx
// 2. DB-তে api_keys table-এ match খোঁজে
// 3. Match পেলে → lastUsedAt update + proceed
// 4. না পেলে → 401 Unauthorized
```

---

### 4.2 — Blog API Endpoints

#### [NEW] `app/api/blog/route.ts`
| Method | Endpoint | কাজ |
|---|---|---|
| **GET** | `/api/blog` | সকল পোস্ট (published + drafts) |
| **POST** | `/api/blog` | নতুন পোস্ট তৈরি |

**POST body schema (Zod validated):**
```json
{
  "title": "My Post Title",
  "slug": "my-post-title",
  "excerpt": "Short description...",
  "content": "## Markdown content here...",
  "cover": "/path/to/image.png",
  "category": "AI",
  "tags": ["AI", "Automation"],
  "published": true,
  "publishedAt": "2026-09-05T00:00:00Z"
}
```
- `slug` optional → auto-generate from title if missing
- `publishedAt` optional → defaults to now if `published: true`

#### [NEW] `app/api/blog/[id]/route.ts`
| Method | Endpoint | কাজ |
|---|---|---|
| **GET** | `/api/blog/:id` | একটি পোস্টের details |
| **PUT** | `/api/blog/:id` | পোস্ট update (partial update supported) |
| **DELETE** | `/api/blog/:id` | পোস্ট delete |

---

### 4.3 — Projects API Endpoints

#### [NEW] `app/api/projects/route.ts`
| Method | Endpoint | কাজ |
|---|---|---|
| **GET** | `/api/projects` | সকল projects |
| **POST** | `/api/projects` | নতুন project তৈরি |

#### [NEW] `app/api/projects/[id]/route.ts`
| Method | Endpoint | কাজ |
|---|---|---|
| **GET** | `/api/projects/:id` | একটি project details |
| **PUT** | `/api/projects/:id` | Project update |
| **DELETE** | `/api/projects/:id` | Project delete |

---

### 4.4 — Utility API Endpoints

#### [NEW] `app/api/profile/route.ts`
| Method | Endpoint | কাজ |
|---|---|---|
| **GET** | `/api/profile` | Profile data (public, no auth) |
| **PUT** | `/api/profile` | Profile update (auth required) |

**Files changed:** 7 new files

---

## Phase 5: Cursor Animations & Micro-interactions

**লক্ষ্য:** Premium cursor/pointer effects পুরো সাইটে

---

### 5.1 — Global Custom Cursor

#### [NEW] `components/custom-cursor.tsx`
- **Default state:** 8px white dot (follows mouse with spring physics)
- **Link/button hover:** Expand to 40px lime circle + label
  - Projects card → `"View"`
  - Blog post link → `"Read"`
  - Contact button → `"Send"`
  - External link → `"Open ↗"`
- **Image hover:** Circle + magnify icon
- **Text input hover:** Custom cursor hide, browser default show
- **Mobile:** Completely hidden (touch devices)
- Uses Framer Motion `useMotionValue` + `useSpring`
- `prefers-reduced-motion: reduce` → disabled

#### [MODIFY] [page.tsx](file:///e:/portfolio/app/page.tsx)
- `<CustomCursor />` mount

#### [MODIFY] [page-shell.tsx](file:///e:/portfolio/components/dark-studio/page-shell.tsx)
- `<CustomCursor />` mount (blog/work pages-এও কাজ করবে)

#### [MODIFY] [studio-projects.tsx](file:///e:/portfolio/components/dark-studio/studio-projects.tsx)
- Remove local cursor logic (lines 62-66, 110-125) → Global cursor handles it
- Add `data-cursor="view"` attribute on project cards

---

### 5.2 — Magnetic Buttons

#### [NEW] `components/magnetic-button.tsx`
- Cursor 100px radius-এ আসলে button cursor-দিকে 5-8px shift হবে
- Cursor সরে গেলে spring back
- Click-এ ripple pulse

#### Usage locations:
- "Send message" button (contact form)
- Social link buttons (footer)
- "Your project here →" link (projects section)
- Nav links (mobile menu)

---

### 5.3 — Spotlight Cards

#### [NEW] `components/spotlight-card.tsx`
- Card-এর ভেতর cursor position অনুযায়ী radial gradient spotlight follow করবে
- Subtle border glow on hover
- Lift effect: `translateY(-4px)` + shadow

#### [MODIFY] [studio-services.tsx](file:///e:/portfolio/components/dark-studio/studio-services.tsx)
- Each service item → `<SpotlightCard>` wrapper

---

### 5.4 — Other Micro-interactions

#### [MODIFY] [studio-about.tsx](file:///e:/portfolio/components/dark-studio/studio-about.tsx)
- Portrait image: subtle parallax tilt (±5°) on mouse move
- Skills badges: scale(1.05) + border-lime on hover

#### [MODIFY] [studio-contact.tsx](file:///e:/portfolio/components/dark-studio/studio-contact.tsx)
- Form input focus: lime-green glow border animation

#### [MODIFY] [studio-nav.tsx](file:///e:/portfolio/components/dark-studio/studio-nav.tsx)
- Link hover: underline slide-in from left to right
- Active section detection (Intersection Observer scroll spy)

#### [NEW] `components/count-up.tsx`
- Stats numbers count-up animation: `0 → 6+`, `0 → 40+`, `0 → 18`
- Triggers on scroll into view (once)

**Files changed:** 8 modified, 4 new

---

## 📊 Complete File Inventory

### New Files (35+)

| # | File | Phase |
|---|---|---|
| 1 | `.env.local` | 1 |
| 2 | `app/admin/layout.tsx` | 2 |
| 3 | `app/admin/login/page.tsx` | 2 |
| 4 | `app/admin/signup/page.tsx` | 2 |
| 5 | `app/admin/page.tsx` | 2 |
| 6 | `app/admin/profile/page.tsx` | 2 |
| 7 | `app/admin/projects/page.tsx` | 2 |
| 8 | `app/admin/projects/new/page.tsx` | 2 |
| 9 | `app/admin/projects/[id]/page.tsx` | 2 |
| 10 | `app/admin/blog/page.tsx` | 2 |
| 11 | `app/admin/blog/new/page.tsx` | 2 |
| 12 | `app/admin/blog/[id]/page.tsx` | 2 |
| 13 | `app/admin/services/page.tsx` | 2 |
| 14 | `app/admin/skills/page.tsx` | 2 |
| 15 | `app/admin/messages/page.tsx` | 2 |
| 16 | `app/admin/api-keys/page.tsx` | 2 |
| 17 | `app/actions/admin.ts` | 2 |
| 18 | `components/admin/admin-sidebar.tsx` | 2 |
| 19 | `components/admin/admin-header.tsx` | 2 |
| 20 | `components/admin/markdown-editor.tsx` | 2 |
| 21 | `components/admin/tag-input.tsx` | 2 |
| 22 | `components/admin/data-table.tsx` | 2 |
| 23 | `components/admin/stat-card.tsx` | 2 |
| 24 | `components/admin/curl-snippet.tsx` | 2 |
| 25 | `components/admin/confirm-dialog.tsx` | 2 |
| 26 | `lib/geo.ts` | 3 |
| 27 | `app/sitemap.ts` | 3 |
| 28 | `app/robots.ts` | 3 |
| 29 | `app/feed.xml/route.ts` | 3 |
| 30 | `lib/api-auth.ts` | 4 |
| 31 | `app/api/blog/route.ts` | 4 |
| 32 | `app/api/blog/[id]/route.ts` | 4 |
| 33 | `app/api/projects/route.ts` | 4 |
| 34 | `app/api/projects/[id]/route.ts` | 4 |
| 35 | `app/api/profile/route.ts` | 4 |
| 36 | `components/custom-cursor.tsx` | 5 |
| 37 | `components/magnetic-button.tsx` | 5 |
| 38 | `components/spotlight-card.tsx` | 5 |
| 39 | `components/count-up.tsx` | 5 |

### Modified Files (12)

| # | File | Phase | কী পরিবর্তন |
|---|---|---|---|
| 1 | `lib/db/schema.ts` | 1 | `category` column + `api_keys` table |
| 2 | `lib/content.ts` | 2 | Blog category query support |
| 3 | `lib/demo-content.ts` | 1 | Category field add to demo posts |
| 4 | `app/layout.tsx` | 3 | GEO metadata + Person JSON-LD |
| 5 | `app/blog/page.tsx` | 3 | Category/tag filter + CollectionPage schema |
| 6 | `app/blog/[slug]/page.tsx` | 3 | ToC, reading time, author box, BlogPosting schema, progress bar |
| 7 | `components/markdown.tsx` | 3 | Code copy button, typography enhancement |
| 8 | `app/page.tsx` | 5 | Custom cursor mount |
| 9 | `components/dark-studio/page-shell.tsx` | 5 | Custom cursor mount |
| 10 | `components/dark-studio/studio-projects.tsx` | 5 | Remove local cursor, add data attributes |
| 11 | `components/dark-studio/studio-services.tsx` | 5 | Spotlight card wrapper |
| 12 | `components/dark-studio/studio-nav.tsx` | 5 | Underline animation + scroll spy |

---

## ⚡ Execution Order

```
Phase 1 (DB Setup)           ← 15 min
    ↓
Phase 2 (Admin Panel)        ← মূল কাজ, সবচেয়ে বড়
    ↓
Phase 3 (Blog GEO)           ← Blog enhance
    ↓
Phase 4 (Blog API)           ← API endpoints
    ↓
Phase 5 (Animations)         ← Final polish (যেকোনো সময়ও করা যায়)
```

---

## ✅ Verification Plan

### প্রতিটি Phase-এর পর:

**Phase 1:**
- XAMPP MySQL start → `npx pnpm db:push` → schema created verify
- `npx pnpm db:seed` → demo data inserted verify

**Phase 2:**
- `/admin/login` → signup → login → dashboard দেখা
- Profile edit → save → homepage-এ reflect হচ্ছে কিনা
- Project create → edit → delete → homepage verify
- Blog post create → publish → `/blog` page verify
- API key create → cURL copy → paste in terminal → response verify

**Phase 3:**
- [Google Rich Results Test](https://search.google.com/test/rich-results) → JSON-LD valid
- `/sitemap.xml` → valid XML
- `/feed.xml` → valid RSS
- Blog post page → ToC, reading time, author box দেখা যাচ্ছে

**Phase 4:**
```bash
# Create post via API
curl -X POST http://localhost:3000/api/blog \
  -H "Authorization: Bearer YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","content":"Hello"}'

# Verify response: 201 Created
```

**Phase 5:**
- Mouse move → custom cursor follow
- Button hover → magnetic pull
- Service cards → spotlight gradient
- Stats → count-up animation
- Mobile → cursor hidden verify

### Build Check:
```bash
npx pnpm build  # TypeScript + Next.js build — no errors
```

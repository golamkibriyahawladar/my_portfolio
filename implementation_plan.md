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
| Email Notification | Resend (Free 3,000/mo) / Gmail SMTP → Admin Messages + Real Gmail Inbox |
| AI Chat Agent | Floating Website AI Companion (Gemini Flash + DB Tools Calling) |
| MCP Server | Official Model Context Protocol Server (`@modelcontextprotocol/sdk`) for Claude/Cursor |
| Command Palette | `Cmd + K` / `Ctrl + K` Terminal & Quick Search Palette |
| Live Time & Status | Dhaka (GMT+6) Local Time & Availability Live Ticker |
| Spotify Status | Live "Listening To" Track Ticker (Spotify API) |
| Project Estimator | Interactive Scope & Budget Estimator (1-click inquiry submission) |
| Case Study Showcase | Interactive Device Frame & Before/After Image Slider |
| Call Booking | Cal.com / Calendly 15-min Discovery Call Modal |
| Accent Color Switcher | 4 Neon Accents (Lime, Cyan, Purple, Amber) with persistence |
| UI Micro-Sounds | Subtle interactive click/swoosh sounds with Mute Toggle |
| Canvas Background | Mouse-reactive particle/mesh background |

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

## Phase 7: Real-Time Email Notification & Admin Seeding

**লক্ষ্য:** কন্টাক্ট ফর্মে মেসেজ এলে Admin Messages Inbox-এ জমার পাশাপাশি ইউজারের আসল জিমেইলে (`golamkibriyahawladar@gmail.com`) রিয়েল-টাইম ইমেইল পাঠানো + Admin User রেজিস্ট্রেশন/সিডিং সম্পন্ন করা।

---

### 7.1 — Admin User Seeding

#### [MODIFY] [seed.ts](file:///e:/portfolio/scripts/seed.ts)
- Better-Auth API (`auth.api.signUpEmail`) ব্যবহার করে এডমিন ইউজার চেক ও ইনসার্ট:
  - যদি `user` টেবিল ফাঁকা থাকে → `.env.local` থেকে `ADMIN_EMAIL` ও `ADMIN_PASSWORD` নিয়ে অটোমেটিক অ্যাডমিন অ্যাকাউন্ট রেজিস্টার করবে।
  - `name`: "Golam Kibriya Hawladar"
  - `role`: "admin"

---

### 7.2 — Real-Time Email Dispatcher

#### [NEW] `lib/email.ts`
- Resend SDK (`resend`) অথবা Nodemailer ট্রান্সপোর্টার ইন্টিগ্রেশন (বিনামূল্যে ৩,০০০ ইমেইল/মাস)।
- রেসপনসিভ ডার্ক/মডার্ন HTML ইমেইল টেমপ্লেট:
  - Sender Name, Email Address, Subject, Timestamp
  - Full Message Content formatted cleanly
  - Direct "Reply to Sender" CTA বাটন
- ফেইল-সেফ মেকানিজম (ইমেইল সেন্ডিং ফেইল করলেও ডাটাবেসে মেসেজ ইনসার্ট নিশ্চিত থাকবে)।

#### [MODIFY] [contact.ts](file:///e:/portfolio/app/actions/contact.ts)
- `sendMessage` সার্ভার অ্যাকশন আপডেট:
  1. Zod দিয়ে ফর্ম ইনপুট ভ্যালিডেশন
  2. MySQL ডাটাবেসের `schema.messages` টেবিলে মেসেজ সংরক্ষণ (Admin Inbox-এর জন্য)
  3. `sendAdminNotificationEmail({ name, email, subject, body })` কল করে সরাসরি জিমেইলে নোটিফিকেশন পাঠানো

---

## Phase 8: Website Smart AI Chat Agent Widget

**লক্ষ্য:** পোর্টফোলিওতে একটি প্রিমিয়াম ডার্ক স্টুডিও থিমের Floating AI Chatbot বসানো যা ডাটাবেস থেকে রিয়েল-টাইম তথ্য নিয়ে ক্লায়েন্টদের সাথে চ্যাট করবে এবং চ্যাট থেকেই সরাসরি গোলামকে মেসেজ পাঠাতে পারবে।

---

### 8.1 — AI Agent API & Tool Calling

#### [NEW] `app/api/chat/route.ts`
- Google Gemini 2.0 / 1.5 Flash মডেল (সম্পূর্ণ ফ্রি টায়ার, দৈনিক ১,৫০০ রিকোয়েস্ট)।
- স্ট্রিমড চ্যাট রেসপন্স (Server-Sent Events) যাতে ভিজিটর তাৎক্ষণিক টাইপিং ইফেক্ট দেখতে পায়।
- **DB Tools Calling (এজেন্টের ক্ষমতা):**
  1. `getProfile()`: গোলামের বায়ো, এক্সপেরিয়েন্স, বর্তমান এভেইলেবিলিটি ও সোশাল লিঙ্ক।
  2. `listProjects({ category? })`: প্রজেক্টের লিস্ট, টেক স্ট্যাক, লাইভ লিঙ্ক ও গিটহাব রিপো।
  3. `getServicesAndSkills()`: কোন কোন সার্ভিস প্রদান করেন এবং কোন কোন প্রযুক্তিতে দক্ষ।
  4. `searchBlog({ query })`: পোর্টফোলিওর টেক ব্লগের আর্টিকেল খুঁজে উত্তর দেওয়া।
  5. `leaveMessage({ name, email, message })`: ক্লায়েন্ট যদি চ্যাটের ভেতর বলে "গোলামের সাথে কাজ করতে চাই/মেসেজ পাঠাতে চাই", এজেন্ট তার নাম-ইমেইল নিয়ে সরাসরি MySQL-এ মেসেজ ইনসার্ট করবে এবং জিমেইলে ইমেইল পাঠিয়ে দেবে!

#### [NEW] `lib/ai-agent.ts`
- Gemini API ক্লায়েন্ট ইনিশিয়ালাইজেশন (`@google/genai` বা Gemini REST SDK)।
- সিস্টেম প্রম্পট: "You are the AI Assistant for Golam Kibriya Hawladar's portfolio. You represent him professionally, know all his skills, projects, and services, and can help clients hire him or ask questions."
- টুলস এক্সিকিউটর যা Drizzle ORM কোয়েরির সাথে ম্যাপ করা।

---

### 8.2 — Floating Chat Widget UI

#### [NEW] `components/ai-chat/chat-widget.tsx`
- **Floating Button:** বটম-রাইট কর্নারে গ্লোয়িং পালস ইফেক্ট ও স্পার্কল/বট আইকন।
- **Modal Window:** ডার্ক স্টুডিও গ্লাস-মরফিজম কার্ড (`#0e0e12/95`, বর্ডার `#a3e635/20`, শ্যাডো `blur-2xl`).
- **Quick Action Chips:**
  - "What are Golam's skills?"
  - "Show latest Next.js projects"
  - "How to hire Golam?"
- **Chat Experience:**
  - টাইপিং অ্যানিমেশন ও অটো-স্ক্রোল।
  - সুন্দর মার্কডাউন রেন্ডারিং ও কোড ব্লক।
  - চ্যাট মিনিমাইজ ও ক্লিয়ার হিস্ট্রি অপশন।
  - মোবাইল রেসপনসিভ ফুলস্ক্রিন/ড্রয়ার ড্রপ।

#### [MODIFY] [page.tsx](file:///e:/portfolio/app/page.tsx)
- `<ChatWidget />` মাউন্ট করা (পোর্টফোলিওতে সর্বদা অ্যাক্সেসযোগ্য)।

---

## Phase 9: Official MCP (Model Context Protocol) Server

**লক্ষ্য:** পোর্টফোলিওকে একটি অফিশিয়াল Model Context Protocol (MCP) সার্ভার হিসেবে প্রকাশ করা, যাতে যে কেউ Claude Desktop, Cursor, Antigravity বা Windsurf দিয়ে গোলামের পোর্টফোলিওর ডাটাবেস সরাসরি ইন্টিগ্রেট ও কোয়েরি করতে পারে।

---

### 9.1 — Standalone MCP Server Core

#### [NEW] `scripts/mcp-server.ts`
- `@modelcontextprotocol/sdk` ব্যবহার করে Stdio ও SSE ট্রান্সপোর্ট যুক্ত MCP সার্ভার।
- **Exposed MCP Tools:**
  - `get_portfolio_profile`: সম্পূর্ণ বায়ো, কন্টাক্ট তথ্য ও এভেইলেবিলিটি।
  - `list_projects`: ক্যাটাগরি, স্ট্যাক বা ফিচারড ফিল্টার সহ প্রজেক্ট ক্যাটালগ।
  - `get_services_and_skills`: সার্ভিসেস ও টেক স্কিলসের লিস্ট।
  - `search_blog`: কিওয়ার্ড বা ট্যাগ দিয়ে ব্লগের টেকনিক্যাল আর্টিকেল সার্চ।
  - `send_contact_message`: সরাসরি পোর্টফোলিও ইনবক্সে মেসেজ পোস্ট করা।
- **Exposed MCP Resources:**
  - `portfolio://profile`: গোলামের প্রোফাইলের সম্পূর্ণ মার্কডাউন সামারি।
  - `portfolio://projects`: সম্পূর্ণ প্রজেক্ট ডিরেক্টরি।
  - `portfolio://skills`: সম্পূর্ণ টেক স্ট্যাক ও টুলসের বিবরণ।

---

### 9.2 — MCP Documentation & Admin Snippets

#### [NEW] `app/admin/(dashboard)/mcp/page.tsx`
- অ্যাডমিন প্যানেলে ডেডিকেটেড MCP ম্যানেজমেন্ট পেইজ।
- **Ready-to-Copy Configuration Snippets:**
  - **Claude Desktop:** `claude_desktop_config.json` স্নsnippet।
  - **Cursor / Antigravity:** MCP Settings JSON কনফিগ।
- সার্ভার টেস্ট ও হেলথ চেক স্ট্যাটাস কার্ড।

#### [MODIFY] [package.json](file:///e:/portfolio/package.json)
- স্ক্রিপ্ট যুক্ত করা: `"mcp": "tsx --env-file=.env.local scripts/mcp-server.ts"`

---

## Phase 10: Command Palette (`Cmd + K`), Live Time & Spotify Status

**লক্ষ্য:** রিক্রুটার ও ভিজিটরদের জন্য কীবোর্ড-ফার্স্ট নেভিগেশন, লাইভ টাইমজোন ট্র্যাকার এবং রিয়েল-টাইম স্পটিফাই মিউজিক অ্যাক্টিভিটি।

---

### 10.1 — Command Palette / Quick Terminal

#### [NEW] `components/command-palette.tsx`
- **Global Shortcut:** `Cmd + K` (Mac) বা `Ctrl + K` (Windows) চাপলে Raycast/Linear স্টাইলের ফ্লুইড স্পটলাইট মডাল ওপেন হবে।
- **Quick Fuzzy Search:**
  - প্রজেক্ট, ব্লগ আর্টিকেল, স্কিল এবং সার্ভিসের ইনস্ট্যান্ট ফিল্টারিং।
  - কীবোর্ড অ্যারো কী (`↑`, `↓`) দিয়ে নেভিগেশন ও `Enter` দিয়ে দ্রুত পেইজ ওপেন।
- **Interactive Terminal Commands:**
  - `help`: সকল কমান্ডের লিস্ট।
  - `bio`: গোলামের সংক্ষিপ্ত পরিচয় প্রিন্ট করবে।
  - `projects`: প্রজেক্টস সেকশনে স্ক্রোল।
  - `contact`: সরাসরি কন্টাক্ট মোড ওপেন।
  - `download-cv`: সিভি ডাউনলোডের লিঙ্ক ট্রিগার।
  - `theme`: অ্যাকসেন্ট কালার সাইকেল করা।
  - `clear`: টার্মিনাল ক্লিয়ার করা।
- **Trigger Button:** সাইটের হেডারে একটি সূক্ষ্ম `⌘K` বাটন থাকবে (যাতে মাউস ইউজাররাও ক্লিক করতে পারে)।

---

### 10.2 — Live Local Time & Availability Ticker

#### [NEW] `components/live-status.tsx`
- **Dhaka Timezone Clock:** GMT+6 লাইভ টাইম (ঘণ্টা, মিনিট ও পালসিং সেকেন্ড) স্বয়ংক্রিয়ভাবে টিক করবে।
- **Day/Night & Availability Status Indicator:**
  - `🟢 Available for Freelance & Full-time Roles`
  - রিয়েল-টাইম লোকাল টাইম প্রদর্শন যা বিদেশি ক্লায়েন্টদের টাইমজোন বুঝতে সাহায্য করবে।

---

### 10.3 — Spotify Live Status ("Currently Listening To")

#### [NEW] `lib/spotify.ts`
- Spotify Web API ইন্টিগ্রেশন (OAuth Refresh Token দিয়ে ক্লায়েন্ট কল)।
- এন্ডপয়েন্ট: `/api/spotify` — বর্তমানে চলমান গানের নাম, আর্টিস্ট, অ্যালবাম আর্ট এবং স্পটিফাই ট্র্যাক লিঙ্ক রিটার্ন করবে।

#### [NEW] `components/spotify-status.tsx`
- সাইটের ফুটারে বা প্রোফাইল সেকশনে মিনি ইকুয়ালাইজার অ্যানিমেশন (সবুজ অডিও ওয়েভ বার)।
- যদি গান চালু থাকে: *"Listening to [Song Name] by [Artist] 🎵"*
- গান বন্ধ থাকলে: সর্বশেষ শোনা ট্র্যাকের নাম প্রদর্শন।

---

## Phase 11: Client Conversion & Showcase Suite

**লক্ষ্য:** ক্লায়েন্টদের সরাসরি বুকিং, বাজেট ক্যালকুলেশন এবং প্রজেক্টের চমৎকার ভার্চুয়াল ডিভাইস উপস্থাপনা।

---

### 11.1 — Interactive Project Budget & Scope Estimator

#### [NEW] `components/project-estimator.tsx`
- **Step-by-Step Interactive Calculator:**
  1. **Project Type:** SaaS Web App, E-Commerce, Portfolio / Landing Page, Custom Automation.
  2. **Core Capabilities:** Database & Authentication, AI Integration, Payment Gateway (Stripe/bKash), Admin CMS.
  3. **Timeline:** Rush (1-2 weeks), Standard (3-4 weeks), Flexible.
- **Dynamic Ballpark Calculation:** ক্লায়েন্টের সিলেক্ট করা অপশন অনুযায়ী একটি আনুমানিক বাজেট রেঞ্জ ও ডেলিভারি টাইম তাৎক্ষণিকভাবে হিসাব করবে।
- **1-Click Proposal Submission:** *"Send this scope to Golam"* বাটনে ক্লিক করলে সমস্ত কনফিগারেশন সরাসরি কন্টাক্ট ফর্মে প্রি-ফিল হয়ে ডাটাবেস ও জিমেইল নোটিফিকেশনে চলে যাবে।

---

### 11.2 — Interactive Device Frame & Before/After Project Slider

#### [NEW] `components/device-frame.tsx`
- প্রজেক্টের কভারের জন্য ভার্চুয়াল ম্যাকবুক ও আইফোন ফ্রেম কনটেইনার।
- হোভার করলে স্মুথ ইন্টারনাল স্ক্রলিং ইফেক্ট (ফুল পেইজের প্রিভিউ দেখতে পাবে)।

#### [NEW] `components/before-after-slider.tsx`
- ড্র্যাগেবল স্প্লিট-স্ক্রিন ডিভাইডার (Before Redesign vs After Redesign)।
- ইউজার স্লাইডার ডানে-বামে ড্র্যাগ করে পারফরম্যান্স ও UI ট্রান্সফরমেশন তুলনা করতে পারবে।

---

### 11.3 — Discovery Call Scheduler (Cal.com / Calendly Integration)

#### [NEW] `components/booking-modal.tsx`
- ওয়েবসাইটে এম্বেডেড ১৫ মিনিটের ডিসকভারি কল শিডিউলিং পপআপ।
- ক্লায়েন্ট সাইট ত্যাগ না করেই ক্যালেন্ডার থেকে পছন্দের সময় স্লট নির্বাচন করে সরাসরি গুগল মিট কল বুক করতে পারবে।

---

## Phase 12: Aesthetic Excellence & Audio-Visual Enhancements

**লক্ষ্য:** সাইটের প্রিমিয়াম ডার্ক স্টুডিও ফিলকে কালার কাস্টমাইজেশন, অডিও হ্যাপটিক্স এবং পার্টিকল ব্যাকগ্রাউন্ড দিয়ে সর্বোচ্চ পর্যায়ে নেওয়া।

---

### 12.1 — Dynamic Accent Color Switcher

#### [NEW] `components/accent-picker.tsx`
- ফ্লোটিং বা হেডার কালার পিকার ড্রপডাউন:
  - 🟢 **Neon Lime** (ডিফল্ট: `#a3e635`)
  - 🔵 **Cyber Cyan** (`#06b6d4`)
  - 🟣 **Electric Purple** (`#a855f7`)
  - 🟠 **Sunset Amber** (`#f59e0b`)
- রুট CSS ভ্যারিয়েবল (`--accent`, `--accent-glow`) রিয়েল-টাইমে আপডেট করবে।
- ইউজারের কালার প্রেফারেন্স `localStorage`-এ অটো-সেভ থাকবে।

---

### 12.2 — UI Micro-Sounds Engine (Haptic Audio)

#### [NEW] `lib/sounds.ts`
- Web Audio API সিন্থেসাইজার (কোনো ভারী অডিও ফাইল ছাড়া হালকা কোডেড সাইন-ওয়েভ ক্লিক/সুইশ)।
- অ্যাকশন: বাটন ক্লিক, ট্যাব সুইচ, প্রজেক্ট ওপেন, মোডাল পপআপ।

#### [NEW] `components/sound-toggle.tsx`
- ফুটারে বা হেডারে সাউন্ড মিউট/আনমিউট টগল বাটন (ডিফল্টভাবে নিঃশব্দ/মিউট থাকতে পারে বা ইউজারের ইচ্ছায় অন করা যাবে)।

---

### 12.3 — Interactive Particle Canvas Background

#### [NEW] `components/particle-canvas.tsx`
- জিরো-ডিপেন্ডেন্সি সুপার-লাইটওয়েট HTML5 Canvas পার্টিকল মেশ।
- মাউসের কার্সরের কাছে এলে পার্টিকলগুলো হালকা রিঅ্যাক্ট করবে এবং ব্যাকগ্রাউন্ডে স্পেস গ্লো তৈরি করবে।
- লো-এন্ড ডিভাইসে অটোমেটিক ফ্রেমরেট অপটিমাইজেশন (GPU-friendly)।

---

## 📊 Complete File Inventory

### New Files (57+)

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
| 40 | `lib/email.ts` | 7 |
| 41 | `app/api/chat/route.ts` | 8 |
| 42 | `lib/ai-agent.ts` | 8 |
| 43 | `components/ai-chat/chat-widget.tsx` | 8 |
| 44 | `scripts/mcp-server.ts` | 9 |
| 45 | `app/admin/(dashboard)/mcp/page.tsx` | 9 |
| 46 | `components/command-palette.tsx` | 10 |
| 47 | `components/live-status.tsx` | 10 |
| 48 | `lib/spotify.ts` | 10 |
| 49 | `components/spotify-status.tsx` | 10 |
| 50 | `components/project-estimator.tsx` | 11 |
| 51 | `components/device-frame.tsx` | 11 |
| 52 | `components/before-after-slider.tsx` | 11 |
| 53 | `components/booking-modal.tsx` | 11 |
| 54 | `components/accent-picker.tsx` | 12 |
| 55 | `lib/sounds.ts` | 12 |
| 56 | `components/sound-toggle.tsx` | 12 |
| 57 | `components/particle-canvas.tsx` | 12 |

### Modified Files (19)

| # | File | Phase | কী পরিবর্তন |
|---|---|---|---|
| 1 | `lib/db/schema.ts` | 1 | `category` column + `api_keys` table |
| 2 | `lib/content.ts` | 2 | Blog category query support |
| 3 | `lib/demo-content.ts` | 1 | Category field add to demo posts |
| 4 | `app/layout.tsx` | 3, 10, 12 | GEO metadata + Command Palette + Accent Provider + Sound Provider |
| 5 | `app/blog/page.tsx` | 3 | Category/tag filter + CollectionPage schema |
| 6 | `app/blog/[slug]/page.tsx` | 3 | ToC, reading time, author box, BlogPosting schema, progress bar |
| 7 | `components/markdown.tsx` | 3 | Code copy button, typography enhancement |
| 8 | `app/page.tsx` | 5, 8, 10, 11 | Custom cursor + AI Chat Widget + Estimator + Live Status |
| 9 | `components/dark-studio/page-shell.tsx` | 5 | Custom cursor mount |
| 10 | `components/dark-studio/studio-projects.tsx` | 5, 11 | Remove local cursor, add device frame & before/after preview |
| 11 | `components/dark-studio/studio-services.tsx` | 5 | Spotlight card wrapper |
| 12 | `components/dark-studio/studio-nav.tsx` | 5, 10, 12 | Underline animation + ⌘K trigger + Accent color picker |
| 13 | `scripts/seed.ts` | 7 | Admin user auto-seeding with Better-Auth |
| 14 | `app/actions/contact.ts` | 7 | Real-time email notification trigger + revalidation |
| 15 | `package.json` | 9 | Add MCP server script |
| 16 | `.env.local` | 7, 8, 10 | Resend API key + Gemini API key + Spotify credentials |
| 17 | `app/actions/admin.ts` | 7 | Add layout revalidation on markMessageRead & deleteMessage |
| 18 | `app/admin/(dashboard)/layout.tsx` | 7 | Fix unread count typecast & real-time sync |
| 19 | `app/globals.css` | 12 | Dynamic CSS variable tokens for neon accent switching |

---

## ⚡ Execution Order

```
Phase 1 (DB Setup)           ← 15 min [COMPLETED]
    ↓
Phase 2 (Admin Panel)        ← মূল কাজ, সবচেয়ে বড় [COMPLETED]
    ↓
Phase 3 (Blog GEO)           ← Blog enhance [COMPLETED]
    ↓
Phase 4 (Blog API)           ← API endpoints [COMPLETED]
    ↓
Phase 5 (Animations)         ← Final polish [COMPLETED]
    ↓
Phase 6 (Mobile & Assets)    ← Responsive drawer & image uploads [COMPLETED]
    ↓
Phase 7 (Email & Admin Seed) ← Admin Account Seeding & Real Email Notification + Inbox Badge Fix
    ↓
Phase 8 (AI Chat Agent)      ← Floating Website AI Chatbot with DB Tools
    ↓
Phase 9 (MCP Server)         ← Official Model Context Protocol for External AI
    ↓
Phase 10 (Cmd+K & Live)      ← Command Palette, Dhaka Live Clock & Spotify Ticker
    ↓
Phase 11 (Client Conversion) ← Project Budget Estimator, Device Frame & Booking Modal
    ↓
Phase 12 (Aesthetics & Audio)← Dynamic Accent Switcher, Haptic Sounds & Particle Canvas
```

---

## ✅ Verification Plan

### প্রতিটি Phase-এর পর:

**Phase 1-6 (Completed):**
- অলরেডি সম্পন্ন এবং ভেরিফায়েড।

**Phase 7 (Email, Admin Seed & Inbox Badge Fix):**
- `npm run db:seed` রান করে `user` টেবিলে অ্যাডমিন তৈরি নিশ্চিত করা।
- `/admin/login`-এ সফল লগইন যাচাই।
- কন্টাক্ট ফর্ম থেকে মেসেজ পাঠিয়ে জিমেইলে রিয়েল-টাইম ইমেইল অ্যালার্ট আসা ও সাইডবারের আনরিড ব্যাজ নিখুঁতভাবে সিঙ্ক হওয়া যাচাই।

**Phase 8 (AI Chat Agent):**
- চ্যাট উইজেট থেকে প্রশ্ন করে ডাটাবেস থেকে সঠিক উত্তর পাওয়া এবং চ্যাট থেকে মেসেজ সাবমিট করা যাচাই।

**Phase 9 (MCP Server):**
- `npm run mcp` রান করে Claude Desktop ও Cursor-এ ডাটা কোয়েরি করা যাচাই।

**Phase 10 (Cmd+K, Live Status & Spotify):**
- `Ctrl+K` বা `Cmd+K` চেপে কমান্ড প্যালেট খোলা এবং টার্মিনাল কমান্ড (`bio`, `projects`, `contact`) এক্সিকিউট করা।
- প্রোফাইলে লাইভ ঢাকা সময় ও স্ট্যাটাস ব্যাজ চেক করা।
- স্পটিফাই লাইভ প্লেয়িং স্ট্যাটাস ও ওয়েভ অ্যানিমেশন যাচাই।

**Phase 11 (Estimator, Device Frame & Booking):**
- ইন্টারেক্টিভ প্রজেক্ট এস্টিমেটরে অপশন সিলেক্ট করে বাজেট রেঞ্জ ও ডিরেক্ট প্রপোজাল সাবমিট টেস্ট করা।
- প্রজেক্ট সেকশনে ভার্চুয়াল ডিভাইস ফ্রেম ও Before/After স্লাইডার ড্র্যাগ করে দেখা।
- ১৫ মিনিটের কল বুকিং মোডাল টেস্ট করা।

**Phase 12 (Accent Switcher, Sounds & Particles):**
- অ্যাকসেন্ট কালার পিকার দিয়ে Lime, Cyan, Purple ও Amber পরিবর্তন করে দেখা।
- বাটন ও ট্যাবে ক্লিক করে ফিউচারিস্টিক মাইক্রো-সাউন্ড টেস্ট এবং মিউট টগল যাচাই।
- ব্যাকগ্রাউন্ডে মাউস-রিঅ্যাক্টিভ পার্টিকল ক্যানভাস স্মুথভাবে চলা নিশ্চিত করা।

### Build Check:
```bash
npx pnpm build  # TypeScript + Next.js build — no errors
```

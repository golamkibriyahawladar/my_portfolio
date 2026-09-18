import {
  getProfile,
  getPublishedProjects,
  getServices,
  getSkills,
  getPublishedPosts,
} from '@/lib/content'
import { getDb, schema } from '@/lib/db'
import { sendAdminNotificationEmail } from '@/lib/email'
import { eq } from 'drizzle-orm'
import slugify from 'slugify'

// ─── Server Info ────────────────────────────────────────────────
export const MCP_SERVER_INFO = {
  name: 'golam-portfolio-mcp',
  version: '1.1.0',
}

// ─── Tool Definitions (JSON Schema for MCP protocol) ───────────
export interface McpToolDefinition {
  name: string
  description: string
  inputSchema: Record<string, any>
}

export const MCP_TOOLS: McpToolDefinition[] = [
  {
    name: 'create_blog_post',
    description:
      'Create and publish a new technical blog post directly on Golam Kibriya Hawladar portfolio. Stores full Markdown content, SEO excerpt, tags, and category in the database.',
    inputSchema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'Title of the blog article (e.g. "How Generative Engine Optimization Works in 2026")',
        },
        content: {
          type: 'string',
          description:
            'Full markdown content of the article with headings (##, ###), code snippets, bullet points, and callouts.',
        },
        excerpt: {
          type: 'string',
          description: 'Short 1-2 sentence compelling summary of the article for social sharing and search engines.',
        },
        category: {
          type: 'string',
          description: 'Category name (e.g. "AI & Automation", "Next.js & React", "Fintech", "Engineering")',
        },
        tags: {
          type: 'array',
          items: { type: 'string' },
          description: 'List of relevant keyword tags (e.g. ["AI", "Agents", "Next.js"])',
        },
        published: {
          type: 'boolean',
          description: 'Set to true to publish immediately (live on site), or false to save as a draft.',
        },
        slug: {
          type: 'string',
          description: 'Optional custom URL slug (e.g. "generative-engine-optimization"). Auto-generated if omitted.',
        },
      },
      required: ['title', 'content'],
    },
  },
  {
    name: 'get_portfolio_profile',
    description:
      'Retrieve Golam Kibriya Hawladar profile details, background, role, and current availability',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'list_projects',
    description:
      'Retrieve portfolio projects with tech stack and live URLs. Optionally filter by category.',
    inputSchema: {
      type: 'object',
      properties: {
        category: {
          type: 'string',
          description: 'Filter projects by category (e.g. AI, Web, SaaS)',
        },
      },
    },
  },
  {
    name: 'get_skills_and_services',
    description:
      'Get the full list of technical skills and development services offered by Golam',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'search_blog',
    description:
      'Search technical blog articles and guides published on the portfolio',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search keyword or topic',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'send_contact_message',
    description:
      'Submit an inquiry, collaboration request, or project proposal directly to Golam',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Your full name' },
        email: {
          type: 'string',
          format: 'email',
          description: 'Your contact email address',
        },
        subject: {
          type: 'string',
          description: 'Subject of the inquiry',
        },
        message: {
          type: 'string',
          description: 'Detailed message content (minimum 5 characters)',
        },
      },
      required: ['name', 'email', 'message'],
    },
  },
]

// ─── Resource Definitions ──────────────────────────────────────
export const MCP_RESOURCES = [
  {
    uri: 'portfolio://profile',
    name: 'profile-summary',
    description: 'Golam Kibriya Hawladar profile summary',
    mimeType: 'text/plain',
  },
]

// ─── Tool Executor ─────────────────────────────────────────────
export type McpToolResult = {
  content: Array<{ type: 'text'; text: string }>
  isError?: boolean
}

export async function executeTool(
  toolName: string,
  args: Record<string, any> = {}
): Promise<McpToolResult> {
  switch (toolName) {
    case 'create_blog_post': {
      if (!args.title || !args.content) {
        return {
          content: [
            {
              type: 'text',
              text: 'Error: Both "title" and "content" are required to create a blog post.',
            },
          ],
          isError: true,
        }
      }

      const db = getDb()
      const title = String(args.title).trim()
      const content = String(args.content).trim()
      const category = (args.category && String(args.category).trim()) || 'AI & Automation'
      const excerpt =
        (args.excerpt && String(args.excerpt).trim()) ||
        content.slice(0, 160).replace(/[#*`_\[\]()]/g, '').trim() + '...'
      const tags =
        Array.isArray(args.tags) && args.tags.length > 0
          ? args.tags.map((t: any) => String(t).trim())
          : ['AI', 'Tech']
      const published = args.published !== false // default: true

      const baseSlug =
        (args.slug && String(args.slug).trim()) ||
        slugify(title, { lower: true, strict: true }) ||
        `post-${Date.now()}`

      // Check slug uniqueness
      const [existing] = await db
        .select()
        .from(schema.posts)
        .where(eq(schema.posts.slug, baseSlug))
        .limit(1)

      const finalSlug = existing ? `${baseSlug}-${Date.now()}` : baseSlug

      const [res] = await db.insert(schema.posts).values({
        slug: finalSlug,
        title,
        category,
        excerpt,
        content,
        cover: args.cover || '/projects/ai-support-agent.png',
        tags,
        published,
        publishedAt: published ? new Date() : null,
      })

      try {
        const { revalidatePath } = await import('next/cache')
        revalidatePath('/', 'layout')
        revalidatePath('/blog')
        revalidatePath(`/blog/${finalSlug}`)
      } catch {
        // Safe if executed outside Next.js request context
      }

      const postUrl = `https://my-portfolio-golam-kibriyas-projects.vercel.app/blog/${finalSlug}`

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                success: true,
                message: `Blog post "${title}" has been created and published successfully!`,
                id: res.insertId,
                title,
                slug: finalSlug,
                category,
                tags,
                published,
                url: postUrl,
              },
              null,
              2
            ),
          },
        ],
      }
    }

    case 'get_portfolio_profile': {
      const profile = await getProfile()
      return {
        content: [{ type: 'text', text: JSON.stringify(profile, null, 2) }],
      }
    }

    case 'list_projects': {
      let projects = await getPublishedProjects()
      if (args.category) {
        projects = projects.filter(
          (p) => p.category?.toLowerCase() === args.category.toLowerCase()
        )
      }
      return {
        content: [{ type: 'text', text: JSON.stringify(projects, null, 2) }],
      }
    }

    case 'get_skills_and_services': {
      const [skills, services] = await Promise.all([
        getSkills(),
        getServices(),
      ])
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({ skills, services }, null, 2),
          },
        ],
      }
    }

    case 'search_blog': {
      const posts = await getPublishedPosts()
      const q = (args.query || '').toLowerCase()
      const filtered = posts.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.excerpt?.toLowerCase().includes(q) ||
          p.content.toLowerCase().includes(q)
      )
      return {
        content: [{ type: 'text', text: JSON.stringify(filtered, null, 2) }],
      }
    }

    case 'send_contact_message': {
      if (!args.name || !args.email || !args.message) {
        return {
          content: [
            {
              type: 'text',
              text: 'Missing required fields: name, email, and message are required.',
            },
          ],
          isError: true,
        }
      }

      const db = getDb()
      await db.insert(schema.messages).values({
        name: args.name,
        email: args.email,
        subject: args.subject || 'Inquiry via MCP',
        body: args.message,
      })

      sendAdminNotificationEmail({
        name: args.name,
        email: args.email,
        subject: args.subject || 'Inquiry via MCP',
        body: args.message,
      }).catch((err) =>
        console.error('[MCP] Email dispatch error:', err)
      )

      return {
        content: [
          {
            type: 'text',
            text: `Message successfully delivered to Golam Kibriya Hawladar's inbox. An email alert has been dispatched.`,
          },
        ],
      }
    }

    default:
      return {
        content: [{ type: 'text', text: `Unknown tool: ${toolName}` }],
        isError: true,
      }
  }
}

// ─── Resource Reader ───────────────────────────────────────────
export async function readResource(
  uri: string
): Promise<{ contents: Array<{ uri: string; text: string }> } | null> {
  if (uri === 'portfolio://profile') {
    const profile = await getProfile()
    return {
      contents: [
        {
          uri: 'portfolio://profile',
          text: `# ${profile.name}\n\n**${profile.role}**\n\n${profile.bio}\n\nLocation: ${profile.location}\nEmail: ${profile.email}\nStatus: ${profile.availability}`,
        },
      ],
    }
  }
  return null
}

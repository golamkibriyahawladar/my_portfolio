import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { z } from 'zod'
import { eq } from 'drizzle-orm'
import slugify from 'slugify'
import { getDb, schema } from '../lib/db'
import {
  getProfile,
  getPublishedProjects,
  getServices,
  getSkills,
  getPublishedPosts,
} from '../lib/content'
import { sendAdminNotificationEmail } from '../lib/email'

const server = new McpServer({
  name: 'golam-portfolio-mcp',
  version: '1.1.0',
})

// Tool: Create and Publish Blog Post
server.tool(
  'create_blog_post',
  'Create and publish a technical blog article directly to Golam Kibriya Hawladar portfolio database',
  {
    title: z.string().describe('Title of the blog post'),
    content: z.string().describe('Full markdown content of the article with headings and code examples'),
    excerpt: z.string().optional().describe('Short 1-2 sentence summary for preview'),
    category: z.string().optional().describe('Category (e.g. "AI & Automation", "Next.js", "Engineering")'),
    tags: z.array(z.string()).optional().describe('Keywords or tags'),
    published: z.boolean().optional().describe('Whether to publish immediately (default: true)'),
    slug: z.string().optional().describe('Optional custom URL slug'),
  },
  async ({ title, content, excerpt, category, tags, published, slug }) => {
    const db = getDb()
    const finalTitle = title.trim()
    const finalContent = content.trim()
    const finalCategory = category?.trim() || 'AI & Automation'
    const finalExcerpt =
      excerpt?.trim() ||
      finalContent.slice(0, 160).replace(/[#*`_\[\]()]/g, '').trim() + '...'
    const finalTags = tags && tags.length > 0 ? tags : ['AI', 'Tech']
    const isPublished = published !== false

    const baseSlug =
      slug?.trim() ||
      slugify(finalTitle, { lower: true, strict: true }) ||
      `post-${Date.now()}`

    const [existing] = await db
      .select()
      .from(schema.posts)
      .where(eq(schema.posts.slug, baseSlug))
      .limit(1)

    const finalSlug = existing ? `${baseSlug}-${Date.now()}` : baseSlug

    const [res] = await db.insert(schema.posts).values({
      slug: finalSlug,
      title: finalTitle,
      category: finalCategory,
      excerpt: finalExcerpt,
      content: finalContent,
      cover: '/projects/ai-support-agent.png',
      tags: finalTags,
      published: isPublished,
      publishedAt: isPublished ? new Date() : null,
    })

    const postUrl = `https://my-portfolio-golam-kibriyas-projects.vercel.app/blog/${finalSlug}`

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              success: true,
              message: `Blog post "${finalTitle}" published successfully!`,
              id: res.insertId,
              slug: finalSlug,
              url: postUrl,
            },
            null,
            2
          ),
        },
      ],
    }
  }
)

// Tool: Get Profile Information
server.tool(
  'get_portfolio_profile',
  'Retrieve Golam Kibriya Hawladar profile details, background, role, and current availability',
  {},
  async () => {
    const profile = await getProfile()
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(profile, null, 2),
        },
      ],
    }
  }
)

// Tool: List Projects
server.tool(
  'list_projects',
  'Retrieve portfolio projects with tech stack and live URLs. Optionally filter by category.',
  {
    category: z.string().optional().describe('Filter projects by category (e.g. AI, Web, SaaS)'),
  },
  async ({ category }) => {
    let projects = await getPublishedProjects()
    if (category) {
      projects = projects.filter(
        (p) => p.category?.toLowerCase() === category.toLowerCase()
      )
    }
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(projects, null, 2),
        },
      ],
    }
  }
)

// Tool: Get Skills and Services
server.tool(
  'get_skills_and_services',
  'Get the full list of technical skills and development services offered by Golam',
  {},
  async () => {
    const [skills, services] = await Promise.all([getSkills(), getServices()])
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ skills, services }, null, 2),
        },
      ],
    }
  }
)

// Tool: Search Blog Articles
server.tool(
  'search_blog',
  'Search technical blog articles and guides published on the portfolio',
  {
    query: z.string().describe('Search keyword or topic'),
  },
  async ({ query }) => {
    const posts = await getPublishedPosts()
    const q = query.toLowerCase()
    const filtered = posts.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.excerpt?.toLowerCase().includes(q) ||
        p.content.toLowerCase().includes(q)
    )
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(filtered, null, 2),
        },
      ],
    }
  }
)

// Tool: Send Contact Message
server.tool(
  'send_contact_message',
  'Submit an inquiry, collaboration request, or project proposal directly to Golam',
  {
    name: z.string().describe('Your full name'),
    email: z.string().email().describe('Your contact email address'),
    subject: z.string().optional().describe('Subject of the inquiry'),
    message: z.string().min(5).describe('Detailed message content'),
  },
  async ({ name, email, subject, message }) => {
    const db = getDb()
    await db.insert(schema.messages).values({
      name,
      email,
      subject: subject || 'Inquiry via MCP Server',
      body: message,
    })

    sendAdminNotificationEmail({
      name,
      email,
      subject: subject || 'Inquiry via MCP Server',
      body: message,
    }).catch((err) => console.error('[MCP Server] Email dispatch error:', err))

    return {
      content: [
        {
          type: 'text',
          text: `Message successfully delivered to Golam Kibriya Hawladar's inbox. An email alert has been dispatched to him.`,
        },
      ],
    }
  }
)

// Resource: Profile Summary
server.resource(
  'profile-summary',
  'portfolio://profile',
  async () => {
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
)

async function main() {
  const transport = new StdioServerTransport()
  await server.connect(transport)
  console.error('Golam Portfolio MCP Server running on stdio')
}

main().catch((err) => {
  console.error('Fatal MCP Server error:', err)
  process.exit(1)
})

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { z } from 'zod'
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
  version: '1.0.0',
})

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

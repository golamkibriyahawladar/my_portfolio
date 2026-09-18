import {
  getProfile,
  getPublishedProjects,
  getServices,
  getSkills,
  getPublishedPosts,
} from '@/lib/content'
import { getDb, schema } from '@/lib/db'
import { sendAdminNotificationEmail } from '@/lib/email'

// ─── Server Info ────────────────────────────────────────────────
export const MCP_SERVER_INFO = {
  name: 'golam-portfolio-mcp',
  version: '1.0.0',
}

// ─── Tool Definitions (JSON Schema for MCP protocol) ───────────
export interface McpToolDefinition {
  name: string
  description: string
  inputSchema: Record<string, any>
}

export const MCP_TOOLS: McpToolDefinition[] = [
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

import {
  getProfile,
  getSkills,
  getServices,
  getPublishedProjects,
  getPublishedPosts,
} from '@/lib/content'
import { getDb, schema } from '@/lib/db'
import { sendAdminNotificationEmail } from '@/lib/email'

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export async function processChatConversation(messages: ChatMessage[]) {
  // Load real portfolio context from database
  const [profile, skills, services, projects, posts] = await Promise.all([
    getProfile().catch(() => null),
    getSkills().catch(() => []),
    getServices().catch(() => []),
    getPublishedProjects().catch(() => []),
    getPublishedPosts().catch(() => []),
  ])

  const apiKey = process.env.GEMINI_API_KEY
  const lastUserMessage = messages[messages.length - 1]?.content || ''

  // Format context for LLM or fallback
  const contextSummary = `
Candidate Name: ${profile?.name || 'Golam Kibriya Hawladar'}
Role: ${profile?.role || 'Full Stack Engineer & Web Developer'}
Tagline: ${profile?.tagline || 'Building modern, high-performance web applications'}
Bio: ${profile?.bio || 'Passionate software engineer specializing in Next.js, React, Node.js, and MySQL.'}
Email: ${profile?.email || 'golamkibriyahawladar@gmail.com'}
Location: ${profile?.location || 'Dhaka, Bangladesh'}
Availability: ${profile?.availability || 'Available for freelance projects & full-time roles'}

Skills:
${skills.map((s) => `- ${s.name}`).join('\n')}

Services:
${services.map((srv) => `- ${srv.title}: ${srv.description}`).join('\n')}

Projects:
${projects.map((p) => `- ${p.title} (${p.category}): ${p.description}. Stack: ${p.stack?.join(', ')}. Live: ${p.liveUrl || 'N/A'}`).join('\n')}

Recent Blog Posts:
${posts.map((b) => `- ${b.title} (${b.category}): ${b.excerpt}`).join('\n')}
`.trim()

  // Check if visitor wants to leave a message in the chat
  const contactMatch = detectContactIntent(lastUserMessage)
  if (contactMatch) {
    try {
      const db = getDb()
      await db.insert(schema.messages).values({
        name: contactMatch.name,
        email: contactMatch.email,
        subject: contactMatch.subject || 'Message sent via Portfolio AI Agent',
        body: contactMatch.message,
      })

      sendAdminNotificationEmail({
        name: contactMatch.name,
        email: contactMatch.email,
        subject: contactMatch.subject || 'Message via AI Chat Agent',
        body: contactMatch.message,
      }).catch((err) => console.error('[AI Agent] Email alert error:', err))

      return {
        reply: `Thank you, **${contactMatch.name}**! 🎉 Your message has been saved to Golam's inbox and forwarded to his personal email. He will get back to you shortly at **${contactMatch.email}**.`,
        actionTaken: 'MESSAGE_SENT',
      }
    } catch (err) {
      console.error('[AI Agent] Failed to save contact message from chat', err)
    }
  }

  // If Gemini API Key is configured, use Gemini 2.0 / 1.5 Flash
  if (apiKey) {
    try {
      const systemInstruction = `You are the official AI Assistant for ${profile?.name || 'Golam Kibriya Hawladar'}'s portfolio.
Your role is to represent Golam professionally, accurately answer visitor questions about his experience, projects, skills, and services, and encourage prospective clients to collaborate.
Answer questions in the same language the user asks (English or Bengali). Be concise, warm, and professional.
If someone wants to hire or message Golam, ask for their Name, Email, and Project message so you can deliver it to him.

Here is the verified portfolio data you must use:
${contextSummary}
`

      // Convert conversation history into Gemini contents format
      const contents = messages
        .filter((m) => m.role !== 'system')
        .map((m) => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.content }],
        }))

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemInstruction }] },
            contents,
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 800,
            },
          }),
        }
      )

      if (response.ok) {
        const data = await response.json()
        const text =
          data?.candidates?.[0]?.content?.parts?.[0]?.text ||
          "I'm here to help! Feel free to ask about Golam's projects, technical skills, or hire him."
        return { reply: text }
      } else {
        const errText = await response.text()
        console.error('[AI Agent] Gemini API call error:', errText)
      }
    } catch (err) {
      console.error('[AI Agent] Gemini invocation failed:', err)
    }
  }

  // Fallback intelligent responder based on query intent & real database data
  return { reply: generateFallbackReply(lastUserMessage, { profile, skills, services, projects }) }
}

function detectContactIntent(text: string) {
  // Simple heuristic detection: contains email address and name/message
  const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/i
  const match = text.match(emailRegex)

  if (match) {
    const email = match[1]
    // Clean up text to extract name and message
    return {
      name: 'Portfolio Visitor',
      email,
      message: text,
      subject: 'Inquiry via AI Chat Widget',
    }
  }

  return null
}

function generateFallbackReply(query: string, data: any): string {
  const q = query.toLowerCase()

  if (q.includes('skill') || q.includes('stack') || q.includes('technology') || q.includes('দখতা')) {
    const skillList = (data.skills || []).map((s: any) => s.name).join(', ')
    return `Golam specializes in full-stack web development. His primary technologies include: **${skillList || 'Next.js, React, Node.js, TypeScript, Tailwind CSS, MySQL'}**.\n\nHe specializes in building high-performance modern web apps, APIs, and custom software systems.`
  }

  if (q.includes('project') || q.includes('work') || q.includes('portfolio') || q.includes('কাজ')) {
    const projectList = (data.projects || [])
      .slice(0, 3)
      .map((p: any) => `• **${p.title}** (${p.category}): ${p.description}`)
      .join('\n')
    return `Here are some of Golam's notable projects:\n\n${projectList || 'Multiple full-stack Next.js and SaaS projects.'}\n\nYou can explore full details in the **Projects** section of this portfolio!`
  }

  if (q.includes('service') || q.includes('offer') || q.includes('সার্ভিস')) {
    const serviceList = (data.services || [])
      .map((s: any) => `• **${s.title}**: ${s.description}`)
      .join('\n')
    return `Golam offers the following professional services:\n\n${serviceList || 'Full-stack Web Applications, API Development, and Performance Optimization.'}`
  }

  if (q.includes('contact') || q.includes('hire') || q.includes('email') || q.includes('যোগাযোগ')) {
    return `You can hire or reach Golam directly:\n\n• **Email**: [${data.profile?.email || 'golamkibriyahawladar@gmail.com'}](mailto:${data.profile?.email || 'golamkibriyahawladar@gmail.com'})\n• **Location**: ${data.profile?.location || 'Dhaka, Bangladesh'}\n• **Status**: ${data.profile?.availability || 'Available for freelance projects'}\n\n💡 *Tip: You can also write your email and message right here in this chat, and I will deliver it to his inbox immediately!*`
  }

  return `Hello! 👋 I'm **Golam's AI Assistant**.\n\nI can answer any questions about Golam's **Projects**, **Skills**, and **Services**, or help you book a collaboration.\n\nHow can I help you today?`
}

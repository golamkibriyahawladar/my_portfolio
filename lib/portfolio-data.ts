export const profile = {
  name: 'Alex Morgan',
  role: 'Web Developer & AI Automation Expert',
  tagline:
    'I design and build fast, elegant websites — then wire them to AI systems that do the repetitive work for you.',
  location: 'Dhaka, Bangladesh',
  email: 'hello@alexmorgan.dev',
  availability: 'Available for new projects',
  bio: 'For the past six years I have helped startups and agencies ship production web apps and automate their operations with AI. I care about clean code, considered typography and systems that keep working long after launch.',
  skills: [
    'Next.js',
    'React',
    'TypeScript',
    'Tailwind CSS',
    'Node.js',
    'PostgreSQL',
    'OpenAI / Anthropic APIs',
    'LangChain',
    'n8n / Make',
    'Zapier',
    'Vector databases',
    'Framer Motion',
  ],
}

export type Project = {
  slug: string
  title: string
  category: string
  year: string
  description: string
  stack: string[]
  image: string
  result: string
}

export const projects: Project[] = [
  {
    slug: 'ai-support-agent',
    title: 'Nova Support Agent',
    category: 'AI Automation',
    year: '2026',
    description:
      'A retrieval-augmented support agent that answers 80% of customer tickets automatically, hands off complex cases to humans and learns from every resolved conversation.',
    stack: ['Next.js', 'OpenAI', 'Pinecone', 'Supabase'],
    image: '/projects/ai-support-agent.png',
    result: '-62% response time',
  },
  {
    slug: 'atelier-store',
    title: 'Atelier Commerce',
    category: 'Web Development',
    year: '2025',
    description:
      'Headless fashion storefront with editorial product pages, instant search and a checkout flow tuned for mobile conversion.',
    stack: ['Next.js', 'Shopify', 'Tailwind', 'Stripe'],
    image: '/projects/ecommerce-store.png',
    result: '+38% conversion rate',
  },
  {
    slug: 'flowforge',
    title: 'FlowForge Ops',
    category: 'AI Automation',
    year: '2025',
    description:
      'Internal automation platform connecting CRM, invoicing and Slack — with LLM-powered data extraction replacing 30 hours of manual entry every week.',
    stack: ['n8n', 'Anthropic', 'Node.js', 'PostgreSQL'],
    image: '/projects/workflow-automation.png',
    result: '30 hrs saved / week',
  },
  {
    slug: 'ledger-analytics',
    title: 'Ledger Analytics',
    category: 'Web Development',
    year: '2024',
    description:
      'Real-time financial dashboard for a fintech startup with role-based access, streaming charts and exportable reports.',
    stack: ['React', 'TypeScript', 'Recharts', 'Neon'],
    image: '/projects/fintech-dashboard.png',
    result: '12k daily active users',
  },
]

export const services = [
  {
    title: 'Web Development',
    description:
      'Marketing sites, web apps and e-commerce built on Next.js with a focus on performance, accessibility and pixel-level polish.',
    items: ['Next.js & React apps', 'Headless e-commerce', 'Design systems', 'Performance audits'],
  },
  {
    title: 'AI Automation',
    description:
      'Custom AI agents and workflow automations that connect your tools, read your documents and remove repetitive work.',
    items: ['Custom AI agents', 'RAG knowledge bases', 'Workflow automation', 'API integrations'],
  },
  {
    title: 'Consulting',
    description:
      'Technical strategy for teams adopting AI — from choosing models and vendors to shipping the first production feature.',
    items: ['AI readiness audits', 'Architecture reviews', 'Team workshops', 'Vendor selection'],
  },
]

export const socials = [
  { label: 'GitHub', href: 'https://github.com' },
  { label: 'LinkedIn', href: 'https://linkedin.com' },
  { label: 'X / Twitter', href: 'https://x.com' },
]

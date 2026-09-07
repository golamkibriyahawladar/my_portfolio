import type { Post, Profile, Project, Service, Skill } from '@/lib/db/schema'
import { profile as p, projects as demoProjects, services as demoServices, socials } from '@/lib/portfolio-data'

const now = new Date()

export const demoProfile: Profile = {
  id: 1,
  name: p.name,
  role: p.role,
  tagline: p.tagline,
  bio: p.bio,
  location: p.location,
  email: p.email,
  availability: p.availability,
  portrait: '/portrait.png',
  socials,
  stats: [
    { value: '6+', label: 'Years experience' },
    { value: '40+', label: 'Projects shipped' },
    { value: '18', label: 'AI systems in production' },
  ],
  updatedAt: now,
}

export const demoProjectRows: Project[] = demoProjects.map((project, i) => ({
  id: i + 1,
  slug: project.slug,
  title: project.title,
  category: project.category,
  year: project.year,
  description: project.description,
  content: `## The challenge\n\n${project.description}\n\n## What I built\n\nA production system built with ${project.stack.join(', ')}. This is demo content — edit it from the admin panel once your database is connected.\n\n## Outcome\n\n**${project.result}**`,
  stack: project.stack,
  image: project.image,
  result: project.result,
  liveUrl: null,
  repoUrl: null,
  featured: true,
  published: true,
  sortOrder: i,
  createdAt: now,
  updatedAt: now,
}))

export const demoServiceRows: Service[] = demoServices.map((service, i) => ({
  id: i + 1,
  title: service.title,
  description: service.description,
  items: service.items,
  sortOrder: i,
}))

export const demoSkillRows: Skill[] = p.skills.map((name, i) => ({ id: i + 1, name, sortOrder: i }))

export const demoPostRows: Post[] = [
  {
    id: 1,
    slug: 'building-reliable-ai-agents',
    title: 'Building reliable AI agents for real businesses',
    excerpt:
      'Most AI demos fall apart in production. Here is the checklist I use to ship agents that keep working after launch.',
    content:
      '## Start with the failure modes\n\nBefore writing a single prompt, list every way the agent can be wrong and decide what happens next.\n\n## Retrieval beats memory\n\nGround every answer in your own documents. A small, well-chunked knowledge base outperforms a bigger model every time.\n\n## Keep a human in the loop\n\nRoute low-confidence answers to a person. Log everything. Review weekly.\n\n```ts\nconst result = await agent.run({ input, confidenceThreshold: 0.8 })\nif (result.confidence < 0.8) escalate(result)\n```\n\nThis is demo content — write your own posts from the admin panel.',
    cover: '/projects/ai-support-agent.png',
    category: 'AI & Automation',
    tags: ['AI', 'Automation'],
    published: true,
    publishedAt: new Date('2026-08-12'),
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 2,
    slug: 'nextjs-performance-checklist',
    title: 'The Next.js performance checklist I run before every launch',
    excerpt: 'Images, fonts, caching and the handful of settings that make a site feel instant.',
    content:
      '## Images\n\nUse `next/image` with explicit sizes. Serve AVIF.\n\n## Fonts\n\nSelf-host with `next/font`, preload only the weights you use.\n\n## Caching\n\nCache everything that is not personal. Revalidate on publish, not on a timer.\n\nThis is demo content — write your own posts from the admin panel.',
    cover: '/projects/ecommerce-store.png',
    category: 'Web Development',
    tags: ['Next.js', 'Performance'],
    published: true,
    publishedAt: new Date('2026-06-03'),
    createdAt: now,
    updatedAt: now,
  },
]

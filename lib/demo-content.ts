import type { Post, Profile, Project, Service, Skill } from '@/lib/db/schema'
import { profile as p, projects as demoProjects, services as demoServices, socials } from '@/lib/portfolio-data'
import { postsData } from '@/lib/posts-data'

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

export const demoPostRows: Post[] = postsData

import { Post, Profile } from '@/lib/db/schema'

export interface HeadingItem {
  id: string
  text: string
  level: number
}

// Calculate estimated reading time in minutes
export function calculateReadingTime(content: string): string {
  const wordsPerMinute = 200
  const words = content.trim().split(/\s+/).length
  const minutes = Math.ceil(words / wordsPerMinute)
  return `${minutes} min read`
}

// Extract h2 and h3 markdown headings for Table of Contents
export function extractHeadings(markdown: string): HeadingItem[] {
  const headingRegex = /^(#{2,3})\s+(.+)$/gm
  const headings: HeadingItem[] = []
  let match

  while ((match = headingRegex.exec(markdown)) !== null) {
    const level = match[1].length
    const text = match[2].trim()
    const id = text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')

    headings.push({ id, text, level })
  }

  return headings
}

// JSON-LD: Person Schema
export function generatePersonSchema(profile: Profile, baseUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: profile.name,
    jobTitle: profile.role,
    description: profile.bio,
    url: baseUrl,
    image: profile.portrait ? `${baseUrl}${profile.portrait}` : undefined,
    sameAs: profile.socials?.map((s) => s.href) || [],
    knowsAbout: [
      'Generative Engine Optimization (GEO)',
      'Artificial Intelligence',
      'Full-Stack Architecture',
      'Next.js',
      'Machine Learning',
      'System Design',
    ],
  }
}

// JSON-LD: BlogPosting Schema for GEO & SEO
export function generateArticleSchema(
  post: Post,
  profile: Profile,
  baseUrl: string
) {
  const postUrl = `${baseUrl}/blog/${post.slug}`
  const imageUrl = post.cover
    ? post.cover.startsWith('http')
      ? post.cover
      : `${baseUrl}${post.cover}`
    : `${baseUrl}/portrait.png`

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    url: postUrl,
    image: imageUrl,
    datePublished: post.publishedAt
      ? new Date(post.publishedAt).toISOString()
      : new Date(post.createdAt).toISOString(),
    dateModified: new Date(post.updatedAt).toISOString(),
    articleSection: post.category || 'Technology',
    keywords: Array.isArray(post.tags) ? post.tags.join(', ') : undefined,
    author: {
      '@type': 'Person',
      name: profile.name,
      jobTitle: profile.role,
      url: baseUrl,
    },
    publisher: {
      '@type': 'Person',
      name: profile.name,
      url: baseUrl,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': postUrl,
    },
  }
}

// JSON-LD: BreadcrumbList Schema
export function generateBreadcrumbSchema(
  items: { name: string; url: string }[]
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

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

  const words = post.content ? post.content.trim().split(/\s+/).filter(Boolean).length : 0
  const readingMinutes = Math.max(1, Math.ceil(words / 200))

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    url: postUrl,
    image: imageUrl,
    inLanguage: 'en-US',
    wordCount: words,
    timeRequired: `PT${readingMinutes}M`,
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

export interface FAQItem {
  question: string
  answer: string
}

// JSON-LD: FAQPage Schema for Google Rich Snippets & GEO
export function generateFaqSchema(faqs: FAQItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }
}

// Automatically extract FAQ items from markdown content
export function extractFaqs(markdown: string): FAQItem[] {
  const faqs: FAQItem[] = []

  // Method 1: Find FAQ section or question headings (### Question?)
  const faqSectionRegex = /^(?:#{2,3})\s+(?:FAQ|Frequently Asked Questions|Common Questions)[\s\S]*$/im
  const faqSectionMatch = markdown.match(faqSectionRegex)
  const textToScan = faqSectionMatch ? faqSectionMatch[0] : markdown

  const questionRegex = /^(?:#{3,4})\s+(?:Q:?\s*)?([^#\n]+\?)\s*\n+([\s\S]*?)(?=(?:^#{2,4}\s+|\Z))/gim
  let match
  while ((match = questionRegex.exec(textToScan)) !== null) {
    const question = match[1].trim()
    const rawAnswer = match[2].trim()
    const answer = rawAnswer
      .replace(/```[\s\S]*?```/g, '[code snippet]')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/[*_~`]/g, '')
      .replace(/\n+/g, ' ')
      .trim()

    if (question && answer && answer.length > 10) {
      faqs.push({ question, answer })
    }
  }

  // Method 2: Bold Q&A format (**Q: ...?** \n A: ...)
  if (faqs.length === 0) {
    const boldQaRegex = /\*\*Q:?\s*([^*]+?\?)\*\*\s*\n+(?:A:?\s*)?([^\n*#]+(?:\n[^\n*#]+)*)/gim
    let qaMatch
    while ((qaMatch = boldQaRegex.exec(markdown)) !== null) {
      const question = qaMatch[1].trim()
      const answer = qaMatch[2].replace(/\n+/g, ' ').trim()
      if (question && answer) {
        faqs.push({ question, answer })
      }
    }
  }

  return faqs
}

export interface ProductSchemaData {
  name: string
  description: string
  url: string
  image?: string
  price?: string | number
  currency?: string
  rating?: number
  reviewCount?: number
  category?: string
}

// JSON-LD: Product Schema for Digital Products & High-Ticket Offers
export function generateProductSchema(
  product: ProductSchemaData,
  brandName: string,
  baseUrl: string
) {
  const imageUrl = product.image
    ? product.image.startsWith('http')
      ? product.image
      : `${baseUrl}${product.image}`
    : `${baseUrl}/portrait.png`

  const schema: any = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: imageUrl,
    url: product.url,
    brand: {
      '@type': 'Brand',
      name: brandName,
    },
  }

  if (product.price !== undefined) {
    const numericPrice =
      typeof product.price === 'number'
        ? product.price
        : parseFloat(String(product.price).replace(/[^0-9.]/g, '')) || 0

    schema.offers = {
      '@type': 'Offer',
      price: numericPrice,
      priceCurrency: product.currency || 'USD',
      availability: 'https://schema.org/InStock',
      url: product.url,
      seller: {
        '@type': 'Person',
        name: brandName,
        url: baseUrl,
      },
    }
  }

  if (product.rating) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: product.rating,
      reviewCount: product.reviewCount || 1,
      bestRating: 5,
      worstRating: 1,
    }
  }

  return schema
}

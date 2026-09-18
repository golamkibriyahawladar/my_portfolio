import type { Metadata } from 'next'
import { BlogShell } from '@/components/blog/blog-shell'
import { Reveal } from '@/components/reveal'
import { getProfile, getPublishedPosts } from '@/lib/content'
import { BlogFilter } from '@/components/blog-filter'

// ISR: Revalidate blog listing every 60 min
export const revalidate = 3600

const baseUrl =
  process.env.NEXT_PUBLIC_APP_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')

export const metadata: Metadata = {
  title: 'AI Voice Agents & Advanced Automation Workflows | Engineering Dispatch',
  description:
    'Technical essays, architecture checklists, and production blueprints for autonomous voice agents, self-healing n8n workflows, and Generative Engine Optimization.',
  alternates: {
    canonical: `${baseUrl}/blog`,
  },
  openGraph: {
    title: 'AI Voice Agents & Advanced Automation Workflows | Golam Kibriya Hawladar',
    description:
      'Production-tested blueprints for AI voice agents, sub-600ms telephony pipelines, resilient multi-agent automations, and system prompt engineering.',
    url: `${baseUrl}/blog`,
    type: 'website',
    images: [
      {
        url: `${baseUrl}/portrait.png`,
        width: 1200,
        height: 630,
        alt: 'Golam Kibriya Hawladar — AI Voice & Automation Engineering Dispatch',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Voice Agents & Advanced Automation Workflows | Golam Kibriya Hawladar',
    description:
      'Production-tested blueprints for AI voice agents, sub-600ms telephony pipelines, resilient multi-agent automations, and system prompt engineering.',
    images: [`${baseUrl}/portrait.png`],
  },
}

export default async function BlogPage() {
  const [profile, posts] = await Promise.all([getProfile(), getPublishedPosts()])

  // JSON-LD CollectionPage Schema for GEO & SEO
  const collectionJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${profile.name} — AI Voice & Automation Engineering Dispatch`,
    description:
      'Technical publications on autonomous AI voice agents, resilient n8n automation pipelines, and Generative Engine Optimization (GEO).',
    url: `${baseUrl}/blog`,
    author: {
      '@type': 'Person',
      name: profile.name,
      url: baseUrl,
    },
    hasPart: posts.map((post) => ({
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.excerpt,
      url: `${baseUrl}/blog/${post.slug}`,
      datePublished: post.publishedAt
        ? new Date(post.publishedAt).toISOString()
        : new Date(post.createdAt).toISOString(),
    })),
  }

  return (
    <BlogShell profile={profile}>
      {/* Inject CollectionPage JSON-LD for AI search engines */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />

      <section className="mx-auto max-w-[1600px] px-6 md:px-10 py-6 md:py-10">
        <Reveal>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#a3e635] animate-pulse" />
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#a3e635] font-semibold">
              AI Engineering, Voice Telephony &amp; Advanced Workflows
            </p>
          </div>
          <h1 className="mt-4 font-grotesk text-[clamp(2.2rem,6vw,5.5rem)] font-medium leading-[1] tracking-[-0.035em] text-white">
            Architecture notes, blueprints &amp; <span className="text-[#bef264]">systems</span>
          </h1>
          <p className="mt-5 max-w-2xl text-white/60 text-sm sm:text-base leading-relaxed">
            Production-tested guides for engineers building autonomous voice agents, resilient n8n multi-agent pipelines, system prompts, and high-performance full-stack AI applications.
          </p>
        </Reveal>

        <div className="mt-10">
          <BlogFilter posts={posts} />
        </div>
      </section>
    </BlogShell>
  )
}

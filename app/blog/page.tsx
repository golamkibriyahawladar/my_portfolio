import { PageShell } from '@/components/dark-studio/page-shell'
import { Reveal } from '@/components/reveal'
import { getProfile, getPublishedPosts } from '@/lib/content'
import { BlogFilter } from '@/components/blog-filter'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Blog & Insights | AI, GEO, & Systems Engineering',
  description:
    'Technical essays, architecture checklists, and Generative Engine Optimization strategies for modern web and AI systems.',
}

export default async function BlogPage() {
  const [profile, posts] = await Promise.all([getProfile(), getPublishedPosts()])

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')

  // JSON-LD CollectionPage Schema for GEO & SEO
  const collectionJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${profile.name} — Technical Blog`,
    description:
      'Technical articles on AI engineering, Generative Engine Optimization (GEO), and software design.',
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
    <PageShell profile={profile}>
      {/* Inject CollectionPage JSON-LD for AI search engines */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />

      <section className="mx-auto max-w-[1600px] px-6 md:px-10 py-8">
        <Reveal>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#a3e635] animate-pulse" />
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#a3e635]">
              GEO &amp; Engineering Blog
            </p>
          </div>
          <h1 className="mt-4 font-grotesk text-[clamp(2.5rem,7vw,7rem)] font-medium leading-[0.95] tracking-[-0.04em] text-white">
            Notes, systems &amp; <span className="text-[#bef264]">writing</span>
          </h1>
          <p className="mt-6 max-w-2xl text-white/60 text-sm sm:text-base leading-relaxed">
            Deep dives into Generative Engine Optimization, autonomous agent architectures, full-stack performance, and shipping production systems.
          </p>
        </Reveal>

        <div className="mt-12">
          <BlogFilter posts={posts} />
        </div>
      </section>
    </PageShell>
  )
}

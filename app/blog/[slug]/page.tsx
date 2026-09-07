import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Clock, Calendar, ArrowRight, User } from 'lucide-react'
import { PageShell } from '@/components/dark-studio/page-shell'
import { Markdown } from '@/components/markdown'
import { Reveal } from '@/components/reveal'
import { getPostBySlug, getProfile, getPublishedPosts } from '@/lib/content'
import { formatDate } from '@/lib/format'
import {
  calculateReadingTime,
  extractHeadings,
  generateArticleSchema,
  generateBreadcrumbSchema,
} from '@/lib/geo'
import { TableOfContents } from '@/components/table-of-contents'
import { ReadingProgressBar } from '@/components/reading-progress-bar'

export const dynamic = 'force-dynamic'

interface BlogPostPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: BlogPostPageProps) {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) return { title: 'Post not found' }

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')

  const postUrl = `${baseUrl}/blog/${post.slug}`
  const imageUrl = post.cover
    ? post.cover.startsWith('http')
      ? post.cover
      : `${baseUrl}${post.cover}`
    : `${baseUrl}/portrait.png`

  return {
    title: `${post.title} | Blog`,
    description: post.excerpt,
    alternates: {
      canonical: postUrl,
    },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: postUrl,
      type: 'article',
      publishedTime: post.publishedAt
        ? new Date(post.publishedAt).toISOString()
        : new Date(post.createdAt).toISOString(),
      tags: post.tags,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: [imageUrl],
    },
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params
  const [profile, post, allPosts] = await Promise.all([
    getProfile(),
    getPostBySlug(slug),
    getPublishedPosts(),
  ])

  if (!post) notFound()

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')

  const readingTime = calculateReadingTime(post.content)
  const headings = extractHeadings(post.content)

  // Find 2 related posts matching category or tags
  const relatedPosts = allPosts
    .filter(
      (p) =>
        p.id !== post.id &&
        (p.category === post.category ||
          (Array.isArray(p.tags) &&
            Array.isArray(post.tags) &&
            p.tags.some((t) => post.tags.includes(t))))
    )
    .slice(0, 2)

  // Fallback to any recent post if no category/tag match
  if (relatedPosts.length < 2) {
    const fallback = allPosts.filter((p) => p.id !== post.id && !relatedPosts.includes(p))
    relatedPosts.push(...fallback.slice(0, 2 - relatedPosts.length))
  }

  // Schemas for GEO & SEO
  const articleSchema = generateArticleSchema(post, profile, baseUrl)
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: baseUrl },
    { name: 'Blog', url: `${baseUrl}/blog` },
    { name: post.title, url: `${baseUrl}/blog/${post.slug}` },
  ])

  return (
    <PageShell profile={profile}>
      {/* Top reading scroll progress bar */}
      <ReadingProgressBar />

      {/* Structured Data for Search & Generative AI Engines */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <article className="mx-auto max-w-6xl px-6 md:px-10 py-6">
        {/* Navigation & Metadata Header */}
        <Reveal>
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6 mb-8">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-white/50 transition-colors hover:text-[#a3e635]"
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
              All articles
            </Link>

            <div className="flex items-center gap-3">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-[#a3e635]/15 text-[#a3e635] border border-[#a3e635]/30">
                {post.category || 'Engineering'}
              </span>
              <div className="flex items-center gap-1.5 text-xs text-white/40 font-mono">
                <Clock className="w-3.5 h-3.5 text-[#bef264]" />
                <span>{readingTime}</span>
              </div>
            </div>
          </div>

          {/* Published date and tags */}
          <div className="flex items-center gap-2 text-xs font-mono text-white/40 mb-4">
            <Calendar className="w-3.5 h-3.5" />
            <time dateTime={post.publishedAt ? new Date(post.publishedAt).toISOString() : undefined}>
              {post.publishedAt ? formatDate(post.publishedAt) : 'Draft'}
            </time>
            {Array.isArray(post.tags) && post.tags.length > 0 && (
              <>
                <span>•</span>
                <span>{post.tags.join(', ')}</span>
              </>
            )}
          </div>

          <h1 className="font-grotesk text-3xl sm:text-5xl lg:text-6xl font-medium leading-[1.05] tracking-[-0.03em] text-white">
            {post.title}
          </h1>

          {/* GEO Executive Summary Box (Direct Answer for AI engines) */}
          <div className="mt-8 p-6 rounded-2xl bg-white/[0.03] border border-white/10 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-[#a3e635]" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#a3e635] font-bold block mb-2">
              Key takeaway / Executive summary
            </span>
            <p className="text-base sm:text-lg leading-relaxed text-white/80 font-normal">
              {post.excerpt}
            </p>
          </div>

          {/* Author micro-banner */}
          <div className="mt-6 flex items-center gap-3 py-3 border-y border-white/5">
            <div className="w-9 h-9 rounded-full overflow-hidden relative bg-white/10 shrink-0 border border-[#a3e635]/40">
              {profile.portrait ? (
                <Image
                  src={profile.portrait}
                  alt={profile.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <User className="w-5 h-5 m-2 text-white/50" />
              )}
            </div>
            <div>
              <span className="text-xs font-semibold text-white block">{profile.name}</span>
              <span className="text-[11px] text-white/40 block font-mono">{profile.role}</span>
            </div>
          </div>
        </Reveal>

        {/* Cover image */}
        {post.cover && (
          <Reveal delay={0.1} className="relative mt-8 aspect-[16/9] max-h-[500px] overflow-hidden rounded-2xl border border-white/10">
            <Image
              src={post.cover}
              alt={post.title}
              fill
              priority
              sizes="(min-width: 1024px) 1100px, 100vw"
              className="object-cover"
            />
          </Reveal>
        )}

        {/* Main Content Grid: ToC Sidebar (Left) + Markdown Article (Right) */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Sticky Table of Contents (Desktop sidebar / Mobile dropdown) */}
          <aside className="lg:col-span-3 order-1 lg:order-1">
            <TableOfContents headings={headings} />
          </aside>

          {/* Article Markdown Body */}
          <div className="lg:col-span-9 order-2 lg:order-2 min-w-0">
            <Reveal delay={0.15}>
              <Markdown content={post.content} />
            </Reveal>

            {/* Author Bio Card at Bottom */}
            <div className="mt-16 p-6 sm:p-8 rounded-2xl border border-white/10 bg-[#121216]/60 flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="w-16 h-16 rounded-2xl overflow-hidden relative bg-white/10 shrink-0 border border-[#a3e635]/40 shadow-xl">
                {profile.portrait ? (
                  <Image
                    src={profile.portrait}
                    alt={profile.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <User className="w-8 h-8 m-4 text-white/50" />
                )}
              </div>
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white">{profile.name}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#a3e635]/15 text-[#a3e635] font-mono">
                    Author
                  </span>
                </div>
                <p className="text-xs text-white/50">{profile.role}</p>
                <p className="text-xs text-white/70 leading-relaxed pt-1">{profile.bio}</p>
              </div>
            </div>

            {/* Related Posts Section */}
            {relatedPosts.length > 0 && (
              <div className="mt-16 pt-12 border-t border-white/10 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-grotesk text-xl font-bold text-white">
                    Related Articles
                  </h3>
                  <Link
                    href="/blog"
                    className="text-xs text-[#a3e635] hover:underline flex items-center gap-1"
                  >
                    All articles <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {relatedPosts.map((rel) => (
                    <Link
                      key={rel.id}
                      href={`/blog/${rel.slug}`}
                      className="group p-5 rounded-xl border border-white/10 bg-[#121216]/40 hover:border-[#a3e635]/40 hover:bg-white/[0.02] transition-all space-y-2 flex flex-col justify-between"
                    >
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-mono text-[#a3e635] uppercase tracking-wider block">
                          {rel.category || 'Article'}
                        </span>
                        <h4 className="text-sm font-semibold text-white group-hover:text-[#bef264] transition-colors leading-snug line-clamp-2">
                          {rel.title}
                        </h4>
                        <p className="text-xs text-white/50 line-clamp-2 leading-relaxed">
                          {rel.excerpt}
                        </p>
                      </div>
                      <div className="pt-2 flex items-center justify-between text-[10px] font-mono text-white/30 border-t border-white/5">
                        <span>{calculateReadingTime(rel.content)}</span>
                        <span className="text-[#a3e635] group-hover:translate-x-1 transition-transform">
                          Read article →
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </article>
    </PageShell>
  )
}

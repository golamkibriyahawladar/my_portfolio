'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowUpRight,
  Clock,
  Search,
  X,
  Sparkles,
  ArrowRight,
  Calendar,
  Layers,
  BookOpen,
} from 'lucide-react'
import { Post } from '@/lib/db/schema'
import { formatDate } from '@/lib/format'
import { calculateReadingTime } from '@/lib/geo'

interface BlogFilterProps {
  posts: Post[]
}

export function BlogFilter({ posts }: BlogFilterProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState<string>('')

  // Extract unique categories and counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: posts.length }
    posts.forEach((p) => {
      const cat = p.category || 'General'
      counts[cat] = (counts[cat] || 0) + 1
    })
    return counts
  }, [posts])

  const categories = Object.keys(categoryCounts)

  // Extract all tags
  const allTags = useMemo(
    () => Array.from(new Set(posts.flatMap((p) => p.tags || []))),
    [posts]
  )

  // Filtered posts based on category, tag, and search query
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchesCategory =
        selectedCategory === 'All' || (post.category || 'General') === selectedCategory
      const matchesTag = !selectedTag || (post.tags && post.tags.includes(selectedTag))
      const matchesSearch =
        !searchQuery.trim() ||
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))

      return matchesCategory && matchesTag && matchesSearch
    })
  }, [posts, selectedCategory, selectedTag, searchQuery])

  // Featured post: The top post when no filter is applied
  const featuredPost =
    selectedCategory === 'All' && !selectedTag && !searchQuery.trim() && filteredPosts.length > 0
      ? filteredPosts[0]
      : null

  const regularPosts = featuredPost
    ? filteredPosts.filter((p) => p.id !== featuredPost.id)
    : filteredPosts

  return (
    <div className="space-y-10">
      {/* Search & Filter Control Bar */}
      <div className="p-6 rounded-2xl border border-white/10 bg-[#0e0e13]/80 backdrop-blur-md space-y-6">
        {/* Search input + Active Filter summary */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-lg">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search architecture guides, blueprints, prompts, tools..."
              className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-white/10 bg-white/[0.03] text-sm text-white placeholder-white/30 focus:border-[#a3e635] focus:outline-none focus:ring-1 focus:ring-[#a3e635] transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-white/40">
            <Layers className="w-3.5 h-3.5 text-[#a3e635]" />
            <span>
              Showing <strong className="text-white">{filteredPosts.length}</strong> of{' '}
              {posts.length} articles
            </span>
          </div>
        </div>

        {/* Category Pill Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat && !selectedTag
            return (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat)
                  setSelectedTag(null)
                }}
                className={`px-3.5 py-1.5 rounded-full text-xs font-mono transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-[#a3e635] text-[#0a0a0a] font-bold shadow-md shadow-[#a3e635]/20'
                    : 'bg-white/[0.04] text-white/60 hover:text-white hover:bg-white/10 border border-white/10'
                }`}
              >
                <span>{cat}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isSelected ? 'bg-black/20 text-black' : 'bg-white/10 text-white/40'
                  }`}
                >
                  {categoryCounts[cat] || 0}
                </span>
              </button>
            )
          })}
        </div>

        {/* Tag pills */}
        {allTags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-white/5">
            <span className="text-[11px] font-mono text-white/30 uppercase mr-1">Filter tag:</span>
            {allTags.map((tag) => {
              const isSelected = selectedTag === tag
              return (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(isSelected ? null : tag)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-colors ${
                    isSelected
                      ? 'bg-[#a3e635]/20 text-[#a3e635] border border-[#a3e635]/40 font-semibold'
                      : 'bg-white/[0.03] text-white/40 hover:text-white hover:bg-white/[0.08] border border-white/5'
                  }`}
                >
                  #{tag}
                </button>
              )
            })}
            {(selectedTag || searchQuery || selectedCategory !== 'All') && (
              <button
                onClick={() => {
                  setSelectedCategory('All')
                  setSelectedTag(null)
                  setSearchQuery('')
                }}
                className="text-[11px] font-mono text-[#a3e635] hover:underline ml-2"
              >
                Reset all filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Hero Featured Article (Shown when browsing default view) */}
      {featuredPost && (
        <div className="relative group overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-br from-[#14141c] via-[#0e0e14] to-[#09090d] p-6 sm:p-10 shadow-2xl transition-all hover:border-[#a3e635]/40 hover:shadow-[0_0_50px_rgba(163,230,53,0.08)]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-[#a3e635] text-[#0a0a0a]">
                  <Sparkles className="w-3 h-3" />
                  Featured Blueprint
                </span>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-mono uppercase bg-white/5 text-[#bef264] border border-white/10">
                  {featuredPost.category}
                </span>
                <div className="flex items-center gap-1.5 text-xs text-white/40 font-mono">
                  <Clock className="w-3.5 h-3.5 text-[#a3e635]" />
                  <span>{calculateReadingTime(featuredPost.content)}</span>
                </div>
              </div>

              <Link href={`/blog/${featuredPost.slug}`}>
                <h2 className="font-grotesk text-2xl sm:text-4xl font-bold tracking-tight text-white group-hover:text-[#bef264] transition-colors leading-[1.1]">
                  {featuredPost.title}
                </h2>
              </Link>

              <p className="text-white/60 text-sm sm:text-base leading-relaxed line-clamp-3">
                {featuredPost.excerpt}
              </p>

              <div className="pt-2 flex items-center gap-4">
                <Link
                  href={`/blog/${featuredPost.slug}`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#a3e635] text-[#0a0a0a] text-sm font-bold font-grotesk hover:bg-[#bef264] transition-all active:scale-95 shadow-[0_0_20px_rgba(163,230,53,0.3)]"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Read Technical Blueprint</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <span className="text-xs font-mono text-white/40">
                  {featuredPost.publishedAt ? formatDate(featuredPost.publishedAt) : 'Recent'}
                </span>
              </div>
            </div>

            <div className="lg:col-span-5">
              <Link
                href={`/blog/${featuredPost.slug}`}
                className="relative aspect-[16/10] block overflow-hidden rounded-2xl border border-white/10 bg-white/5 group-hover:border-white/25 transition-all"
              >
                {featuredPost.cover ? (
                  <Image
                    src={featuredPost.cover}
                    alt={featuredPost.title}
                    fill
                    priority
                    sizes="(min-width: 1024px) 500px, 100vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-white/5 font-mono text-xs text-white/30">
                    No preview available
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#09090d]/80 via-transparent to-transparent opacity-60" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Articles Grid */}
      {filteredPosts.length === 0 ? (
        <div className="p-20 text-center rounded-2xl border border-white/10 bg-white/[0.02] space-y-4">
          <p className="text-white/50 text-base font-medium">
            No technical guides or blueprints match "{searchQuery || selectedCategory}".
          </p>
          <button
            onClick={() => {
              setSelectedCategory('All')
              setSelectedTag(null)
              setSearchQuery('')
            }}
            className="px-4 py-2 rounded-xl bg-[#a3e635] text-black text-xs font-bold font-mono hover:bg-[#bef264]"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {regularPosts.map((post) => {
            const readingTime = calculateReadingTime(post.content)

            return (
              <article
                key={post.id}
                className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-[#0e0e13]/60 p-5 transition-all duration-300 hover:border-[#a3e635]/40 hover:bg-white/[0.02] hover:shadow-[0_0_30px_rgba(163,230,53,0.05)]"
              >
                <div className="space-y-4">
                  {/* Cover Image */}
                  <Link
                    href={`/blog/${post.slug}`}
                    className="relative aspect-[16/10] block overflow-hidden rounded-xl border border-white/10 bg-white/5"
                  >
                    {post.cover ? (
                      <Image
                        src={post.cover}
                        alt={post.title}
                        fill
                        sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-white/5 font-mono text-xs text-white/30">
                        Technical Architecture
                      </div>
                    )}
                    <div className="absolute top-2.5 left-2.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-[#0a0a0e]/90 text-[#a3e635] border border-[#a3e635]/30 backdrop-blur-md">
                        {post.category || 'Engineering'}
                      </span>
                    </div>
                  </Link>

                  {/* Date & Reading time */}
                  <div className="flex items-center justify-between text-xs font-mono text-white/40 pt-1">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3 h-3 text-white/30" />
                      <time dateTime={post.publishedAt ? new Date(post.publishedAt).toISOString() : undefined}>
                        {post.publishedAt ? formatDate(post.publishedAt) : 'Recent'}
                      </time>
                    </div>
                    <div className="flex items-center gap-1 text-[#bef264]">
                      <Clock className="w-3 h-3" />
                      <span>{readingTime}</span>
                    </div>
                  </div>

                  {/* Title & Excerpt */}
                  <div className="space-y-2">
                    <Link href={`/blog/${post.slug}`}>
                      <h3 className="font-grotesk text-lg sm:text-xl font-bold text-white group-hover:text-[#bef264] transition-colors line-clamp-2 leading-snug">
                        {post.title}
                      </h3>
                    </Link>
                    <p className="text-xs sm:text-sm text-white/60 line-clamp-3 leading-relaxed">
                      {post.excerpt}
                    </p>
                  </div>
                </div>

                {/* Footer: Tags & Read Link */}
                <div className="pt-5 mt-4 border-t border-white/5 flex items-center justify-between">
                  <div className="flex flex-wrap gap-1">
                    {post.tags?.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] font-mono text-white/40 px-2 py-0.5 rounded bg-white/5"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <Link
                    href={`/blog/${post.slug}`}
                    className="inline-flex items-center gap-1 text-xs font-mono font-semibold text-[#a3e635] group-hover:translate-x-0.5 transition-transform"
                  >
                    <span>Read guide</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}

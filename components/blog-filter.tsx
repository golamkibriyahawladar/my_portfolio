'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowUpRight, Clock, Tag } from 'lucide-react'
import { Post } from '@/lib/db/schema'
import { formatDate } from '@/lib/format'
import { calculateReadingTime } from '@/lib/geo'

interface BlogFilterProps {
  posts: Post[]
}

export function BlogFilter({ posts }: BlogFilterProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [selectedTag, setSelectedTag] = useState<string | null>(null)

  // Extract unique categories
  const categories = ['All', ...Array.from(new Set(posts.map((p) => p.category || 'General')))]

  // Extract all tags
  const allTags = Array.from(new Set(posts.flatMap((p) => p.tags || [])))

  const filteredPosts = posts.filter((post) => {
    const matchesCategory =
      selectedCategory === 'All' || (post.category || 'General') === selectedCategory
    const matchesTag = !selectedTag || (post.tags && post.tags.includes(selectedTag))
    return matchesCategory && matchesTag
  })

  return (
    <div className="space-y-12">
      {/* Filter Tabs */}
      <div className="space-y-4 border-b border-white/10 pb-8">
        <div className="flex flex-wrap items-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat)
                setSelectedTag(null)
              }}
              className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${
                selectedCategory === cat && !selectedTag
                  ? 'bg-[#a3e635] text-black font-semibold shadow-lg shadow-[#a3e635]/20'
                  : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Tag chips */}
        {allTags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-2">
            <span className="text-[11px] font-mono text-white/30 uppercase mr-1">Filter tag:</span>
            {allTags.map((tag) => {
              const isSelected = selectedTag === tag
              return (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(isSelected ? null : tag)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-mono transition-colors ${
                    isSelected
                      ? 'bg-[#a3e635]/20 text-[#a3e635] border border-[#a3e635]/40'
                      : 'bg-white/[0.03] text-white/40 hover:text-white hover:bg-white/[0.08] border border-white/5'
                  }`}
                >
                  #{tag}
                </button>
              )
            })}
            {selectedTag && (
              <button
                onClick={() => setSelectedTag(null)}
                className="text-[11px] text-[#a3e635] hover:underline ml-2"
              >
                Clear tag filter
              </button>
            )}
          </div>
        )}
      </div>

      {/* Posts list */}
      {filteredPosts.length === 0 ? (
        <div className="p-16 text-center text-white/40">
          No articles match the selected filter.
        </div>
      ) : (
        <ul className="divide-y divide-white/10 border-b border-white/10">
          {filteredPosts.map((post) => {
            const readingTime = calculateReadingTime(post.content)

            return (
              <li key={post.id}>
                <Link
                  href={`/blog/${post.slug}`}
                  data-cursor="read"
                  className="group grid gap-6 py-10 md:grid-cols-12 md:items-center transition-all hover:bg-white/[0.01]"
                >
                  <div className="md:col-span-2 space-y-2">
                    <p className="font-mono text-xs uppercase tracking-[0.2em] text-white/40">
                      {post.publishedAt ? formatDate(post.publishedAt) : 'Draft'}
                    </p>
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] text-[#bef264] font-mono">
                      <Clock className="w-3 h-3" />
                      {readingTime}
                    </div>
                  </div>

                  <div className="md:col-span-6">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-[#a3e635]/80 font-semibold mb-2 block">
                      {post.category || 'Engineering'}
                    </span>
                    <h2 className="font-grotesk text-2xl sm:text-3xl font-medium tracking-tight text-white transition-colors group-hover:text-[#bef264] leading-snug">
                      {post.title}
                    </h2>
                    <p className="mt-3 max-w-xl leading-relaxed text-sm text-white/60 line-clamp-2">
                      {post.excerpt}
                    </p>
                    <ul className="mt-4 flex flex-wrap gap-2 font-mono text-[10px] uppercase tracking-[0.15em] text-white/40">
                      {post.tags?.map((tag) => (
                        <li
                          key={tag}
                          className="rounded-full border border-white/15 px-2.5 py-0.5 group-hover:border-white/30"
                        >
                          {tag}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="relative aspect-[16/10] overflow-hidden rounded-xl border border-white/10 bg-white/5 md:col-span-3 group-hover:border-white/20">
                    {post.cover && (
                      <Image
                        src={post.cover}
                        alt={post.title}
                        fill
                        sizes="(min-width: 768px) 25vw, 100vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    )}
                  </div>

                  <span className="hidden justify-self-end text-white/40 transition-all duration-300 group-hover:text-[#a3e635] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 md:col-span-1 md:block">
                    <ArrowUpRight className="h-6 w-6" aria-hidden="true" />
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

'use client'

import React from 'react'
import Image from 'next/image'
import { ExternalLink, Star, ShoppingCart, Play, BookOpen, Download } from 'lucide-react'
import { ProductSchema } from '@/components/json-ld/product-schema'

export interface ProductCTAProps {
  /** Product title */
  title: string
  /** Short description of the product */
  description: string
  /** External link — Gumroad, Lemon Squeezy, YouTube, Udemy, your own site, etc. */
  href: string
  /** Product type — controls the icon and badge */
  type?: 'ebook' | 'video' | 'course' | 'template' | 'blueprint' | 'tool'
  /** Cover image URL */
  image?: string
  /** Original price (shown with strikethrough) */
  originalPrice?: string
  /** Current/sale price */
  price?: string
  /** Currency symbol */
  currency?: string
  /** Star rating (1-5) */
  rating?: number
  /** Number of reviews */
  reviewCount?: number
  /** CTA button text */
  buttonText?: string
  /** Badge text like "BESTSELLER", "NEW", "LIMITED" */
  badge?: string
  /** Automatically inject Product JSON-LD structured data for Google Rich Results (default: true) */
  enableSchema?: boolean
}

const typeConfig = {
  ebook: { icon: BookOpen, label: 'eBook', gradient: 'from-purple-500/20 to-indigo-500/20' },
  video: { icon: Play, label: 'Video', gradient: 'from-red-500/20 to-orange-500/20' },
  course: { icon: Play, label: 'Course', gradient: 'from-blue-500/20 to-cyan-500/20' },
  template: { icon: Download, label: 'Template', gradient: 'from-emerald-500/20 to-teal-500/20' },
  blueprint: { icon: Download, label: 'Blueprint', gradient: 'from-amber-500/20 to-yellow-500/20' },
  tool: { icon: Download, label: 'Tool', gradient: 'from-pink-500/20 to-rose-500/20' },
}

export function ProductCTA({
  title,
  description,
  href,
  type = 'ebook',
  image,
  originalPrice,
  price,
  currency = '$',
  rating,
  reviewCount,
  buttonText,
  badge,
  enableSchema = true,
}: ProductCTAProps) {
  const config = typeConfig[type] || typeConfig.ebook
  const IconComponent = config.icon

  const defaultButtonText = {
    ebook: 'Get the eBook',
    video: 'Watch Now',
    course: 'Enroll Now',
    template: 'Download Template',
    blueprint: 'Get the Blueprint',
    tool: 'Get Access',
  }

  const ctaText = buttonText || defaultButtonText[type] || 'Get Access'

  return (
    <>
      {enableSchema && (
        <ProductSchema
          product={{
            name: title,
            description,
            url: href,
            image,
            price,
            currency: currency === '$' ? 'USD' : currency === '€' ? 'EUR' : currency === '£' ? 'GBP' : currency,
            rating,
            reviewCount,
            category: type,
          }}
        />
      )}
      <div className="my-10 rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-white/[0.01] overflow-hidden transition-all hover:border-[#a3e635]/30 hover:shadow-[0_0_40px_rgba(163,230,53,0.06)] group">
      <div className="flex flex-col sm:flex-row">
        {/* Image section */}
        {image && (
          <div className="relative sm:w-48 md:w-56 shrink-0">
            <div className="relative aspect-[4/3] sm:aspect-auto sm:h-full overflow-hidden">
              <Image
                src={image}
                alt={title}
                fill
                sizes="(min-width: 640px) 224px, 100vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#0d0d11]/80 hidden sm:block" />
            </div>
          </div>
        )}

        {/* Content section */}
        <div className="flex-1 p-5 sm:p-6 flex flex-col justify-between gap-4">
          <div className="space-y-3">
            {/* Type badge + Special badge */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-gradient-to-r ${config.gradient} text-white/80 border border-white/10`}>
                <IconComponent className="w-3 h-3" />
                {config.label}
              </span>
              {badge && (
                <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-[#a3e635]/15 text-[#a3e635] border border-[#a3e635]/30 animate-pulse">
                  {badge}
                </span>
              )}
            </div>

            {/* Title */}
            <h4 className="text-lg sm:text-xl font-bold font-grotesk text-white leading-tight group-hover:text-[#bef264] transition-colors">
              {title}
            </h4>

            {/* Description */}
            <p className="text-sm text-white/60 leading-relaxed line-clamp-3">
              {description}
            </p>

            {/* Rating */}
            {rating && (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i < Math.round(rating)
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-white/20'
                      }`}
                    />
                  ))}
                </div>
                {reviewCount && (
                  <span className="text-[11px] font-mono text-white/40">
                    ({reviewCount} reviews)
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Price + CTA */}
          <div className="flex items-center justify-between gap-4 pt-3 border-t border-white/5">
            {/* Price */}
            {price && (
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold text-white font-grotesk">
                  {currency}{price}
                </span>
                {originalPrice && (
                  <span className="text-sm text-white/30 line-through font-mono">
                    {currency}{originalPrice}
                  </span>
                )}
              </div>
            )}

            {/* CTA Button */}
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#a3e635] text-[#0a0a0a] text-sm font-bold font-grotesk hover:bg-[#bef264] transition-all active:scale-[0.97] shadow-[0_0_20px_rgba(163,230,53,0.3)] hover:shadow-[0_0_30px_rgba(163,230,53,0.5)]"
            >
              <ShoppingCart className="w-4 h-4" />
              {ctaText}
              <ExternalLink className="w-3 h-3 opacity-60" />
            </a>
          </div>
        </div>
      </div>
    </div>
    </>
  )
}

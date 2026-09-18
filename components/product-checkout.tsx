'use client'

import React from 'react'
import { ShoppingCart, Download, CheckCircle2, Sparkles, ExternalLink, ShieldCheck } from 'lucide-react'
import { ProductSchema } from '@/components/json-ld/product-schema'

export interface ProductCheckoutProps {
  title: string
  price: string
  productId: string
  description?: string
  href?: string
}

export function ProductCheckout({
  title,
  price,
  productId,
  description = 'Don’t want to build this from scratch? Download the complete ready-to-import JSON workflow, system prompts, and configuration files.',
  href,
}: ProductCheckoutProps) {
  // Construct checkout URL (e.g. Gumroad / Lemon Squeezy / custom store)
  const checkoutUrl = href || `https://gumroad.com/l/${productId}`

  // Parse numeric price for schema
  const numericPrice = parseFloat(price.replace(/[^0-9.]/g, '')) || 0

  return (
    <div className="my-10 overflow-hidden rounded-2xl border border-white/15 bg-gradient-to-br from-[#13131a] via-[#0f0f14] to-[#0a0a0d] p-6 sm:p-8 shadow-2xl transition-all hover:border-[#a3e635]/40 hover:shadow-[0_0_40px_rgba(163,230,53,0.08)]">
      {/* Product JSON-LD for Google Rich Results */}
      <ProductSchema
        product={{
          name: title,
          description: description,
          url: checkoutUrl,
          price: numericPrice,
          currency: 'USD',
          rating: 4.9,
          reviewCount: 38,
          category: 'Digital Blueprint',
        }}
      />

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-3 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-[#a3e635]/15 text-[#a3e635] border border-[#a3e635]/30">
            <Sparkles className="w-3 h-3" />
            <span>Verified Production Blueprint</span>
          </div>

          <h4 className="font-grotesk text-xl sm:text-2xl font-bold tracking-tight text-white leading-snug">
            {title}
          </h4>

          <p className="text-xs sm:text-sm text-white/60 leading-relaxed">
            {description}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] font-mono text-white/50">
            <span className="flex items-center gap-1 text-[#bef264]">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#a3e635]" />
              Ready-to-import JSON
            </span>
            <span className="flex items-center gap-1 text-[#bef264]">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#a3e635]" />
              Full System Prompts
            </span>
            <span className="flex items-center gap-1 text-[#bef264]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#a3e635]" />
              Instant Email Access
            </span>
          </div>
        </div>

        {/* Price & Checkout CTA Box */}
        <div className="w-full md:w-auto p-5 rounded-xl border border-white/10 bg-white/[0.02] flex flex-col items-center justify-center shrink-0 min-w-[220px] text-center gap-3">
          <div className="space-y-0.5">
            <span className="text-[10px] font-mono uppercase tracking-widest text-white/40 block">
              Digital License
            </span>
            <div className="font-grotesk text-3xl font-bold text-white tracking-tight">
              {price.startsWith('$') ? price : `$${price}`}
            </div>
          </div>

          <a
            href={checkoutUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#a3e635] text-[#0a0a0a] text-sm font-bold font-grotesk hover:bg-[#bef264] transition-all active:scale-95 shadow-[0_0_20px_rgba(163,230,53,0.3)] hover:shadow-[0_0_30px_rgba(163,230,53,0.5)]"
          >
            <Download className="w-4 h-4" />
            <span>Download Now</span>
            <ExternalLink className="w-3 h-3 opacity-60" />
          </a>

          <span className="text-[10px] font-mono text-white/30">
            Secure checkout via Gumroad
          </span>
        </div>
      </div>
    </div>
  )
}

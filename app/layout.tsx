import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Inter, Playfair_Display, Space_Grotesk, JetBrains_Mono } from 'next/font/google'
import { Toaster } from '@/components/ui/sonner'
import { CustomCursor } from '@/components/custom-cursor'
import { ParticleCanvas } from '@/components/particle-canvas'
import { CommandPalette } from '@/components/command-palette'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' })
const grotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-grotesk' })
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains' })

const baseUrl =
  process.env.NEXT_PUBLIC_APP_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'Golam Kibriya Hawladar — Senior AI Engineer & Full-Stack Architect',
    template: '%s | Golam Kibriya Hawladar',
  },
  description:
    'Portfolio of Golam Kibriya Hawladar: high-performance websites, autonomous AI agent architectures, and Generative Engine Optimization.',
  alternates: {
    canonical: baseUrl,
  },
  openGraph: {
    title: 'Golam Kibriya Hawladar — Senior AI Engineer & Full-Stack Architect',
    description:
      'High-performance web applications, autonomous AI agents, and Generative Engine Optimization.',
    url: baseUrl,
    siteName: 'Golam Kibriya Hawladar Portfolio',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Golam Kibriya Hawladar — Senior AI Engineer',
    description:
      'High-performance web applications, autonomous AI agents, and Generative Engine Optimization.',
  },
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#0a0a0a',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const globalPersonJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Golam Kibriya Hawladar',
    jobTitle: 'Senior AI Engineer & Full-Stack Architect',
    url: baseUrl,
    email: 'golamkibriyahawladar@gmail.com',
    knowsAbout: [
      'Generative Engine Optimization (GEO)',
      'Artificial Intelligence',
      'Full-Stack Web Development',
      'Next.js',
      'Agentic Systems',
    ],
  }

  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} ${grotesk.variable} ${mono.variable}`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(globalPersonJsonLd) }}
        />
      </head>
      <body className="antialiased bg-[#0a0a0a] text-white relative min-h-screen">
        <ParticleCanvas />
        <CustomCursor />
        <CommandPalette />
        {children}
        <Toaster richColors position="top-right" theme="dark" />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}

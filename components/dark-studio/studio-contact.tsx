import Link from 'next/link'
import { Reveal } from '@/components/reveal'
import { ContactForm } from '@/components/dark-studio/contact-form'
import type { Profile } from '@/lib/db/schema'

export function StudioContact({ profile, showForm = true }: { profile: Profile; showForm?: boolean }) {
  return (
    <footer id="contact" className="relative overflow-hidden border-t border-white/10">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_60%_at_50%_100%,rgba(190,242,100,0.15),transparent)]"
      />
      <div className="relative mx-auto max-w-[1600px] px-6 py-32 md:px-10">
        <Reveal>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-white/40">03 — Contact</p>
          <h2 className="mt-8 font-grotesk text-[clamp(2.5rem,9vw,9rem)] font-medium leading-[0.95] tracking-[-0.04em] text-white">
            Let&apos;s build
            <br />
            something <span className="text-lime-300">together</span>
          </h2>
        </Reveal>

        <div className="mt-16 grid gap-16 md:grid-cols-12">
          <Reveal delay={0.1} className="md:col-span-4">
            <a
              href={`mailto:${profile.email}`}
              className="font-grotesk text-2xl text-white transition-colors hover:text-lime-300 md:text-3xl"
            >
              {profile.email}
            </a>
            <ul className="mt-10 flex flex-col gap-3 font-mono text-xs uppercase tracking-[0.2em] text-white/50">
              {profile.socials.map((s) => (
                <li key={s.label}>
                  <a href={s.href} target="_blank" rel="noreferrer" className="transition-colors hover:text-white">
                    {s.label} ↗
                  </a>
                </li>
              ))}
            </ul>
          </Reveal>
          {showForm && (
            <Reveal delay={0.2} className="md:col-span-8">
              <ContactForm />
            </Reveal>
          )}
        </div>

        <div className="mt-24 flex flex-col gap-2 border-t border-white/10 pt-6 font-mono text-xs text-white/30 sm:flex-row sm:justify-between">
          <p>
            © {new Date().getFullYear()} {profile.name}
          </p>
          <div className="flex gap-6">
            <Link href="/blog" className="transition-colors hover:text-white">
              Blog
            </Link>
            <Link href="/admin" className="transition-colors hover:text-white">
              Admin
            </Link>
            <p>{profile.location}</p>
          </div>
        </div>
      </div>
    </footer>
  )
}

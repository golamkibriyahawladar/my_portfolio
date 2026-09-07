import { ArrowUpRight } from 'lucide-react'
import { Reveal } from '@/components/reveal'
import { profile, socials } from '@/lib/portfolio-data'

export function EditorialContact() {
  return (
    <footer id="contact" className="bg-stone-900 text-[#f5f1ea]">
      <div className="mx-auto max-w-7xl px-6 py-24 md:px-10 md:py-32">
        <Reveal>
          <p className="mb-6 text-xs uppercase tracking-[0.2em] text-stone-400">Contact</p>
          <h2 className="font-serif text-[clamp(2.5rem,7vw,6.5rem)] leading-[1] tracking-tight">
            Have a project
            <br />
            <span className="italic text-stone-400">in mind?</span>
          </h2>
        </Reveal>
        <Reveal delay={0.15} className="mt-12 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <a
            href={`mailto:${profile.email}`}
            className="group inline-flex items-center gap-3 border-b border-[#f5f1ea]/30 pb-2 text-xl transition-colors hover:border-[#f5f1ea] md:text-3xl"
          >
            {profile.email}
            <ArrowUpRight className="h-6 w-6 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
          </a>
          <ul className="flex gap-6 text-sm text-stone-400">
            {socials.map((s) => (
              <li key={s.label}>
                <a href={s.href} className="transition-colors hover:text-[#f5f1ea]">
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </Reveal>
        <div className="mt-24 flex flex-col gap-2 border-t border-[#f5f1ea]/10 pt-6 text-xs text-stone-500 sm:flex-row sm:justify-between">
          <p>
            © {new Date().getFullYear()} {profile.name}. All rights reserved.
          </p>
          <p>{profile.location}</p>
        </div>
      </div>
    </footer>
  )
}

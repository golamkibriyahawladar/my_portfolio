import Image from 'next/image'
import { Reveal } from '@/components/reveal'
import { CountUp } from '@/components/count-up'
import type { Profile, Skill } from '@/lib/db/schema'

export function StudioAbout({ profile, skills }: { profile: Profile; skills: Skill[] }) {
  return (
    <section id="about" className="mx-auto max-w-[1600px] px-6 py-32 md:px-10">
      <div className="grid gap-12 md:grid-cols-12">
        <Reveal className="md:col-span-3">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#a3e635]">01 — About &amp; Track Record</p>
        </Reveal>
        <div className="md:col-span-9">
          <Reveal>
            <h2 className="font-grotesk text-3xl font-medium leading-[1.1] tracking-tight text-white md:text-6xl">
              I build products that look sharp and{' '}
              <span className="text-lime-300">run themselves</span>.
            </h2>
          </Reveal>
          <div className="mt-16 grid gap-12 md:grid-cols-2">
            <Reveal delay={0.1}>
              <div className="relative aspect-[4/5] max-w-sm overflow-hidden rounded-2xl border border-white/10 bg-white/5 group shadow-2xl">
                {profile.portrait && (
                  <Image
                    src={profile.portrait}
                    alt={`Portrait of ${profile.name}`}
                    fill
                    sizes="(min-width: 768px) 30vw, 100vw"
                    className="object-cover grayscale contrast-125 transition-transform duration-700 group-hover:scale-105 group-hover:grayscale-0"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </Reveal>
            <div>
              <Reveal delay={0.15}>
                <p className="whitespace-pre-line text-lg leading-relaxed text-white/70">{profile.bio}</p>
              </Reveal>
              {profile.stats.length > 0 && (
                <Reveal delay={0.25}>
                  <dl className="mt-12 grid grid-cols-3 gap-6 border-t border-white/10 pt-8">
                    {profile.stats.map((stat) => (
                      <div key={stat.label}>
                        <dd className="font-grotesk text-4xl sm:text-5xl font-bold text-white">
                          <CountUp value={stat.value} />
                        </dd>
                        <dt className="mt-1 font-mono text-[11px] uppercase tracking-[0.15em] text-white/40">
                          {stat.label}
                        </dt>
                      </div>
                    ))}
                  </dl>
                </Reveal>
              )}
              <Reveal delay={0.35}>
                <ul className="mt-12 flex flex-wrap gap-2" aria-label="Skills">
                  {skills.map((skill) => (
                    <li
                      key={skill.id}
                      className="rounded-full border border-white/15 px-3 py-1.5 font-mono text-xs text-white/70 transition-all hover:border-lime-300 hover:text-lime-300 hover:scale-105 hover:bg-lime-300/10 cursor-default"
                    >
                      {skill.name}
                    </li>
                  ))}
                </ul>
              </Reveal>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

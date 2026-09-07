import Image from 'next/image'
import { Reveal } from '@/components/reveal'
import { profile } from '@/lib/portfolio-data'

export function EditorialAbout() {
  return (
    <section id="about" className="border-t border-stone-900/10 bg-[#ede8df]">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-24 md:grid-cols-12 md:px-10 md:py-32">
        <Reveal className="md:col-span-4">
          <div className="relative aspect-[4/5] overflow-hidden rounded-sm">
            <Image
              src="/portrait.png"
              alt={`Portrait of ${profile.name}`}
              fill
              sizes="(min-width: 768px) 30vw, 100vw"
              className="object-cover grayscale"
            />
          </div>
        </Reveal>
        <div className="md:col-span-7 md:col-start-6">
          <Reveal>
            <p className="mb-6 text-xs uppercase tracking-[0.2em] text-stone-500">About</p>
            <h2 className="font-serif text-3xl leading-tight tracking-tight text-stone-900 md:text-5xl">
              Craft first, then automate everything that gets in the way of it.
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-8 max-w-xl text-lg leading-relaxed text-stone-600">{profile.bio}</p>
          </Reveal>
          <Reveal delay={0.2}>
            <dl className="mt-10 grid gap-8 sm:grid-cols-3">
              {[
                ['Experience', '6+ years'],
                ['Projects shipped', '40+'],
                ['Based in', profile.location],
              ].map(([label, value]) => (
                <div key={label} className="border-t border-stone-900/15 pt-4">
                  <dt className="text-xs uppercase tracking-[0.2em] text-stone-500">{label}</dt>
                  <dd className="mt-2 font-serif text-2xl text-stone-900">{value}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
          <Reveal delay={0.3}>
            <ul className="mt-10 flex flex-wrap gap-2" aria-label="Skills">
              {profile.skills.map((skill) => (
                <li
                  key={skill}
                  className="rounded-full bg-[#f5f1ea] px-3 py-1.5 text-sm text-stone-700"
                >
                  {skill}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

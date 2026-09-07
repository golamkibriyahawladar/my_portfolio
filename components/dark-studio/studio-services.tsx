import { ArrowRight } from 'lucide-react'
import { Reveal } from '@/components/reveal'
import { SpotlightCard } from '@/components/spotlight-card'
import type { Service } from '@/lib/db/schema'

export function StudioServices({ services }: { services: Service[] }) {
  return (
    <section id="services" className="border-t border-white/10">
      <div className="mx-auto max-w-[1600px] px-6 py-32 md:px-10">
        <Reveal className="mb-16">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#a3e635]">02 — Services &amp; Capabilities</p>
          <h2 className="mt-4 font-grotesk text-4xl sm:text-6xl font-medium tracking-tight text-white">
            Specialized engineering <span className="text-lime-300">offerings</span>
          </h2>
        </Reveal>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {services.map((service, i) => (
            <Reveal key={service.id} delay={i * 0.08}>
              <SpotlightCard className="p-8 sm:p-10 h-full flex flex-col justify-between group">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-[#a3e635]/70 font-semibold tracking-widest">
                      SERVICE {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="text-white/30 group-hover:text-[#a3e635] group-hover:translate-x-1 transition-all duration-300">
                      <ArrowRight className="h-5 w-5" />
                    </span>
                  </div>
                  <h3 className="mt-4 font-grotesk text-2xl sm:text-3xl font-medium tracking-tight text-white transition-colors duration-300 group-hover:text-lime-300">
                    {service.title}
                  </h3>
                  <p className="mt-3 leading-relaxed text-sm text-white/60">
                    {service.description}
                  </p>
                </div>
                <ul className="mt-8 flex flex-wrap gap-2 font-mono text-[11px] uppercase tracking-wider text-white/40 pt-6 border-t border-white/5">
                  {service.items.map((item) => (
                    <li
                      key={item}
                      className="px-2.5 py-1 rounded-md bg-white/5 border border-white/5 group-hover:border-white/15 transition-colors"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </SpotlightCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

import { Reveal } from '@/components/reveal'
import { services } from '@/lib/portfolio-data'

export function EditorialServices() {
  return (
    <section id="services" className="mx-auto max-w-7xl px-6 py-24 md:px-10 md:py-32">
      <Reveal className="mb-16 max-w-2xl">
        <p className="mb-6 text-xs uppercase tracking-[0.2em] text-stone-500">Services</p>
        <h2 className="font-serif text-4xl tracking-tight text-stone-900 md:text-6xl">
          What I can do <span className="italic text-stone-500">for you</span>
        </h2>
      </Reveal>
      <div className="grid gap-px overflow-hidden rounded-sm border border-stone-900/10 bg-stone-900/10 md:grid-cols-3">
        {services.map((service, i) => (
          <Reveal
            key={service.title}
            delay={i * 0.1}
            className="group flex flex-col bg-[#f5f1ea] p-8 transition-colors duration-500 hover:bg-stone-900 md:p-10"
          >
            <span className="font-serif text-5xl text-stone-300 transition-colors duration-500 group-hover:text-stone-600">
              0{i + 1}
            </span>
            <h3 className="mt-8 font-serif text-2xl text-stone-900 transition-colors duration-500 group-hover:text-[#f5f1ea]">
              {service.title}
            </h3>
            <p className="mt-4 leading-relaxed text-stone-600 transition-colors duration-500 group-hover:text-stone-300">
              {service.description}
            </p>
            <ul className="mt-8 space-y-2 border-t border-stone-900/10 pt-6 text-sm text-stone-600 transition-colors duration-500 group-hover:border-stone-700 group-hover:text-stone-300">
              {service.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

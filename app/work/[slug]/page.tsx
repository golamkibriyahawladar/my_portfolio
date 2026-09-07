import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ArrowUpRight } from 'lucide-react'
import { PageShell } from '@/components/dark-studio/page-shell'
import { Markdown } from '@/components/markdown'
import { Reveal } from '@/components/reveal'
import { getProfile, getProjectBySlug, getPublishedProjects } from '@/lib/content'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const project = await getProjectBySlug(slug)
  if (!project) return { title: 'Project not found' }
  return { title: project.title, description: project.description }
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const [profile, project, all] = await Promise.all([getProfile(), getProjectBySlug(slug), getPublishedProjects()])
  if (!project) notFound()

  const index = all.findIndex((p) => p.slug === project.slug)
  const next = all[(index + 1) % all.length]

  return (
    <PageShell profile={profile}>
      <article className="mx-auto max-w-[1600px] px-6 md:px-10">
        <Reveal>
          <Link
            href="/#work"
            className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-white/40 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" /> All work
          </Link>
          <p className="mt-12 font-mono text-xs uppercase tracking-[0.2em] text-white/40">
            {project.category} · {project.year}
          </p>
          <h1 className="mt-4 max-w-5xl font-grotesk text-[clamp(2.5rem,7vw,7rem)] font-medium leading-[0.95] tracking-[-0.04em] text-white">
            {project.title}
          </h1>
        </Reveal>

        <Reveal delay={0.1} className="mt-12 grid gap-8 border-t border-white/10 pt-8 md:grid-cols-12">
          <p className="max-w-xl text-lg leading-relaxed text-white/70 md:col-span-7">{project.description}</p>
          <dl className="grid grid-cols-2 gap-6 font-mono text-xs md:col-span-5">
            <div>
              <dt className="uppercase tracking-[0.2em] text-white/40">Stack</dt>
              <dd className="mt-2 text-white/80">{project.stack.join(', ')}</dd>
            </div>
            {project.result && (
              <div>
                <dt className="uppercase tracking-[0.2em] text-white/40">Result</dt>
                <dd className="mt-2 text-lime-300">{project.result}</dd>
              </div>
            )}
            {(project.liveUrl || project.repoUrl) && (
              <div className="col-span-2 flex gap-6">
                {project.liveUrl && (
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-white transition-colors hover:text-lime-300"
                  >
                    Live site <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </a>
                )}
                {project.repoUrl && (
                  <a
                    href={project.repoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-white transition-colors hover:text-lime-300"
                  >
                    Source <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </a>
                )}
              </div>
            )}
          </dl>
        </Reveal>

        <Reveal delay={0.15} className="relative mt-16 aspect-[16/9] overflow-hidden rounded-lg border border-white/10 bg-white/5">
          <Image src={project.image} alt={`${project.title} preview`} fill priority sizes="100vw" className="object-cover" />
        </Reveal>

        {project.content && (
          <Reveal className="mx-auto mt-20 max-w-3xl">
            <Markdown content={project.content} className="text-lg" />
          </Reveal>
        )}

        {next && next.slug !== project.slug && (
          <Reveal className="mt-32 border-t border-white/10 pt-12">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-white/40">Next project</p>
            <Link
              href={`/work/${next.slug}`}
              className="group mt-4 inline-flex items-center gap-4 font-grotesk text-4xl font-medium tracking-tight text-white transition-colors hover:text-lime-300 md:text-6xl"
            >
              {next.title}
              <ArrowUpRight className="h-8 w-8 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" aria-hidden="true" />
            </Link>
          </Reveal>
        )}
      </article>
    </PageShell>
  )
}

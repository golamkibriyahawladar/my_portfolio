import { StudioNav } from '@/components/dark-studio/studio-nav'
import { StudioHero } from '@/components/dark-studio/studio-hero'
import { StudioProjects } from '@/components/dark-studio/studio-projects'
import { StudioAbout } from '@/components/dark-studio/studio-about'
import { StudioServices } from '@/components/dark-studio/studio-services'
import { StudioContact } from '@/components/dark-studio/studio-contact'
import { getProfile, getPublishedProjects, getServices, getSkills } from '@/lib/content'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const [profile, projects, services, skills] = await Promise.all([
    getProfile(),
    getPublishedProjects(),
    getServices(),
    getSkills(),
  ])

  return (
    <div className="min-h-screen bg-[#0a0a0a] font-sans text-white selection:bg-lime-300 selection:text-black">
      <StudioNav name={profile.name} email={profile.email} />
      <main>
        <StudioHero profile={profile} skills={skills} />
        {projects.length > 0 && <StudioProjects projects={projects} />}
        <StudioAbout profile={profile} skills={skills} />
        <StudioServices services={services} />
      </main>
      <StudioContact profile={profile} />
    </div>
  )
}

import { EditorialNav } from '@/components/editorial/editorial-nav'
import { EditorialHero } from '@/components/editorial/editorial-hero'
import { EditorialProjects } from '@/components/editorial/editorial-projects'
import { EditorialAbout } from '@/components/editorial/editorial-about'
import { EditorialServices } from '@/components/editorial/editorial-services'
import { EditorialContact } from '@/components/editorial/editorial-contact'

export const metadata = {
  title: 'Concept 1 — Classic Editorial',
}

export default function EditorialConceptPage() {
  return (
    <div className="min-h-screen bg-[#f5f1ea] font-sans text-stone-900 selection:bg-stone-900 selection:text-[#f5f1ea]">
      <EditorialNav />
      <main>
        <EditorialHero />
        <EditorialProjects />
        <EditorialAbout />
        <EditorialServices />
      </main>
      <EditorialContact />
    </div>
  )
}

import { getProfileSections } from '@/actions/profile'
import ProfileClient from './client'

export default async function ProfilePage() {
  const sections = await getProfileSections()

  const sectionMap: Record<string, unknown> = {}
  for (const section of sections) {
    sectionMap[section.sectionType] = section.data
  }

  return <ProfileClient initialSections={sectionMap} />
}

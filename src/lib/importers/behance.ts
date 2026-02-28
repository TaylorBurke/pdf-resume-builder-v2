import type { PersonalInfo, Project } from '@/types'

interface BehanceImportResult {
  personalInfo: Partial<PersonalInfo>
  projects: Project
}

export async function importFromBehance(
  username: string
): Promise<BehanceImportResult> {
  // TODO: Implement Behance API integration
  // Behance API requires an API key from Adobe
  throw new Error('Behance import is not yet implemented. Coming soon!')
}

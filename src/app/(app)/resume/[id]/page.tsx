import { getResume } from '@/actions/generation'
import { getProfileSection } from '@/actions/profile'
import ResumeViewClient from './client'
import type { PersonalInfo } from '@/types'

interface ResumePageProps {
  params: Promise<{ id: string }>
}

export default async function ResumePage({ params }: ResumePageProps) {
  const { id } = await params
  const resume = await getResume(id)
  const personalInfoSection = await getProfileSection('personal_info')
  const personalInfo = personalInfoSection?.data as PersonalInfo | null

  return (
    <ResumeViewClient
      resume={resume}
      personalInfo={personalInfo ?? undefined}
    />
  )
}

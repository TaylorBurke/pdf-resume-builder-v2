'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { saveProfileSection } from '@/actions/profile'
import { ONBOARDING_STEPS } from '@/components/onboarding/steps'
import {
  PersonalInfoStep,
  SummaryStep,
  ExperienceStep,
  EducationStep,
  SkillsStep,
  ProjectsStep,
  CertificatesStep,
  ReferencesStep,
  VolunteerStep,
  LanguagesStep,
  AwardsStep,
  IPStep,
  InterestsStep,
} from '@/components/onboarding/steps'
import type { SectionType, SectionData } from '@/types'

interface OnboardingStepClientProps {
  stepType: string
  stepIndex: number
  totalSteps: number
  initialData: SectionData | null
}

export default function OnboardingStepClient({
  stepType,
  stepIndex,
  totalSteps,
  initialData,
}: OnboardingStepClientProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  function navigateNext() {
    if (stepIndex + 1 >= totalSteps) {
      router.push('/onboarding/complete')
    } else {
      const nextStep = ONBOARDING_STEPS[stepIndex + 1]
      router.push(`/onboarding/${nextStep.path}`)
    }
  }

  async function handleSubmit(data: SectionData) {
    setIsLoading(true)
    try {
      await saveProfileSection(stepType as SectionType, data)
      navigateNext()
    } catch (error) {
      console.error('Failed to save section:', error)
    } finally {
      setIsLoading(false)
    }
  }

  function handleSkip() {
    navigateNext()
  }

  const stepComponents: Record<string, React.ReactNode> = {
    personal_info: (
      <PersonalInfoStep onSubmit={handleSubmit} onSkip={handleSkip} initialData={initialData as any} />
    ),
    summary: (
      <SummaryStep onSubmit={handleSubmit} onSkip={handleSkip} initialData={initialData as any} />
    ),
    experience: (
      <ExperienceStep onSubmit={handleSubmit} onSkip={handleSkip} initialData={initialData as any} />
    ),
    education: (
      <EducationStep onSubmit={handleSubmit} onSkip={handleSkip} initialData={initialData as any} />
    ),
    skills: (
      <SkillsStep onSubmit={handleSubmit} onSkip={handleSkip} initialData={initialData as any} />
    ),
    projects: (
      <ProjectsStep onSubmit={handleSubmit} onSkip={handleSkip} initialData={initialData as any} />
    ),
    certificates: (
      <CertificatesStep onSubmit={handleSubmit} onSkip={handleSkip} initialData={initialData as any} />
    ),
    references: (
      <ReferencesStep onSubmit={handleSubmit} onSkip={handleSkip} initialData={initialData as any} />
    ),
    volunteer: (
      <VolunteerStep onSubmit={handleSubmit} onSkip={handleSkip} initialData={initialData as any} />
    ),
    languages: (
      <LanguagesStep onSubmit={handleSubmit} onSkip={handleSkip} initialData={initialData as any} />
    ),
    awards: (
      <AwardsStep onSubmit={handleSubmit} onSkip={handleSkip} initialData={initialData as any} />
    ),
    ip: (
      <IPStep onSubmit={handleSubmit} onSkip={handleSkip} initialData={initialData as any} />
    ),
    interests: (
      <InterestsStep onSubmit={handleSubmit} onSkip={handleSkip} initialData={initialData as any} />
    ),
  }

  return stepComponents[stepType] ?? <div>Unknown step</div>
}

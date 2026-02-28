import { notFound } from 'next/navigation'
import { getProfileSection } from '@/actions/profile'
import { ONBOARDING_STEPS } from '@/components/onboarding/steps'
import ProgressBar from '@/components/onboarding/ProgressBar'
import OnboardingStepClient from './client'
import type { SectionType, SectionData } from '@/types'

interface PageProps {
  params: Promise<{ step: string }>
}

export default async function OnboardingStepPage({ params }: PageProps) {
  const { step } = await params
  const stepIndex = ONBOARDING_STEPS.findIndex((s) => s.path === step)

  if (stepIndex === -1) {
    notFound()
  }

  const currentStep = ONBOARDING_STEPS[stepIndex]
  let existingData: SectionData | null = null

  try {
    const section = await getProfileSection(currentStep.type as SectionType)
    existingData = section?.data ?? null
  } catch {
    // No existing data, that's fine
  }

  return (
    <>
      <ProgressBar currentStep={stepIndex + 1} totalSteps={ONBOARDING_STEPS.length} />
      <OnboardingStepClient
        stepType={currentStep.type}
        stepIndex={stepIndex}
        totalSteps={ONBOARDING_STEPS.length}
        initialData={existingData}
      />
    </>
  )
}

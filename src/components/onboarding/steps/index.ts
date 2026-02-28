import { SECTION_TYPES } from '@/types'

export { default as PersonalInfoStep } from './PersonalInfoStep'
export { default as SummaryStep } from './SummaryStep'
export { default as ExperienceStep } from './ExperienceStep'
export { default as EducationStep } from './EducationStep'
export { default as SkillsStep } from './SkillsStep'
export { default as ProjectsStep } from './ProjectsStep'
export { default as CertificatesStep } from './CertificatesStep'
export { default as ReferencesStep } from './ReferencesStep'
export { default as VolunteerStep } from './VolunteerStep'
export { default as LanguagesStep } from './LanguagesStep'
export { default as AwardsStep } from './AwardsStep'
export { default as IPStep } from './IPStep'
export { default as InterestsStep } from './InterestsStep'

export const ONBOARDING_STEPS = SECTION_TYPES.map((type) => ({
  type,
  path: type.replace(/_/g, '-'),
}))

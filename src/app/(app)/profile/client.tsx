'use client'

import { useState, useTransition } from 'react'
import { saveProfileSection } from '@/actions/profile'
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
import { SECTION_TYPES } from '@/types'
import type { SectionType, SectionData } from '@/types'

const SECTION_LABELS: Record<SectionType, string> = {
  personal_info: 'Personal Information',
  summary: 'Professional Summary',
  experience: 'Work Experience',
  education: 'Education',
  skills: 'Skills',
  projects: 'Projects',
  certificates: 'Certifications',
  references: 'References',
  volunteer: 'Volunteer Experience',
  languages: 'Languages',
  awards: 'Awards',
  ip: 'Intellectual Property',
  interests: 'Interests',
}

interface ProfileClientProps {
  initialSections: Record<string, unknown>
}

export default function ProfileClient({ initialSections }: ProfileClientProps) {
  const [sections, setSections] = useState<Record<string, unknown>>(initialSections)
  const [editingSection, setEditingSection] = useState<SectionType | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSave(sectionType: SectionType, data: SectionData) {
    startTransition(async () => {
      await saveProfileSection(sectionType, data)
      setSections((prev) => ({ ...prev, [sectionType]: data }))
      setEditingSection(null)
    })
  }

  function handleCancel() {
    setEditingSection(null)
  }

  function renderStepComponent(sectionType: SectionType) {
    const data = sections[sectionType] ?? null
    const onSubmit = (d: SectionData) => handleSave(sectionType, d)
    const onSkip = handleCancel

    const props = { onSubmit, onSkip, initialData: data as any }

    switch (sectionType) {
      case 'personal_info':
        return <PersonalInfoStep {...props} />
      case 'summary':
        return <SummaryStep {...props} />
      case 'experience':
        return <ExperienceStep {...props} />
      case 'education':
        return <EducationStep {...props} />
      case 'skills':
        return <SkillsStep {...props} />
      case 'projects':
        return <ProjectsStep {...props} />
      case 'certificates':
        return <CertificatesStep {...props} />
      case 'references':
        return <ReferencesStep {...props} />
      case 'volunteer':
        return <VolunteerStep {...props} />
      case 'languages':
        return <LanguagesStep {...props} />
      case 'awards':
        return <AwardsStep {...props} />
      case 'ip':
        return <IPStep {...props} />
      case 'interests':
        return <InterestsStep {...props} />
      default:
        return null
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Profile</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        Manage your resume sections. This data is used to generate tailored resumes.
      </p>

      <div className="space-y-4">
        {SECTION_TYPES.map((sectionType) => {
          const hasData = !!sections[sectionType]
          const isEditing = editingSection === sectionType

          return (
            <div
              key={sectionType}
              className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800"
            >
              <div className="flex items-center justify-between px-6 py-4">
                <div>
                  <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {SECTION_LABELS[sectionType]}
                  </h2>
                  {!hasData && !isEditing && (
                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">Not filled in yet</p>
                  )}
                  {hasData && !isEditing && (
                    <p className="text-sm text-green-600 dark:text-green-400 mt-0.5">Completed</p>
                  )}
                </div>
                {!isEditing && (
                  <button
                    type="button"
                    onClick={() => setEditingSection(sectionType)}
                    className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                  >
                    {hasData ? 'Edit' : 'Add'}
                  </button>
                )}
              </div>

              {isEditing && (
                <div className="px-6 pb-6 border-t border-gray-100 dark:border-gray-800 pt-4">
                  {renderStepComponent(sectionType)}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

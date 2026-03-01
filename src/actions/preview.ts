'use server'

import { renderResumeToHtml } from '@/lib/pdf/generator'
import type { TemplateId } from '@/templates'
import type { ResumeContent, PersonalInfo } from '@/types'

export async function getPreviewHtml(
  resumeContent: ResumeContent,
  personalInfo: PersonalInfo,
  templateId: TemplateId
): Promise<string> {
  return renderResumeToHtml(resumeContent, personalInfo, templateId)
}

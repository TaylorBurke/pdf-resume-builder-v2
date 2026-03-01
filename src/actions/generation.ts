'use server'

import { db } from '@/lib/db/client'
import { users, profileSections, resumes } from '@/lib/db/schema'
import { auth } from '@/lib/auth'
import { eq, and } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { callOpenRouterJSON } from '@/lib/ai/openrouter'
import { buildAnalysisPrompt } from '@/lib/ai/prompts/analyze-job'
import { buildGenerationPrompt } from '@/lib/ai/prompts/generate-resume'
import { buildRegenerationPrompt } from '@/lib/ai/prompts/regenerate-resume'
import type { JobAnalysis, ResumeContent } from '@/types'

async function getAuthenticatedUser() {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Not authenticated')
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1)
  if (!user) throw new Error('User not found')
  if (!user.openrouterApiKey) throw new Error('OpenRouter API key not configured. Go to Settings.')
  return user
}

export async function analyzeJob(jobText: string, company: string, jobTitle: string) {
  const user = await getAuthenticatedUser()

  const sections = await db
    .select()
    .from(profileSections)
    .where(eq(profileSections.userId, user.id))

  const parsedSections = sections.map((s) => ({
    sectionType: s.sectionType,
    data: JSON.parse(s.data),
  }))

  const analysis = await callOpenRouterJSON<JobAnalysis>({
    apiKey: user.openrouterApiKey!,
    model: user.preferredModel || 'anthropic/claude-sonnet-4',
    messages: [{ role: 'user', content: buildAnalysisPrompt({ jobText, profileSections: parsedSections }) }],
  })

  return { analysis, parsedSections }
}

export async function generateResume(
  jobText: string,
  company: string,
  jobTitle: string,
  analysis: JobAnalysis,
  parsedSections: { sectionType: string; data: unknown }[]
) {
  const user = await getAuthenticatedUser()

  const resumeContent = await callOpenRouterJSON<ResumeContent>({
    apiKey: user.openrouterApiKey!,
    model: user.preferredModel || 'anthropic/claude-sonnet-4',
    messages: [{ role: 'user', content: buildGenerationPrompt({ analysis, profileSections: parsedSections }) }],
    maxTokens: 8192,
  })

  const id = nanoid()
  const now = new Date().toISOString()

  await db.insert(resumes).values({
    id,
    userId: user.id,
    jobTitle,
    company,
    jobText,
    analysis: JSON.stringify(analysis),
    resumeContent: JSON.stringify(resumeContent),
    templateId: 'clean',
    feedbackHistory: '[]',
    createdAt: now,
    updatedAt: now,
  })

  return { id, resumeContent, analysis }
}

export async function regenerateResume(resumeId: string, feedback: string) {
  const user = await getAuthenticatedUser()

  const [resume] = await db
    .select()
    .from(resumes)
    .where(eq(resumes.id, resumeId))
    .limit(1)

  if (!resume || resume.userId !== user.id) throw new Error('Resume not found')

  const currentResume = JSON.parse(resume.resumeContent!) as ResumeContent
  const feedbackHistory = JSON.parse(resume.feedbackHistory) as { feedback: string; timestamp: string }[]

  const sections = await db
    .select()
    .from(profileSections)
    .where(eq(profileSections.userId, user.id))

  const parsedSections = sections.map((s) => ({
    sectionType: s.sectionType,
    data: JSON.parse(s.data),
  }))

  const newResume = await callOpenRouterJSON<ResumeContent>({
    apiKey: user.openrouterApiKey!,
    model: user.preferredModel || 'anthropic/claude-sonnet-4',
    messages: [
      {
        role: 'user',
        content: buildRegenerationPrompt({
          currentResume,
          feedback,
          feedbackHistory,
          profileSections: parsedSections,
        }),
      },
    ],
    maxTokens: 8192,
  })

  const updatedHistory = [...feedbackHistory, { feedback, timestamp: new Date().toISOString() }]

  await db
    .update(resumes)
    .set({
      resumeContent: JSON.stringify(newResume),
      feedbackHistory: JSON.stringify(updatedHistory),
      updatedAt: new Date().toISOString(),
    })
    .where(eq(resumes.id, resumeId))

  return { resumeContent: newResume }
}

export async function updateResumeTemplate(resumeId: string, templateId: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Not authenticated')
  await db
    .update(resumes)
    .set({ templateId, updatedAt: new Date().toISOString() })
    .where(eq(resumes.id, resumeId))
}

export async function updateResumeContent(resumeId: string, resumeContent: ResumeContent) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Not authenticated')
  await db
    .update(resumes)
    .set({ resumeContent: JSON.stringify(resumeContent), updatedAt: new Date().toISOString() })
    .where(and(eq(resumes.id, resumeId), eq(resumes.userId, session.user.id)))
  return { resumeContent }
}

export async function getResume(resumeId: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Not authenticated')
  const [resume] = await db
    .select()
    .from(resumes)
    .where(and(eq(resumes.id, resumeId), eq(resumes.userId, session.user.id)))
    .limit(1)
  if (!resume) throw new Error('Resume not found')
  return {
    ...resume,
    resumeContent: resume.resumeContent ? JSON.parse(resume.resumeContent) : null,
    analysis: resume.analysis ? JSON.parse(resume.analysis) : null,
    feedbackHistory: JSON.parse(resume.feedbackHistory),
  }
}

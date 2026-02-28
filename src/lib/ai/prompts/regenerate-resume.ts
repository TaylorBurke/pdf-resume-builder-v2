import type { ResumeContent } from '@/types'

interface RegenerationPromptInput {
  currentResume: ResumeContent
  feedback: string
  feedbackHistory: { feedback: string; timestamp: string }[]
  profileSections: { sectionType: string; data: unknown }[]
}

export function buildRegenerationPrompt({
  currentResume,
  feedback,
  feedbackHistory,
  profileSections,
}: RegenerationPromptInput): string {
  const resumeJson = JSON.stringify(currentResume, null, 2)
  const historyJson = JSON.stringify(feedbackHistory, null, 2)
  const profileJson = JSON.stringify(profileSections, null, 2)

  return `You are a professional resume writer. Revise the following resume based on the user's feedback.

## Current Resume

${resumeJson}

## User Feedback

${feedback}

## Previous Feedback History

${historyJson}

## Candidate Profile (Source Data)

${profileJson}

## Instructions

Revise the resume according to the user's feedback while:
1. Maintaining accuracy based on the candidate's actual profile data
2. Keeping the same overall structure unless the feedback requests structural changes
3. Considering the history of previous feedback to understand the user's preferences
4. Not fabricating experience, skills, or credentials not present in the profile
5. Do NOT undo previous feedback — preserve improvements from earlier revisions while applying the new changes

Return the revised resume as a JSON object with the same structure as the current resume.

Return ONLY the JSON object, no additional text.`
}

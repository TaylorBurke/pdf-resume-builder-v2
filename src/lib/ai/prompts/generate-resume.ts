import type { JobAnalysis } from '@/types'

interface GenerationPromptInput {
  analysis: JobAnalysis
  profileSections: { sectionType: string; data: unknown }[]
}

export function buildGenerationPrompt({
  analysis,
  profileSections,
}: GenerationPromptInput): string {
  const analysisJson = JSON.stringify(analysis, null, 2)
  const profileJson = JSON.stringify(profileSections, null, 2)

  return `You are a professional resume writer. Generate a tailored resume based on the following job analysis and candidate profile.

## Job Analysis

${analysisJson}

## Candidate Profile

${profileJson}

## Instructions

CRITICAL RULES:
- NEVER fabricate information. Only reword, reorder, and curate content from the candidate's real profile data.
- References are NEVER included in resume content. Do not add a references section under any circumstances.

Using the analysis and profile data, create a tailored resume that:
1. Highlights the strongest skill matches
2. Addresses gaps where possible by reframing existing experience
3. Follows the recommended positioning angle
4. Only includes sections listed in sectionsToInclude

Return the resume as a JSON object with the following structure:

{
  "summary": "Professional summary tailored to the role",
  "experience": [
    { "company": "string", "title": "string", "dates": "string", "bullets": ["string"] }
  ],
  "skills": [
    { "name": "Category name", "items": ["skill1", "skill2"] }
  ],
  "projects": [
    { "name": "string", "description": "string", "techStack": ["string"], "highlights": ["string"] }
  ],
  "education": [
    { "school": "string", "degree": "string", "field": "string", "graduationDate": "string" }
  ],
  "certificates": [
    { "name": "string", "issuer": "string", "date": "string" }
  ],
  "languages": [
    { "language": "string", "proficiency": "string" }
  ],
  "awards": [
    { "name": "string", "issuer": "string", "date": "string", "description": "string" }
  ],
  "ip": [
    { "type": "string", "title": "string", "description": "string", "url": "string", "date": "string" }
  ],
  "volunteer": [
    { "organization": "string", "role": "string", "description": "string" }
  ],
  "interests": ["string"]
}

Only include optional sections if they appear in sectionsToInclude from the analysis. Required sections: summary, experience, skills.

Return ONLY the JSON object, no additional text.`
}

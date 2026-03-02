import type { JobAnalysis } from '@/types'

interface CoverLetterPromptInput {
  jobText: string
  company: string
  jobTitle: string
  analysis: JobAnalysis
  profileSections: { sectionType: string; data: unknown }[]
}

export function buildCoverLetterPrompt({ jobText, company, jobTitle, analysis, profileSections }: CoverLetterPromptInput): string {
  return `You are writing cover letters for a job application.

## Job Posting
Company: ${company}
Position: ${jobTitle}

${jobText}

## Job Analysis
Recommended angle: ${analysis.recommendedAngle}
Key requirements: ${analysis.keyRequirements.map((r) => `${r.requirement} (${r.priority})`).join(', ')}
Skill matches: ${analysis.skillMatches.map((s) => `${s.skill} (${s.strength})`).join(', ')}
${analysis.gaps.length > 0 ? `Gaps to address: ${analysis.gaps.join(', ')}` : ''}

## Candidate Profile
${JSON.stringify(profileSections, null, 2)}

## Instructions

Write THREE cover letters for this position, each in a different tone. Each should be 300-400 words, addressed to "Dear Hiring Manager," and signed "Sincerely, [Candidate Name]".

CRITICAL RULES:
- NEVER fabricate information. Only use facts from the candidate's real profile data above.
- Each letter must reference specific experience and skills from the profile.
- Tailor each letter to the job requirements and recommended angle.

### Tone Descriptions

1. **formal** — Direct and professional. Concise sentences, emphasizes qualifications and fit. Formal business language. Gets straight to the point about why the candidate is the right choice.

2. **cultureFit** — Warmer and more personable. Shows genuine enthusiasm for the company's mission and values. Still uses proper grammar and professional language, but reads as approachable. Highlights collaborative experience and team contributions.

3. **technical** — Leads with technical achievements. References specific technologies, architectures, and measurable outcomes. Emphasizes engineering depth, problem-solving, and technical leadership. Uses concrete metrics where available from the profile.

## Output Format

Return ONLY valid JSON with this exact structure:
{
  "formal": "Full cover letter text...",
  "cultureFit": "Full cover letter text...",
  "technical": "Full cover letter text..."
}`
}

interface AnalysisPromptInput {
  jobText: string
  profileSections: { sectionType: string; data: unknown }[]
}

export function buildAnalysisPrompt({
  jobText,
  profileSections,
}: AnalysisPromptInput): string {
  const profileJson = JSON.stringify(profileSections, null, 2)

  return `You are a professional resume strategist. Analyze the following job posting against the candidate's profile and determine the best resume strategy.

## Job Posting

${jobText}

## Candidate Profile

${profileJson}

## Instructions

Compare the job posting requirements with the candidate's profile. Identify which skills and experiences match, which are gaps, and recommend the best angle to position the candidate.

The following sections must ALWAYS be included in the resume:
- personal_info
- summary
- experience
- skills

Only include optional sections (education, projects, certificates, volunteer, languages, awards, ip, interests) if they are directly relevant to the job posting.

Return your analysis as a JSON object with the following structure:

{
  "keyRequirements": [
    { "requirement": "string describing the requirement", "priority": "high" | "medium" | "low" }
  ],
  "skillMatches": [
    { "skill": "string", "strength": "strong" | "moderate" | "weak" }
  ],
  "gaps": ["string describing each gap"],
  "recommendedAngle": "string describing the best positioning strategy",
  "sectionsToInclude": ["personal_info", "summary", "experience", "skills", ...]
}

Return ONLY the JSON object, no additional text.`
}

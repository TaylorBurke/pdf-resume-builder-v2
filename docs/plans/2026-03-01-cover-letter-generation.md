# Cover Letter Generation Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add optional cover letter generation (3 tones) to the resume generation flow, with inline editing, PDF download, and resume complementation.

**Architecture:** New `coverLetters` DB table linked to resumes. Single AI call generates 3 tones. Cover letters appear as tabbed textareas in Step 2 of the generate flow. Selected tone feeds into resume generation prompt. Cover letters are editable and downloadable as PDF from the resume page.

**Tech Stack:** Drizzle ORM (schema), OpenRouter API (generation), React (UI), Puppeteer (PDF)

**Design doc:** `docs/plans/2026-03-01-cover-letter-generation-design.md`

---

### Task 1: Database Schema — Add cover letters table and resume column

**Files:**
- Modify: `src/lib/db/schema.ts` (after line 93)

**Step 1: Add coverLetters table and selectedCoverLetterTone column**

Add after the `resumes` table definition (line 93):

```typescript
export const coverLetters = sqliteTable('cover_letters', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  resumeId: text('resume_id').notNull().references(() => resumes.id, { onDelete: 'cascade' }),
  tone: text('tone').notNull(), // 'formal' | 'culture_fit' | 'technical'
  content: text('content').notNull(),
  createdAt: text('created_at').notNull().default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: text('updated_at').notNull().default(sql`(CURRENT_TIMESTAMP)`),
})
```

Add `selectedCoverLetterTone` to the `resumes` table (after line 90, before `createdAt`):

```typescript
  selectedCoverLetterTone: text('selected_cover_letter_tone'),
```

**Step 2: Generate and apply migration**

Run: `npm run db:push`
Expected: Schema pushed successfully to Turso

**Step 3: Commit**

```bash
git add src/lib/db/schema.ts
git commit -m "feat: add cover_letters table and selectedCoverLetterTone column"
```

---

### Task 2: TypeScript Types — Add CoverLetterTone and CoverLetters type

**Files:**
- Modify: `src/types/index.ts` (after ResumeContent, ~line 262)

**Step 1: Add types**

Append after the `ResumeContent` interface:

```typescript
// ── Cover Letters ────────────────────────────────────────────────────

export type CoverLetterTone = 'formal' | 'culture_fit' | 'technical'

export interface CoverLetterSet {
  formal: string
  cultureFit: string
  technical: string
}
```

**Step 2: Add test for new types**

Add to `tests/unit/types/types.test.ts`:

```typescript
it('CoverLetterTone accepts valid tones', () => {
  const tones: CoverLetterTone[] = ['formal', 'culture_fit', 'technical']
  expect(tones).toHaveLength(3)
})

it('CoverLetterSet has all three tone fields', () => {
  const set: CoverLetterSet = {
    formal: 'Dear Hiring Manager...',
    cultureFit: 'Hi there...',
    technical: 'As a senior engineer...',
  }
  expect(set.formal).toBeDefined()
  expect(set.cultureFit).toBeDefined()
  expect(set.technical).toBeDefined()
})
```

**Step 3: Run tests**

Run: `npx vitest run tests/unit/types/types.test.ts`
Expected: PASS

**Step 4: Commit**

```bash
git add src/types/index.ts tests/unit/types/types.test.ts
git commit -m "feat: add CoverLetterTone and CoverLetterSet types"
```

---

### Task 3: AI Prompt — Cover letter generation prompt

**Files:**
- Create: `src/lib/ai/prompts/generate-cover-letters.ts`
- Create: `tests/unit/ai/generate-cover-letters.test.ts`

**Step 1: Write the failing test**

```typescript
// tests/unit/ai/generate-cover-letters.test.ts
import { describe, it, expect } from 'vitest'
import { buildCoverLetterPrompt } from '@/lib/ai/prompts/generate-cover-letters'

describe('buildCoverLetterPrompt', () => {
  const jobText = 'We are looking for a Senior React Developer with 5+ years of experience.'
  const company = 'Acme Corp'
  const jobTitle = 'Senior React Developer'

  const analysis = {
    keyRequirements: [{ requirement: 'React experience', priority: 'high' as const }],
    skillMatches: [{ skill: 'React', strength: 'strong' as const }],
    gaps: [],
    recommendedAngle: 'Emphasize frontend expertise',
    sectionsToInclude: ['personal_info' as const, 'experience' as const, 'skills' as const, 'summary' as const],
  }

  const profileSections = [
    { sectionType: 'personal_info', data: { fullName: 'Jane Doe', email: 'jane@example.com' } },
    { sectionType: 'experience', data: { entries: [{ company: 'TechCo', title: 'Developer', startDate: '2020-01', current: true, bullets: ['Built React apps'] }] } },
    { sectionType: 'summary', data: { text: 'Experienced frontend developer' } },
  ]

  it('returns a string prompt', () => {
    const prompt = buildCoverLetterPrompt({ jobText, company, jobTitle, analysis, profileSections })
    expect(typeof prompt).toBe('string')
    expect(prompt.length).toBeGreaterThan(0)
  })

  it('includes the job posting text', () => {
    const prompt = buildCoverLetterPrompt({ jobText, company, jobTitle, analysis, profileSections })
    expect(prompt).toContain(jobText)
  })

  it('includes the company name', () => {
    const prompt = buildCoverLetterPrompt({ jobText, company, jobTitle, analysis, profileSections })
    expect(prompt).toContain('Acme Corp')
  })

  it('mentions all three tones', () => {
    const prompt = buildCoverLetterPrompt({ jobText, company, jobTitle, analysis, profileSections })
    expect(prompt).toContain('formal')
    expect(prompt).toContain('cultureFit')
    expect(prompt).toContain('technical')
  })

  it('includes the recommended angle from analysis', () => {
    const prompt = buildCoverLetterPrompt({ jobText, company, jobTitle, analysis, profileSections })
    expect(prompt).toContain('Emphasize frontend expertise')
  })

  it('requests JSON output', () => {
    const prompt = buildCoverLetterPrompt({ jobText, company, jobTitle, analysis, profileSections })
    expect(prompt).toContain('"formal"')
    expect(prompt).toContain('"cultureFit"')
    expect(prompt).toContain('"technical"')
  })
})
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/ai/generate-cover-letters.test.ts`
Expected: FAIL — module not found

**Step 3: Implement the prompt builder**

```typescript
// src/lib/ai/prompts/generate-cover-letters.ts
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
```

**Step 4: Run tests**

Run: `npx vitest run tests/unit/ai/generate-cover-letters.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/lib/ai/prompts/generate-cover-letters.ts tests/unit/ai/generate-cover-letters.test.ts
git commit -m "feat: add cover letter generation prompt builder"
```

---

### Task 4: Server Actions — Cover letter generation and CRUD

**Files:**
- Modify: `src/actions/generation.ts`
- Modify: `tests/unit/actions/generation.test.ts`

**Step 1: Add failing tests**

Add to `tests/unit/actions/generation.test.ts`:

```typescript
it('exports generateCoverLetters function', async () => {
  const { generateCoverLetters } = await import('@/actions/generation')
  expect(typeof generateCoverLetters).toBe('function')
})

it('exports updateCoverLetter function', async () => {
  const { updateCoverLetter } = await import('@/actions/generation')
  expect(typeof updateCoverLetter).toBe('function')
})

it('exports getCoverLetters function', async () => {
  const { getCoverLetters } = await import('@/actions/generation')
  expect(typeof getCoverLetters).toBe('function')
})
```

**Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/unit/actions/generation.test.ts`
Expected: FAIL

**Step 3: Implement server actions**

Add imports at top of `src/actions/generation.ts`:

```typescript
import { coverLetters } from '@/lib/db/schema'
import { buildCoverLetterPrompt } from '@/lib/ai/prompts/generate-cover-letters'
import type { JobAnalysis, ResumeContent, CoverLetterSet, CoverLetterTone } from '@/types'
```

Add these new functions at the end of the file:

```typescript
export async function generateCoverLetters(
  jobText: string,
  company: string,
  jobTitle: string,
  analysis: JobAnalysis,
  parsedSections: { sectionType: string; data: unknown }[]
) {
  const user = await getAuthenticatedUser()

  const result = await callOpenRouterJSON<CoverLetterSet>({
    apiKey: user.openrouterApiKey!,
    model: user.preferredModel || 'anthropic/claude-sonnet-4',
    messages: [
      {
        role: 'user',
        content: buildCoverLetterPrompt({ jobText, company, jobTitle, analysis, profileSections: parsedSections }),
      },
    ],
    temperature: 0.7,
    maxTokens: 8192,
  })

  return result
}

export async function updateCoverLetter(resumeId: string, tone: CoverLetterTone, content: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Not authenticated')

  const toneToColumn: Record<CoverLetterTone, string> = {
    formal: 'formal',
    culture_fit: 'culture_fit',
    technical: 'technical',
  }

  await db
    .update(coverLetters)
    .set({ content, updatedAt: new Date().toISOString() })
    .where(
      and(
        eq(coverLetters.resumeId, resumeId),
        eq(coverLetters.tone, toneToColumn[tone]),
        eq(coverLetters.userId, session.user.id)
      )
    )

  return { tone, content }
}

export async function getCoverLetters(resumeId: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Not authenticated')

  const letters = await db
    .select()
    .from(coverLetters)
    .where(
      and(
        eq(coverLetters.resumeId, resumeId),
        eq(coverLetters.userId, session.user.id)
      )
    )

  return letters
}
```

**Step 4: Modify generateResume to accept cover letters**

Update the `generateResume` function signature and body. The function should:
1. Accept optional `coverLetterTexts` (the 3 edited texts) and `selectedTone`
2. Pass the selected cover letter into the resume generation prompt
3. Save all 3 cover letters to DB after creating the resume

Updated signature:

```typescript
export async function generateResume(
  jobText: string,
  company: string,
  jobTitle: string,
  analysis: JobAnalysis,
  parsedSections: { sectionType: string; data: unknown }[],
  coverLetterTexts?: CoverLetterSet,
  selectedTone?: CoverLetterTone
)
```

Inside the function, before calling `callOpenRouterJSON<ResumeContent>`, build the prompt with optional cover letter context:

```typescript
  let prompt = buildGenerationPrompt({ analysis, profileSections: parsedSections })

  if (coverLetterTexts && selectedTone) {
    const toneKey = selectedTone === 'culture_fit' ? 'cultureFit' : selectedTone
    const selectedLetter = coverLetterTexts[toneKey as keyof CoverLetterSet]
    prompt += `\n\n## Cover Letter Context\nThe candidate is also submitting this cover letter. Ensure the resume complements rather than duplicates the cover letter's talking points:\n\n${selectedLetter}`
  }
```

After the `db.insert(resumes)` call, add cover letter saving:

```typescript
  if (coverLetterTexts) {
    const tones: { tone: string; content: string }[] = [
      { tone: 'formal', content: coverLetterTexts.formal },
      { tone: 'culture_fit', content: coverLetterTexts.cultureFit },
      { tone: 'technical', content: coverLetterTexts.technical },
    ]

    for (const t of tones) {
      await db.insert(coverLetters).values({
        id: nanoid(),
        userId: user.id,
        resumeId: id,
        tone: t.tone,
        content: t.content,
        createdAt: now,
        updatedAt: now,
      })
    }
  }
```

Also update the resumes insert to include `selectedCoverLetterTone`:

```typescript
  await db.insert(resumes).values({
    id,
    userId: user.id,
    jobTitle,
    company,
    jobText,
    analysis: JSON.stringify(analysis),
    resumeContent: JSON.stringify(resumeContent),
    templateId: 'clean',
    selectedCoverLetterTone: selectedTone ?? null,
    feedbackHistory: '[]',
    createdAt: now,
    updatedAt: now,
  })
```

**Step 5: Run tests**

Run: `npx vitest run tests/unit/actions/generation.test.ts`
Expected: PASS

**Step 6: Commit**

```bash
git add src/actions/generation.ts tests/unit/actions/generation.test.ts
git commit -m "feat: add cover letter server actions and modify generateResume"
```

---

### Task 5: Generate Page UI — Toggle and cover letter tabs

**Files:**
- Modify: `src/app/(app)/generate/client.tsx`

**Step 1: Add state variables**

Add after existing state declarations (around line 18):

```typescript
const [wantCoverLetters, setWantCoverLetters] = useState(false)
const [coverLetters, setCoverLetters] = useState<CoverLetterSet | null>(null)
const [coverLetterTab, setCoverLetterTab] = useState<'formal' | 'cultureFit' | 'technical'>('formal')
const [isGeneratingCoverLetters, setIsGeneratingCoverLetters] = useState(false)
```

Add import for `generateCoverLetters` and types:

```typescript
import { analyzeJob, generateResume, generateCoverLetters } from '@/actions/generation'
import type { JobAnalysis, CoverLetterSet, CoverLetterTone } from '@/types'
```

**Step 2: Trigger cover letter generation after analysis**

In `handleAnalyze`, after `setStep('analysis')` (line 31), add:

```typescript
        if (wantCoverLetters) {
          setIsGeneratingCoverLetters(true)
          try {
            const letters = await generateCoverLetters(jobText, company, jobTitle, result.analysis, result.parsedSections)
            setCoverLetters(letters)
          } catch {
            // Cover letter generation failed — non-blocking, user can still generate resume
          } finally {
            setIsGeneratingCoverLetters(false)
          }
        }
```

**Step 3: Pass cover letters to handleGenerate**

Update `handleGenerate` to pass cover letter data:

```typescript
  function handleGenerate() {
    if (!analysis) return
    setError(null)
    setStep('generating')

    const toneMap: Record<string, CoverLetterTone> = {
      formal: 'formal',
      cultureFit: 'culture_fit',
      technical: 'technical',
    }

    startTransition(async () => {
      try {
        const result = await generateResume(
          jobText, company, jobTitle, analysis, parsedSections,
          coverLetters ?? undefined,
          coverLetters ? toneMap[coverLetterTab] : undefined
        )
        router.push(`/resume/${result.id}`)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to generate resume')
        setStep('analysis')
      }
    })
  }
```

**Step 4: Add checkbox toggle to Step 1 UI**

Add below the job posting textarea (after line 114, before the button `<div>`):

```tsx
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={wantCoverLetters}
                onChange={(e) => setWantCoverLetters(e.target.checked)}
                disabled={step === 'analyzing'}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Also generate cover letters</span>
            </label>
```

**Step 5: Add cover letter section to Step 2 UI**

Add after the analysis results card (after line 205, before the "Generate Resume" button `<div>`):

```tsx
          {/* Cover Letters */}
          {wantCoverLetters && (
            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Cover Letters</h2>

              {isGeneratingCoverLetters && (
                <div className="flex items-center justify-center gap-3 py-8 text-sm text-gray-600 dark:text-gray-400">
                  <div className="h-5 w-5 border-2 border-blue-600 dark:border-blue-400 border-t-transparent rounded-full animate-spin" />
                  Generating cover letters...
                </div>
              )}

              {coverLetters && (
                <>
                  <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
                    {([
                      ['formal', 'Direct & Formal'],
                      ['cultureFit', 'Culture Fit'],
                      ['technical', 'Technically Impressive'],
                    ] as const).map(([key, label]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setCoverLetterTab(key)}
                        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                          coverLetterTab === key
                            ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                            : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={coverLetters[coverLetterTab]}
                    onChange={(e) =>
                      setCoverLetters((prev) =>
                        prev ? { ...prev, [coverLetterTab]: e.target.value } : prev
                      )
                    }
                    rows={16}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 dark:bg-gray-800 dark:text-gray-100 resize-y leading-relaxed"
                  />
                </>
              )}
            </div>
          )}
```

**Step 6: Commit**

```bash
git add src/app/\(app\)/generate/client.tsx
git commit -m "feat: add cover letter toggle and tabbed editor to generate page"
```

---

### Task 6: Cover Letter PDF Template and API Route

**Files:**
- Create: `src/lib/pdf/cover-letter-template.ts`
- Create: `src/app/api/pdf/cover-letter/[resumeId]/route.ts`

**Step 1: Create the cover letter HTML template**

```typescript
// src/lib/pdf/cover-letter-template.ts
import type { PersonalInfo } from '@/types'

export function renderCoverLetterToHtml(
  content: string,
  personalInfo: PersonalInfo
): string {
  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  // Split content into paragraphs, preserving the letter structure
  const paragraphs = content
    .split('\n')
    .filter((line) => line.trim())
    .map((p) => `<p style="margin: 0 0 12px 0; line-height: 1.7;">${p.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>`)
    .join('\n')

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Cover Letter - ${personalInfo.fullName.replace(/</g, '&lt;')}</title>
  <style>
    @page { size: letter; margin: 72px; }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 0;
      font-family: Georgia, 'Times New Roman', Times, serif;
      font-size: 11.5px;
      color: #1f2937;
      line-height: 1.7;
      print-color-adjust: exact;
      -webkit-print-color-adjust: exact;
    }
  </style>
</head>
<body>
  <div style="max-width: 816px;">
    <div style="margin-bottom: 32px;">
      <div style="font-weight: 600; font-size: 14px;">${personalInfo.fullName.replace(/</g, '&lt;')}</div>
      ${personalInfo.email ? `<div style="font-size: 10.5px; color: #4b5563;">${personalInfo.email}</div>` : ''}
      ${personalInfo.phone ? `<div style="font-size: 10.5px; color: #4b5563;">${personalInfo.phone}</div>` : ''}
      ${personalInfo.location ? `<div style="font-size: 10.5px; color: #4b5563;">${personalInfo.location}</div>` : ''}
    </div>
    <div style="margin-bottom: 24px; font-size: 11px; color: #6b7280;">${today}</div>
    <div style="font-size: 11.5px;">
      ${paragraphs}
    </div>
  </div>
</body>
</html>`
}
```

**Step 2: Create the API route**

```typescript
// src/app/api/pdf/cover-letter/[resumeId]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db/client'
import { coverLetters, profileSections } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { renderCoverLetterToHtml } from '@/lib/pdf/cover-letter-template'
import { generatePdf } from '@/lib/pdf/puppeteer'
import { buildResumeFilename } from '@/lib/filename'
import type { PersonalInfo, CoverLetterTone } from '@/types'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ resumeId: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { resumeId } = await params
  const tone = (request.nextUrl.searchParams.get('tone') ?? 'formal') as CoverLetterTone

  const [letter] = await db
    .select()
    .from(coverLetters)
    .where(
      and(
        eq(coverLetters.resumeId, resumeId),
        eq(coverLetters.tone, tone),
        eq(coverLetters.userId, session.user.id)
      )
    )
    .limit(1)

  if (!letter) {
    return NextResponse.json({ error: 'Cover letter not found' }, { status: 404 })
  }

  const sections = await db
    .select()
    .from(profileSections)
    .where(
      and(
        eq(profileSections.userId, session.user.id),
        eq(profileSections.sectionType, 'personal_info')
      )
    )
    .limit(1)

  const personalInfo: PersonalInfo = sections[0]
    ? JSON.parse(sections[0].data)
    : { fullName: 'Unknown', email: '' }

  const html = renderCoverLetterToHtml(letter.content, personalInfo)
  const pdf = await generatePdf(html)

  const filename = buildResumeFilename(personalInfo.fullName, '', '')
    .replace('resume', 'cover-letter')

  return new NextResponse(pdf, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
```

**Step 3: Commit**

```bash
git add src/lib/pdf/cover-letter-template.ts src/app/api/pdf/cover-letter/\[resumeId\]/route.ts
git commit -m "feat: add cover letter PDF template and API route"
```

---

### Task 7: Resume Page UI — Cover letter tab in side panel

**Files:**
- Modify: `src/app/(app)/resume/[id]/client.tsx`
- Modify: `src/app/(app)/resume/[id]/page.tsx` (server component — needs to pass cover letters)

**Step 1: Update the server page to fetch cover letters**

In `src/app/(app)/resume/[id]/page.tsx`, after fetching the resume with `getResume()`, also call `getCoverLetters()`:

```typescript
import { getResume, getCoverLetters } from '@/actions/generation'
```

Pass the cover letters to the client component:

```typescript
const letters = await getCoverLetters(resume.id)
// Pass as prop: coverLetters={letters}
```

**Step 2: Update the client component**

Add cover letter state and a third tab to the side panel. Reference the existing tab pattern at line 82 (`drawerTab`).

Expand the tab type:

```typescript
type DrawerTab = 'edit' | 'customize' | 'coverLetter'
```

Add state for cover letter editing:

```typescript
const [coverLetterTab, setCoverLetterTab] = useState<'formal' | 'culture_fit' | 'technical'>('formal')
const [coverLetterTexts, setCoverLetterTexts] = useState<Record<string, string>>({})
```

Initialize from props in a useEffect:

```typescript
useEffect(() => {
  if (initialCoverLetters.length > 0) {
    const texts: Record<string, string> = {}
    for (const l of initialCoverLetters) texts[l.tone] = l.content
    setCoverLetterTexts(texts)
  }
}, [initialCoverLetters])
```

Add a "Cover Letter" tab button alongside Edit and Customize (only shown when cover letters exist):

```tsx
{initialCoverLetters.length > 0 && (
  <button onClick={() => setDrawerTab('coverLetter')} ...>Cover Letter</button>
)}
```

Add the cover letter tab content panel with:
- 3 sub-tabs (Direct & Formal / Culture Fit / Technically Impressive)
- Editable textarea for the active tone
- Save button that calls `updateCoverLetter()`
- Download button that links to `/api/pdf/cover-letter/${resumeId}?tone=${coverLetterTab}`

```tsx
{drawerTab === 'coverLetter' && (
  <div className="space-y-3">
    <div className="flex border-b border-gray-200 dark:border-gray-700">
      {([
        ['formal', 'Formal'],
        ['culture_fit', 'Culture Fit'],
        ['technical', 'Technical'],
      ] as const).map(([key, label]) => (
        <button
          key={key}
          type="button"
          onClick={() => setCoverLetterTab(key)}
          className={`px-3 py-1.5 text-xs font-medium border-b-2 ${
            coverLetterTab === key
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
    <textarea
      value={coverLetterTexts[coverLetterTab] ?? ''}
      onChange={(e) =>
        setCoverLetterTexts((prev) => ({ ...prev, [coverLetterTab]: e.target.value }))
      }
      rows={20}
      className="w-full px-2 py-1.5 text-sm border border-gray-300/70 dark:border-gray-600/70 rounded-md bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm dark:text-gray-100 resize-y leading-relaxed"
    />
    <div className="flex gap-2">
      <button
        type="button"
        onClick={handleCoverLetterSave}
        className="flex-1 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
      >
        Save
      </button>
      <a
        href={`/api/pdf/cover-letter/${resumeId}?tone=${coverLetterTab}`}
        download
        className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-900"
      >
        Download PDF
      </a>
    </div>
  </div>
)}
```

The save handler:

```typescript
async function handleCoverLetterSave() {
  const content = coverLetterTexts[coverLetterTab]
  if (!content) return
  await updateCoverLetter(resumeId, coverLetterTab as CoverLetterTone, content)
}
```

**Step 3: Commit**

```bash
git add src/app/\(app\)/resume/\[id\]/client.tsx src/app/\(app\)/resume/\[id\]/page.tsx
git commit -m "feat: add cover letter tab to resume page side panel"
```

---

### Task 8: Type check and integration test

**Step 1: Run type checker**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 2: Run all tests**

Run: `npm test`
Expected: All pass

**Step 3: Manual smoke test**

1. Go to `/generate`, fill in company/title/job posting
2. Check "Also generate cover letters"
3. Click Analyze — verify analysis shows, then cover letters load in 3 tabs
4. Edit a cover letter, switch tabs, verify edits persist
5. Click Generate Resume — verify redirect to resume page
6. On resume page, verify Cover Letter tab appears in side panel
7. Verify download works for cover letter PDF

**Step 4: Final commit**

```bash
git add -A
git commit -m "feat: complete cover letter generation feature"
```

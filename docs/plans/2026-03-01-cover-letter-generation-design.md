# Cover Letter Generation Feature — Design

## Overview

Add optional cover letter generation to the resume builder flow. When enabled, the system generates 3 cover letters in different tones during job analysis (Step 2). Users edit them inline, select one, and the resume generation uses it as complementary context. Cover letters are saved with the resume and downloadable as formatted PDFs.

## User Flow

1. **Step 1 (Input)** — Checkbox toggle "Also generate cover letters" below job posting textarea
2. **Step 2 (Analysis)** — After job analysis completes, if toggle was checked:
   - Cover letters generate automatically (loading state shown below analysis)
   - 3-tab UI appears: Direct & Formal | Culture Fit | Technically Impressive
   - Each tab has an editable textarea with the full cover letter
3. **Generate Resume** — Active tab's cover letter passes as context to resume generation prompt
4. **Resume Page** — Cover letters accessible in side panel, editable, downloadable as PDF

## Three Tones

- **Direct & Formal** — Professional, concise, emphasizes qualifications and fit
- **Culture Fit** — Warmer, shows enthusiasm for company mission/values, proper grammar throughout
- **Technically Impressive** — Leads with technical achievements, specific metrics, architecture decisions

## Data Model

### New table: `coverLetters`

| Column      | Type    | Description                              |
|-------------|---------|------------------------------------------|
| id          | text PK | UUID                                     |
| userId      | text FK | References users                         |
| resumeId    | text FK | References resumes                       |
| tone        | text    | 'formal' \| 'culture_fit' \| 'technical' |
| content     | text    | Full cover letter text                   |
| createdAt   | integer | Unix timestamp                           |
| updatedAt   | integer | Unix timestamp                           |

### Changes to `resumes` table

- Add `selectedCoverLetterTone` column (nullable text) — null means no cover letter generated

## AI Integration

### New prompt: `generate-cover-letters.ts`

- **Input:** Job posting, job analysis, profile sections (personal_info, summary, experience)
- **Output JSON:** `{ formal: string, cultureFit: string, technical: string }`
- Single API call returns all 3 tones (~300-400 words each)
- Same no-fabrication rule as resumes — only uses real profile data
- Temperature: 0.7 (more creative variation between tones)

### Modified prompt: `generate-resume.ts`

When cover letter is present, append to generation prompt:
> "The candidate is also submitting this cover letter. Ensure the resume complements rather than duplicates the cover letter's talking points."

## Server Actions

| Action | Purpose |
|--------|---------|
| `generateCoverLetters(jobText, company, jobTitle, analysis, parsedSections)` | Generate 3 tones via OpenRouter. Returns strings, not yet saved to DB. |
| `generateResume(...)` — modified | Accepts optional `coverLetters` + `selectedTone`. Saves cover letters to DB after creating resume. Passes selected cover letter into resume prompt. |
| `updateCoverLetter(resumeId, tone, content)` | Update a single cover letter's content (post-generation editing). |
| `getCoverLetters(resumeId)` | Fetch all 3 cover letters for a resume. |

## Cover Letter PDF

- **Route:** `/api/pdf/cover-letter/[resumeId]?tone=formal|culture_fit|technical`
- **Template:** Single clean letter layout (not 3 visual styles — tone variation is in writing)
  - User's name and contact info (from personalInfo)
  - Date
  - "Dear Hiring Manager,"
  - Body paragraphs
  - "Sincerely, [Name]"
- Uses same Puppeteer pipeline as resume PDFs

## UI Components

### Generate page (`client.tsx`)

- Checkbox toggle below job posting: "Also generate cover letters"
- Cover letter section appears after analysis (loading → tabs)
- 3 tabs with editable textareas
- Active tab when clicking "Generate Resume" = selected tone

### Resume page (side panel)

- New "Cover Letter" tab (shown only when cover letters exist)
- Same 3-tab UI with editable textareas
- Download button for cover letter PDF (active tone)

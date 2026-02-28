# Resume Builder v2 — Design Document

**Date:** 2026-02-28
**Status:** Approved

## Overview

A multi-user web application that helps job seekers build comprehensive professional profiles and generate tailored, AI-optimized resumes for specific job postings. Users provide their own OpenRouter API key (BYOK) to power AI features. The app generates a single strongest-possible resume per job, which users can edit, provide feedback on, and regenerate. Three premium templates provide visually distinctive PDF output.

**Philosophy:** Software as a Gift — free to use, users bring their own AI keys.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js (App Router, React Server Components, Server Actions) |
| Language | TypeScript (TSX) |
| Styling | Tailwind CSS |
| Auth | Auth.js (NextAuth) — Google + GitHub OAuth |
| Database | Turso (libSQL) |
| ORM | Drizzle ORM |
| AI | OpenRouter API (BYOK — user provides their own key) |
| PDF | Puppeteer / @sparticuz/chromium (headless Chrome on Vercel) |
| Testing | Vitest, React Testing Library, MSW, Playwright |
| Deployment | Vercel |

## Architecture

Server Components + Server Actions pattern. No separate backend service.

- **Server Components** for all data-fetching pages
- **Server Actions** for mutations (profile saves, AI generation, resume edits)
- **Route Handlers** for auth callbacks, PDF generation, platform imports
- All AI calls happen server-side — user API keys never sent to browser
- Puppeteer PDF generation via Vercel serverless function

## Data Model

### users
| Column | Type | Notes |
|--------|------|-------|
| id | text PK | |
| name | text | From OAuth |
| email | text | From OAuth |
| image | text | From OAuth |
| tier | text | Default 'free' — future monetization |
| generations_this_month | int | Default 0 — future monetization |
| openrouter_api_key | text | Encrypted |
| preferred_model | text | Nullable |
| onboarding_completed | boolean | |
| created_at | timestamp | |
| updated_at | timestamp | |

### profile_sections
| Column | Type | Notes |
|--------|------|-------|
| id | text PK | |
| user_id | text FK | → users |
| section_type | text | Enum: personal_info, summary, experience, education, skills, projects, certificates, references, volunteer, languages, awards, ip, interests |
| data | text | JSON — flexible per section type |
| sort_order | int | |
| created_at | timestamp | |
| updated_at | timestamp | |

### resumes
| Column | Type | Notes |
|--------|------|-------|
| id | text PK | |
| user_id | text FK | → users |
| job_title | text | |
| company | text | |
| job_text | text | Pasted job posting |
| analysis | text | JSON — AI analysis results |
| resume_content | text | JSON — generated resume data |
| template_id | text | |
| user_edits | text | JSON, nullable — user overrides |
| feedback_history | text | JSON — array of {feedback, timestamp} |
| created_at | timestamp | |
| updated_at | timestamp | |

### templates
| Column | Type | Notes |
|--------|------|-------|
| id | text PK | |
| name | text | |
| slug | text | Unique |
| description | text | |
| tier | text | Default 'free' — future monetization |
| preview_image_url | text | |

## User Flow

### Authentication
1. Landing page with sign-in (Google or GitHub OAuth)
2. Auth.js handles session management

### Onboarding (first-time users)
Step-by-step profile builder at `/onboarding/[step]`:

1. **Personal Info** — name, email, phone, location, links (required)
2. **Summary/Bio** — professional summary with AI polish option
3. **Work Experience** — company, title, dates, bullet points (AI-assisted)
4. **Education** — school, degree, graduation year, GPA (optional)
5. **Skills** — categorized: languages, frameworks, tools, soft skills
6. **Projects** — name, description, URL, tech stack
7. **Certificates/Licenses** — name, issuer, date, credential ID
8. **References** — name, title, company, contact (never auto-included in resume)
9. **Volunteer Work** — org, role, dates, description
10. **Languages** — language, proficiency level
11. **Awards/Honors** — name, issuer, date, description
12. **Intellectual Property** — patents, publications, open source contributions
13. **Interests** — hobbies, activities outside work

Features:
- Progress bar showing completion
- Skip button on optional sections (everything except personal info)
- Platform import buttons on relevant steps (GitHub, Kaggle, Behance)
- AI assistance per field (polish text, suggest descriptions)
- All sections editable later from `/profile`

### Resume Generation
1. User pastes job posting text at `/generate`
2. AI analyzes job vs profile — extracts requirements, matches skills, identifies gaps, recommends narrative angle, selects which optional sections to include
3. AI generates single strongest resume — tailored summary, rewritten bullets, curated skills, selected sections
4. User views result at `/resume/[id]` with live preview
5. User can edit sections inline, provide feedback ("make it more technical"), regenerate
6. User selects template and downloads PDF

### Dashboard
- Generate new resume
- Edit profile (section-by-section)
- Resume history (past generations)
- Settings (API key, model selection)

## AI Integration

All AI calls via OpenRouter API (`POST https://openrouter.ai/api/v1/chat/completions`).

### 1. Onboarding Assistance (optional, per-field)
- Polishes rough bullet points
- Suggests structured descriptions
- Lightweight single-prompt calls

### 2. Job Analysis
- Input: job posting text + complete profile
- Output: structured JSON — requirements, skill matches, gaps, recommended angle, sections to include
- JSON schema enforced via prompt

### 3. Resume Generation
- Input: profile + analysis + sections to include
- Output: structured JSON — full resume content
- Rule: never fabricate — only reword, reorder, curate from real profile data

### 4. Regeneration with Feedback
- Input: current resume + feedback text + feedback history
- Output: revised resume addressing feedback
- Preserves context of prior revisions

## Templates

Three premium PDF templates:

1. **Clean** — Minimalist single-column, generous whitespace, serif headings, subtle accent line
2. **Bold** — Two-column with colored sidebar, skills visualization, modern sans-serif
3. **Executive** — Dark header block, modular sections, professional serif typography, understated elegance

All templates rendered as HTML/CSS, converted to PDF via Puppeteer.

## PDF Generation

- Templates are React components that render to HTML
- Puppeteer (via `@sparticuz/chromium`) runs in a Vercel serverless function
- Renders the HTML template to PDF
- Full CSS support (flexbox, grid, gradients, custom fonts)
- File naming: `resume-{company}-{template}.pdf`

## Testing Strategy (TDD)

| Layer | What | Tool |
|-------|------|------|
| Server Actions | Profile CRUD, generation pipeline, resume edits | Vitest + in-memory SQLite |
| AI prompts | Prompt construction, response parsing | Vitest + MSW |
| Components | Onboarding forms, resume preview, template rendering | React Testing Library |
| PDF generation | Template HTML output | Vitest snapshot tests |
| Auth | Protected routes, session handling | Vitest + mocked Auth.js |
| E2E | Full onboarding, generate + download | Playwright |

TDD rhythm: write failing test → implement minimum to pass → refactor → repeat.

## Future Monetization (data model only, no logic)

- `users.tier` — defaults to 'free', can be 'pro' later
- `users.generations_this_month` — counter for potential rate limiting
- `templates.tier` — gate premium templates behind paid tier
- Resume history naturally supports storage limits

## Project Structure

```
pdf-resume-builder-v2/
├── src/
│   ├── app/
│   │   ├── page.tsx                    (landing)
│   │   ├── layout.tsx                  (root layout)
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── onboarding/
│   │   │   └── [step]/
│   │   │       └── page.tsx
│   │   ├── generate/
│   │   │   └── page.tsx
│   │   ├── resume/
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   ├── profile/
│   │   │   └── page.tsx
│   │   ├── settings/
│   │   │   └── page.tsx
│   │   └── api/
│   │       ├── auth/[...nextauth]/
│   │       ├── pdf/[id]/
│   │       └── import/[platform]/
│   ├── components/
│   │   ├── onboarding/               (step forms)
│   │   ├── resume/                   (preview, editor, templates)
│   │   ├── ui/                       (shared UI primitives)
│   │   └── layout/                   (nav, sidebar, etc.)
│   ├── actions/
│   │   ├── profile.ts
│   │   ├── generation.ts
│   │   └── resume.ts
│   ├── lib/
│   │   ├── db/
│   │   │   ├── schema.ts             (Drizzle schema)
│   │   │   ├── client.ts             (Turso connection)
│   │   │   └── migrations/
│   │   ├── ai/
│   │   │   ├── openrouter.ts         (API client)
│   │   │   ├── prompts/              (prompt templates)
│   │   │   └── schemas/              (JSON response schemas)
│   │   ├── auth.ts                   (Auth.js config)
│   │   ├── pdf/
│   │   │   └── generator.ts          (Puppeteer logic)
│   │   └── importers/
│   │       ├── github.ts
│   │       ├── kaggle.ts
│   │       └── behance.ts
│   ├── templates/
│   │   ├── clean/
│   │   ├── bold/
│   │   └── executive/
│   └── types/
│       └── index.ts
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── docs/
│   └── plans/
├── drizzle.config.ts
├── next.config.ts
├── tailwind.config.ts
├── vitest.config.ts
├── playwright.config.ts
├── package.json
└── tsconfig.json
```

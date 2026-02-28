# Resume Builder v2 — Developer Guide

## Quick Start

```bash
npm install
npm run dev       # Start dev server on localhost:3000
npm test          # Run all tests
npm run test:watch # Watch mode
```

## Stack

- **Framework:** Next.js 16 (App Router, Server Components, Server Actions)
- **Language:** TypeScript
- **Styling:** Tailwind CSS (inline styles for PDF templates)
- **Auth:** Auth.js v5 (Google + GitHub OAuth)
- **Database:** Turso (libSQL) via Drizzle ORM
- **AI:** OpenRouter API (BYOK)
- **PDF:** Puppeteer (via @sparticuz/chromium for Vercel)
- **Testing:** Vitest + React Testing Library + MSW

## Project Structure

- `src/app/` — Next.js pages and API routes
  - `(app)/` — Authenticated route group (dashboard, generate, resume, settings, profile)
  - `login/` — Login page (unauthenticated)
  - `onboarding/` — Step-by-step profile builder
  - `api/` — Auth handlers, PDF generation, platform imports
- `src/actions/` — Server actions (profile, settings, generation, onboarding)
- `src/components/` — React components (onboarding steps, resume, layout)
- `src/lib/` — Core libraries (auth, db, ai, pdf, importers, env)
- `src/templates/` — Resume PDF templates (clean, bold, executive)
- `src/types/` — TypeScript type definitions
- `tests/` — Test files (mirrors src structure)

## Database

```bash
npm run db:generate  # Generate migrations from schema
npm run db:migrate   # Apply migrations to Turso
npm run db:push      # Push schema directly (dev)
npm run db:studio    # Open Drizzle Studio
```

Schema: `src/lib/db/schema.ts`
Client: `src/lib/db/client.ts`

## Testing

TDD approach: write failing test → implement → verify → commit.

```bash
npm test                    # Run all tests
npm run test:watch          # Watch mode
npx vitest run tests/unit/  # Run specific directory
```

Tests use:
- **Vitest** for test runner
- **React Testing Library** for component tests
- **MSW** for mocking HTTP requests (OpenRouter, GitHub API)
- Mocked DB and auth for unit tests

## Key Patterns

- **Server Actions** for all mutations (no REST API layer)
- **Server Components** for data-fetching pages
- **Client Components** only for interactive forms and state
- **JSON in SQLite** for flexible section data (profile_sections.data column)
- **BYOK** — users provide their own OpenRouter API key
- **Never fabricate** — AI rewrites/reorders real profile data, never invents

## Environment Variables

See `.env.example` for all required variables.

## 13 Profile Section Types

personal_info, summary, experience, education, skills, projects, certificates, references, volunteer, languages, awards, ip, interests

## Resume Templates

- **Clean** — Minimalist single-column, serif headings
- **Bold** — Two-column with navy sidebar
- **Executive** — Dark header block, gold accents

All use inline styles (not CSS modules) for Puppeteer PDF compatibility.

# Resume Builder v2 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a multi-user resume builder with step-by-step onboarding, OpenRouter AI integration (BYOK), single best-resume generation, and 3 premium PDF templates.

**Architecture:** Next.js App Router with Server Components + Server Actions, Turso DB via Drizzle ORM, Auth.js (Google/GitHub OAuth), OpenRouter for AI, Puppeteer for PDF generation. TDD throughout.

**Tech Stack:** Next.js 16, TypeScript, Tailwind CSS, Drizzle ORM, Turso, Auth.js v5, OpenRouter API, Puppeteer, Vitest, React Testing Library, MSW, Playwright

---

## Phase 1: Project Scaffolding & Configuration

### Task 1: Initialize Next.js project

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`

**Step 1: Create Next.js app**

Run:
```bash
cd /c/Users/USER/dev/pdf-resume-builder-v2
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm
```

Accept defaults. If it asks about overwriting, allow it (only docs/ exists).

**Step 2: Verify it runs**

Run: `npm run dev`
Expected: App starts on localhost:3000

**Step 3: Commit**

```bash
git add -A
git commit -m "chore: initialize Next.js project with TypeScript and Tailwind"
```

### Task 2: Install core dependencies

**Files:**
- Modify: `package.json`

**Step 1: Install production dependencies**

```bash
npm install drizzle-orm @libsql/client next-auth@beta @auth/drizzle-adapter nanoid
```

**Step 2: Install dev dependencies**

```bash
npm install -D drizzle-kit dotenv vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event msw playwright @playwright/test
```

**Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: install core dependencies (drizzle, auth.js, vitest, msw, playwright)"
```

### Task 3: Configure Vitest

**Files:**
- Create: `vitest.config.ts`
- Modify: `package.json` (add test scripts)
- Modify: `tsconfig.json` (add vitest types)

**Step 1: Create vitest config**

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.test.{ts,tsx}'],
    globals: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

**Step 2: Create test setup file**

```typescript
// tests/setup.ts
import '@testing-library/jest-dom/vitest'
```

**Step 3: Add test scripts to package.json**

Add to `"scripts"`:
```json
"test": "vitest run",
"test:watch": "vitest",
"test:ui": "vitest --ui"
```

**Step 4: Run tests (should pass with no tests found)**

Run: `npm test`
Expected: "No test files found"

**Step 5: Commit**

```bash
git add vitest.config.ts tests/setup.ts package.json tsconfig.json
git commit -m "chore: configure Vitest with React Testing Library"
```

### Task 4: Create environment config

**Files:**
- Create: `.env.local` (gitignored)
- Create: `.env.example`
- Create: `src/lib/env.ts`

**Step 1: Create .env.example**

```bash
# Auth.js
AUTH_SECRET=
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=
AUTH_GITHUB_ID=
AUTH_GITHUB_SECRET=

# Turso
TURSO_DATABASE_URL=
TURSO_AUTH_TOKEN=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Step 2: Create .env.local with same keys (fill in later)**

Copy `.env.example` to `.env.local`.

**Step 3: Create env validation helper**

```typescript
// src/lib/env.ts
export function getEnvVar(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`)
  }
  return value
}
```

**Step 4: Add .env.local to .gitignore**

Verify `.env.local` is already in `.gitignore` (Next.js adds it by default).

**Step 5: Commit**

```bash
git add .env.example src/lib/env.ts
git commit -m "chore: add environment config with validation helper"
```

---

## Phase 2: Database Schema & Drizzle Setup

### Task 5: Define Drizzle schema

**Files:**
- Create: `src/lib/db/schema.ts`
- Test: `tests/unit/db/schema.test.ts`

**Step 1: Write the failing test**

```typescript
// tests/unit/db/schema.test.ts
import { describe, it, expect } from 'vitest'
import { users, profileSections, resumes, templates } from '@/lib/db/schema'

describe('Database Schema', () => {
  it('exports users table with required columns', () => {
    expect(users).toBeDefined()
    const columns = Object.keys(users)
    expect(columns).toContain('id')
    expect(columns).toContain('email')
    expect(columns).toContain('tier')
    expect(columns).toContain('onboardingCompleted')
  })

  it('exports profileSections table with required columns', () => {
    expect(profileSections).toBeDefined()
    const columns = Object.keys(profileSections)
    expect(columns).toContain('id')
    expect(columns).toContain('userId')
    expect(columns).toContain('sectionType')
    expect(columns).toContain('data')
  })

  it('exports resumes table with required columns', () => {
    expect(resumes).toBeDefined()
    const columns = Object.keys(resumes)
    expect(columns).toContain('id')
    expect(columns).toContain('userId')
    expect(columns).toContain('jobTitle')
    expect(columns).toContain('resumeContent')
    expect(columns).toContain('feedbackHistory')
  })

  it('exports templates table with required columns', () => {
    expect(templates).toBeDefined()
    const columns = Object.keys(templates)
    expect(columns).toContain('id')
    expect(columns).toContain('slug')
    expect(columns).toContain('tier')
  })
})
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/db/schema.test.ts`
Expected: FAIL — module not found

**Step 3: Write the schema**

```typescript
// src/lib/db/schema.ts
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  name: text('name'),
  email: text('email').notNull().unique(),
  emailVerified: integer('email_verified', { mode: 'timestamp' }),
  image: text('image'),
  tier: text('tier').notNull().default('free'),
  generationsThisMonth: integer('generations_this_month').notNull().default(0),
  openrouterApiKey: text('openrouter_api_key'),
  preferredModel: text('preferred_model'),
  onboardingCompleted: integer('onboarding_completed', { mode: 'boolean' }).notNull().default(false),
  createdAt: text('created_at').notNull().default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: text('updated_at').notNull().default(sql`(CURRENT_TIMESTAMP)`),
})

// Auth.js required tables
export const accounts = sqliteTable('accounts', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: text('type').notNull(),
  provider: text('provider').notNull(),
  providerAccountId: text('provider_account_id').notNull(),
  refreshToken: text('refresh_token'),
  accessToken: text('access_token'),
  expiresAt: integer('expires_at'),
  tokenType: text('token_type'),
  scope: text('scope'),
  idToken: text('id_token'),
  sessionState: text('session_state'),
})

export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey(),
  sessionToken: text('session_token').notNull().unique(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  expires: integer('expires', { mode: 'timestamp' }).notNull(),
})

export const verificationTokens = sqliteTable('verification_tokens', {
  identifier: text('identifier').notNull(),
  token: text('token').notNull(),
  expires: integer('expires', { mode: 'timestamp' }).notNull(),
})

export const profileSections = sqliteTable('profile_sections', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  sectionType: text('section_type').notNull(),
  data: text('data').notNull().default('{}'),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: text('created_at').notNull().default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: text('updated_at').notNull().default(sql`(CURRENT_TIMESTAMP)`),
})

export const resumes = sqliteTable('resumes', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  jobTitle: text('job_title').notNull(),
  company: text('company').notNull(),
  jobText: text('job_text').notNull(),
  analysis: text('analysis'),
  resumeContent: text('resume_content'),
  templateId: text('template_id'),
  userEdits: text('user_edits'),
  feedbackHistory: text('feedback_history').notNull().default('[]'),
  createdAt: text('created_at').notNull().default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: text('updated_at').notNull().default(sql`(CURRENT_TIMESTAMP)`),
})

export const templates = sqliteTable('templates', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description').notNull(),
  tier: text('tier').notNull().default('free'),
  previewImageUrl: text('preview_image_url'),
})
```

**Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/db/schema.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/lib/db/schema.ts tests/unit/db/schema.test.ts
git commit -m "feat: define Drizzle schema for users, profiles, resumes, templates"
```

### Task 6: Configure Drizzle client and drizzle-kit

**Files:**
- Create: `src/lib/db/client.ts`
- Create: `drizzle.config.ts`

**Step 1: Create Drizzle client**

```typescript
// src/lib/db/client.ts
import { drizzle } from 'drizzle-orm/libsql'
import * as schema from './schema'

export const db = drizzle({
  connection: {
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN,
  },
  schema,
})

export type Database = typeof db
```

**Step 2: Create drizzle-kit config**

```typescript
// drizzle.config.ts
import 'dotenv/config'
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  out: './drizzle',
  schema: './src/lib/db/schema.ts',
  dialect: 'turso',
  dbCredentials: {
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN,
  },
})
```

**Step 3: Add drizzle scripts to package.json**

Add to `"scripts"`:
```json
"db:generate": "drizzle-kit generate",
"db:migrate": "drizzle-kit migrate",
"db:push": "drizzle-kit push",
"db:studio": "drizzle-kit studio"
```

**Step 4: Commit**

```bash
git add src/lib/db/client.ts drizzle.config.ts package.json
git commit -m "chore: configure Drizzle client and drizzle-kit for Turso"
```

---

## Phase 3: Authentication

### Task 7: Configure Auth.js with Google + GitHub

**Files:**
- Create: `src/lib/auth.ts`
- Create: `src/app/api/auth/[...nextauth]/route.ts`
- Test: `tests/unit/auth/auth.test.ts`

**Step 1: Write the failing test**

```typescript
// tests/unit/auth/auth.test.ts
import { describe, it, expect, vi } from 'vitest'

vi.mock('@/lib/db/client', () => ({
  db: {},
}))

describe('Auth configuration', () => {
  it('exports auth, signIn, signOut, and handlers', async () => {
    const authModule = await import('@/lib/auth')
    expect(authModule.auth).toBeDefined()
    expect(authModule.signIn).toBeDefined()
    expect(authModule.signOut).toBeDefined()
    expect(authModule.handlers).toBeDefined()
  })
})
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/auth/auth.test.ts`
Expected: FAIL — module not found

**Step 3: Create Auth.js config**

```typescript
// src/lib/auth.ts
import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import GitHub from 'next-auth/providers/github'
import { DrizzleAdapter } from '@auth/drizzle-adapter'
import { db } from './db/client'

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db),
  providers: [Google, GitHub],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    session({ session, user }) {
      if (session.user) {
        session.user.id = user.id
      }
      return session
    },
  },
})
```

**Step 4: Create route handler**

```typescript
// src/app/api/auth/[...nextauth]/route.ts
import { handlers } from '@/lib/auth'
export const { GET, POST } = handlers
```

**Step 5: Run test to verify it passes**

Run: `npx vitest run tests/unit/auth/auth.test.ts`
Expected: PASS

**Step 6: Commit**

```bash
git add src/lib/auth.ts src/app/api/auth/\[...nextauth\]/route.ts tests/unit/auth/auth.test.ts
git commit -m "feat: configure Auth.js with Google and GitHub OAuth providers"
```

### Task 8: Create auth middleware for protected routes

**Files:**
- Create: `src/middleware.ts`

**Step 1: Create middleware**

```typescript
// src/middleware.ts
export { auth as middleware } from '@/lib/auth'

export const config = {
  matcher: ['/dashboard/:path*', '/onboarding/:path*', '/generate/:path*', '/resume/:path*', '/profile/:path*', '/settings/:path*'],
}
```

**Step 2: Commit**

```bash
git add src/middleware.ts
git commit -m "feat: add auth middleware to protect app routes"
```

### Task 9: Create login page

**Files:**
- Create: `src/app/login/page.tsx`
- Test: `tests/unit/components/login-page.test.tsx`

**Step 1: Write the failing test**

```typescript
// tests/unit/components/login-page.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import LoginPage from '@/app/login/page'

vi.mock('@/lib/auth', () => ({
  signIn: vi.fn(),
}))

describe('LoginPage', () => {
  it('renders sign-in buttons for Google and GitHub', () => {
    render(<LoginPage />)
    expect(screen.getByRole('button', { name: /google/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /github/i })).toBeInTheDocument()
  })

  it('displays app name', () => {
    render(<LoginPage />)
    expect(screen.getByText(/resume builder/i)).toBeInTheDocument()
  })
})
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/components/login-page.test.tsx`
Expected: FAIL

**Step 3: Implement login page**

```tsx
// src/app/login/page.tsx
import { signIn } from '@/lib/auth'

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-8 shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Resume Builder</h1>
          <p className="mt-2 text-gray-600">Sign in to build your perfect resume</p>
        </div>
        <div className="space-y-4">
          <form action={async () => {
            'use server'
            await signIn('google', { redirectTo: '/dashboard' })
          }}>
            <button type="submit" className="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50">
              Sign in with Google
            </button>
          </form>
          <form action={async () => {
            'use server'
            await signIn('github', { redirectTo: '/dashboard' })
          }}>
            <button type="submit" className="flex w-full items-center justify-center gap-3 rounded-lg bg-gray-900 px-4 py-3 text-sm font-medium text-white shadow-sm hover:bg-gray-800">
              Sign in with GitHub
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
```

**Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/components/login-page.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add src/app/login/page.tsx tests/unit/components/login-page.test.tsx
git commit -m "feat: add login page with Google and GitHub sign-in buttons"
```

---

## Phase 4: Types & Shared Utilities

### Task 10: Define TypeScript types for all data structures

**Files:**
- Create: `src/types/index.ts`
- Test: `tests/unit/types/types.test.ts`

**Step 1: Write the failing test**

```typescript
// tests/unit/types/types.test.ts
import { describe, it, expect } from 'vitest'
import type {
  SectionType,
  PersonalInfo,
  Experience,
  Education,
  Skill,
  Project,
  Certificate,
  Reference,
  VolunteerWork,
  Language,
  Award,
  IntellectualProperty,
  Interest,
  JobAnalysis,
  ResumeContent,
  SECTION_TYPES,
} from '@/types'

// Type-level tests — these verify the types compile correctly
describe('Types', () => {
  it('SECTION_TYPES contains all 13 section types', async () => {
    const { SECTION_TYPES } = await import('@/types')
    expect(SECTION_TYPES).toHaveLength(13)
    expect(SECTION_TYPES).toContain('personal_info')
    expect(SECTION_TYPES).toContain('summary')
    expect(SECTION_TYPES).toContain('experience')
    expect(SECTION_TYPES).toContain('education')
    expect(SECTION_TYPES).toContain('skills')
    expect(SECTION_TYPES).toContain('projects')
    expect(SECTION_TYPES).toContain('certificates')
    expect(SECTION_TYPES).toContain('references')
    expect(SECTION_TYPES).toContain('volunteer')
    expect(SECTION_TYPES).toContain('languages')
    expect(SECTION_TYPES).toContain('awards')
    expect(SECTION_TYPES).toContain('ip')
    expect(SECTION_TYPES).toContain('interests')
  })
})
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/types/types.test.ts`
Expected: FAIL

**Step 3: Create types file**

```typescript
// src/types/index.ts
export const SECTION_TYPES = [
  'personal_info',
  'summary',
  'experience',
  'education',
  'skills',
  'projects',
  'certificates',
  'references',
  'volunteer',
  'languages',
  'awards',
  'ip',
  'interests',
] as const

export type SectionType = (typeof SECTION_TYPES)[number]

export interface PersonalInfo {
  fullName: string
  email: string
  phone?: string
  location?: string
  linkedinUrl?: string
  githubUrl?: string
  portfolioUrl?: string
  websiteUrl?: string
}

export interface Summary {
  text: string
}

export interface Experience {
  entries: {
    company: string
    title: string
    startDate: string
    endDate?: string
    current: boolean
    location?: string
    bullets: string[]
  }[]
}

export interface Education {
  entries: {
    school: string
    degree: string
    field?: string
    graduationDate?: string
    gpa?: string
    honors?: string
  }[]
}

export interface Skill {
  categories: {
    name: string
    items: string[]
  }[]
}

export interface Project {
  entries: {
    name: string
    description: string
    url?: string
    techStack: string[]
    highlights: string[]
  }[]
}

export interface Certificate {
  entries: {
    name: string
    issuer: string
    date?: string
    credentialId?: string
    url?: string
  }[]
}

export interface Reference {
  entries: {
    name: string
    title: string
    company: string
    email?: string
    phone?: string
    relationship?: string
  }[]
}

export interface VolunteerWork {
  entries: {
    organization: string
    role: string
    startDate?: string
    endDate?: string
    description: string
  }[]
}

export interface Language {
  entries: {
    language: string
    proficiency: 'native' | 'fluent' | 'advanced' | 'intermediate' | 'basic'
  }[]
}

export interface Award {
  entries: {
    name: string
    issuer: string
    date?: string
    description?: string
  }[]
}

export interface IntellectualProperty {
  entries: {
    type: 'patent' | 'publication' | 'open_source' | 'other'
    title: string
    description?: string
    url?: string
    date?: string
  }[]
}

export interface Interest {
  items: string[]
}

export type SectionData =
  | PersonalInfo
  | Summary
  | Experience
  | Education
  | Skill
  | Project
  | Certificate
  | Reference
  | VolunteerWork
  | Language
  | Award
  | IntellectualProperty
  | Interest

export interface SectionDataMap {
  personal_info: PersonalInfo
  summary: Summary
  experience: Experience
  education: Education
  skills: Skill
  projects: Project
  certificates: Certificate
  references: Reference
  volunteer: VolunteerWork
  languages: Language
  awards: Award
  ip: IntellectualProperty
  interests: Interest
}

export interface JobAnalysis {
  keyRequirements: {
    requirement: string
    priority: 'high' | 'medium' | 'low'
  }[]
  skillMatches: {
    skill: string
    strength: 'strong' | 'moderate' | 'weak'
  }[]
  gaps: string[]
  recommendedAngle: string
  sectionsToInclude: SectionType[]
}

export interface ResumeContent {
  summary: string
  experience: {
    company: string
    title: string
    startDate: string
    endDate?: string
    current: boolean
    location?: string
    bullets: string[]
  }[]
  skills: {
    name: string
    items: string[]
  }[]
  projects?: {
    name: string
    description: string
    techStack: string[]
  }[]
  education?: {
    school: string
    degree: string
    field?: string
    graduationDate?: string
  }[]
  certificates?: {
    name: string
    issuer: string
    date?: string
  }[]
  languages?: {
    language: string
    proficiency: string
  }[]
  awards?: {
    name: string
    issuer: string
    date?: string
  }[]
  ip?: {
    type: string
    title: string
    description?: string
  }[]
  volunteer?: {
    organization: string
    role: string
    description: string
  }[]
  interests?: string[]
}
```

**Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/types/types.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/types/index.ts tests/unit/types/types.test.ts
git commit -m "feat: define TypeScript types for all profile sections, analysis, and resume content"
```

---

## Phase 5: Profile Server Actions (CRUD)

### Task 11: Create profile server actions

**Files:**
- Create: `src/actions/profile.ts`
- Test: `tests/unit/actions/profile.test.ts`

**Step 1: Write the failing tests**

```typescript
// tests/unit/actions/profile.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock DB and auth before importing actions
const mockDb = {
  select: vi.fn(),
  insert: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
}

vi.mock('@/lib/db/client', () => ({ db: mockDb }))
vi.mock('@/lib/auth', () => ({
  auth: vi.fn(() => Promise.resolve({ user: { id: 'user-1' } })),
}))

describe('Profile Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('getProfileSections returns sections for authenticated user', async () => {
    const { getProfileSections } = await import('@/actions/profile')
    expect(getProfileSections).toBeDefined()
    expect(typeof getProfileSections).toBe('function')
  })

  it('saveProfileSection is a function', async () => {
    const { saveProfileSection } = await import('@/actions/profile')
    expect(saveProfileSection).toBeDefined()
    expect(typeof saveProfileSection).toBe('function')
  })
})
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/actions/profile.test.ts`
Expected: FAIL

**Step 3: Implement profile actions**

```typescript
// src/actions/profile.ts
'use server'

import { db } from '@/lib/db/client'
import { profileSections } from '@/lib/db/schema'
import { auth } from '@/lib/auth'
import { eq, and } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import type { SectionType, SectionData } from '@/types'

async function getAuthenticatedUserId(): Promise<string> {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error('Not authenticated')
  }
  return session.user.id
}

export async function getProfileSections() {
  const userId = await getAuthenticatedUserId()
  const sections = await db
    .select()
    .from(profileSections)
    .where(eq(profileSections.userId, userId))
    .orderBy(profileSections.sortOrder)
  return sections.map((s) => ({
    ...s,
    data: JSON.parse(s.data) as SectionData,
  }))
}

export async function getProfileSection(sectionType: SectionType) {
  const userId = await getAuthenticatedUserId()
  const [section] = await db
    .select()
    .from(profileSections)
    .where(
      and(
        eq(profileSections.userId, userId),
        eq(profileSections.sectionType, sectionType)
      )
    )
    .limit(1)
  if (!section) return null
  return { ...section, data: JSON.parse(section.data) as SectionData }
}

export async function saveProfileSection(
  sectionType: SectionType,
  data: SectionData
) {
  const userId = await getAuthenticatedUserId()
  const existing = await db
    .select()
    .from(profileSections)
    .where(
      and(
        eq(profileSections.userId, userId),
        eq(profileSections.sectionType, sectionType)
      )
    )
    .limit(1)

  const jsonData = JSON.stringify(data)
  const now = new Date().toISOString()

  if (existing.length > 0) {
    await db
      .update(profileSections)
      .set({ data: jsonData, updatedAt: now })
      .where(eq(profileSections.id, existing[0].id))
    return { id: existing[0].id, sectionType, data }
  }

  const id = nanoid()
  await db.insert(profileSections).values({
    id,
    userId,
    sectionType,
    data: jsonData,
    sortOrder: 0,
    createdAt: now,
    updatedAt: now,
  })
  return { id, sectionType, data }
}

export async function deleteProfileSection(sectionType: SectionType) {
  const userId = await getAuthenticatedUserId()
  await db
    .delete(profileSections)
    .where(
      and(
        eq(profileSections.userId, userId),
        eq(profileSections.sectionType, sectionType)
      )
    )
}
```

**Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/actions/profile.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/actions/profile.ts tests/unit/actions/profile.test.ts
git commit -m "feat: add profile CRUD server actions"
```

---

## Phase 6: Settings & OpenRouter Configuration

### Task 12: Create settings server actions

**Files:**
- Create: `src/actions/settings.ts`
- Test: `tests/unit/actions/settings.test.ts`

**Step 1: Write the failing test**

```typescript
// tests/unit/actions/settings.test.ts
import { describe, it, expect, vi } from 'vitest'

vi.mock('@/lib/db/client', () => ({ db: {} }))
vi.mock('@/lib/auth', () => ({
  auth: vi.fn(() => Promise.resolve({ user: { id: 'user-1' } })),
}))

describe('Settings Actions', () => {
  it('exports saveOpenRouterKey function', async () => {
    const { saveOpenRouterKey } = await import('@/actions/settings')
    expect(typeof saveOpenRouterKey).toBe('function')
  })

  it('exports savePreferredModel function', async () => {
    const { savePreferredModel } = await import('@/actions/settings')
    expect(typeof savePreferredModel).toBe('function')
  })

  it('exports getSettings function', async () => {
    const { getSettings } = await import('@/actions/settings')
    expect(typeof getSettings).toBe('function')
  })
})
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/actions/settings.test.ts`
Expected: FAIL

**Step 3: Implement settings actions**

```typescript
// src/actions/settings.ts
'use server'

import { db } from '@/lib/db/client'
import { users } from '@/lib/db/schema'
import { auth } from '@/lib/auth'
import { eq } from 'drizzle-orm'

async function getAuthenticatedUserId(): Promise<string> {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error('Not authenticated')
  }
  return session.user.id
}

export async function getSettings() {
  const userId = await getAuthenticatedUserId()
  const [user] = await db
    .select({
      hasApiKey: users.openrouterApiKey,
      preferredModel: users.preferredModel,
      onboardingCompleted: users.onboardingCompleted,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  return {
    hasApiKey: !!user?.hasApiKey,
    preferredModel: user?.preferredModel ?? null,
    onboardingCompleted: user?.onboardingCompleted ?? false,
  }
}

export async function saveOpenRouterKey(apiKey: string) {
  const userId = await getAuthenticatedUserId()
  // TODO: encrypt before storing in production
  await db
    .update(users)
    .set({ openrouterApiKey: apiKey, updatedAt: new Date().toISOString() })
    .where(eq(users.id, userId))
}

export async function savePreferredModel(model: string) {
  const userId = await getAuthenticatedUserId()
  await db
    .update(users)
    .set({ preferredModel: model, updatedAt: new Date().toISOString() })
    .where(eq(users.id, userId))
}
```

**Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/actions/settings.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/actions/settings.ts tests/unit/actions/settings.test.ts
git commit -m "feat: add settings server actions for OpenRouter key and model preference"
```

---

## Phase 7: OpenRouter AI Client

### Task 13: Create OpenRouter API client

**Files:**
- Create: `src/lib/ai/openrouter.ts`
- Test: `tests/unit/ai/openrouter.test.ts`

**Step 1: Write the failing test**

```typescript
// tests/unit/ai/openrouter.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

const server = setupServer(
  http.post('https://openrouter.ai/api/v1/chat/completions', async ({ request }) => {
    const body = await request.json() as { messages: { content: string }[] }
    return HttpResponse.json({
      choices: [
        {
          message: {
            content: JSON.stringify({ result: 'test response' }),
          },
        },
      ],
    })
  })
)

beforeEach(() => server.listen())
afterEach(() => {
  server.resetHandlers()
  server.close()
})

describe('OpenRouter Client', () => {
  it('callOpenRouter sends request with correct headers and returns parsed response', async () => {
    const { callOpenRouter } = await import('@/lib/ai/openrouter')
    const result = await callOpenRouter({
      apiKey: 'test-key',
      model: 'anthropic/claude-sonnet-4',
      messages: [{ role: 'user', content: 'test prompt' }],
    })
    expect(result).toBeDefined()
  })

  it('callOpenRouter throws on missing API key', async () => {
    const { callOpenRouter } = await import('@/lib/ai/openrouter')
    await expect(
      callOpenRouter({
        apiKey: '',
        model: 'anthropic/claude-sonnet-4',
        messages: [{ role: 'user', content: 'test' }],
      })
    ).rejects.toThrow('OpenRouter API key is required')
  })
})
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/ai/openrouter.test.ts`
Expected: FAIL

**Step 3: Implement OpenRouter client**

```typescript
// src/lib/ai/openrouter.ts
interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface OpenRouterRequest {
  apiKey: string
  model: string
  messages: ChatMessage[]
  temperature?: number
  maxTokens?: number
}

interface OpenRouterResponse {
  choices: {
    message: {
      content: string
    }
  }[]
}

export async function callOpenRouter({
  apiKey,
  model,
  messages,
  temperature = 0.7,
  maxTokens = 4096,
}: OpenRouterRequest): Promise<string> {
  if (!apiKey) {
    throw new Error('OpenRouter API key is required')
  }

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      'X-Title': 'Resume Builder',
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`OpenRouter API error (${response.status}): ${error}`)
  }

  const data: OpenRouterResponse = await response.json()
  return data.choices[0].message.content
}

export async function callOpenRouterJSON<T>({
  apiKey,
  model,
  messages,
  temperature = 0.3,
  maxTokens = 4096,
}: OpenRouterRequest): Promise<T> {
  const content = await callOpenRouter({
    apiKey,
    model,
    messages,
    temperature,
    maxTokens,
  })

  // Extract JSON from response (handle markdown code blocks)
  const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/)
  const jsonString = jsonMatch ? jsonMatch[1].trim() : content.trim()

  try {
    return JSON.parse(jsonString) as T
  } catch {
    throw new Error(`Failed to parse AI response as JSON: ${content.slice(0, 200)}`)
  }
}
```

**Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/ai/openrouter.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/lib/ai/openrouter.ts tests/unit/ai/openrouter.test.ts
git commit -m "feat: add OpenRouter API client with JSON parsing support"
```

---

## Phase 8: AI Prompts (Analysis & Generation)

### Task 14: Create job analysis prompt

**Files:**
- Create: `src/lib/ai/prompts/analyze-job.ts`
- Test: `tests/unit/ai/analyze-job.test.ts`

**Step 1: Write the failing test**

```typescript
// tests/unit/ai/analyze-job.test.ts
import { describe, it, expect } from 'vitest'

describe('buildAnalysisPrompt', () => {
  it('includes job text and profile data in the prompt', async () => {
    const { buildAnalysisPrompt } = await import('@/lib/ai/prompts/analyze-job')
    const prompt = buildAnalysisPrompt({
      jobText: 'Senior React Developer needed',
      profileSections: [
        { sectionType: 'skills', data: { categories: [{ name: 'Languages', items: ['TypeScript', 'React'] }] } },
      ],
    })
    expect(prompt).toContain('Senior React Developer needed')
    expect(prompt).toContain('TypeScript')
    expect(prompt).toContain('React')
  })

  it('returns a string prompt', async () => {
    const { buildAnalysisPrompt } = await import('@/lib/ai/prompts/analyze-job')
    const prompt = buildAnalysisPrompt({
      jobText: 'Test job',
      profileSections: [],
    })
    expect(typeof prompt).toBe('string')
    expect(prompt.length).toBeGreaterThan(0)
  })
})
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/ai/analyze-job.test.ts`
Expected: FAIL

**Step 3: Implement analysis prompt builder**

```typescript
// src/lib/ai/prompts/analyze-job.ts
interface AnalysisInput {
  jobText: string
  profileSections: { sectionType: string; data: unknown }[]
}

export function buildAnalysisPrompt({ jobText, profileSections }: AnalysisInput): string {
  const profileStr = profileSections
    .map((s) => `### ${s.sectionType}\n${JSON.stringify(s.data, null, 2)}`)
    .join('\n\n')

  return `You are an expert career advisor and resume strategist. Analyze this job posting against the candidate's profile.

## Job Posting
${jobText}

## Candidate Profile
${profileStr}

## Instructions
Analyze the job posting and compare it against the candidate's profile. Return a JSON object with this exact structure:

{
  "keyRequirements": [
    { "requirement": "string describing the requirement", "priority": "high" | "medium" | "low" }
  ],
  "skillMatches": [
    { "skill": "skill name", "strength": "strong" | "moderate" | "weak" }
  ],
  "gaps": ["string describing each gap"],
  "recommendedAngle": "A 2-3 sentence description of the best narrative angle for this resume",
  "sectionsToInclude": ["array of section types to include from: personal_info, summary, experience, education, skills, projects, certificates, references, volunteer, languages, awards, ip, interests"]
}

Rules:
- Always include personal_info, summary, experience, skills
- Only include optional sections (certificates, languages, awards, ip, interests, volunteer, references) if they are genuinely relevant to THIS specific job
- Be specific about why skills match or don't
- Prioritize requirements by what the employer emphasizes most
- The recommended angle should focus on the candidate's strongest alignment with the role

Return ONLY valid JSON, no markdown code blocks.`
}
```

**Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/ai/analyze-job.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/lib/ai/prompts/analyze-job.ts tests/unit/ai/analyze-job.test.ts
git commit -m "feat: add job analysis prompt builder"
```

### Task 15: Create resume generation prompt

**Files:**
- Create: `src/lib/ai/prompts/generate-resume.ts`
- Test: `tests/unit/ai/generate-resume.test.ts`

**Step 1: Write the failing test**

```typescript
// tests/unit/ai/generate-resume.test.ts
import { describe, it, expect } from 'vitest'
import type { JobAnalysis } from '@/types'

describe('buildGenerationPrompt', () => {
  it('includes analysis and profile in the prompt', async () => {
    const { buildGenerationPrompt } = await import('@/lib/ai/prompts/generate-resume')
    const analysis: JobAnalysis = {
      keyRequirements: [{ requirement: 'React', priority: 'high' }],
      skillMatches: [{ skill: 'React', strength: 'strong' }],
      gaps: [],
      recommendedAngle: 'Technical frontend focus',
      sectionsToInclude: ['personal_info', 'summary', 'experience', 'skills'],
    }
    const prompt = buildGenerationPrompt({
      analysis,
      profileSections: [
        { sectionType: 'experience', data: { entries: [{ company: 'Acme', title: 'Dev', startDate: '2020', current: true, bullets: ['Built stuff'] }] } },
      ],
    })
    expect(prompt).toContain('Technical frontend focus')
    expect(prompt).toContain('Acme')
  })
})
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/ai/generate-resume.test.ts`
Expected: FAIL

**Step 3: Implement generation prompt builder**

```typescript
// src/lib/ai/prompts/generate-resume.ts
import type { JobAnalysis } from '@/types'

interface GenerationInput {
  analysis: JobAnalysis
  profileSections: { sectionType: string; data: unknown }[]
}

export function buildGenerationPrompt({ analysis, profileSections }: GenerationInput): string {
  const profileStr = profileSections
    .map((s) => `### ${s.sectionType}\n${JSON.stringify(s.data, null, 2)}`)
    .join('\n\n')

  return `You are an expert resume writer. Generate the strongest possible resume based on the candidate's profile and job analysis.

## Job Analysis
${JSON.stringify(analysis, null, 2)}

## Candidate Profile
${profileStr}

## Recommended Angle
${analysis.recommendedAngle}

## Sections to Include
${analysis.sectionsToInclude.join(', ')}

## Instructions
Generate a tailored resume that emphasizes the candidate's strongest alignment with this role. Return a JSON object with this structure:

{
  "summary": "2-3 sentence professional summary tailored to this specific role",
  "experience": [
    {
      "company": "string",
      "title": "string",
      "startDate": "string",
      "endDate": "string or null",
      "current": boolean,
      "location": "string or null",
      "bullets": ["rewritten bullet points emphasizing relevant achievements"]
    }
  ],
  "skills": [
    { "name": "category name", "items": ["skills ordered by relevance to this job"] }
  ],
  "projects": [...] (only if in sectionsToInclude),
  "education": [...] (only if in sectionsToInclude),
  "certificates": [...] (only if in sectionsToInclude),
  "languages": [...] (only if in sectionsToInclude),
  "awards": [...] (only if in sectionsToInclude),
  "ip": [...] (only if in sectionsToInclude),
  "volunteer": [...] (only if in sectionsToInclude),
  "interests": [...] (only if in sectionsToInclude)
}

CRITICAL RULES:
- NEVER fabricate experience, skills, or achievements — only reword, reorder, and curate from the real profile data
- Rewrite bullet points to emphasize aspects most relevant to this job
- Reorder skills so the most relevant appear first
- Keep bullet points concise and achievement-oriented (use metrics when available)
- Omit sections not listed in sectionsToInclude
- References are NEVER included in resume content (they are available upon request only)

Return ONLY valid JSON, no markdown code blocks.`
}
```

**Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/ai/generate-resume.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/lib/ai/prompts/generate-resume.ts tests/unit/ai/generate-resume.test.ts
git commit -m "feat: add resume generation prompt builder"
```

### Task 16: Create regeneration-with-feedback prompt

**Files:**
- Create: `src/lib/ai/prompts/regenerate-resume.ts`
- Test: `tests/unit/ai/regenerate-resume.test.ts`

**Step 1: Write the failing test**

```typescript
// tests/unit/ai/regenerate-resume.test.ts
import { describe, it, expect } from 'vitest'

describe('buildRegenerationPrompt', () => {
  it('includes current resume, feedback, and history', async () => {
    const { buildRegenerationPrompt } = await import('@/lib/ai/prompts/regenerate-resume')
    const prompt = buildRegenerationPrompt({
      currentResume: { summary: 'Old summary', experience: [], skills: [] },
      feedback: 'Make it more technical',
      feedbackHistory: [{ feedback: 'Add more metrics', timestamp: '2026-01-01' }],
      profileSections: [],
    })
    expect(prompt).toContain('Make it more technical')
    expect(prompt).toContain('Add more metrics')
    expect(prompt).toContain('Old summary')
  })
})
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/ai/regenerate-resume.test.ts`
Expected: FAIL

**Step 3: Implement regeneration prompt builder**

```typescript
// src/lib/ai/prompts/regenerate-resume.ts
import type { ResumeContent } from '@/types'

interface RegenerationInput {
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
}: RegenerationInput): string {
  const profileStr = profileSections
    .map((s) => `### ${s.sectionType}\n${JSON.stringify(s.data, null, 2)}`)
    .join('\n\n')

  const historyStr = feedbackHistory.length > 0
    ? feedbackHistory.map((h) => `- ${h.feedback} (${h.timestamp})`).join('\n')
    : 'None'

  return `You are an expert resume writer. Revise this resume based on the user's feedback.

## Current Resume
${JSON.stringify(currentResume, null, 2)}

## User's Feedback
${feedback}

## Previous Feedback History
${historyStr}

## Original Profile Data (source of truth)
${profileStr}

## Instructions
Revise the resume to address the user's feedback while maintaining the overall quality. Return the same JSON structure as the current resume with your revisions applied.

CRITICAL RULES:
- Address the specific feedback provided
- Do NOT undo changes from previous feedback rounds (check the history)
- NEVER fabricate — only reword, reorder, and curate from the original profile data
- Return ONLY valid JSON, no markdown code blocks
- Return the complete resume structure, not just the changed parts`
}
```

**Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/ai/regenerate-resume.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/lib/ai/prompts/regenerate-resume.ts tests/unit/ai/regenerate-resume.test.ts
git commit -m "feat: add regeneration-with-feedback prompt builder"
```

---

## Phase 9: Generation Server Actions

### Task 17: Create resume generation actions

**Files:**
- Create: `src/actions/generation.ts`
- Test: `tests/unit/actions/generation.test.ts`

**Step 1: Write the failing test**

```typescript
// tests/unit/actions/generation.test.ts
import { describe, it, expect, vi } from 'vitest'

vi.mock('@/lib/db/client', () => ({ db: {} }))
vi.mock('@/lib/auth', () => ({
  auth: vi.fn(() => Promise.resolve({ user: { id: 'user-1' } })),
}))
vi.mock('@/lib/ai/openrouter', () => ({
  callOpenRouterJSON: vi.fn(),
}))

describe('Generation Actions', () => {
  it('exports analyzeJob function', async () => {
    const { analyzeJob } = await import('@/actions/generation')
    expect(typeof analyzeJob).toBe('function')
  })

  it('exports generateResume function', async () => {
    const { generateResume } = await import('@/actions/generation')
    expect(typeof generateResume).toBe('function')
  })

  it('exports regenerateResume function', async () => {
    const { regenerateResume } = await import('@/actions/generation')
    expect(typeof regenerateResume).toBe('function')
  })
})
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/actions/generation.test.ts`
Expected: FAIL

**Step 3: Implement generation actions**

```typescript
// src/actions/generation.ts
'use server'

import { db } from '@/lib/db/client'
import { users, profileSections, resumes } from '@/lib/db/schema'
import { auth } from '@/lib/auth'
import { eq } from 'drizzle-orm'
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
```

**Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/actions/generation.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/actions/generation.ts tests/unit/actions/generation.test.ts
git commit -m "feat: add resume generation, analysis, and regeneration server actions"
```

---

## Phase 10: Onboarding UI Components

### Task 18: Create onboarding layout with progress bar

**Files:**
- Create: `src/app/onboarding/layout.tsx`
- Create: `src/components/onboarding/ProgressBar.tsx`
- Test: `tests/unit/components/onboarding/ProgressBar.test.tsx`

**Step 1: Write the failing test**

```typescript
// tests/unit/components/onboarding/ProgressBar.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ProgressBar } from '@/components/onboarding/ProgressBar'

describe('ProgressBar', () => {
  it('renders with correct number of steps', () => {
    render(<ProgressBar currentStep={0} totalSteps={13} />)
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
  })

  it('displays current step label', () => {
    render(<ProgressBar currentStep={2} totalSteps={13} />)
    expect(screen.getByText(/3 of 13/)).toBeInTheDocument()
  })

  it('marks completed steps visually', () => {
    const { container } = render(<ProgressBar currentStep={3} totalSteps={13} />)
    const completedSegments = container.querySelectorAll('[data-completed="true"]')
    expect(completedSegments.length).toBe(3)
  })
})
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/components/onboarding/ProgressBar.test.tsx`
Expected: FAIL

**Step 3: Implement ProgressBar component**

```tsx
// src/components/onboarding/ProgressBar.tsx
interface ProgressBarProps {
  currentStep: number
  totalSteps: number
}

export function ProgressBar({ currentStep, totalSteps }: ProgressBarProps) {
  return (
    <div className="w-full">
      <div className="mb-2 flex justify-between text-sm text-gray-600">
        <span>Profile Setup</span>
        <span>{currentStep + 1} of {totalSteps}</span>
      </div>
      <div
        role="progressbar"
        aria-valuenow={currentStep + 1}
        aria-valuemin={1}
        aria-valuemax={totalSteps}
        className="flex gap-1"
      >
        {Array.from({ length: totalSteps }, (_, i) => (
          <div
            key={i}
            data-completed={i < currentStep ? 'true' : 'false'}
            className={`h-2 flex-1 rounded-full transition-colors ${
              i < currentStep
                ? 'bg-blue-600'
                : i === currentStep
                  ? 'bg-blue-400'
                  : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
```

**Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/components/onboarding/ProgressBar.test.tsx`
Expected: PASS

**Step 5: Create onboarding layout**

```tsx
// src/app/onboarding/layout.tsx
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session) redirect('/login')

  return (
    <div className="mx-auto min-h-screen max-w-2xl px-4 py-8">
      {children}
    </div>
  )
}
```

**Step 6: Commit**

```bash
git add src/components/onboarding/ProgressBar.tsx src/app/onboarding/layout.tsx tests/unit/components/onboarding/ProgressBar.test.tsx
git commit -m "feat: add onboarding layout and progress bar component"
```

### Task 19: Create generic section form component

**Files:**
- Create: `src/components/onboarding/SectionForm.tsx`
- Test: `tests/unit/components/onboarding/SectionForm.test.tsx`

**Step 1: Write the failing test**

```typescript
// tests/unit/components/onboarding/SectionForm.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SectionForm } from '@/components/onboarding/SectionForm'

describe('SectionForm', () => {
  it('renders title and description', () => {
    render(
      <SectionForm
        title="Work Experience"
        description="Add your work history"
        onSubmit={vi.fn()}
        onSkip={vi.fn()}
        isRequired={false}
      >
        <input data-testid="test-input" />
      </SectionForm>
    )
    expect(screen.getByText('Work Experience')).toBeInTheDocument()
    expect(screen.getByText('Add your work history')).toBeInTheDocument()
  })

  it('shows skip button when not required', () => {
    render(
      <SectionForm
        title="Test"
        description="Test"
        onSubmit={vi.fn()}
        onSkip={vi.fn()}
        isRequired={false}
      >
        <div />
      </SectionForm>
    )
    expect(screen.getByRole('button', { name: /skip/i })).toBeInTheDocument()
  })

  it('hides skip button when required', () => {
    render(
      <SectionForm
        title="Test"
        description="Test"
        onSubmit={vi.fn()}
        onSkip={vi.fn()}
        isRequired={true}
      >
        <div />
      </SectionForm>
    )
    expect(screen.queryByRole('button', { name: /skip/i })).not.toBeInTheDocument()
  })

  it('has a continue button', () => {
    render(
      <SectionForm
        title="Test"
        description="Test"
        onSubmit={vi.fn()}
        onSkip={vi.fn()}
        isRequired={false}
      >
        <div />
      </SectionForm>
    )
    expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument()
  })
})
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/components/onboarding/SectionForm.test.tsx`
Expected: FAIL

**Step 3: Implement SectionForm**

```tsx
// src/components/onboarding/SectionForm.tsx
'use client'

import { type ReactNode, type FormEvent } from 'react'

interface SectionFormProps {
  title: string
  description: string
  onSubmit: () => void
  onSkip: () => void
  isRequired: boolean
  children: ReactNode
  isLoading?: boolean
}

export function SectionForm({
  title,
  description,
  onSubmit,
  onSkip,
  isRequired,
  children,
  isLoading = false,
}: SectionFormProps) {
  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    onSubmit()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        <p className="mt-1 text-gray-600">{description}</p>
      </div>

      <div className="space-y-4">{children}</div>

      <div className="flex items-center justify-between pt-4">
        {!isRequired ? (
          <button
            type="button"
            onClick={onSkip}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Skip for now
          </button>
        ) : (
          <div />
        )}
        <button
          type="submit"
          disabled={isLoading}
          className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? 'Saving...' : 'Continue'}
        </button>
      </div>
    </form>
  )
}
```

**Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/components/onboarding/SectionForm.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add src/components/onboarding/SectionForm.tsx tests/unit/components/onboarding/SectionForm.test.tsx
git commit -m "feat: add generic SectionForm component for onboarding steps"
```

### Task 20: Create onboarding step pages

**Files:**
- Create: `src/app/onboarding/[step]/page.tsx`
- Create: `src/components/onboarding/steps/PersonalInfoStep.tsx`
- Create: `src/components/onboarding/steps/ExperienceStep.tsx`
- Create: `src/components/onboarding/steps/index.ts`
- Test: `tests/unit/components/onboarding/steps/PersonalInfoStep.test.tsx`

This is a larger task. For brevity, the pattern below shows PersonalInfoStep and ExperienceStep — all 13 steps follow the same pattern.

**Step 1: Write the failing test for PersonalInfoStep**

```typescript
// tests/unit/components/onboarding/steps/PersonalInfoStep.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PersonalInfoStep } from '@/components/onboarding/steps/PersonalInfoStep'

describe('PersonalInfoStep', () => {
  it('renders name, email, phone, location fields', () => {
    render(<PersonalInfoStep onSubmit={vi.fn()} onSkip={vi.fn()} initialData={null} />)
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/phone/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/location/i)).toBeInTheDocument()
  })

  it('pre-fills fields when initialData is provided', () => {
    render(
      <PersonalInfoStep
        onSubmit={vi.fn()}
        onSkip={vi.fn()}
        initialData={{ fullName: 'John Doe', email: 'john@test.com' }}
      />
    )
    expect(screen.getByLabelText(/full name/i)).toHaveValue('John Doe')
    expect(screen.getByLabelText(/email/i)).toHaveValue('john@test.com')
  })
})
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/components/onboarding/steps/PersonalInfoStep.test.tsx`
Expected: FAIL

**Step 3: Implement PersonalInfoStep**

```tsx
// src/components/onboarding/steps/PersonalInfoStep.tsx
'use client'

import { useState } from 'react'
import { SectionForm } from '@/components/onboarding/SectionForm'
import type { PersonalInfo } from '@/types'

interface Props {
  onSubmit: (data: PersonalInfo) => void
  onSkip: () => void
  initialData: Partial<PersonalInfo> | null
}

export function PersonalInfoStep({ onSubmit, onSkip, initialData }: Props) {
  const [data, setData] = useState<PersonalInfo>({
    fullName: initialData?.fullName ?? '',
    email: initialData?.email ?? '',
    phone: initialData?.phone ?? '',
    location: initialData?.location ?? '',
    linkedinUrl: initialData?.linkedinUrl ?? '',
    githubUrl: initialData?.githubUrl ?? '',
    portfolioUrl: initialData?.portfolioUrl ?? '',
    websiteUrl: initialData?.websiteUrl ?? '',
  })

  function update(field: keyof PersonalInfo, value: string) {
    setData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <SectionForm
      title="Personal Information"
      description="Let's start with your basic contact details"
      onSubmit={() => onSubmit(data)}
      onSkip={onSkip}
      isRequired={true}
    >
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Full Name</label>
          <input id="fullName" type="text" value={data.fullName} onChange={(e) => update('fullName', e.target.value)} className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" required />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
          <input id="email" type="email" value={data.email} onChange={(e) => update('email', e.target.value)} className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" required />
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone</label>
          <input id="phone" type="tel" value={data.phone ?? ''} onChange={(e) => update('phone', e.target.value)} className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
        </div>
        <div className="col-span-2">
          <label htmlFor="location" className="block text-sm font-medium text-gray-700">Location</label>
          <input id="location" type="text" value={data.location ?? ''} onChange={(e) => update('location', e.target.value)} placeholder="e.g. San Francisco, CA" className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
        </div>
        <div>
          <label htmlFor="linkedinUrl" className="block text-sm font-medium text-gray-700">LinkedIn URL</label>
          <input id="linkedinUrl" type="url" value={data.linkedinUrl ?? ''} onChange={(e) => update('linkedinUrl', e.target.value)} className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
        </div>
        <div>
          <label htmlFor="githubUrl" className="block text-sm font-medium text-gray-700">GitHub URL</label>
          <input id="githubUrl" type="url" value={data.githubUrl ?? ''} onChange={(e) => update('githubUrl', e.target.value)} className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
        </div>
      </div>
    </SectionForm>
  )
}
```

**Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/components/onboarding/steps/PersonalInfoStep.test.tsx`
Expected: PASS

**Step 5: Create remaining step components**

Create the following files, each following the same pattern as PersonalInfoStep but with fields matching their respective type interfaces:

- `src/components/onboarding/steps/SummaryStep.tsx` — textarea for professional summary
- `src/components/onboarding/steps/ExperienceStep.tsx` — dynamic list of experience entries (company, title, dates, bullets)
- `src/components/onboarding/steps/EducationStep.tsx` — dynamic list of education entries
- `src/components/onboarding/steps/SkillsStep.tsx` — categorized skills with add/remove
- `src/components/onboarding/steps/ProjectsStep.tsx` — dynamic list of projects
- `src/components/onboarding/steps/CertificatesStep.tsx` — dynamic list of certificates
- `src/components/onboarding/steps/ReferencesStep.tsx` — dynamic list of references
- `src/components/onboarding/steps/VolunteerStep.tsx` — dynamic list of volunteer entries
- `src/components/onboarding/steps/LanguagesStep.tsx` — language + proficiency pairs
- `src/components/onboarding/steps/AwardsStep.tsx` — dynamic list of awards
- `src/components/onboarding/steps/IPStep.tsx` — intellectual property entries
- `src/components/onboarding/steps/InterestsStep.tsx` — simple list of interest strings

Each step component receives `onSubmit`, `onSkip`, and `initialData` props.

**Step 6: Create step registry**

```typescript
// src/components/onboarding/steps/index.ts
export { PersonalInfoStep } from './PersonalInfoStep'
export { SummaryStep } from './SummaryStep'
export { ExperienceStep } from './ExperienceStep'
export { EducationStep } from './EducationStep'
export { SkillsStep } from './SkillsStep'
export { ProjectsStep } from './ProjectsStep'
export { CertificatesStep } from './CertificatesStep'
export { ReferencesStep } from './ReferencesStep'
export { VolunteerStep } from './VolunteerStep'
export { LanguagesStep } from './LanguagesStep'
export { AwardsStep } from './AwardsStep'
export { IPStep } from './IPStep'
export { InterestsStep } from './InterestsStep'

import { SECTION_TYPES } from '@/types'

export const ONBOARDING_STEPS = SECTION_TYPES.map((type) => ({
  type,
  path: type.replace(/_/g, '-'),
}))
```

**Step 7: Create the dynamic onboarding page**

```tsx
// src/app/onboarding/[step]/page.tsx
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { ONBOARDING_STEPS } from '@/components/onboarding/steps'
import { OnboardingStepClient } from './client'
import { getProfileSection } from '@/actions/profile'
import { ProgressBar } from '@/components/onboarding/ProgressBar'
import type { SectionType } from '@/types'

export default async function OnboardingStepPage({
  params,
}: {
  params: Promise<{ step: string }>
}) {
  const session = await auth()
  if (!session) redirect('/login')

  const { step } = await params
  const stepIndex = ONBOARDING_STEPS.findIndex((s) => s.path === step)
  if (stepIndex === -1) redirect('/onboarding/personal-info')

  const sectionType = ONBOARDING_STEPS[stepIndex].type as SectionType
  const existingData = await getProfileSection(sectionType)

  return (
    <div className="space-y-8">
      <ProgressBar currentStep={stepIndex} totalSteps={ONBOARDING_STEPS.length} />
      <OnboardingStepClient
        stepIndex={stepIndex}
        sectionType={sectionType}
        initialData={existingData?.data ?? null}
      />
    </div>
  )
}
```

**Step 8: Create the client wrapper**

```tsx
// src/app/onboarding/[step]/client.tsx
'use client'

import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { saveProfileSection } from '@/actions/profile'
import { ONBOARDING_STEPS } from '@/components/onboarding/steps'
import {
  PersonalInfoStep, SummaryStep, ExperienceStep, EducationStep,
  SkillsStep, ProjectsStep, CertificatesStep, ReferencesStep,
  VolunteerStep, LanguagesStep, AwardsStep, IPStep, InterestsStep,
} from '@/components/onboarding/steps'
import type { SectionType, SectionData } from '@/types'

const STEP_COMPONENTS: Record<SectionType, React.ComponentType<{ onSubmit: (data: SectionData) => void; onSkip: () => void; initialData: unknown }>> = {
  personal_info: PersonalInfoStep as never,
  summary: SummaryStep as never,
  experience: ExperienceStep as never,
  education: EducationStep as never,
  skills: SkillsStep as never,
  projects: ProjectsStep as never,
  certificates: CertificatesStep as never,
  references: ReferencesStep as never,
  volunteer: VolunteerStep as never,
  languages: LanguagesStep as never,
  awards: AwardsStep as never,
  ip: IPStep as never,
  interests: InterestsStep as never,
}

interface Props {
  stepIndex: number
  sectionType: SectionType
  initialData: unknown
}

export function OnboardingStepClient({ stepIndex, sectionType, initialData }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function goToNext() {
    if (stepIndex < ONBOARDING_STEPS.length - 1) {
      router.push(`/onboarding/${ONBOARDING_STEPS[stepIndex + 1].path}`)
    } else {
      router.push('/onboarding/complete')
    }
  }

  function handleSubmit(data: SectionData) {
    startTransition(async () => {
      await saveProfileSection(sectionType, data)
      goToNext()
    })
  }

  function handleSkip() {
    goToNext()
  }

  const StepComponent = STEP_COMPONENTS[sectionType]
  return <StepComponent onSubmit={handleSubmit} onSkip={handleSkip} initialData={initialData} />
}
```

**Step 9: Commit**

```bash
git add src/app/onboarding/ src/components/onboarding/
git commit -m "feat: add onboarding step pages with dynamic routing and all 13 section forms"
```

---

## Phase 11: Dashboard & Core Pages

### Task 21: Create dashboard page

**Files:**
- Create: `src/app/dashboard/page.tsx`
- Test: `tests/unit/components/dashboard.test.tsx`

**Step 1: Write the failing test**

```typescript
// tests/unit/components/dashboard.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('@/lib/auth', () => ({
  auth: vi.fn(() => Promise.resolve({ user: { id: 'user-1', name: 'Test User' } })),
}))
vi.mock('@/lib/db/client', () => ({ db: {} }))
vi.mock('@/actions/settings', () => ({
  getSettings: vi.fn(() => Promise.resolve({ onboardingCompleted: true, hasApiKey: true })),
}))

// Dashboard is a server component, test the client parts
describe('Dashboard', () => {
  it('should be importable', async () => {
    // Verify module structure
    const mod = await import('@/app/dashboard/page')
    expect(mod.default).toBeDefined()
  })
})
```

**Step 2: Implement dashboard page**

```tsx
// src/app/dashboard/page.tsx
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getSettings } from '@/actions/settings'
import { db } from '@/lib/db/client'
import { resumes } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import Link from 'next/link'

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const settings = await getSettings()
  if (!settings.onboardingCompleted) redirect('/onboarding/personal-info')

  const recentResumes = await db
    .select()
    .from(resumes)
    .where(eq(resumes.userId, session.user.id!))
    .orderBy(desc(resumes.createdAt))
    .limit(10)

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {session.user.name}
        </h1>
        <p className="mt-1 text-gray-600">Generate tailored resumes for your next opportunity</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Link
          href="/generate"
          className="rounded-xl border-2 border-blue-200 bg-blue-50 p-6 transition hover:border-blue-400"
        >
          <h2 className="text-lg font-semibold text-blue-900">Generate Resume</h2>
          <p className="mt-1 text-sm text-blue-700">Paste a job posting and get a tailored resume</p>
        </Link>
        <Link
          href="/profile"
          className="rounded-xl border border-gray-200 bg-white p-6 transition hover:border-gray-400"
        >
          <h2 className="text-lg font-semibold text-gray-900">Edit Profile</h2>
          <p className="mt-1 text-sm text-gray-600">Update your skills and experience</p>
        </Link>
        <Link
          href="/settings"
          className="rounded-xl border border-gray-200 bg-white p-6 transition hover:border-gray-400"
        >
          <h2 className="text-lg font-semibold text-gray-900">Settings</h2>
          <p className="mt-1 text-sm text-gray-600">Configure AI model and API key</p>
        </Link>
      </div>

      {recentResumes.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">Recent Resumes</h2>
          <div className="space-y-3">
            {recentResumes.map((r) => (
              <Link
                key={r.id}
                href={`/resume/${r.id}`}
                className="block rounded-lg border border-gray-200 bg-white p-4 transition hover:border-gray-400"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">{r.jobTitle}</h3>
                    <p className="text-sm text-gray-600">{r.company}</p>
                  </div>
                  <span className="text-sm text-gray-400">{new Date(r.createdAt).toLocaleDateString()}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
```

**Step 3: Run test, verify it passes, commit**

```bash
git add src/app/dashboard/page.tsx tests/unit/components/dashboard.test.tsx
git commit -m "feat: add dashboard page with resume history and quick actions"
```

### Task 22: Create generate page

**Files:**
- Create: `src/app/generate/page.tsx`
- Create: `src/components/generate/JobInput.tsx`
- Create: `src/components/generate/GenerationFlow.tsx`
- Test: `tests/unit/components/generate/JobInput.test.tsx`

Follow the same TDD pattern. The generate page has:
- Step 1: Paste job text + enter company name + job title
- Step 2: Show "Analyzing..." loading state, display analysis results
- Step 3: Show "Generating..." loading state, redirect to `/resume/[id]`

**Step 1-5: Write test → implement → verify → commit** (same TDD pattern as above)

```bash
git commit -m "feat: add generate page with job input and generation flow"
```

### Task 23: Create resume view/edit page

**Files:**
- Create: `src/app/resume/[id]/page.tsx`
- Create: `src/components/resume/ResumePreview.tsx`
- Create: `src/components/resume/ResumeEditor.tsx`
- Create: `src/components/resume/FeedbackForm.tsx`
- Create: `src/components/resume/TemplateSelector.tsx`
- Test: `tests/unit/components/resume/FeedbackForm.test.tsx`

The resume page shows:
- Live preview of the resume in the selected template
- Section-by-section inline editing
- Feedback textarea + "Regenerate" button
- Template selector (Clean, Bold, Executive)
- Download PDF button

**Step 1-5: Write test → implement → verify → commit** (same TDD pattern)

```bash
git commit -m "feat: add resume view page with preview, editing, feedback, and template selection"
```

### Task 24: Create settings page

**Files:**
- Create: `src/app/settings/page.tsx`
- Test: `tests/unit/components/settings.test.tsx`

Settings page has:
- OpenRouter API key input (masked, save button)
- Model selector (text input or dropdown of popular models)
- Account info (from OAuth)

**Step 1-5: Write test → implement → verify → commit**

```bash
git commit -m "feat: add settings page for API key and model configuration"
```

### Task 25: Create profile editing page

**Files:**
- Create: `src/app/profile/page.tsx`
- Test: `tests/unit/components/profile.test.tsx`

Profile page shows all sections with edit buttons, reusing onboarding step components in edit mode.

**Step 1-5: Write test → implement → verify → commit**

```bash
git commit -m "feat: add profile editing page with section-by-section editing"
```

---

## Phase 12: Landing Page

### Task 26: Create landing page

**Files:**
- Modify: `src/app/page.tsx`
- Test: `tests/unit/components/landing.test.tsx`

**Step 1: Write the failing test**

```typescript
// tests/unit/components/landing.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import LandingPage from '@/app/page'

vi.mock('@/lib/auth', () => ({
  auth: vi.fn(() => Promise.resolve(null)),
  signIn: vi.fn(),
}))

describe('LandingPage', () => {
  it('renders app title and call to action', () => {
    render(<LandingPage />)
    expect(screen.getByText(/resume builder/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /get started/i })).toBeInTheDocument()
  })
})
```

**Step 2-5: Implement → verify → commit**

```bash
git commit -m "feat: add landing page with hero section and sign-in CTA"
```

---

## Phase 13: Resume Templates (HTML/CSS)

### Task 27: Create Clean template

**Files:**
- Create: `src/templates/clean/CleanTemplate.tsx`
- Create: `src/templates/clean/clean.module.css`
- Test: `tests/unit/templates/clean.test.tsx`

**Step 1: Write the failing test**

```typescript
// tests/unit/templates/clean.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CleanTemplate } from '@/templates/clean/CleanTemplate'
import type { ResumeContent, PersonalInfo } from '@/types'

const mockResume: ResumeContent = {
  summary: 'Experienced developer',
  experience: [{
    company: 'Acme Corp',
    title: 'Senior Developer',
    startDate: '2020-01',
    current: true,
    bullets: ['Built things', 'Led team'],
  }],
  skills: [{ name: 'Languages', items: ['TypeScript', 'Python'] }],
}

const mockPersonalInfo: PersonalInfo = {
  fullName: 'Jane Smith',
  email: 'jane@test.com',
}

describe('CleanTemplate', () => {
  it('renders personal info', () => {
    render(<CleanTemplate resume={mockResume} personalInfo={mockPersonalInfo} />)
    expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    expect(screen.getByText('jane@test.com')).toBeInTheDocument()
  })

  it('renders experience section', () => {
    render(<CleanTemplate resume={mockResume} personalInfo={mockPersonalInfo} />)
    expect(screen.getByText('Acme Corp')).toBeInTheDocument()
    expect(screen.getByText('Senior Developer')).toBeInTheDocument()
  })

  it('renders skills section', () => {
    render(<CleanTemplate resume={mockResume} personalInfo={mockPersonalInfo} />)
    expect(screen.getByText('TypeScript')).toBeInTheDocument()
  })
})
```

**Step 2: Run test to verify it fails**

**Step 3: Implement Clean template**

The Clean template is a minimalist single-column layout:
- Serif headings (Georgia or similar web-safe serif)
- Generous whitespace and padding
- Subtle accent line under the name
- Clean section dividers
- Sized for US Letter (8.5" x 11") at 96 DPI

```tsx
// src/templates/clean/CleanTemplate.tsx
import type { ResumeContent, PersonalInfo } from '@/types'
import styles from './clean.module.css'

interface Props {
  resume: ResumeContent
  personalInfo: PersonalInfo
}

export function CleanTemplate({ resume, personalInfo }: Props) {
  return (
    <div className={styles.page}>
      {/* Header */}
      <header className={styles.header}>
        <h1 className={styles.name}>{personalInfo.fullName}</h1>
        <div className={styles.contact}>
          {personalInfo.email && <span>{personalInfo.email}</span>}
          {personalInfo.phone && <span>{personalInfo.phone}</span>}
          {personalInfo.location && <span>{personalInfo.location}</span>}
        </div>
      </header>

      {/* Summary */}
      {resume.summary && (
        <section className={styles.section}>
          <p className={styles.summary}>{resume.summary}</p>
        </section>
      )}

      {/* Experience */}
      {resume.experience?.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Experience</h2>
          {resume.experience.map((exp, i) => (
            <div key={i} className={styles.entry}>
              <div className={styles.entryHeader}>
                <div>
                  <strong className={styles.entryTitle}>{exp.title}</strong>
                  <span className={styles.entryCompany}>{exp.company}</span>
                </div>
                <span className={styles.entryDates}>
                  {exp.startDate} — {exp.current ? 'Present' : exp.endDate}
                </span>
              </div>
              <ul className={styles.bullets}>
                {exp.bullets.map((b, j) => <li key={j}>{b}</li>)}
              </ul>
            </div>
          ))}
        </section>
      )}

      {/* Skills */}
      {resume.skills?.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Skills</h2>
          {resume.skills.map((cat, i) => (
            <div key={i} className={styles.skillCategory}>
              <strong>{cat.name}:</strong> {cat.items.join(', ')}
            </div>
          ))}
        </section>
      )}

      {/* Education */}
      {resume.education && resume.education.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Education</h2>
          {resume.education.map((edu, i) => (
            <div key={i} className={styles.entry}>
              <strong>{edu.degree}{edu.field ? `, ${edu.field}` : ''}</strong>
              <span className={styles.entryCompany}>{edu.school}</span>
              {edu.graduationDate && <span className={styles.entryDates}>{edu.graduationDate}</span>}
            </div>
          ))}
        </section>
      )}

      {/* Projects, Certificates, Languages, Awards, IP, Volunteer, Interests — same pattern */}
    </div>
  )
}
```

**Step 4: Run test to verify it passes**

**Step 5: Commit**

```bash
git commit -m "feat: add Clean resume template (minimalist single-column)"
```

### Task 28: Create Bold template

Same TDD pattern. Two-column layout with colored sidebar, skills visualization, modern sans-serif.

```bash
git commit -m "feat: add Bold resume template (two-column with sidebar)"
```

### Task 29: Create Executive template

Same TDD pattern. Dark header block, modular sections, serif typography.

```bash
git commit -m "feat: add Executive resume template (dark header, modular sections)"
```

### Task 30: Create template registry

**Files:**
- Create: `src/templates/index.ts`

```typescript
// src/templates/index.ts
import { CleanTemplate } from './clean/CleanTemplate'
import { BoldTemplate } from './bold/BoldTemplate'
import { ExecutiveTemplate } from './executive/ExecutiveTemplate'

export const TEMPLATES = {
  clean: { name: 'Clean', component: CleanTemplate, description: 'Minimalist and elegant' },
  bold: { name: 'Bold', component: BoldTemplate, description: 'Modern two-column layout' },
  executive: { name: 'Executive', component: ExecutiveTemplate, description: 'Professional and authoritative' },
} as const

export type TemplateId = keyof typeof TEMPLATES
```

```bash
git commit -m "feat: add template registry"
```

---

## Phase 14: PDF Generation (Puppeteer)

### Task 31: Create PDF generation API route

**Files:**
- Create: `src/app/api/pdf/[id]/route.ts`
- Create: `src/lib/pdf/generator.ts`
- Test: `tests/unit/pdf/generator.test.ts`

**Step 1: Write the failing test**

```typescript
// tests/unit/pdf/generator.test.ts
import { describe, it, expect } from 'vitest'

describe('PDF Generator', () => {
  it('exports renderResumeToPdf function', async () => {
    const { renderResumeToHtml } = await import('@/lib/pdf/generator')
    expect(typeof renderResumeToHtml).toBe('function')
  })
})
```

**Step 2-3: Implement**

```typescript
// src/lib/pdf/generator.ts
import { renderToStaticMarkup } from 'react-dom/server'
import { createElement } from 'react'
import { TEMPLATES, type TemplateId } from '@/templates'
import type { ResumeContent, PersonalInfo } from '@/types'

export function renderResumeToHtml(
  resume: ResumeContent,
  personalInfo: PersonalInfo,
  templateId: TemplateId
): string {
  const template = TEMPLATES[templateId]
  const markup = renderToStaticMarkup(
    createElement(template.component, { resume, personalInfo })
  )

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    @page { size: letter; margin: 0; }
    body { margin: 0; padding: 0; }
  </style>
  <link rel="stylesheet" href="/templates/${templateId}.css">
</head>
<body>${markup}</body>
</html>`
}
```

```typescript
// src/app/api/pdf/[id]/route.ts
import { auth } from '@/lib/auth'
import { db } from '@/lib/db/client'
import { resumes, profileSections } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { renderResumeToHtml } from '@/lib/pdf/generator'
import type { ResumeContent, PersonalInfo, TemplateId } from '@/types'
// Puppeteer import handled at runtime for Vercel compatibility

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return new Response('Unauthorized', { status: 401 })
  }

  const { id } = await params
  const [resume] = await db
    .select()
    .from(resumes)
    .where(and(eq(resumes.id, id), eq(resumes.userId, session.user.id)))
    .limit(1)

  if (!resume) return new Response('Not found', { status: 404 })

  const [personalInfoSection] = await db
    .select()
    .from(profileSections)
    .where(
      and(
        eq(profileSections.userId, session.user.id),
        eq(profileSections.sectionType, 'personal_info')
      )
    )
    .limit(1)

  const resumeContent = JSON.parse(resume.resumeContent!) as ResumeContent
  const personalInfo = JSON.parse(personalInfoSection.data) as PersonalInfo
  const templateId = (resume.templateId || 'clean') as TemplateId

  const html = renderResumeToHtml(resumeContent, personalInfo, templateId)

  // Use puppeteer-core + @sparticuz/chromium for Vercel serverless
  const chromium = await import('@sparticuz/chromium').then(m => m.default)
  const puppeteer = await import('puppeteer-core').then(m => m.default)

  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath(),
    headless: true,
  })

  const page = await browser.newPage()
  await page.setContent(html, { waitUntil: 'networkidle0' })
  const pdf = await page.pdf({
    format: 'letter',
    printBackground: true,
  })
  await browser.close()

  return new Response(pdf, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="resume-${resume.company}-${templateId}.pdf"`,
    },
  })
}
```

**Step 4-5: Test, commit**

```bash
git commit -m "feat: add PDF generation via Puppeteer with template rendering"
```

---

## Phase 15: Platform Importers

### Task 32: Create GitHub importer

**Files:**
- Create: `src/lib/importers/github.ts`
- Create: `src/app/api/import/github/route.ts`
- Test: `tests/unit/importers/github.test.ts`

**Step 1: Write the failing test**

```typescript
// tests/unit/importers/github.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

const server = setupServer(
  http.get('https://api.github.com/users/testuser', () => {
    return HttpResponse.json({
      name: 'Test User',
      bio: 'Developer',
      location: 'SF',
      blog: 'https://test.com',
    })
  }),
  http.get('https://api.github.com/users/testuser/repos', () => {
    return HttpResponse.json([
      { name: 'cool-project', description: 'A cool project', html_url: 'https://github.com/testuser/cool-project', language: 'TypeScript', fork: false, stargazers_count: 10 },
    ])
  })
)

beforeEach(() => server.listen())
afterEach(() => { server.resetHandlers(); server.close() })

describe('GitHub Importer', () => {
  it('fetches user profile and repos', async () => {
    const { importFromGitHub } = await import('@/lib/importers/github')
    const result = await importFromGitHub('testuser')
    expect(result.personalInfo.fullName).toBe('Test User')
    expect(result.projects.length).toBeGreaterThan(0)
    expect(result.skills.length).toBeGreaterThan(0)
  })
})
```

**Step 2-5: Implement → test → commit**

```bash
git commit -m "feat: add GitHub profile importer for onboarding"
```

### Task 33: Create Kaggle and Behance importers (stubs)

Create importers for Kaggle and Behance following the same pattern. These can start as stubs that parse publicly available profile data.

```bash
git commit -m "feat: add Kaggle and Behance importer stubs"
```

---

## Phase 16: App Layout & Navigation

### Task 34: Create app shell with navigation

**Files:**
- Modify: `src/app/layout.tsx`
- Create: `src/components/layout/AppNav.tsx`
- Create: `src/components/layout/SessionProvider.tsx`

Implement the root layout with a navigation bar (Dashboard, Profile, Settings, Sign Out) for authenticated users.

```bash
git commit -m "feat: add app shell with navigation bar"
```

---

## Phase 17: Onboarding Completion

### Task 35: Create onboarding complete page

**Files:**
- Create: `src/app/onboarding/complete/page.tsx`
- Create: `src/actions/onboarding.ts`

This page marks onboarding as complete in the DB and redirects to dashboard.

```bash
git commit -m "feat: add onboarding completion page and action"
```

---

## Phase 18: E2E Tests

### Task 36: Configure Playwright

**Files:**
- Create: `playwright.config.ts`

```bash
git commit -m "chore: configure Playwright for E2E tests"
```

### Task 37: Write E2E test for onboarding flow

**Files:**
- Create: `tests/e2e/onboarding.spec.ts`

```bash
git commit -m "test: add E2E test for onboarding flow"
```

### Task 38: Write E2E test for generate + download flow

**Files:**
- Create: `tests/e2e/generate.spec.ts`

```bash
git commit -m "test: add E2E test for resume generation and download"
```

---

## Phase 19: Database Migration & Seed

### Task 39: Generate and run initial migration

**Step 1:** Run `npm run db:generate` to create migration files from schema
**Step 2:** Run `npm run db:migrate` to apply migrations to Turso
**Step 3:** Seed templates table with Clean, Bold, Executive entries

```bash
git commit -m "chore: add initial database migration and template seed data"
```

---

## Phase 20: Final Polish & Deploy

### Task 40: Add CLAUDE.md for developer guidance

**Files:**
- Create: `CLAUDE.md`

```bash
git commit -m "docs: add CLAUDE.md with project conventions and development guidance"
```

### Task 41: Vercel deployment config

**Files:**
- Create: `vercel.json` (if needed for Puppeteer function config)
- Verify `next.config.ts` has correct settings

```bash
git commit -m "chore: add Vercel deployment configuration"
```

---

## Execution Notes

- **Total tasks:** 41
- **Phases:** 20
- **Every task follows TDD:** write failing test → implement → verify → commit
- **Tasks 20 and 22-25 are the largest** — they involve multiple components each. The plan shows the pattern; each step component follows the same structure.
- **Tasks 27-29 (templates)** will need the most design attention — use the frontend-design skill when implementing.
- **The onboarding step components (Task 20)** can be parallelized — each step is independent.

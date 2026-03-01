# Template Preview Switching — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** When a user switches templates, the preview renders the actual template component so the preview matches the PDF output exactly.

**Architecture:** Replace the generic `ResumePreview` component with the real template component looked up from `TEMPLATES[templateId]`. Add a responsive sliding drawer for sidebar controls (template selector, feedback, download) on narrow screens. Default to `'clean'` template on initial load.

**Tech Stack:** React, Tailwind CSS, Vitest + React Testing Library

---

## Task 1: Swap ResumePreview for actual template component

**Files:**
- Modify: `src/app/(app)/resume/[id]/client.tsx`

**Step 1: Write the failing test**

Create: `tests/unit/components/resume/ResumeViewClient.test.tsx`

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}))

// Mock server actions
vi.mock('@/actions/generation', () => ({
  regenerateResume: vi.fn(),
  updateResumeTemplate: vi.fn(),
}))

// Mock template components so we can detect which renders
vi.mock('@/templates', () => ({
  TEMPLATES: {
    clean: {
      name: 'Clean',
      component: ({ resume, personalInfo }: any) => (
        <div data-testid="template-clean">Clean Template</div>
      ),
      description: 'Minimalist',
    },
    bold: {
      name: 'Bold',
      component: ({ resume, personalInfo }: any) => (
        <div data-testid="template-bold">Bold Template</div>
      ),
      description: 'Modern',
    },
    executive: {
      name: 'Executive',
      component: ({ resume, personalInfo }: any) => (
        <div data-testid="template-executive">Executive Template</div>
      ),
      description: 'Professional',
    },
  },
  type TemplateId = 'clean' | 'bold' | 'executive',
}))

import ResumeViewClient from '@/app/(app)/resume/[id]/client'

const mockResume = {
  id: 'test-1',
  jobTitle: 'Software Engineer',
  company: 'Acme Corp',
  templateId: null,
  resumeContent: {
    summary: 'Test summary',
    experience: [],
    skills: [],
  },
  feedbackHistory: [],
}

const mockPersonalInfo = {
  fullName: 'Jane Doe',
  email: 'jane@example.com',
}

describe('ResumeViewClient', () => {
  it('renders clean template by default when templateId is null', () => {
    render(
      <ResumeViewClient resume={mockResume} personalInfo={mockPersonalInfo} />
    )
    expect(screen.getByTestId('template-clean')).toBeInTheDocument()
  })

  it('renders the template matching the stored templateId', () => {
    render(
      <ResumeViewClient
        resume={{ ...mockResume, templateId: 'bold' }}
        personalInfo={mockPersonalInfo}
      />
    )
    expect(screen.getByTestId('template-bold')).toBeInTheDocument()
  })

  it('switches template when user clicks a different template button', async () => {
    const user = userEvent.setup()
    render(
      <ResumeViewClient resume={mockResume} personalInfo={mockPersonalInfo} />
    )

    // Initially clean
    expect(screen.getByTestId('template-clean')).toBeInTheDocument()

    // Click "Executive" template button
    await user.click(screen.getByRole('button', { name: /executive/i }))

    // Should now show executive template
    expect(screen.getByTestId('template-executive')).toBeInTheDocument()
    expect(screen.queryByTestId('template-clean')).not.toBeInTheDocument()
  })
})
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/components/resume/ResumeViewClient.test.tsx`
Expected: FAIL — `ResumeViewClient` still renders `<ResumePreview>` instead of template components, so `data-testid="template-clean"` won't be found.

**Step 3: Write minimal implementation**

In `src/app/(app)/resume/[id]/client.tsx`, replace the `ResumePreview` import and usage:

```tsx
'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { TEMPLATES } from '@/templates'
import TemplateSelector from '@/components/resume/TemplateSelector'
import FeedbackForm from '@/components/resume/FeedbackForm'
import DownloadButton from '@/components/resume/DownloadButton'
import { regenerateResume, updateResumeTemplate } from '@/actions/generation'
import type { ResumeContent, PersonalInfo } from '@/types'
import type { TemplateId } from '@/templates'

interface ResumeData {
  id: string
  jobTitle: string
  company: string
  templateId: string | null
  resumeContent: ResumeContent | null
  feedbackHistory: { feedback: string; timestamp: string }[]
}

interface ResumeViewClientProps {
  resume: ResumeData
  personalInfo?: PersonalInfo
}

export default function ResumeViewClient({ resume, personalInfo }: ResumeViewClientProps) {
  const router = useRouter()
  const [content, setContent] = useState<ResumeContent | null>(resume.resumeContent)
  const [templateId, setTemplateId] = useState<TemplateId>(
    (resume.templateId as TemplateId) ?? 'clean'
  )
  const [isPending, startTransition] = useTransition()

  function handleTemplateChange(newTemplateId: string) {
    setTemplateId(newTemplateId as TemplateId)
    startTransition(async () => {
      await updateResumeTemplate(resume.id, newTemplateId)
    })
  }

  function handleFeedbackSubmit(feedback: string) {
    startTransition(async () => {
      const result = await regenerateResume(resume.id, feedback)
      setContent(result.resumeContent)
    })
  }

  if (!content) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">This resume has no content yet.</p>
      </div>
    )
  }

  const TemplateComponent = TEMPLATES[templateId].component

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{resume.jobTitle}</h1>
          <p className="text-gray-600">{resume.company}</p>
        </div>
        <DownloadButton resumeId={resume.id} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Resume Preview — actual template */}
        <div className="lg:col-span-2">
          <TemplateComponent
            resume={content}
            personalInfo={personalInfo ?? { fullName: '', email: '' }}
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <TemplateSelector
            selectedTemplate={templateId}
            onSelect={handleTemplateChange}
          />

          <div className="border-t border-gray-200 pt-6">
            <FeedbackForm
              onSubmit={handleFeedbackSubmit}
              isLoading={isPending}
            />
          </div>

          {resume.feedbackHistory.length > 0 && (
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Feedback History</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {resume.feedbackHistory.map((entry, i) => (
                  <div key={i} className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm text-gray-700">{entry.feedback}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(entry.timestamp).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
```

**Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/components/resume/ResumeViewClient.test.tsx`
Expected: PASS — all 3 tests pass.

**Step 5: Commit**

```bash
git add tests/unit/components/resume/ResumeViewClient.test.tsx src/app/\(app\)/resume/\[id\]/client.tsx
git commit -m "feat: render actual template component in preview (#5)"
```

---

## Task 2: Add responsive sliding drawer for sidebar controls

**Files:**
- Modify: `src/app/(app)/resume/[id]/client.tsx`

**Step 1: Write the failing test**

Add to `tests/unit/components/resume/ResumeViewClient.test.tsx`:

```tsx
describe('Responsive drawer', () => {
  it('renders a drawer toggle button', () => {
    render(
      <ResumeViewClient resume={mockResume} personalInfo={mockPersonalInfo} />
    )
    expect(screen.getByRole('button', { name: /customize/i })).toBeInTheDocument()
  })

  it('opens drawer when toggle is clicked', async () => {
    const user = userEvent.setup()
    render(
      <ResumeViewClient resume={mockResume} personalInfo={mockPersonalInfo} />
    )

    // Drawer content should be hidden initially (has hidden class or not in DOM)
    const drawer = screen.getByTestId('controls-drawer')
    expect(drawer).toHaveClass('translate-x-full')

    // Click toggle
    await user.click(screen.getByRole('button', { name: /customize/i }))

    // Drawer should be visible
    expect(drawer).toHaveClass('translate-x-0')
  })

  it('closes drawer when close button is clicked', async () => {
    const user = userEvent.setup()
    render(
      <ResumeViewClient resume={mockResume} personalInfo={mockPersonalInfo} />
    )

    // Open drawer
    await user.click(screen.getByRole('button', { name: /customize/i }))
    const drawer = screen.getByTestId('controls-drawer')
    expect(drawer).toHaveClass('translate-x-0')

    // Close drawer
    await user.click(screen.getByRole('button', { name: /close/i }))
    expect(drawer).toHaveClass('translate-x-full')
  })
})
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/components/resume/ResumeViewClient.test.tsx`
Expected: FAIL — no drawer toggle button exists yet.

**Step 3: Write minimal implementation**

Update `src/app/(app)/resume/[id]/client.tsx` — add drawer state and responsive layout. The sidebar content is rendered twice: once in the desktop sidebar (hidden on small screens via `hidden lg:block`), once in the drawer (visible on small screens via `lg:hidden`).

Replace the return JSX with:

```tsx
const [drawerOpen, setDrawerOpen] = useState(false)

// ... existing handlers ...

const sidebarContent = (
  <>
    <TemplateSelector
      selectedTemplate={templateId}
      onSelect={handleTemplateChange}
    />
    <div className="border-t border-gray-200 pt-6">
      <FeedbackForm
        onSubmit={handleFeedbackSubmit}
        isLoading={isPending}
      />
    </div>
    {resume.feedbackHistory.length > 0 && (
      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Feedback History</h3>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {resume.feedbackHistory.map((entry, i) => (
            <div key={i} className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm text-gray-700">{entry.feedback}</p>
              <p className="text-xs text-gray-400 mt-1">
                {new Date(entry.timestamp).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </div>
    )}
  </>
)

return (
  <div>
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{resume.jobTitle}</h1>
        <p className="text-gray-600">{resume.company}</p>
      </div>
      <div className="flex items-center gap-3">
        <DownloadButton resumeId={resume.id} />
        {/* Drawer toggle — visible only on small screens */}
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="lg:hidden inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
        >
          Customize
        </button>
      </div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Resume Preview — actual template */}
      <div className="lg:col-span-2">
        <TemplateComponent
          resume={content}
          personalInfo={personalInfo ?? { fullName: '', email: '' }}
        />
      </div>

      {/* Desktop sidebar — hidden on small screens */}
      <div className="hidden lg:block space-y-6">
        {sidebarContent}
      </div>
    </div>

    {/* Mobile/tablet drawer — slides over preview */}
    {/* Backdrop */}
    {drawerOpen && (
      <div
        className="fixed inset-0 bg-black/30 z-40 lg:hidden"
        onClick={() => setDrawerOpen(false)}
      />
    )}
    {/* Drawer panel */}
    <div
      data-testid="controls-drawer"
      className={`fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out lg:hidden ${
        drawerOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Customize</h2>
        <button
          type="button"
          onClick={() => setDrawerOpen(false)}
          aria-label="Close"
          className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="p-4 space-y-6 overflow-y-auto h-[calc(100%-65px)]">
        {sidebarContent}
      </div>
    </div>
  </div>
)
```

**Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/components/resume/ResumeViewClient.test.tsx`
Expected: PASS — all 6 tests pass.

**Step 5: Commit**

```bash
git add src/app/\(app\)/resume/\[id\]/client.tsx tests/unit/components/resume/ResumeViewClient.test.tsx
git commit -m "feat: add responsive sliding drawer for controls on narrow screens (#5)"
```

---

## Task 3: Delete unused ResumePreview component

**Files:**
- Delete: `src/components/resume/ResumePreview.tsx`

**Step 1: Verify no remaining imports**

Run: `grep -r "ResumePreview" src/`
Expected: No matches (only docs/plans files may reference it).

**Step 2: Delete the file**

```bash
rm src/components/resume/ResumePreview.tsx
```

**Step 3: Run all tests to verify nothing breaks**

Run: `npx vitest run`
Expected: All tests pass.

**Step 4: Commit**

```bash
git add -A
git commit -m "chore: remove unused ResumePreview component (#5)"
```

---

## Task 4: Manual verification

**Step 1: Start dev server**

Run: `npm run dev`

**Step 2: Verify in browser**

1. Navigate to a resume page
2. Confirm it renders the Clean template by default
3. Click Bold — preview should immediately switch to two-column navy sidebar layout
4. Click Executive — preview should switch to dark header with gold accents
5. Resize browser window narrow — sidebar should disappear, "Customize" button appears
6. Click "Customize" — drawer slides in from right with template selector, feedback form
7. Switch template from drawer — preview updates behind the drawer
8. Close drawer — preview shows the selected template
9. Download PDF — confirm PDF matches the preview

**Step 3: Final commit if any tweaks needed**

```bash
git commit -m "fix: template preview polish (#5)"
```

# Preview-PDF Matching & Smart Page Breaks — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make the resume preview pixel-identical to the downloaded PDF and prevent content from being cut off mid-element at page boundaries.

**Architecture:** Add CSS `break-inside: avoid` rules to the HTML template used by both Puppeteer and the preview. Replace the current React-children-based PagedPreview with an iframe-based approach that renders the exact same HTML as Puppeteer, ensuring visual parity. A new server action generates the preview HTML by calling the existing `renderResumeToHtml()` function.

**Tech Stack:** React, Next.js Server Actions, iframe with `srcdoc`, CSS break properties, Vitest

---

## Task 1: Add smart page break CSS to renderResumeToHtml

**Files:**
- Modify: `src/lib/pdf/generator.ts`

**Step 1: Update the `<style>` block**

In `src/lib/pdf/generator.ts`, find the `<style>` block in the template string (lines 31-42). Add page break rules after the existing `body` rule:

```ts
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Resume - ${personalInfo.fullName}</title>
  <style>
    @page { size: letter; margin: 0; }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      print-color-adjust: exact;
      -webkit-print-color-adjust: exact;
    }
    section > div, aside > div > div { break-inside: avoid; }
    h2 { break-after: avoid; }
  </style>
</head>
<body>${markup}</body>
</html>`
```

The two new lines:
- `section > div, aside > div > div { break-inside: avoid; }` — prevents splitting entry-level divs (experience entries, education entries, etc.) across pages. Works for Clean/Executive (which use `<section>`) and Bold (which uses `<aside>` for sidebar content).
- `h2 { break-after: avoid; }` — keeps section headings attached to their first entry.

**Step 2: Run all tests**

Run: `npx vitest run`
Expected: All tests pass (this is a CSS-only change, no logic affected).

**Step 3: Commit**

```bash
git add src/lib/pdf/generator.ts
git commit -m "feat: add smart page break CSS to PDF/preview HTML"
```

---

## Task 2: Create getPreviewHtml server action

**Files:**
- Create: `src/actions/preview.ts`

**Step 1: Write the server action**

Create `src/actions/preview.ts`:

```ts
'use server'

import { renderResumeToHtml } from '@/lib/pdf/generator'
import type { TemplateId } from '@/templates'
import type { ResumeContent, PersonalInfo } from '@/types'

export async function getPreviewHtml(
  resumeContent: ResumeContent,
  personalInfo: PersonalInfo,
  templateId: TemplateId
): Promise<string> {
  return renderResumeToHtml(resumeContent, personalInfo, templateId)
}
```

This is a thin wrapper that exposes `renderResumeToHtml` as a server action callable from client components. It takes the resume data directly (not a resumeId) so the client can call it whenever content or templateId changes without an extra DB round-trip.

**Step 2: Run all tests**

Run: `npx vitest run`
Expected: All tests pass.

**Step 3: Commit**

```bash
git add src/actions/preview.ts
git commit -m "feat: add getPreviewHtml server action"
```

---

## Task 3: Rewrite PagedPreview to use iframes

**Files:**
- Rewrite: `src/components/resume/PagedPreview.tsx`
- Rewrite: `tests/unit/components/resume/PagedPreview.test.tsx`

**Step 1: Write the new test**

Replace `tests/unit/components/resume/PagedPreview.test.tsx` entirely:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'

import PagedPreview from '@/components/resume/PagedPreview'

const mockHtml = '<html><body><div style="width:816px;min-height:1056px;">Page content</div></body></html>'

describe('PagedPreview', () => {
  it('renders the paged preview container', () => {
    render(<PagedPreview html={mockHtml} />)
    expect(screen.getByTestId('paged-preview')).toBeInTheDocument()
  })

  it('renders at least one page iframe', () => {
    render(<PagedPreview html={mockHtml} />)
    const pages = screen.getAllByTestId(/^page-\d+$/)
    expect(pages.length).toBeGreaterThanOrEqual(1)
  })

  it('renders iframes with srcdoc attribute', () => {
    render(<PagedPreview html={mockHtml} />)
    const pages = screen.getAllByTestId(/^page-\d+$/)
    // Each page is an iframe with srcdoc
    expect(pages[0].tagName).toBe('IFRAME')
    expect(pages[0]).toHaveAttribute('srcdoc', mockHtml)
  })

  it('shows page labels', () => {
    render(<PagedPreview html={mockHtml} />)
    expect(screen.getByText(/page 1/i)).toBeInTheDocument()
  })

  it('shows loading state when html is empty', () => {
    render(<PagedPreview html="" />)
    expect(screen.getByText(/generating preview/i)).toBeInTheDocument()
  })
})
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/components/resume/PagedPreview.test.tsx`
Expected: FAIL — current PagedPreview accepts `children`, not `html`.

**Step 3: Rewrite the component**

Replace `src/components/resume/PagedPreview.tsx` entirely:

```tsx
'use client'

import { useRef, useState, useCallback } from 'react'

const PAGE_WIDTH = 816
const PAGE_HEIGHT = 1056

interface PagedPreviewProps {
  html: string
}

export default function PagedPreview({ html }: PagedPreviewProps) {
  const measureRef = useRef<HTMLIFrameElement>(null)
  const [pageCount, setPageCount] = useState(1)

  const handleMeasureLoad = useCallback(() => {
    const iframe = measureRef.current
    if (!iframe?.contentDocument?.body) return
    const height = iframe.contentDocument.body.scrollHeight
    setPageCount(Math.max(1, Math.ceil(height / PAGE_HEIGHT)))
  }, [])

  const handlePageLoad = useCallback((pageIndex: number) => {
    return (e: React.SyntheticEvent<HTMLIFrameElement>) => {
      const iframe = e.currentTarget
      try {
        iframe.contentWindow?.scrollTo(0, pageIndex * PAGE_HEIGHT)
      } catch {
        // cross-origin safety — srcdoc should be same-origin so this shouldn't fire
      }
    }
  }, [])

  if (!html) {
    return (
      <div data-testid="paged-preview" className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">Generating preview...</p>
      </div>
    )
  }

  return (
    <div data-testid="paged-preview">
      {/* Hidden measurement iframe */}
      <iframe
        ref={measureRef}
        srcDoc={html}
        onLoad={handleMeasureLoad}
        aria-hidden="true"
        tabIndex={-1}
        style={{
          position: 'absolute',
          visibility: 'hidden',
          width: PAGE_WIDTH,
          height: 0,
          overflow: 'hidden',
          pointerEvents: 'none',
          border: 'none',
        }}
      />

      {/* Visible pages */}
      <div className="flex flex-col items-center gap-8">
        {Array.from({ length: pageCount }, (_, i) => (
          <div key={i}>
            <div
              className="shadow-lg border border-gray-200 dark:border-gray-700"
              style={{
                width: PAGE_WIDTH,
                height: PAGE_HEIGHT,
                overflow: 'hidden',
              }}
            >
              <iframe
                data-testid={`page-${i + 1}`}
                srcDoc={html}
                onLoad={handlePageLoad(i)}
                scrolling="no"
                style={{
                  width: PAGE_WIDTH,
                  height: PAGE_HEIGHT,
                  border: 'none',
                  display: 'block',
                }}
              />
            </div>
            <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-2">
              Page {i + 1} of {pageCount}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
```

Key points:
- Accepts `html` string prop (not children)
- Hidden measurement iframe loads the HTML, on load reads `scrollHeight` to calculate pages
- Each visible page is an iframe with `srcdoc={html}`, on load scrolls to `pageIndex * PAGE_HEIGHT`
- `scrolling="no"` prevents user from scrolling within a page
- Shows loading state when `html` is empty (before server action returns)

**Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/components/resume/PagedPreview.test.tsx`
Expected: PASS — all 5 tests pass.

Note: jsdom doesn't fully support iframe `srcdoc`/`onLoad`, so the `handleMeasureLoad` callback won't fire in tests. `pageCount` stays at 1 (the default), which is fine — we still get one page rendered.

**Step 5: Commit**

```bash
git add src/components/resume/PagedPreview.tsx tests/unit/components/resume/PagedPreview.test.tsx
git commit -m "feat: rewrite PagedPreview to use iframe-based rendering"
```

---

## Task 4: Wire up client.tsx to use getPreviewHtml + iframe PagedPreview

**Files:**
- Modify: `src/app/(app)/resume/[id]/client.tsx`
- Modify: `tests/unit/components/resume/ResumeViewClient.test.tsx`

**Step 1: Update client.tsx**

Replace the import of `PagedPreview` and `TEMPLATES` usage to call the server action and pass HTML:

```tsx
'use client'

import { useState, useTransition, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import PagedPreview from '@/components/resume/PagedPreview'
import TemplateSelector from '@/components/resume/TemplateSelector'
import FeedbackForm from '@/components/resume/FeedbackForm'
import DownloadButton from '@/components/resume/DownloadButton'
import { regenerateResume, updateResumeTemplate } from '@/actions/generation'
import { getPreviewHtml } from '@/actions/preview'
import { TEMPLATES } from '@/templates'
import type { TemplateId } from '@/templates'
import type { ResumeContent, PersonalInfo } from '@/types'

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

function isValidTemplateId(id: string): id is TemplateId {
  return id in TEMPLATES
}

export default function ResumeViewClient({ resume, personalInfo }: ResumeViewClientProps) {
  const router = useRouter()
  const [content, setContent] = useState<ResumeContent | null>(resume.resumeContent)
  const [templateId, setTemplateId] = useState<TemplateId>(
    resume.templateId && isValidTemplateId(resume.templateId) ? resume.templateId : 'clean'
  )
  const [isPending, startTransition] = useTransition()
  const [previewHtml, setPreviewHtml] = useState('')
  const [drawerOpen, setDrawerOpen] = useState(false)

  const resolvedPersonalInfo = personalInfo ?? { fullName: '', email: '' }

  const loadPreview = useCallback(async (resumeContent: ResumeContent, tid: TemplateId) => {
    const html = await getPreviewHtml(resumeContent, resolvedPersonalInfo, tid)
    setPreviewHtml(html)
  }, [resolvedPersonalInfo])

  // Load preview HTML on mount and when content/template changes
  useEffect(() => {
    if (content) {
      loadPreview(content, templateId)
    }
  }, [content, templateId, loadPreview])

  function handleTemplateChange(newTemplateId: string) {
    if (!isValidTemplateId(newTemplateId)) return
    setTemplateId(newTemplateId)
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
        <p className="text-gray-500 dark:text-gray-400">This resume has no content yet.</p>
      </div>
    )
  }

  const sidebarContent = (
    <>
      <TemplateSelector
        selectedTemplate={templateId}
        onSelect={handleTemplateChange}
      />
      <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
        <FeedbackForm
          onSubmit={handleFeedbackSubmit}
          isLoading={isPending}
        />
      </div>
      {resume.feedbackHistory.length > 0 && (
        <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Feedback History</h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {resume.feedbackHistory.map((entry, i) => (
              <div key={i} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                <p className="text-sm text-gray-700 dark:text-gray-300">{entry.feedback}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{resume.jobTitle}</h1>
          <p className="text-gray-600 dark:text-gray-400">{resume.company}</p>
        </div>
        <div className="flex items-center gap-2">
          <DownloadButton resumeId={resume.id} iconOnly />
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 shadow-sm transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
            </svg>
            Customize
          </button>
        </div>
      </div>

      <PagedPreview html={previewHtml} />

      {drawerOpen && (
        <div
          className="fixed inset-0 bg-black/30 dark:bg-black/50 z-40"
          onClick={() => setDrawerOpen(false)}
        />
      )}
      <div
        data-testid="controls-drawer"
        className={`fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white dark:bg-gray-900 shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
          drawerOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Customize</h2>
          <button
            type="button"
            onClick={() => setDrawerOpen(false)}
            aria-label="Close"
            className="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 rounded-lg"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-4 space-y-6 overflow-y-auto h-[calc(100%-65px)]">
          <DownloadButton resumeId={resume.id} />
          {sidebarContent}
        </div>
      </div>
    </div>
  )
}
```

Key changes from current:
- Import `getPreviewHtml` from `@/actions/preview`
- Import `useEffect`, `useCallback`
- New state: `previewHtml` (string)
- `loadPreview()` callback calls `getPreviewHtml()` server action
- `useEffect` calls `loadPreview` when `content` or `templateId` changes
- Replace `<PagedPreview><TemplateComponent ... /></PagedPreview>` with `<PagedPreview html={previewHtml} />`
- Remove the `TemplateComponent` local variable (no longer needed)

**Step 2: Update ResumeViewClient tests**

The tests currently mock `@/templates` to detect which template renders via `data-testid`. With the iframe approach, the template is rendered server-side into HTML, so the test strategy changes. We need to:
1. Mock `@/actions/preview` to return predictable HTML containing the template testid
2. Remove the `ResizeObserver` mock (no longer needed — PagedPreview uses iframes now)
3. Remove `@/templates` mock (client.tsx still imports TEMPLATES for `isValidTemplateId` and `TemplateSelector`, but no longer renders template components directly)

Replace `tests/unit/components/resume/ResumeViewClient.test.tsx` entirely:

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
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

// Mock preview server action to return HTML with identifiable template markers
const mockGetPreviewHtml = vi.fn()
vi.mock('@/actions/preview', () => ({
  getPreviewHtml: (...args: any[]) => mockGetPreviewHtml(...args),
}))

// Mock templates registry (still needed for isValidTemplateId and TemplateSelector)
vi.mock('@/templates', () => ({
  TEMPLATES: {
    clean: { name: 'Clean', component: () => null, description: 'Minimalist' },
    bold: { name: 'Bold', component: () => null, description: 'Modern' },
    executive: { name: 'Executive', component: () => null, description: 'Professional' },
  },
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

beforeEach(() => {
  mockGetPreviewHtml.mockReset()
  mockGetPreviewHtml.mockResolvedValue('<html><body><div>Preview</div></body></html>')
})

describe('ResumeViewClient', () => {
  it('calls getPreviewHtml on mount with default template', async () => {
    render(
      <ResumeViewClient resume={mockResume} personalInfo={mockPersonalInfo} />
    )

    await waitFor(() => {
      expect(mockGetPreviewHtml).toHaveBeenCalledWith(
        mockResume.resumeContent,
        mockPersonalInfo,
        'clean'
      )
    })
  })

  it('calls getPreviewHtml with stored templateId', async () => {
    render(
      <ResumeViewClient
        resume={{ ...mockResume, templateId: 'bold' }}
        personalInfo={mockPersonalInfo}
      />
    )

    await waitFor(() => {
      expect(mockGetPreviewHtml).toHaveBeenCalledWith(
        mockResume.resumeContent,
        mockPersonalInfo,
        'bold'
      )
    })
  })

  it('renders PagedPreview with the returned HTML', async () => {
    mockGetPreviewHtml.mockResolvedValue('<html><body><div>Test HTML</div></body></html>')

    render(
      <ResumeViewClient resume={mockResume} personalInfo={mockPersonalInfo} />
    )

    await waitFor(() => {
      expect(screen.getByTestId('paged-preview')).toBeInTheDocument()
    })
  })

  it('calls getPreviewHtml again when template changes', async () => {
    const user = userEvent.setup()
    render(
      <ResumeViewClient resume={mockResume} personalInfo={mockPersonalInfo} />
    )

    await waitFor(() => {
      expect(mockGetPreviewHtml).toHaveBeenCalledTimes(1)
    })

    // Click "Executive" template button
    await user.click(screen.getByRole('button', { name: /executive/i }))

    await waitFor(() => {
      expect(mockGetPreviewHtml).toHaveBeenCalledWith(
        mockResume.resumeContent,
        mockPersonalInfo,
        'executive'
      )
    })
  })

  describe('Overlay drawer', () => {
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

      const drawer = screen.getByTestId('controls-drawer')
      expect(drawer).toHaveClass('translate-x-full')

      await user.click(screen.getByRole('button', { name: /customize/i }))

      expect(drawer).toHaveClass('translate-x-0')
    })

    it('closes drawer when close button is clicked', async () => {
      const user = userEvent.setup()
      render(
        <ResumeViewClient resume={mockResume} personalInfo={mockPersonalInfo} />
      )

      await user.click(screen.getByRole('button', { name: /customize/i }))
      const drawer = screen.getByTestId('controls-drawer')
      expect(drawer).toHaveClass('translate-x-0')

      await user.click(screen.getByRole('button', { name: /close/i }))
      expect(drawer).toHaveClass('translate-x-full')
    })
  })
})
```

Key test changes:
- Mock `@/actions/preview` instead of detecting template rendering via `data-testid`
- Tests verify `getPreviewHtml` is called with the right arguments (content, personalInfo, templateId)
- Template switching test verifies `getPreviewHtml` is called again with the new templateId
- Drawer tests remain unchanged
- No more `ResizeObserver` mock needed
- Add `waitFor` import for async state updates

**Step 3: Run all tests**

Run: `npx vitest run`
Expected: All tests pass.

**Step 4: Commit**

```bash
git add src/app/\(app\)/resume/\[id\]/client.tsx tests/unit/components/resume/ResumeViewClient.test.tsx
git commit -m "feat: wire up iframe preview with getPreviewHtml server action"
```

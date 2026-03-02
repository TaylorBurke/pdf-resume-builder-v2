# Download Button Improvements Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add loading indicator, error state, and improved filename format to the PDF download button.

**Architecture:** Convert DownloadButton from a plain `<a>` link to a `<button>` that fetches the PDF via `fetch()`, giving full control over loading/error states. Update the API route filename to include company and job title. Pass company/jobTitle props through from the parent.

**Tech Stack:** React (useState), fetch API, Blob/URL.createObjectURL, Vitest + React Testing Library

---

### Task 1: Update PDF API Route Filename

**Files:**
- Modify: `src/app/api/pdf/[id]/route.ts:61`

**Step 1: Write the failing test**

There is no existing test for this route and it requires complex mocking (db, auth, Puppeteer). Skip TDD for this one-line change — it's a simple string template update.

**Step 2: Update the filename format**

In `src/app/api/pdf/[id]/route.ts`, replace line 61:

```ts
// OLD:
const filename = `Resume-${personalInfo.fullName.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`

// NEW:
const sanitize = (s: string) => s.replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_|_$/g, '')
const filename = `${sanitize(personalInfo.fullName)}-${sanitize(resume.company)}-${sanitize(resume.jobTitle)}.pdf`
```

Note: `resume.company` and `resume.jobTitle` are already loaded from the DB query on line 24. The `sanitize` helper collapses consecutive non-alphanumeric chars into a single underscore and trims leading/trailing underscores.

**Step 3: Run existing tests to verify nothing breaks**

Run: `npx vitest run`
Expected: All existing tests pass (this route has no unit tests, but verify no regressions).

**Step 4: Commit**

```bash
git add src/app/api/pdf/[id]/route.ts
git commit -m "feat: include company and title in PDF filename"
```

---

### Task 2: Rewrite DownloadButton with Loading and Error States

**Files:**
- Modify: `src/components/resume/DownloadButton.tsx`
- Create: `tests/unit/components/resume/DownloadButton.test.tsx`
- Modify: `src/app/(app)/resume/[id]/client.tsx:239,264`

**Step 1: Write the failing tests**

Create `tests/unit/components/resume/DownloadButton.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import DownloadButton from '@/components/resume/DownloadButton'

// Mock global fetch
const mockFetch = vi.fn()

beforeEach(() => {
  vi.stubGlobal('fetch', mockFetch)
  vi.stubGlobal('URL', {
    createObjectURL: vi.fn(() => 'blob:http://localhost/fake'),
    revokeObjectURL: vi.fn(),
  })
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('DownloadButton', () => {
  const defaultProps = {
    resumeId: 'test-1',
    company: 'Acme Corp',
    jobTitle: 'Software Engineer',
    fullName: 'Jane Doe',
  }

  it('renders download button with text in full mode', () => {
    render(<DownloadButton {...defaultProps} />)
    expect(screen.getByRole('button', { name: /download pdf/i })).toBeInTheDocument()
  })

  it('renders icon-only button when iconOnly is true', () => {
    render(<DownloadButton {...defaultProps} iconOnly />)
    const btn = screen.getByRole('button', { name: /download pdf/i })
    expect(btn).toBeInTheDocument()
    expect(btn).not.toHaveTextContent('Download PDF')
  })

  it('shows loading state while downloading', async () => {
    const user = userEvent.setup()
    // Never resolve to keep loading state
    mockFetch.mockReturnValue(new Promise(() => {}))

    render(<DownloadButton {...defaultProps} />)
    await user.click(screen.getByRole('button', { name: /download pdf/i }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /downloading/i })).toBeDisabled()
    })
  })

  it('fetches PDF and triggers download on success', async () => {
    const user = userEvent.setup()
    const mockBlob = new Blob(['pdf-data'], { type: 'application/pdf' })
    mockFetch.mockResolvedValue({
      ok: true,
      blob: () => Promise.resolve(mockBlob),
    })

    // Mock createElement to capture the download link
    const clickSpy = vi.fn()
    const originalCreateElement = document.createElement.bind(document)
    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      const el = originalCreateElement(tag)
      if (tag === 'a') {
        vi.spyOn(el, 'click').mockImplementation(clickSpy)
      }
      return el
    })

    render(<DownloadButton {...defaultProps} />)
    await user.click(screen.getByRole('button', { name: /download pdf/i }))

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/pdf/test-1')
    })

    await waitFor(() => {
      expect(clickSpy).toHaveBeenCalled()
    })

    // Should return to idle
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /download pdf/i })).toBeEnabled()
    })
  })

  it('shows error state on fetch failure', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    mockFetch.mockResolvedValue({ ok: false, status: 500 })

    render(<DownloadButton {...defaultProps} />)
    await user.click(screen.getByRole('button', { name: /download pdf/i }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /download failed/i })).toBeInTheDocument()
    })

    // After 2 seconds, should reset to idle
    vi.advanceTimersByTime(2000)
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /download pdf/i })).toBeInTheDocument()
    })

    vi.useRealTimers()
  })

  it('uses correct filename with sanitized segments', async () => {
    const user = userEvent.setup()
    const mockBlob = new Blob(['pdf-data'], { type: 'application/pdf' })
    mockFetch.mockResolvedValue({
      ok: true,
      blob: () => Promise.resolve(mockBlob),
    })

    let capturedDownload = ''
    const originalCreateElement = document.createElement.bind(document)
    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      const el = originalCreateElement(tag)
      if (tag === 'a') {
        vi.spyOn(el, 'click').mockImplementation(() => {})
        const originalSet = Object.getOwnPropertyDescriptor(HTMLAnchorElement.prototype, 'download')!.set!
        Object.defineProperty(el, 'download', {
          set(v: string) { capturedDownload = v; originalSet.call(this, v) },
          get() { return capturedDownload },
        })
      }
      return el
    })

    render(<DownloadButton {...defaultProps} />)
    await user.click(screen.getByRole('button', { name: /download pdf/i }))

    await waitFor(() => {
      expect(capturedDownload).toBe('Jane_Doe-Acme_Corp-Software_Engineer.pdf')
    })
  })
})
```

**Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/unit/components/resume/DownloadButton.test.tsx`
Expected: FAIL — DownloadButton currently renders `<a>` not `<button>`, so `getByRole('button')` will fail.

**Step 3: Rewrite DownloadButton component**

Replace the entire content of `src/components/resume/DownloadButton.tsx`:

```tsx
'use client'

import { useState, useCallback } from 'react'

type DownloadState = 'idle' | 'loading' | 'error'

interface DownloadButtonProps {
  resumeId: string
  fullName: string
  company: string
  jobTitle: string
  iconOnly?: boolean
}

function sanitize(s: string) {
  return s.replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_|_$/g, '')
}

export default function DownloadButton({
  resumeId,
  fullName,
  company,
  jobTitle,
  iconOnly = false,
}: DownloadButtonProps) {
  const [state, setState] = useState<DownloadState>('idle')

  const handleDownload = useCallback(async () => {
    if (state === 'loading') return
    setState('loading')
    try {
      const res = await fetch(`/api/pdf/${resumeId}`)
      if (!res.ok) throw new Error('Download failed')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${sanitize(fullName)}-${sanitize(company)}-${sanitize(jobTitle)}.pdf`
      a.click()
      URL.revokeObjectURL(url)
      setState('idle')
    } catch {
      setState('error')
      setTimeout(() => setState('idle'), 2000)
    }
  }, [resumeId, fullName, company, jobTitle, state])

  const label =
    state === 'loading' ? 'Downloading...' :
    state === 'error' ? 'Download failed' :
    'Download PDF'

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={state === 'loading'}
      title={label}
      aria-label={label}
      className={
        iconOnly
          ? 'inline-flex items-center justify-center p-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50'
          : `inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 ${
              state === 'error'
                ? 'bg-red-600 text-white dark:bg-red-700'
                : 'bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-200'
            }`
      }
    >
      {state === 'loading' ? (
        <svg
          className={`animate-spin ${iconOnly ? 'w-5 h-5' : 'w-4 h-4 mr-2'}`}
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : state === 'error' ? (
        <svg
          className={iconOnly ? 'w-5 h-5 text-red-500' : 'w-4 h-4 mr-2'}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      ) : (
        <svg
          className={iconOnly ? 'w-5 h-5' : 'w-4 h-4 mr-2'}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      )}
      {!iconOnly && label}
    </button>
  )
}
```

**Step 4: Update DownloadButton usage in client.tsx**

In `src/app/(app)/resume/[id]/client.tsx`, update both DownloadButton call sites.

Line 239 (expanded panel):
```tsx
// OLD:
<DownloadButton resumeId={resume.id} />
// NEW:
<DownloadButton resumeId={resume.id} fullName={resolvedPersonalInfo.fullName} company={resume.company} jobTitle={resume.jobTitle} />
```

Line 264 (collapsed toolbar):
```tsx
// OLD:
<DownloadButton resumeId={resume.id} iconOnly />
// NEW:
<DownloadButton resumeId={resume.id} fullName={resolvedPersonalInfo.fullName} company={resume.company} jobTitle={resume.jobTitle} iconOnly />
```

**Step 5: Run tests to verify they pass**

Run: `npx vitest run tests/unit/components/resume/DownloadButton.test.tsx`
Expected: All 6 tests PASS.

Run: `npx vitest run`
Expected: All tests pass (including existing ResumeViewClient tests — DownloadButton is rendered but its internal behavior is not tested there).

**Step 6: Commit**

```bash
git add src/components/resume/DownloadButton.tsx tests/unit/components/resume/DownloadButton.test.tsx src/app/(app)/resume/[id]/client.tsx
git commit -m "feat: add loading/error states and improved filename to download button"
```

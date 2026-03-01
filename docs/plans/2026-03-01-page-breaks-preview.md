# Page Breaks Preview — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Show page breaks in the resume preview by splitting the template output into separate paper-like page containers that match Puppeteer's automatic pagination.

**Architecture:** A `PagedPreview` wrapper component renders the template into a hidden measurement container, calculates how many 1056px pages are needed, then renders N visible page containers each showing a different slice of the content via overflow clipping and negative margin offsets.

**Tech Stack:** React (useRef, useEffect, useState), Tailwind CSS, Vitest + React Testing Library

---

## Task 1: Create PagedPreview component with tests

**Files:**
- Create: `src/components/resume/PagedPreview.tsx`
- Create: `tests/unit/components/resume/PagedPreview.test.tsx`

**Step 1: Write the failing test**

Create `tests/unit/components/resume/PagedPreview.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'

import PagedPreview from '@/components/resume/PagedPreview'

// Mock ResizeObserver which jsdom doesn't provide
class MockResizeObserver {
  callback: ResizeObserverCallback
  constructor(callback: ResizeObserverCallback) {
    this.callback = callback
  }
  observe(target: Element) {
    // Simulate observation with the element's scrollHeight
    this.callback(
      [{ target, contentRect: {} } as ResizeObserverEntry],
      this as unknown as ResizeObserver
    )
  }
  unobserve() {}
  disconnect() {}
}

beforeEach(() => {
  vi.stubGlobal('ResizeObserver', MockResizeObserver)
})

describe('PagedPreview', () => {
  it('renders children inside page containers', () => {
    render(
      <PagedPreview>
        <div data-testid="template-content">Resume content</div>
      </PagedPreview>
    )

    // The hidden measurement container should have the children
    expect(screen.getByTestId('template-content')).toBeInTheDocument()
  })

  it('renders at least one page container', () => {
    render(
      <PagedPreview>
        <div style={{ width: 816, minHeight: 1056 }}>Page 1 content</div>
      </PagedPreview>
    )

    expect(screen.getByTestId('paged-preview')).toBeInTheDocument()
    // Should have at least one page
    const pages = screen.getAllByTestId(/^page-\d+$/)
    expect(pages.length).toBeGreaterThanOrEqual(1)
  })

  it('shows page labels', () => {
    render(
      <PagedPreview>
        <div style={{ width: 816, minHeight: 1056 }}>Content</div>
      </PagedPreview>
    )

    // Should show at least "Page 1" label
    expect(screen.getByText(/page 1/i)).toBeInTheDocument()
  })
})
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/components/resume/PagedPreview.test.tsx`
Expected: FAIL — module `@/components/resume/PagedPreview` doesn't exist.

**Step 3: Write the implementation**

Create `src/components/resume/PagedPreview.tsx`:

```tsx
'use client'

import { useRef, useState, useEffect, type ReactNode } from 'react'

const PAGE_WIDTH = 816
const PAGE_HEIGHT = 1056

interface PagedPreviewProps {
  children: ReactNode
}

export default function PagedPreview({ children }: PagedPreviewProps) {
  const measureRef = useRef<HTMLDivElement>(null)
  const [pageCount, setPageCount] = useState(1)

  useEffect(() => {
    const el = measureRef.current
    if (!el) return

    function measure() {
      if (!el) return
      const height = el.scrollHeight
      setPageCount(Math.max(1, Math.ceil(height / PAGE_HEIGHT)))
    }

    measure()

    const observer = new ResizeObserver(measure)
    observer.observe(el)
    return () => observer.disconnect()
  }, [children])

  return (
    <div data-testid="paged-preview">
      {/* Hidden measurement container */}
      <div
        ref={measureRef}
        aria-hidden="true"
        style={{
          position: 'absolute',
          visibility: 'hidden',
          width: PAGE_WIDTH,
          overflow: 'hidden',
          pointerEvents: 'none',
        }}
      >
        {children}
      </div>

      {/* Visible pages */}
      <div className="flex flex-col items-center gap-8">
        {Array.from({ length: pageCount }, (_, i) => (
          <div key={i}>
            <div
              data-testid={`page-${i + 1}`}
              className="shadow-lg border border-gray-200 dark:border-gray-700 bg-white"
              style={{
                width: PAGE_WIDTH,
                height: PAGE_HEIGHT,
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              <div
                style={{
                  marginTop: -(i * PAGE_HEIGHT),
                }}
              >
                {children}
              </div>
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

**Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/components/resume/PagedPreview.test.tsx`
Expected: PASS — all 3 tests pass.

**Step 5: Commit**

```bash
git add src/components/resume/PagedPreview.tsx tests/unit/components/resume/PagedPreview.test.tsx
git commit -m "feat: add PagedPreview component for page break visualization"
```

---

## Task 2: Integrate PagedPreview into resume page

**Files:**
- Modify: `src/app/(app)/resume/[id]/client.tsx`
- Modify: `tests/unit/components/resume/ResumeViewClient.test.tsx`

**Step 1: Update client.tsx**

Add import at top of file:

```tsx
import PagedPreview from '@/components/resume/PagedPreview'
```

Replace the direct template render (line 118):

```tsx
<TemplateComponent resume={content} personalInfo={personalInfo ?? { fullName: '', email: '' }} />
```

With:

```tsx
<PagedPreview>
  <TemplateComponent resume={content} personalInfo={personalInfo ?? { fullName: '', email: '' }} />
</PagedPreview>
```

**Step 2: Update tests**

In `tests/unit/components/resume/ResumeViewClient.test.tsx`, add a ResizeObserver mock at the top (after the existing mocks, before the import of ResumeViewClient):

```tsx
// Mock ResizeObserver which jsdom doesn't provide
class MockResizeObserver {
  callback: ResizeObserverCallback
  constructor(callback: ResizeObserverCallback) {
    this.callback = callback
  }
  observe(target: Element) {
    this.callback(
      [{ target, contentRect: {} } as ResizeObserverEntry],
      this as unknown as ResizeObserver
    )
  }
  unobserve() {}
  disconnect() {}
}

beforeEach(() => {
  vi.stubGlobal('ResizeObserver', MockResizeObserver)
})
```

Add `beforeEach` import — update the existing vitest import:

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
```

Existing tests should continue to pass since the template components still render inside PagedPreview.

**Step 3: Run all tests**

Run: `npx vitest run`
Expected: All tests pass.

**Step 4: Commit**

```bash
git add src/app/\(app\)/resume/\[id\]/client.tsx tests/unit/components/resume/ResumeViewClient.test.tsx
git commit -m "feat: integrate PagedPreview into resume page"
```

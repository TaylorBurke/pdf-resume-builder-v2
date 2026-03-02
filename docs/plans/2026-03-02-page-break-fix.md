# Page Break Fix Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix page breaks so no section splits across pages (except Experience), individual entries never split, preview matches PDF, and bottom margins are respected.

**Architecture:** Replace blanket CSS `break-inside: avoid` with targeted rules using `data-section="experience"` selectors. Move page margins from `@page` CSS into template inline styles. Rewrite `PagedPreview` to detect natural page break points by measuring element positions in a hidden iframe instead of slicing at fixed 1056px intervals.

**Tech Stack:** CSS page break properties, React (iframe srcDoc), Puppeteer PDF generation.

---

### Task 1: Update CSS break rules in generator.ts

**Files:**
- Modify: `src/lib/pdf/generator.ts`

**Step 1: Update the CSS rules**

Replace lines 39-54 in `generator.ts` with:

```typescript
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Resume - ${escapeHtml(personalInfo.fullName)}</title>
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
    section { break-inside: avoid; }
    section[data-section="experience"] { break-inside: auto; }
    section[data-section="experience"] > div { break-inside: avoid; }
    aside > div { break-inside: avoid; }
    h2 { break-after: avoid; }
  </style>
</head>
<body>${markup}</body>
</html>`
```

Key changes:
- `@page { margin: 0 }` — remove all @page margins (margins now handled by template padding)
- Remove `@page :first` rule
- Remove `box-decoration-break` (no longer needed without @page margins)
- Add `section[data-section="experience"] { break-inside: auto }` — Experience can split
- Add `section[data-section="experience"] > div { break-inside: avoid }` — entries stay whole
- Keep `aside > div` and `h2` rules

Also remove the `pageMargin` variable and `margin` constant (lines 23-24) since @page margins are gone.

**Step 2: Verify the build compiles**

Run: `npx next build 2>&1 | head -30`
Expected: No errors related to generator.ts

**Step 3: Commit**

```
git add src/lib/pdf/generator.ts
git commit -m "fix: replace blanket break-inside with targeted page break rules"
```

---

### Task 2: Add data-section="experience" to all three templates

**Files:**
- Modify: `src/templates/clean/CleanTemplate.tsx`
- Modify: `src/templates/bold/BoldTemplate.tsx`
- Modify: `src/templates/executive/ExecutiveTemplate.tsx`

**Step 1: Update CleanTemplate**

In `CleanTemplate.tsx`, find the Experience section (around line 260):

```tsx
// Before:
<section style={styles.section}>

// After:
<section style={styles.section} data-section="experience">
```

Only on the Experience section — no other sections get this attribute.

**Step 2: Update BoldTemplate**

In `BoldTemplate.tsx`, find the Experience section (around line 435):

```tsx
// Before:
<section style={s.mainSection}>
  <h2 style={s.mainSectionTitle}>Experience</h2>

// After:
<section style={s.mainSection} data-section="experience">
  <h2 style={s.mainSectionTitle}>Experience</h2>
```

**Step 3: Update ExecutiveTemplate**

In `ExecutiveTemplate.tsx`, find the Experience section (around line 341):

```tsx
// Before:
<section style={s.card}>
  <h2 style={s.sectionTitle}>Professional Experience</h2>

// After:
<section style={s.card} data-section="experience">
  <h2 style={s.sectionTitle}>Professional Experience</h2>
```

**Step 4: Verify build**

Run: `npx next build 2>&1 | head -30`
Expected: No errors

**Step 5: Commit**

```
git add src/templates/clean/CleanTemplate.tsx src/templates/bold/BoldTemplate.tsx src/templates/executive/ExecutiveTemplate.tsx
git commit -m "feat: add data-section attribute to Experience sections for page break targeting"
```

---

### Task 3: Ensure template bottom padding is correct

**Files:**
- Modify: `src/templates/clean/CleanTemplate.tsx` (if needed)
- Modify: `src/templates/bold/BoldTemplate.tsx` (if needed)
- Modify: `src/templates/executive/ExecutiveTemplate.tsx` (if needed)

Since `@page` margins are now `0`, all spacing comes from template inline styles. Verify each template's root padding includes adequate bottom padding:

**Step 1: Check and fix Clean template**

Clean currently has `padding: '72px 72px 64px'` (top 72, left/right 72, bottom 64). This is fine — adequate bottom padding.

**Step 2: Check and fix Bold template**

Bold's `<main>` has `padding: '32px 24px'`. Bold's `<aside>` has `padding: '${spacing.xl}px ${spacing.lg}px'` which is `32px 24px`. Both have adequate bottom padding already.

**Step 3: Check and fix Executive template**

Executive's body has `padding: '24px 64px 32px'` (top 24, left/right 64, bottom 32). This is fine.

No changes expected here, but verify by visual inspection if needed.

**Step 4: Commit (only if changes were made)**

```
git add src/templates/
git commit -m "fix: ensure template bottom padding accounts for removed @page margins"
```

---

### Task 4: Rewrite PagedPreview with content-aware page breaks

**Files:**
- Modify: `src/components/resume/PagedPreview.tsx`

This is the main change. Replace the naive `pageIndex * PAGE_HEIGHT` slicing with measurement-based break detection.

**Step 1: Write the new PagedPreview component**

Replace the entire file with:

```tsx
'use client'

import { useRef, useState, useCallback } from 'react'

const PAGE_WIDTH = 816
const PAGE_HEIGHT = 1056

interface PagedPreviewProps {
  html: string
}

/**
 * Measure where natural page breaks occur by walking elements in a
 * hidden iframe. Sections with break-inside:avoid stay whole.
 * The experience section (data-section="experience") can break
 * between entries but never mid-entry.
 */
function computeBreakOffsets(doc: Document): number[] {
  const container = doc.querySelector('[data-page-root]') ?? doc.body.firstElementChild
  if (!container) return [0]

  const offsets: number[] = [0]
  let currentPageBottom = PAGE_HEIGHT

  const children = Array.from(container.children) as HTMLElement[]

  for (const child of children) {
    const top = child.offsetTop
    const bottom = top + child.offsetHeight

    if (bottom <= currentPageBottom) {
      // Fits on current page — continue
      continue
    }

    // Check if this is the Experience section that can split
    if (child.getAttribute('data-section') === 'experience') {
      // Walk entries inside Experience to find where to break
      const entries = Array.from(child.children) as HTMLElement[]
      for (const entry of entries) {
        const entryTop = entry.offsetTop
        const entryBottom = entryTop + entry.offsetHeight

        if (entryBottom > currentPageBottom && entryTop < currentPageBottom) {
          // This entry would be split — break before it
          offsets.push(entryTop)
          currentPageBottom = entryTop + PAGE_HEIGHT
        } else if (entryTop >= currentPageBottom) {
          // Entry starts beyond current page — break at the page boundary
          offsets.push(entryTop)
          currentPageBottom = entryTop + PAGE_HEIGHT
        }
        // Advance currentPageBottom if entry extends past it
        while (entryBottom > currentPageBottom) {
          // Entry is somehow taller than a page (shouldn't happen but be safe)
          currentPageBottom += PAGE_HEIGHT
        }
      }
    } else {
      // Section doesn't fit and can't split — move it to next page
      offsets.push(top)
      currentPageBottom = top + PAGE_HEIGHT

      // If section is taller than a page, advance past it
      while (bottom > currentPageBottom) {
        currentPageBottom += PAGE_HEIGHT
      }
    }
  }

  return offsets
}

export default function PagedPreview({ html }: PagedPreviewProps) {
  const measureRef = useRef<HTMLIFrameElement>(null)
  const [breakOffsets, setBreakOffsets] = useState<number[]>([0])

  const handleMeasureLoad = useCallback(() => {
    const iframe = measureRef.current
    const doc = iframe?.contentDocument
    if (!doc?.body) return

    const offsets = computeBreakOffsets(doc)
    setBreakOffsets(offsets)
  }, [])

  if (!html) {
    return (
      <div data-testid="paged-preview" className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">Generating preview...</p>
      </div>
    )
  }

  // Add data-page-root to the body's first child for measurement
  const measurableHtml = html.replace(
    /<body>([\s\S]*?)<div /,
    '<body>$1<div data-page-root '
  )

  const pageCount = breakOffsets.length

  return (
    <div data-testid="paged-preview">
      {/* Hidden measurement iframe */}
      <iframe
        ref={measureRef}
        srcDoc={measurableHtml}
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
                background: 'white',
              }}
            >
              <iframe
                data-testid={`page-${i + 1}`}
                srcDoc={getPageHtml(html, breakOffsets[i])}
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

/**
 * Offset the body content so the iframe shows content starting at the
 * given pixel offset.
 */
function getPageHtml(baseHtml: string, offset: number): string {
  if (offset === 0) return baseHtml
  return baseHtml.replace('<body>', `<body style="margin-top: -${offset}px;">`)
}
```

**Step 2: Verify build**

Run: `npx next build 2>&1 | head -30`
Expected: No errors

**Step 3: Manual test**

Run `npm run dev`, navigate to a resume with enough content to span 2 pages. Verify:
- Page breaks occur between sections (not mid-section)
- Experience section, if long enough, breaks between entries (not mid-entry)
- Preview pages match the downloaded PDF layout

**Step 4: Commit**

```
git add src/components/resume/PagedPreview.tsx
git commit -m "feat: content-aware page break detection in preview

Replace naive fixed-height page slicing with measurement-based break
detection. Walks elements in a hidden iframe to find natural break
points, keeping sections whole and only splitting Experience between
individual entries."
```

---

### Task 5: End-to-end verification

**Step 1: Run build**

Run: `npx next build`
Expected: Clean build, no errors

**Step 2: Run tests**

Run: `npm test`
Expected: All tests pass (or no tests exist yet)

**Step 3: Manual verification**

Start dev server (`npm run dev`) and test each template with a resume that has enough content to overflow one page:

1. **Clean template** — verify sections don't split, Experience entries don't split, bottom of page 1 has proper spacing
2. **Bold template** — verify sidebar extends, sections don't split, Experience entries don't split
3. **Executive template** — verify card sections don't split, Experience entries don't split

For each template:
- Compare preview layout to downloaded PDF
- Verify bottom margins on page 1 look correct
- Verify page 2 starts cleanly (no cut-off content at top)

**Step 4: Deploy and verify on Vercel**

Run: `npx vercel --prod`
Test PDF download on deployed site.

**Step 5: Final commit (if any fixes needed)**

```
git add -A
git commit -m "fix: final page break adjustments after e2e testing"
```

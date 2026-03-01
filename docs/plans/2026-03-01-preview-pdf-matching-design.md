# Preview-PDF Matching & Smart Page Breaks — Design

**Date:** 2026-03-01

## Problems

1. **Preview doesn't match PDF:** The preview renders template React components inside the app where Tailwind's preflight CSS (normalize, resets, default margins/line-heights) bleeds into templates. The PDF renders from a clean HTML document via `renderResumeToHtml()` with only `* { box-sizing: border-box }` and a body reset. This causes visual differences.

2. **Content cut off mid-element:** Neither the PDF nor the preview has smart page break rules. Experience entries, education blocks, etc. get sliced in half at the 1056px page boundary.

## Solution

### Smart page break CSS

Add CSS break rules to the `<style>` block in `renderResumeToHtml()`:

```css
section > div, aside > div > div { break-inside: avoid; }
h2 { break-after: avoid; }
```

This prevents splitting individual entry divs across pages and keeps section headings with their first entry. Both Puppeteer and browser rendering engines respect these CSS properties.

### iframe-based preview

Replace the current PagedPreview approach (rendering React children with overflow clipping) with iframe-based rendering that uses the exact same HTML as the PDF.

**Server action:** `getPreviewHtml(resumeId)` calls `renderResumeToHtml()` and returns the HTML string.

**PagedPreview rewrite:**
1. Receives `html` string prop (instead of `children`)
2. Renders one hidden iframe (`srcdoc={html}`) for height measurement
3. On iframe load, reads `contentDocument.body.scrollHeight` to calculate `pageCount`
4. Renders `pageCount` visible iframes, each:
   - Same `srcdoc={html}`, fixed at 816x1056, `overflow: hidden`, `scrolling="no"`
   - On load, scrolls to `i * PAGE_HEIGHT` via `contentWindow.scrollTo(0, i * 1056)`
5. Page labels below each iframe ("Page X of Y")

**Result:** Preview and PDF are pixel-identical — same HTML, same CSS, same rendering engine. Smart breaks work in both because the same CSS rules apply.

### Integration changes

`client.tsx` calls `getPreviewHtml()` when content or templateId changes, passes the HTML string to `<PagedPreview html={html} />` instead of wrapping template children.

## Components

1. **Modify:** `src/lib/pdf/generator.ts` — add `break-inside: avoid` CSS rules
2. **New:** `src/actions/preview.ts` — server action `getPreviewHtml()`
3. **Rewrite:** `src/components/resume/PagedPreview.tsx` — iframe-based with html prop
4. **Modify:** `src/app/(app)/resume/[id]/client.tsx` — call getPreviewHtml, pass html to PagedPreview
5. **Update:** tests for PagedPreview and ResumeViewClient

## Out of Scope

- Per-template break customization (CSS rules are generic, apply to all templates)
- Print stylesheet for browser print (only Puppeteer PDF and iframe preview)

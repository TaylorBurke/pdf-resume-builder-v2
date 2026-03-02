# Page Break Fix — Design

## Problem

Three issues with PDF page breaks:

1. **Content breaking on overflow** — sections split mid-content across pages
2. **Preview/PDF mismatch** — preview slices at fixed 1056px intervals ignoring break rules; PDF engine honors CSS break rules
3. **Bottom margins not respected** — `@page` margins conflict with Puppeteer's rendering

## Rules

- No section should split across pages, except Experience
- Experience may span multiple pages but individual entries must never split
- Preview must show the same layout as the downloaded PDF

## Approach

### 1. CSS Page Break Rules

Replace blanket `section { break-inside: avoid }` with targeted rules:

- All `<section>` elements: `break-inside: avoid` (keep whole)
- `section[data-section="experience"]`: `break-inside: auto` (allowed to split)
- `section[data-section="experience"] > div`: `break-inside: avoid` (entries stay whole)
- `aside > div`: `break-inside: avoid` (sidebar sections stay whole)
- `h2`: `break-after: avoid` (headings stick with content)

Templates add `data-section="experience"` to their Experience `<section>`.

### 2. Move Margins from @page to Inline Styles

Remove `@page` margins entirely (`margin: 0`). Templates already have padding on their root containers. Ensure bottom padding is correct. This eliminates the `@page` vs inline style conflict and makes both preview and PDF see identical spacing.

### 3. Content-Aware Preview Slicing

Replace naive `pageIndex * PAGE_HEIGHT` slicing in `PagedPreview` with:

1. Walk top-level children of the page container in hidden iframe
2. Track cumulative height; break when next child exceeds page boundary
3. For Experience section: walk its children to find entry-level break points
4. Store break offsets array and use per-page `margin-top` accordingly

## Files Changed

| File | Change |
|------|--------|
| `src/lib/pdf/generator.ts` | New CSS break rules, remove `@page` margins |
| `src/components/resume/PagedPreview.tsx` | Content-aware page break detection |
| `src/templates/clean/CleanTemplate.tsx` | Add `data-section="experience"` |
| `src/templates/bold/BoldTemplate.tsx` | Add `data-section="experience"` |
| `src/templates/executive/ExecutiveTemplate.tsx` | Add `data-section="experience"` |

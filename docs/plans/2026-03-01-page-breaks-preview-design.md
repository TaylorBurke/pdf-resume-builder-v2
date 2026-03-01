# Page Breaks in Preview — Design

**Date:** 2026-03-01
**Issue:** #8

## Problem

The resume preview renders as one continuous element with no indication of where PDF page breaks will occur. Users need to see exactly where pages split so they can adjust content accordingly.

## Solution

Create a `PagedPreview` wrapper component that slices the template output into separate paper-like page containers, matching Puppeteer's automatic pagination at fixed 1056px (US Letter height at 96dpi) intervals.

## How It Works

1. Render the template into a hidden measurement container (`visibility: hidden; position: absolute`) using a `ref` to read its natural height
2. Calculate `pageCount = Math.ceil(measuredHeight / PAGE_HEIGHT)`
3. Render `pageCount` visible page containers, each:
   - Fixed at 816x1056px with `overflow: hidden`
   - Contains the template content offset by `-i * PAGE_HEIGHT` using negative `marginTop`
   - Styled with shadow and border to look like paper sheets
   - Separated by 32px vertical gap
4. Page number label below each page (e.g., "Page 1 of 2")

## Constants

- `PAGE_WIDTH = 816` — US Letter width at 96dpi
- `PAGE_HEIGHT = 1056` — US Letter height at 96dpi

These match the template `width` and `minHeight` values, and Puppeteer's zero-margin Letter format.

## Integration

In `client.tsx`, replace the direct `<TemplateComponent>` render with `<PagedPreview>` wrapping it.

## Styling

- Each page: `shadow-lg`, light border, rounded corners — paper look
- Dark mode: slightly lighter background behind pages for depth contrast
- 32px gap between pages
- Page labels: small muted text centered below each page

## Components

- **New:** `src/components/resume/PagedPreview.tsx`
- **Modified:** `src/app/(app)/resume/[id]/client.tsx` — use PagedPreview
- **Tests:** `tests/unit/components/resume/PagedPreview.test.tsx`

## Out of Scope

- Smart page breaks (avoiding splitting entries mid-line) — this mirrors Puppeteer's dumb pagination exactly
- Template changes — no template modifications needed

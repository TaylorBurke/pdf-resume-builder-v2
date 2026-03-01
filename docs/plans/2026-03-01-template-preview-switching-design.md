# Template Preview Switching — Design

**Issue:** #5 — Template switching should update the preview
**Date:** 2026-03-01

## Problem

ResumePreview renders a hardcoded generic layout that ignores `templateId`. Switching templates updates the database but the preview doesn't change. Users see a different layout in the preview than what appears in the downloaded PDF.

## Solution

Replace `<ResumePreview>` with the actual template component (`TEMPLATES[templateId].component`) so the preview matches the PDF output exactly. Add a responsive sliding drawer for controls on narrow screens.

## Changes

### 1. `src/app/(app)/resume/[id]/client.tsx`

- Import `TEMPLATES` from `@/templates`
- Render `TEMPLATES[templateId].component` with `{ resume, personalInfo }` props instead of `<ResumePreview>`
- Template renders at full size (816x1056px) in normal page flow
- Default to `'clean'` template on initial load
- Optimistic update: `setTemplateId` fires immediately, server action runs in background

### 2. Responsive drawer for sidebar controls

- `lg:` and above: sidebar stays as grid column (current layout)
- Below `lg:`: sidebar content moves into a slide-over drawer
  - Floating toggle button to open
  - Drawer slides over the preview with semi-transparent backdrop
  - Close button inside drawer
  - Contains: TemplateSelector, FeedbackForm, DownloadButton, feedback history

### 3. Delete `src/components/resume/ResumePreview.tsx`

No longer used — the actual template components replace it entirely.

## Behavior

1. Page loads → `templateId` defaults to `'clean'` → CleanTemplate renders
2. User clicks Bold → state updates → BoldTemplate renders immediately → DB updates in background
3. On narrow screens, controls live in a drawer that opens/closes over the preview

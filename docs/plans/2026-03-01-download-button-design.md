# Download Button Improvements — Design

**Date:** 2026-03-01

## Problem

The download button is a plain `<a download>` link with no loading feedback. PDF generation involves server-side Puppeteer rendering which takes several seconds. Users get no visual indication anything is happening. The filename only includes the user's name, not the company or job title.

## Solution

### 1. Loading Indicator

Convert from `<a>` to `<button>` with `fetch()`-based download. This gives full control over loading state.

- **Loading:** Spinner SVG replaces download icon. Text changes to "Downloading..." (full mode) or just spinner (icon-only mode). Button disabled.
- **Success:** Spinner disappears, download icon returns.
- **Error:** Brief red error icon for 2 seconds, then resets to idle.

### 2. Downloads Folder

No code changes needed. The existing `download` attribute + `Content-Disposition: attachment` already downloads to the user's default folder. Whether a "Save As" dialog appears is a browser-level setting we can't control from code.

### 3. Filename Format

Change from `Resume-{fullName}.pdf` to `{fullName}-{company}-{title}.pdf`. Sanitize all segments (replace non-alphanumeric with underscores, collapse runs). Apply on both server (`Content-Disposition`) and client (`download` attribute on programmatic `<a>`).

## Components

- **Modify:** `src/components/resume/DownloadButton.tsx` — Convert to `<button>` with fetch-based download, loading/error states, accept `company` and `jobTitle` props
- **Modify:** `src/app/api/pdf/[id]/route.ts` — Update filename to include company and title
- **Modify:** `src/app/(app)/resume/[id]/client.tsx` — Pass `company` and `jobTitle` to DownloadButton

## Data Flow

```
Click → loading state → fetch(/api/pdf/{id}) → blob
  → create temp <a href=blobUrl download="Name-Company-Title.pdf">
  → click() → revokeObjectURL → idle state
```

On fetch error → error state (2s) → idle state.

## Out of Scope

- Progress bar for download percentage
- Toast notifications
- Changing browser "Save As" dialog behavior

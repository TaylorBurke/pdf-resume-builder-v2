# Panel Improvements — Design

**Date:** 2026-03-01

## Problem

The drawer panel starts closed and overlays the preview with a dark backdrop when opened. Users must click "Customize" to access any controls. There's no quick-access toolbar for common actions (download, template switching) and the opaque panel completely hides the resume preview.

## Solution

Replace the overlay drawer with a side-by-side push layout. The panel starts open by default. When collapsed, it shrinks to a narrow icon toolbar with download and template-switching buttons. Text inputs use frosted glass styling so the resume peeks through. Collapse/expand transitions smoothly.

## Layout

Flex container: preview on the left, panel on the right.

- **Open (default):** Panel is ~320px wide. Preview fills remaining width.
- **Collapsed:** Panel shrinks to ~48px icon toolbar. Preview expands to fill freed space.
- **Transition:** `transition-all duration-300 ease-in-out` on the panel width change.

## Collapsed Toolbar

Vertical strip of icon buttons, top to bottom:

1. **Expand caret** (chevron-left) — prominent, at the top. Clicking anywhere on the toolbar that isn't another button also expands.
2. **Download** icon button
3. **Visual separator** (thin horizontal line)
4. **3 template icons** — Clean (single-column), Bold (two-column), Executive (header-block). Active template highlighted blue. Clicking switches template immediately via existing `handleTemplateChange`.

## Expanded Panel

- **Collapse caret** (chevron-right) replaces the X close button in the header.
- **Edit / Customize tabs** unchanged.
- **Download button** stays above tabs, always visible.
- **Frosted glass inputs** — all `<input>` and `<textarea>` get `backdrop-filter: blur(8px)` with semi-transparent background (`bg-white/70 dark:bg-gray-800/70`).

## Components

- **Modify:** `src/app/(app)/resume/[id]/client.tsx` — replace overlay drawer with flex push layout, collapsed/expanded state (default: expanded), remove backdrop overlay, add collapsed toolbar
- **Modify:** `src/components/resume/FeedbackForm.tsx` — frosted glass classes on textarea
- **Modify:** `src/components/resume/SectionEditor.tsx` — frosted glass classes on shared `inputClass`

No new components. Collapsed toolbar rendered inline in `client.tsx`.

## Data Flow

No changes. Same `handleTemplateChange`, `handleContentSave`, `handleFeedbackSubmit`. Collapsed toolbar template icons call existing `handleTemplateChange`.

## Out of Scope

- Responsive/mobile breakpoint behavior
- Custom template preview thumbnails
- Drag-to-resize panel width

# Inline Section Editing — Design

**Date:** 2026-03-01

## Problem

Users can only modify their resume content by submitting AI feedback and regenerating the entire resume. There's no way to directly edit a bullet point, fix a typo, or adjust a skill without going through the AI regeneration flow.

## Solution

Add section-level edit forms inside the existing drawer overlay. The drawer gets two tabs (Edit and Customize). The Edit tab shows collapsible accordions for each section present in the resume. Each accordion expands to reveal a form matching that section's data shape. A Save button per section persists changes and refreshes the preview.

## Drawer Layout

Two tabs at the top of the drawer: **Edit** (default) and **Customize**.

- **Edit tab**: Accordion list of sections present in the resume. Only one section expanded at a time. Each has a Save button.
- **Customize tab**: Existing template selector, feedback form, and feedback history (unchanged).
- **Download button**: Stays above the tabs, always visible.

## Section Edit Forms

Each form matches the `ResumeContent` type structure:

| Section | Fields |
|---------|--------|
| Summary | Single textarea |
| Experience | List of entries: company (input), title (input), dates (input), bullets (dynamic textarea list with add/remove) |
| Skills | List of groups: name (input), items (dynamic input list with add/remove) |
| Education | List of entries: school, degree, field, graduationDate (all inputs) |
| Projects | List of entries: name, description, techStack (comma-separated), highlights (dynamic list) |
| Certificates | List of entries: name, issuer, date |
| Languages | List of entries: language, proficiency |
| Awards | List of entries: name, issuer, date, description |
| IP | List of entries: type, title, description, url, date |
| Volunteer | List of entries: organization, role, description |
| Interests | Dynamic list of text inputs |

Only sections that exist in the generated `ResumeContent` appear. We do not support adding new sections.

## Server Action

New `updateResumeContent(resumeId: string, resumeContent: ResumeContent)` in `src/actions/generation.ts`:
- Validates user owns the resume
- Writes the full updated `resumeContent` JSON to DB
- Returns the updated content

The client patches the edited section into the full `ResumeContent` object and sends the whole thing. No server-side merge logic needed.

## Data Flow

1. User opens drawer → Edit tab shows section accordions
2. User clicks section name → accordion expands, form pre-fills from `content` state
3. User edits fields → local form state only
4. User clicks Save → `updateResumeContent()` persists → client `content` state updates → `useEffect` triggers `getPreviewHtml` → preview refreshes

## Components

1. **New:** `src/components/resume/SectionEditor.tsx` — Accordion list of section edit forms
2. **New:** `src/components/resume/editors/*.tsx` — Individual section form components (SummaryEditor, ExperienceEditor, SkillsEditor, etc.)
3. **Modify:** `src/app/(app)/resume/[id]/client.tsx` — Add tabs to drawer, render SectionEditor in Edit tab
4. **Modify:** `src/actions/generation.ts` — Add `updateResumeContent` server action

## Out of Scope

- Adding new sections not present in the generated resume
- Drag-and-drop reordering of entries within a section
- Real-time preview updates while typing (only on save)
- Undo/redo history

# Inline Section Editing — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Allow users to edit individual resume sections directly in the drawer, with a Save button per section that persists changes and refreshes the preview.

**Architecture:** Add a tabbed interface (Edit / Customize) to the drawer. The Edit tab shows collapsible accordions for each section present in the resume. Each accordion contains a form matching the section's data shape. A new `updateResumeContent` server action saves the full ResumeContent. The client patches the edited section into the existing content and sends the whole object.

**Tech Stack:** React, Next.js Server Actions, Vitest, React Testing Library

---

## Task 1: Add `updateResumeContent` server action

**Files:**
- Modify: `src/actions/generation.ts`
- Test: `tests/unit/actions/generation.test.ts`

**Step 1: Add the server action**

In `src/actions/generation.ts`, add after the existing `updateResumeTemplate` function:

```ts
export async function updateResumeContent(resumeId: string, resumeContent: ResumeContent) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Not authenticated')
  await db
    .update(resumes)
    .set({ resumeContent: JSON.stringify(resumeContent), updatedAt: new Date().toISOString() })
    .where(and(eq(resumes.id, resumeId), eq(resumes.userId, session.user.id)))
  return { resumeContent }
}
```

You will also need to add `ResumeContent` to the type imports at the top of the file. Check the existing imports — they currently import from `@/types`. Add `ResumeContent` to that import.

**Step 2: Run all tests**

Run: `npx vitest run`
Expected: All tests pass (existing tests still work, no new test needed for a thin DB wrapper).

**Step 3: Commit**

```bash
git add src/actions/generation.ts
git commit -m "feat: add updateResumeContent server action"
```

---

## Task 2: Add tabs to the drawer in client.tsx

**Files:**
- Modify: `src/app/(app)/resume/[id]/client.tsx`
- Modify: `tests/unit/components/resume/ResumeViewClient.test.tsx`

**Step 1: Add tab state and tabbed UI**

In `client.tsx`, add a `drawerTab` state:

```tsx
const [drawerTab, setDrawerTab] = useState<'edit' | 'customize'>('edit')
```

Replace the drawer header and content area. The drawer header gets the title replaced with two tab buttons. The content area conditionally renders based on `drawerTab`:

Replace the drawer header section (the div with "Customize" h2 and close button):

```tsx
<div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
  <div className="flex gap-1">
    <button
      type="button"
      onClick={() => setDrawerTab('edit')}
      className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
        drawerTab === 'edit'
          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
          : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
      }`}
    >
      Edit
    </button>
    <button
      type="button"
      onClick={() => setDrawerTab('customize')}
      className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
        drawerTab === 'customize'
          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
          : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
      }`}
    >
      Customize
    </button>
  </div>
  <button
    type="button"
    onClick={() => setDrawerOpen(false)}
    aria-label="Close"
    className="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 rounded-lg"
  >
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  </button>
</div>
```

Replace the drawer content area:

```tsx
<div className="p-4 space-y-6 overflow-y-auto h-[calc(100%-65px)]">
  <DownloadButton resumeId={resume.id} />
  {drawerTab === 'edit' ? (
    <p className="text-sm text-gray-500 dark:text-gray-400">Section editors coming soon...</p>
  ) : (
    sidebarContent
  )}
</div>
```

**Step 2: Update tests**

In `tests/unit/components/resume/ResumeViewClient.test.tsx`, update the drawer test that checks for "Customize" heading — it's now a tab button, not an h2. Add a test that verifies both tabs render and switching works:

```tsx
it('renders Edit and Customize tabs in drawer', async () => {
  const user = userEvent.setup()
  render(
    <ResumeViewClient resume={mockResume} personalInfo={mockPersonalInfo} />
  )
  await user.click(screen.getByRole('button', { name: /customize/i }))
  // Drawer is now open, both tabs visible
  expect(screen.getByRole('button', { name: /^edit$/i })).toBeInTheDocument()
  // "Customize" button exists as both the toggle and the tab — use getAllByRole
  const customizeButtons = screen.getAllByRole('button', { name: /customize/i })
  expect(customizeButtons.length).toBeGreaterThanOrEqual(2)
})
```

Note: The "Customize" button on the page header opens the drawer, and there's also a "Customize" tab inside the drawer. The test accounts for both.

**Step 3: Run all tests**

Run: `npx vitest run`
Expected: All tests pass.

**Step 4: Commit**

```bash
git add src/app/\(app\)/resume/\[id\]/client.tsx tests/unit/components/resume/ResumeViewClient.test.tsx
git commit -m "feat: add Edit/Customize tabs to drawer"
```

---

## Task 3: Create SectionEditor component with accordion UI

**Files:**
- Create: `src/components/resume/SectionEditor.tsx`
- Create: `tests/unit/components/resume/SectionEditor.test.tsx`

**Step 1: Write the test**

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SectionEditor from '@/components/resume/SectionEditor'
import type { ResumeContent } from '@/types'

const mockContent: ResumeContent = {
  summary: 'Test summary',
  experience: [{ company: 'Acme', title: 'Engineer', dates: '2020-2023', bullets: ['Built stuff'] }],
  skills: [{ name: 'Frontend', items: ['React', 'TypeScript'] }],
}

describe('SectionEditor', () => {
  it('renders section names for sections present in content', () => {
    render(<SectionEditor content={mockContent} onSave={vi.fn()} isSaving={false} />)
    expect(screen.getByRole('button', { name: /summary/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /experience/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /skills/i })).toBeInTheDocument()
  })

  it('does not render sections not present in content', () => {
    render(<SectionEditor content={mockContent} onSave={vi.fn()} isSaving={false} />)
    expect(screen.queryByRole('button', { name: /education/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /projects/i })).not.toBeInTheDocument()
  })

  it('expands a section when clicked', async () => {
    const user = userEvent.setup()
    render(<SectionEditor content={mockContent} onSave={vi.fn()} isSaving={false} />)
    await user.click(screen.getByRole('button', { name: /summary/i }))
    // Summary editor should show a textarea with the summary text
    expect(screen.getByDisplayValue('Test summary')).toBeInTheDocument()
  })

  it('collapses the open section when another is clicked', async () => {
    const user = userEvent.setup()
    render(<SectionEditor content={mockContent} onSave={vi.fn()} isSaving={false} />)
    await user.click(screen.getByRole('button', { name: /summary/i }))
    expect(screen.getByDisplayValue('Test summary')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /experience/i }))
    expect(screen.queryByDisplayValue('Test summary')).not.toBeInTheDocument()
  })

  it('calls onSave with updated content when Save is clicked', async () => {
    const onSave = vi.fn()
    const user = userEvent.setup()
    render(<SectionEditor content={mockContent} onSave={onSave} isSaving={false} />)
    await user.click(screen.getByRole('button', { name: /summary/i }))
    const textarea = screen.getByDisplayValue('Test summary')
    await user.clear(textarea)
    await user.type(textarea, 'Updated summary')
    await user.click(screen.getByRole('button', { name: /save/i }))
    expect(onSave).toHaveBeenCalledWith({ ...mockContent, summary: 'Updated summary' })
  })
})
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/components/resume/SectionEditor.test.tsx`
Expected: FAIL — module not found.

**Step 3: Create the component**

Create `src/components/resume/SectionEditor.tsx`:

```tsx
'use client'

import { useState } from 'react'
import type { ResumeContent } from '@/types'

interface SectionEditorProps {
  content: ResumeContent
  onSave: (updated: ResumeContent) => void
  isSaving: boolean
}

type SectionKey = keyof ResumeContent

const SECTION_LABELS: Record<string, string> = {
  summary: 'Summary',
  experience: 'Experience',
  skills: 'Skills',
  education: 'Education',
  projects: 'Projects',
  certificates: 'Certificates',
  languages: 'Languages',
  awards: 'Awards',
  ip: 'Intellectual Property',
  volunteer: 'Volunteer',
  interests: 'Interests',
}

const SECTION_ORDER: SectionKey[] = [
  'summary', 'experience', 'skills', 'education', 'projects',
  'certificates', 'languages', 'awards', 'ip', 'volunteer', 'interests',
]

export default function SectionEditor({ content, onSave, isSaving }: SectionEditorProps) {
  const [openSection, setOpenSection] = useState<SectionKey | null>(null)
  const [editState, setEditState] = useState<ResumeContent>(content)

  // Reset edit state when content changes externally (e.g. after AI regeneration)
  const contentKey = JSON.stringify(content)
  useState(() => { setEditState(content) })

  const presentSections = SECTION_ORDER.filter((key) => {
    const val = content[key]
    if (val === undefined || val === null) return false
    if (Array.isArray(val) && val.length === 0) return false
    if (typeof val === 'string' && val.trim() === '') return false
    return true
  })

  function handleToggle(key: SectionKey) {
    if (openSection === key) {
      setOpenSection(null)
    } else {
      setEditState(content) // reset edits when switching sections
      setOpenSection(key)
    }
  }

  function handleSave() {
    onSave(editState)
    setOpenSection(null)
  }

  function updateField<K extends SectionKey>(key: K, value: ResumeContent[K]) {
    setEditState((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div className="space-y-1">
      {presentSections.map((key) => (
        <div key={key} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          <button
            type="button"
            onClick={() => handleToggle(key)}
            className="w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            {SECTION_LABELS[key] || key}
            <svg
              className={`w-4 h-4 text-gray-400 transition-transform ${openSection === key ? 'rotate-180' : ''}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {openSection === key && (
            <div className="px-3 pb-3 space-y-3">
              {renderEditor(key, editState, updateField)}
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="w-full py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function renderEditor(
  key: SectionKey,
  state: ResumeContent,
  update: <K extends SectionKey>(key: K, value: ResumeContent[K]) => void
) {
  switch (key) {
    case 'summary':
      return (
        <textarea
          value={state.summary}
          onChange={(e) => update('summary', e.target.value)}
          rows={4}
          className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-800 dark:text-gray-100"
        />
      )
    case 'experience':
      return <ExperienceEditor entries={state.experience} onChange={(v) => update('experience', v)} />
    case 'skills':
      return <SkillsEditor groups={state.skills} onChange={(v) => update('skills', v)} />
    case 'education':
      return <EducationEditor entries={state.education ?? []} onChange={(v) => update('education', v)} />
    case 'projects':
      return <ProjectsEditor entries={state.projects ?? []} onChange={(v) => update('projects', v)} />
    case 'certificates':
      return <SimpleListEditor
        entries={state.certificates ?? []}
        fields={['name', 'issuer', 'date']}
        onChange={(v) => update('certificates', v)}
      />
    case 'languages':
      return <SimpleListEditor
        entries={state.languages ?? []}
        fields={['language', 'proficiency']}
        onChange={(v) => update('languages', v)}
      />
    case 'awards':
      return <SimpleListEditor
        entries={state.awards ?? []}
        fields={['name', 'issuer', 'date', 'description']}
        onChange={(v) => update('awards', v)}
      />
    case 'ip':
      return <SimpleListEditor
        entries={state.ip ?? []}
        fields={['type', 'title', 'description', 'url', 'date']}
        onChange={(v) => update('ip', v)}
      />
    case 'volunteer':
      return <SimpleListEditor
        entries={state.volunteer ?? []}
        fields={['organization', 'role', 'description']}
        onChange={(v) => update('volunteer', v)}
      />
    case 'interests':
      return <InterestsEditor items={state.interests ?? []} onChange={(v) => update('interests', v)} />
    default:
      return null
  }
}

// ── Sub-editors ──────────────────────────────────────────────────────────

const inputClass = 'w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-800 dark:text-gray-100'
const labelClass = 'block text-xs font-medium text-gray-500 dark:text-gray-400 mb-0.5'

function ExperienceEditor({
  entries,
  onChange,
}: {
  entries: ResumeContent['experience']
  onChange: (v: ResumeContent['experience']) => void
}) {
  function updateEntry(index: number, field: string, value: string | string[]) {
    const updated = entries.map((e, i) => (i === index ? { ...e, [field]: value } : e))
    onChange(updated)
  }
  function updateBullet(entryIndex: number, bulletIndex: number, value: string) {
    const updated = entries.map((e, i) =>
      i === entryIndex ? { ...e, bullets: e.bullets.map((b, j) => (j === bulletIndex ? value : b)) } : e
    )
    onChange(updated)
  }
  function addBullet(entryIndex: number) {
    const updated = entries.map((e, i) =>
      i === entryIndex ? { ...e, bullets: [...e.bullets, ''] } : e
    )
    onChange(updated)
  }
  function removeBullet(entryIndex: number, bulletIndex: number) {
    const updated = entries.map((e, i) =>
      i === entryIndex ? { ...e, bullets: e.bullets.filter((_, j) => j !== bulletIndex) } : e
    )
    onChange(updated)
  }

  return (
    <div className="space-y-4">
      {entries.map((entry, i) => (
        <div key={i} className="border-t border-gray-100 dark:border-gray-700 pt-3 first:border-0 first:pt-0">
          <label className={labelClass}>Company</label>
          <input className={inputClass} value={entry.company} onChange={(e) => updateEntry(i, 'company', e.target.value)} />
          <label className={`${labelClass} mt-2`}>Title</label>
          <input className={inputClass} value={entry.title} onChange={(e) => updateEntry(i, 'title', e.target.value)} />
          <label className={`${labelClass} mt-2`}>Dates</label>
          <input className={inputClass} value={entry.dates} onChange={(e) => updateEntry(i, 'dates', e.target.value)} />
          <label className={`${labelClass} mt-2`}>Bullets</label>
          {entry.bullets.map((bullet, j) => (
            <div key={j} className="flex gap-1 mt-1">
              <textarea
                className={`${inputClass} flex-1`}
                value={bullet}
                onChange={(e) => updateBullet(i, j, e.target.value)}
                rows={2}
              />
              <button
                type="button"
                onClick={() => removeBullet(i, j)}
                className="px-2 text-red-500 hover:text-red-700 text-xs"
                aria-label="Remove bullet"
              >
                &times;
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => addBullet(i)}
            className="mt-1 text-xs text-blue-600 dark:text-blue-400 hover:underline"
          >
            + Add bullet
          </button>
        </div>
      ))}
    </div>
  )
}

function SkillsEditor({
  groups,
  onChange,
}: {
  groups: ResumeContent['skills']
  onChange: (v: ResumeContent['skills']) => void
}) {
  function updateGroup(index: number, field: string, value: string | string[]) {
    const updated = groups.map((g, i) => (i === index ? { ...g, [field]: value } : g))
    onChange(updated)
  }

  return (
    <div className="space-y-3">
      {groups.map((group, i) => (
        <div key={i} className="border-t border-gray-100 dark:border-gray-700 pt-3 first:border-0 first:pt-0">
          <label className={labelClass}>Category</label>
          <input className={inputClass} value={group.name} onChange={(e) => updateGroup(i, 'name', e.target.value)} />
          <label className={`${labelClass} mt-2`}>Skills (comma-separated)</label>
          <input
            className={inputClass}
            value={group.items.join(', ')}
            onChange={(e) => updateGroup(i, 'items', e.target.value.split(',').map((s) => s.trim()).filter(Boolean))}
          />
        </div>
      ))}
    </div>
  )
}

function EducationEditor({
  entries,
  onChange,
}: {
  entries: NonNullable<ResumeContent['education']>
  onChange: (v: NonNullable<ResumeContent['education']>) => void
}) {
  function updateEntry(index: number, field: string, value: string) {
    const updated = entries.map((e, i) => (i === index ? { ...e, [field]: value } : e))
    onChange(updated)
  }

  return (
    <div className="space-y-3">
      {entries.map((entry, i) => (
        <div key={i} className="border-t border-gray-100 dark:border-gray-700 pt-3 first:border-0 first:pt-0">
          <label className={labelClass}>School</label>
          <input className={inputClass} value={entry.school} onChange={(e) => updateEntry(i, 'school', e.target.value)} />
          <label className={`${labelClass} mt-2`}>Degree</label>
          <input className={inputClass} value={entry.degree} onChange={(e) => updateEntry(i, 'degree', e.target.value)} />
          <label className={`${labelClass} mt-2`}>Field</label>
          <input className={inputClass} value={entry.field ?? ''} onChange={(e) => updateEntry(i, 'field', e.target.value)} />
          <label className={`${labelClass} mt-2`}>Graduation Date</label>
          <input className={inputClass} value={entry.graduationDate ?? ''} onChange={(e) => updateEntry(i, 'graduationDate', e.target.value)} />
        </div>
      ))}
    </div>
  )
}

function ProjectsEditor({
  entries,
  onChange,
}: {
  entries: NonNullable<ResumeContent['projects']>
  onChange: (v: NonNullable<ResumeContent['projects']>) => void
}) {
  function updateEntry(index: number, field: string, value: string | string[]) {
    const updated = entries.map((e, i) => (i === index ? { ...e, [field]: value } : e))
    onChange(updated)
  }

  return (
    <div className="space-y-3">
      {entries.map((entry, i) => (
        <div key={i} className="border-t border-gray-100 dark:border-gray-700 pt-3 first:border-0 first:pt-0">
          <label className={labelClass}>Name</label>
          <input className={inputClass} value={entry.name} onChange={(e) => updateEntry(i, 'name', e.target.value)} />
          <label className={`${labelClass} mt-2`}>Description</label>
          <textarea className={inputClass} value={entry.description} onChange={(e) => updateEntry(i, 'description', e.target.value)} rows={2} />
          <label className={`${labelClass} mt-2`}>Tech Stack (comma-separated)</label>
          <input
            className={inputClass}
            value={(entry.techStack ?? []).join(', ')}
            onChange={(e) => updateEntry(i, 'techStack', e.target.value.split(',').map((s) => s.trim()).filter(Boolean))}
          />
          <label className={`${labelClass} mt-2`}>Highlights (comma-separated)</label>
          <input
            className={inputClass}
            value={(entry.highlights ?? []).join(', ')}
            onChange={(e) => updateEntry(i, 'highlights', e.target.value.split(',').map((s) => s.trim()).filter(Boolean))}
          />
        </div>
      ))}
    </div>
  )
}

function SimpleListEditor({
  entries,
  fields,
  onChange,
}: {
  entries: Record<string, string | undefined>[]
  fields: string[]
  onChange: (v: any[]) => void
}) {
  function updateEntry(index: number, field: string, value: string) {
    const updated = entries.map((e, i) => (i === index ? { ...e, [field]: value } : e))
    onChange(updated)
  }

  return (
    <div className="space-y-3">
      {entries.map((entry, i) => (
        <div key={i} className="border-t border-gray-100 dark:border-gray-700 pt-3 first:border-0 first:pt-0">
          {fields.map((field) => (
            <div key={field}>
              <label className={`${labelClass} mt-2 first:mt-0`}>{field.charAt(0).toUpperCase() + field.slice(1)}</label>
              <input className={inputClass} value={(entry[field] as string) ?? ''} onChange={(e) => updateEntry(i, field, e.target.value)} />
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

function InterestsEditor({
  items,
  onChange,
}: {
  items: string[]
  onChange: (v: string[]) => void
}) {
  return (
    <div className="space-y-1">
      {items.map((item, i) => (
        <div key={i} className="flex gap-1">
          <input
            className={`${inputClass} flex-1`}
            value={item}
            onChange={(e) => {
              const updated = items.map((v, j) => (j === i ? e.target.value : v))
              onChange(updated)
            }}
          />
          <button
            type="button"
            onClick={() => onChange(items.filter((_, j) => j !== i))}
            className="px-2 text-red-500 hover:text-red-700 text-xs"
            aria-label="Remove interest"
          >
            &times;
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...items, ''])}
        className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
      >
        + Add interest
      </button>
    </div>
  )
}
```

**Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/unit/components/resume/SectionEditor.test.tsx`
Expected: All 5 tests pass.

**Step 5: Run all tests**

Run: `npx vitest run`
Expected: All tests pass.

**Step 6: Commit**

```bash
git add src/components/resume/SectionEditor.tsx tests/unit/components/resume/SectionEditor.test.tsx
git commit -m "feat: add SectionEditor component with accordion edit forms"
```

---

## Task 4: Wire SectionEditor into the drawer

**Files:**
- Modify: `src/app/(app)/resume/[id]/client.tsx`
- Modify: `tests/unit/components/resume/ResumeViewClient.test.tsx`

**Step 1: Import SectionEditor and updateResumeContent**

Add to the imports in `client.tsx`:

```tsx
import SectionEditor from '@/components/resume/SectionEditor'
import { regenerateResume, updateResumeTemplate, updateResumeContent } from '@/actions/generation'
```

**Step 2: Add handleContentSave function**

After the `handleFeedbackSubmit` function, add:

```tsx
function handleContentSave(updatedContent: ResumeContent) {
  setContent(updatedContent)
  startTransition(async () => {
    await updateResumeContent(resume.id, updatedContent)
  })
}
```

Note: `setContent` is called immediately (before the server action), so the preview updates right away via the existing `useEffect`. The server action persists in the background.

**Step 3: Replace the Edit tab placeholder**

Replace the placeholder `<p>` in the Edit tab with:

```tsx
{drawerTab === 'edit' ? (
  <SectionEditor content={content} onSave={handleContentSave} isSaving={isPending} />
) : (
  sidebarContent
)}
```

**Step 4: Add test for section editing integration**

In `ResumeViewClient.test.tsx`, add a mock for `updateResumeContent` and a test:

Add to the `vi.mock('@/actions/generation', ...)` block:

```tsx
vi.mock('@/actions/generation', () => ({
  regenerateResume: vi.fn(),
  updateResumeTemplate: vi.fn(),
  updateResumeContent: vi.fn(),
}))
```

Add test:

```tsx
it('shows section editors in Edit tab when drawer opens', async () => {
  const user = userEvent.setup()
  render(
    <ResumeViewClient resume={mockResume} personalInfo={mockPersonalInfo} />
  )

  // Open drawer (defaults to Edit tab)
  await user.click(screen.getByRole('button', { name: /customize/i }))

  // Section accordions should be visible
  expect(screen.getByRole('button', { name: /summary/i })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /experience/i })).toBeInTheDocument()
})
```

**Step 5: Run all tests**

Run: `npx vitest run`
Expected: All tests pass.

**Step 6: Commit**

```bash
git add src/app/\(app\)/resume/\[id\]/client.tsx tests/unit/components/resume/ResumeViewClient.test.tsx
git commit -m "feat: wire SectionEditor into drawer Edit tab"
```

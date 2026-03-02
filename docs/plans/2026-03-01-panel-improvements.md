# Panel Improvements — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the overlay drawer with a side-by-side push layout that starts open, collapses to a narrow icon toolbar, and uses frosted glass styling on inputs.

**Architecture:** The page layout changes from a single-column with an overlay drawer to a flex row with a resizable side panel. A `panelOpen` boolean (default `true`) toggles between the full panel (~320px) and a narrow icon toolbar (~48px). The toolbar has download + template switcher icons. Frosted glass is applied via CSS `backdrop-filter` on inputs. Smooth transition on width change.

**Tech Stack:** React, Tailwind CSS, CSS `backdrop-filter`

---

## Task 1: Apply frosted glass styling to inputs

**Files:**
- Modify: `src/components/resume/SectionEditor.tsx:166`
- Modify: `src/components/resume/FeedbackForm.tsx:28`

**Step 1: Update SectionEditor inputClass**

In `src/components/resume/SectionEditor.tsx`, find line 166:

```ts
const inputClass = 'w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-800 dark:text-gray-100'
```

Replace with:

```ts
const inputClass = 'w-full px-2 py-1.5 text-sm border border-gray-300/70 dark:border-gray-600/70 rounded-md bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm dark:text-gray-100'
```

Changes: `border-gray-300` → `border-gray-300/70`, `dark:border-gray-600` → `dark:border-gray-600/70`, added `bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm`.

**Step 2: Update FeedbackForm textarea**

In `src/components/resume/FeedbackForm.tsx`, find line 28:

```tsx
className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 dark:bg-gray-800 dark:text-gray-100 resize-y"
```

Replace with:

```tsx
className="w-full px-3 py-2 border border-gray-300/70 dark:border-gray-600/70 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm dark:text-gray-100 resize-y"
```

Changes: same pattern — semi-transparent borders and background, add `backdrop-blur-sm`.

**Step 3: Run all tests**

Run: `npx vitest run`
Expected: All 156 tests pass (CSS-only changes, no behavior change).

**Step 4: Commit**

```bash
git add src/components/resume/SectionEditor.tsx src/components/resume/FeedbackForm.tsx
git commit -m "style: add frosted glass styling to panel inputs"
```

---

## Task 2: Replace overlay drawer with push layout and collapsed toolbar

This is the main task. It rewrites the layout in `client.tsx` and updates all affected tests.

**Files:**
- Modify: `src/app/(app)/resume/[id]/client.tsx`
- Modify: `tests/unit/components/resume/ResumeViewClient.test.tsx`

**Step 1: Rewrite client.tsx layout**

In `src/app/(app)/resume/[id]/client.tsx`, make these changes:

**1a. Replace state variables.** Find lines 41-43:

```tsx
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerTab, setDrawerTab] = useState<'edit' | 'customize'>('edit')
```

Replace with:

```tsx
  const [panelOpen, setPanelOpen] = useState(true)
  const [drawerTab, setDrawerTab] = useState<'edit' | 'customize'>('edit')
```

**1b. Replace the return JSX.** Replace the entire return block (from `return (` at line 132 through the closing `</div>` and `)` near line 221) with the new layout below. This replaces: the page header, the analysis panel, the preview, the backdrop overlay, and the drawer — all in one shot.

```tsx
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{resume.jobTitle}</h1>
          <p className="text-gray-600 dark:text-gray-400">{resume.company}</p>
        </div>
      </div>

      {resume.analysis && <AnalysisPanel analysis={resume.analysis} />}

      <div className="flex gap-0">
        {/* Preview area */}
        <div className="flex-1 min-w-0 transition-all duration-300 ease-in-out">
          <PagedPreview html={previewHtml} />
        </div>

        {/* Side panel */}
        <div
          data-testid="controls-panel"
          className={`flex-shrink-0 transition-all duration-300 ease-in-out ${
            panelOpen ? 'w-80' : 'w-12'
          }`}
        >
          {panelOpen ? (
            /* ── Expanded panel ── */
            <div className="h-full border-l border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
                <div className="flex gap-1" role="tablist">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={drawerTab === 'edit'}
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
                    role="tab"
                    aria-selected={drawerTab === 'customize'}
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
                  onClick={() => setPanelOpen(false)}
                  aria-label="Collapse panel"
                  className="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 rounded-lg"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
              <div className="p-4 space-y-6 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
                <DownloadButton resumeId={resume.id} />
                {drawerTab === 'edit' ? (
                  <SectionEditor content={content} onSave={handleContentSave} isSaving={isPending} />
                ) : (
                  sidebarContent
                )}
              </div>
            </div>
          ) : (
            /* ── Collapsed toolbar ── */
            <div
              data-testid="collapsed-toolbar"
              className="h-full border-l border-gray-200 dark:border-gray-700 flex flex-col items-center py-3 gap-2 cursor-pointer"
              onClick={(e) => {
                if (e.target === e.currentTarget) setPanelOpen(true)
              }}
            >
              <button
                type="button"
                onClick={() => setPanelOpen(true)}
                aria-label="Expand panel"
                className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <a
                href={`/api/pdf/${resume.id}`}
                download
                title="Download PDF"
                className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </a>

              <div className="w-6 border-t border-gray-300 dark:border-gray-600" />

              {/* Template switcher icons */}
              <button
                type="button"
                onClick={() => handleTemplateChange('clean')}
                title="Clean template"
                className={`p-2 rounded-lg transition-colors ${
                  templateId === 'clean'
                    ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950'
                    : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <rect x="4" y="3" width="16" height="18" rx="1" />
                  <line x1="7" y1="7" x2="17" y2="7" />
                  <line x1="7" y1="11" x2="17" y2="11" />
                  <line x1="7" y1="15" x2="13" y2="15" />
                </svg>
              </button>

              <button
                type="button"
                onClick={() => handleTemplateChange('bold')}
                title="Bold template"
                className={`p-2 rounded-lg transition-colors ${
                  templateId === 'bold'
                    ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950'
                    : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <rect x="4" y="3" width="16" height="18" rx="1" />
                  <rect x="4" y="3" width="6" height="18" rx="1" fill="currentColor" opacity="0.2" />
                  <line x1="12" y1="7" x2="17" y2="7" />
                  <line x1="12" y1="11" x2="17" y2="11" />
                </svg>
              </button>

              <button
                type="button"
                onClick={() => handleTemplateChange('executive')}
                title="Executive template"
                className={`p-2 rounded-lg transition-colors ${
                  templateId === 'executive'
                    ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950'
                    : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <rect x="4" y="3" width="16" height="18" rx="1" />
                  <rect x="4" y="3" width="16" height="6" rx="1" fill="currentColor" opacity="0.2" />
                  <line x1="7" y1="13" x2="17" y2="13" />
                  <line x1="7" y1="17" x2="13" y2="17" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
```

Key differences from the old layout:
- No more `fixed` positioning, no `z-50`, no backdrop overlay, no `translate-x` transforms
- Flex row with `flex-1 min-w-0` preview and `flex-shrink-0 w-80`/`w-12` panel
- Panel content scrolls via `overflow-y-auto` with `maxHeight: calc(100vh - 200px)`
- Close button replaced with collapse chevron (right-pointing `>` when open)
- Collapsed toolbar: expand chevron (left-pointing `<`), download link, separator, 3 template icons
- `transition-all duration-300 ease-in-out` on both the preview and panel divs

**1c. Remove unused imports.** The `DownloadButton` import on line 7 is no longer needed in the expanded panel since we render it inline, BUT actually we still use `<DownloadButton resumeId={resume.id} />` in the expanded panel. So keep it.

Actually, wait — the page header no longer has `<DownloadButton resumeId={resume.id} iconOnly />` (line 140 in the old code). The download button is now only in the expanded panel and as an inline `<a>` in the collapsed toolbar. The `DownloadButton` component import is still used in the expanded panel, so keep it.

**Step 2: Rewrite the tests**

In `tests/unit/components/resume/ResumeViewClient.test.tsx`, replace the entire `'Overlay drawer'` describe block (lines 171-230) with:

```tsx
  describe('Side panel', () => {
    it('renders panel open by default with Edit tab', () => {
      render(
        <ResumeViewClient resume={mockResume} personalInfo={mockPersonalInfo} />
      )
      // Panel is open by default — tabs visible immediately
      expect(screen.getByRole('tab', { name: /edit/i })).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: /customize/i })).toBeInTheDocument()
      // Section editors visible in Edit tab
      expect(screen.getByRole('button', { name: /summary/i })).toBeInTheDocument()
    })

    it('collapses panel when collapse button is clicked', async () => {
      const user = userEvent.setup()
      render(
        <ResumeViewClient resume={mockResume} personalInfo={mockPersonalInfo} />
      )

      // Panel starts open
      expect(screen.getByRole('tab', { name: /edit/i })).toBeInTheDocument()

      // Click collapse
      await user.click(screen.getByRole('button', { name: /collapse panel/i }))

      // Tabs should be gone, toolbar visible
      expect(screen.queryByRole('tab', { name: /edit/i })).not.toBeInTheDocument()
      expect(screen.getByTestId('collapsed-toolbar')).toBeInTheDocument()
    })

    it('expands panel when expand button is clicked', async () => {
      const user = userEvent.setup()
      render(
        <ResumeViewClient resume={mockResume} personalInfo={mockPersonalInfo} />
      )

      // Collapse first
      await user.click(screen.getByRole('button', { name: /collapse panel/i }))
      expect(screen.queryByRole('tab', { name: /edit/i })).not.toBeInTheDocument()

      // Expand
      await user.click(screen.getByRole('button', { name: /expand panel/i }))
      expect(screen.getByRole('tab', { name: /edit/i })).toBeInTheDocument()
    })

    it('switches templates from collapsed toolbar', async () => {
      const user = userEvent.setup()
      render(
        <ResumeViewClient resume={mockResume} personalInfo={mockPersonalInfo} />
      )

      await waitFor(() => {
        expect(mockGetPreviewHtml).toHaveBeenCalledTimes(1)
      })

      // Collapse panel
      await user.click(screen.getByRole('button', { name: /collapse panel/i }))

      // Click Bold template icon
      await user.click(screen.getByRole('button', { name: /bold template/i }))

      await waitFor(() => {
        expect(mockGetPreviewHtml).toHaveBeenCalledWith(
          mockResume.resumeContent,
          mockPersonalInfo,
          'bold'
        )
      })
    })
  })
```

Also update the template-change test (around line 111). The old test opened the drawer and switched to the Customize tab. Now the panel is open by default. Find:

```tsx
    // Open drawer and switch to Customize tab to access template selector
    await user.click(screen.getByRole('button', { name: /customize/i })) // Open drawer
    await user.click(screen.getByRole('tab', { name: /customize/i })) // Switch to Customize tab
```

Replace with:

```tsx
    // Switch to Customize tab (panel is open by default)
    await user.click(screen.getByRole('tab', { name: /customize/i }))
```

**Step 3: Run all tests**

Run: `npx vitest run`
Expected: All tests pass. Some old drawer tests are replaced by new panel tests.

**Step 4: Commit**

```bash
git add "src/app/(app)/resume/[id]/client.tsx" "tests/unit/components/resume/ResumeViewClient.test.tsx"
git commit -m "feat: replace overlay drawer with push layout side panel"
```

---

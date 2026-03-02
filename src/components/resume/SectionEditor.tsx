'use client'

import { useState, useEffect } from 'react'
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

  // Sync edit state when content changes externally (e.g. AI regeneration)
  useEffect(() => {
    setEditState(content)
    setOpenSection(null)
  }, [content])

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
      setEditState(content)
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
            aria-expanded={openSection === key}
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
  onChange: (v: Record<string, string | undefined>[]) => void
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

'use client'

import { useState } from 'react'
import SectionForm from '../SectionForm'
import type { Experience, ExperienceEntry } from '@/types'

interface ExperienceStepProps {
  onSubmit: (data: Experience) => void
  onSkip: () => void
  onBack?: () => void
  initialData: Partial<Experience> | null
}

function emptyEntry(): ExperienceEntry {
  return { company: '', title: '', startDate: '', endDate: '', current: false, location: '', bullets: [''] }
}

export default function ExperienceStep({ onSubmit, onSkip, onBack, initialData }: ExperienceStepProps) {
  const [entries, setEntries] = useState<ExperienceEntry[]>(
    initialData?.entries?.length ? initialData.entries : [emptyEntry()]
  )

  function updateEntry(index: number, field: keyof ExperienceEntry, value: string | boolean) {
    setEntries((prev) => prev.map((e, i) => (i === index ? { ...e, [field]: value } : e)))
  }

  function addEntry() {
    setEntries((prev) => [...prev, emptyEntry()])
  }

  function removeEntry(index: number) {
    setEntries((prev) => prev.filter((_, i) => i !== index))
  }

  function updateBullet(entryIndex: number, bulletIndex: number, value: string) {
    setEntries((prev) =>
      prev.map((e, i) =>
        i === entryIndex
          ? { ...e, bullets: e.bullets.map((b, bi) => (bi === bulletIndex ? value : b)) }
          : e
      )
    )
  }

  function addBullet(entryIndex: number) {
    setEntries((prev) =>
      prev.map((e, i) => (i === entryIndex ? { ...e, bullets: [...e.bullets, ''] } : e))
    )
  }

  function removeBullet(entryIndex: number, bulletIndex: number) {
    setEntries((prev) =>
      prev.map((e, i) =>
        i === entryIndex ? { ...e, bullets: e.bullets.filter((_, bi) => bi !== bulletIndex) } : e
      )
    )
  }

  function handleSubmit() {
    onSubmit({
      entries: entries.map((e) => ({
        ...e,
        endDate: e.current ? undefined : e.endDate,
        location: e.location || undefined,
        bullets: e.bullets.filter((b) => b.trim() !== ''),
      })),
    })
  }

  return (
    <SectionForm
      title="Work Experience"
      description="Add your work experience, starting with the most recent position."
      onSubmit={handleSubmit}
      onSkip={onSkip}
      onBack={onBack}
      isEmpty={!entries[0]?.company.trim()}
    >
      <div className="space-y-6">
        {entries.map((entry, idx) => (
          <div key={idx} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Position {idx + 1}</h3>
              {entries.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeEntry(idx)}
                  className="text-sm text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                >
                  Remove
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Company</label>
                <input
                  type="text"
                  value={entry.company}
                  onChange={(e) => updateEntry(idx, 'company', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 dark:bg-gray-800 dark:text-gray-100"
                  placeholder="Acme Corp"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                <input
                  type="text"
                  value={entry.title}
                  onChange={(e) => updateEntry(idx, 'title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 dark:bg-gray-800 dark:text-gray-100"
                  placeholder="Software Engineer"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date</label>
                <input
                  type="text"
                  value={entry.startDate}
                  onChange={(e) => updateEntry(idx, 'startDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 dark:bg-gray-800 dark:text-gray-100"
                  placeholder="Jan 2022"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Date</label>
                <input
                  type="text"
                  value={entry.current ? '' : (entry.endDate ?? '')}
                  onChange={(e) => updateEntry(idx, 'endDate', e.target.value)}
                  disabled={entry.current}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 dark:bg-gray-800 dark:text-gray-100 disabled:bg-gray-100 dark:disabled:bg-gray-700"
                  placeholder="Dec 2023"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id={`current-${idx}`}
                checked={entry.current}
                onChange={(e) => updateEntry(idx, 'current', e.target.checked)}
                className="h-4 w-4 text-blue-600 rounded border-gray-300"
              />
              <label htmlFor={`current-${idx}`} className="text-sm text-gray-700 dark:text-gray-300">
                I currently work here
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label>
              <input
                type="text"
                value={entry.location ?? ''}
                onChange={(e) => updateEntry(idx, 'location', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 dark:bg-gray-800 dark:text-gray-100"
                placeholder="San Francisco, CA"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Key Achievements / Bullets</label>
              {entry.bullets.map((bullet, bIdx) => (
                <div key={bIdx} className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    value={bullet}
                    onChange={(e) => updateBullet(idx, bIdx, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 dark:bg-gray-800 dark:text-gray-100"
                    placeholder="Led migration to microservices..."
                  />
                  {entry.bullets.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeBullet(idx, bIdx)}
                      className="text-sm text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => addBullet(idx)}
                className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              >
                + Add Bullet
              </button>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={addEntry}
          className="w-full py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-500 dark:text-gray-400 hover:border-blue-400 dark:hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400"
        >
          + Add Experience
        </button>
      </div>
    </SectionForm>
  )
}

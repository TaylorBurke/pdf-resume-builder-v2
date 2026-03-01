'use client'

import { useState } from 'react'
import SectionForm from '../SectionForm'
import type { IntellectualProperty, IntellectualPropertyEntry } from '@/types'

interface IPStepProps {
  onSubmit: (data: IntellectualProperty) => void
  onSkip: () => void
  onBack?: () => void
  initialData: Partial<IntellectualProperty> | null
}

const IP_TYPES: IntellectualPropertyEntry['type'][] = ['patent', 'publication', 'open_source', 'other']

function emptyEntry(): IntellectualPropertyEntry {
  return { type: 'patent', title: '', description: '', url: '', date: '' }
}

export default function IPStep({ onSubmit, onSkip, onBack, initialData }: IPStepProps) {
  const [entries, setEntries] = useState<IntellectualPropertyEntry[]>(
    initialData?.entries?.length ? initialData.entries : [emptyEntry()]
  )

  function updateEntry(index: number, field: keyof IntellectualPropertyEntry, value: string) {
    setEntries((prev) => prev.map((e, i) => (i === index ? { ...e, [field]: value } : e)))
  }

  function addEntry() {
    setEntries((prev) => [...prev, emptyEntry()])
  }

  function removeEntry(index: number) {
    setEntries((prev) => prev.filter((_, i) => i !== index))
  }

  function handleSubmit() {
    onSubmit({
      entries: entries.map((e) => ({
        type: e.type,
        title: e.title,
        description: e.description || undefined,
        url: e.url || undefined,
        date: e.date || undefined,
      })),
    })
  }

  const typeLabels: Record<IntellectualPropertyEntry['type'], string> = {
    patent: 'Patent',
    publication: 'Publication',
    open_source: 'Open Source',
    other: 'Other',
  }

  return (
    <SectionForm
      title="Intellectual Property"
      description="Add patents, publications, open-source projects, or other intellectual property."
      onSubmit={handleSubmit}
      onSkip={onSkip}
      onBack={onBack}
      isEmpty={!entries[0]?.title.trim()}
    >
      <div className="space-y-6">
        {entries.map((entry, idx) => (
          <div key={idx} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Entry {idx + 1}</h3>
              {entries.length > 1 && (
                <button type="button" onClick={() => removeEntry(idx)} className="text-sm text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300">
                  Remove
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
                <select
                  value={entry.type}
                  onChange={(e) => updateEntry(idx, 'type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-800 dark:text-gray-100"
                >
                  {IP_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {typeLabels[t]}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                <input
                  type="text"
                  value={entry.title}
                  onChange={(e) => updateEntry(idx, 'title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 dark:bg-gray-800 dark:text-gray-100"
                  placeholder="Method for Distributed Computing"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
              <textarea
                value={entry.description ?? ''}
                onChange={(e) => updateEntry(idx, 'description', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 dark:bg-gray-800 dark:text-gray-100 resize-y"
                placeholder="Brief description..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">URL</label>
                <input
                  type="url"
                  value={entry.url ?? ''}
                  onChange={(e) => updateEntry(idx, 'url', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 dark:bg-gray-800 dark:text-gray-100"
                  placeholder="https://patent.example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
                <input
                  type="text"
                  value={entry.date ?? ''}
                  onChange={(e) => updateEntry(idx, 'date', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 dark:bg-gray-800 dark:text-gray-100"
                  placeholder="Mar 2023"
                />
              </div>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={addEntry}
          className="w-full py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-500 dark:text-gray-400 hover:border-blue-400 dark:hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400"
        >
          + Add Entry
        </button>
      </div>
    </SectionForm>
  )
}

'use client'

import { useState } from 'react'
import SectionForm from '../SectionForm'
import type { Language, LanguageEntry } from '@/types'

interface LanguagesStepProps {
  onSubmit: (data: Language) => void
  onSkip: () => void
  onBack?: () => void
  initialData: Partial<Language> | null
}

function emptyEntry(): LanguageEntry {
  return { language: '', proficiency: 'intermediate' }
}

const PROFICIENCY_OPTIONS: LanguageEntry['proficiency'][] = [
  'native',
  'fluent',
  'advanced',
  'intermediate',
  'basic',
]

export default function LanguagesStep({ onSubmit, onSkip, onBack, initialData }: LanguagesStepProps) {
  const [entries, setEntries] = useState<LanguageEntry[]>(
    initialData?.entries?.length ? initialData.entries : [emptyEntry()]
  )

  function updateEntry(index: number, field: keyof LanguageEntry, value: string) {
    setEntries((prev) => prev.map((e, i) => (i === index ? { ...e, [field]: value } : e)))
  }

  function addEntry() {
    setEntries((prev) => [...prev, emptyEntry()])
  }

  function removeEntry(index: number) {
    setEntries((prev) => prev.filter((_, i) => i !== index))
  }

  function handleSubmit() {
    onSubmit({ entries })
  }

  return (
    <SectionForm
      title="Languages"
      description="List the languages you speak and your proficiency level."
      onSubmit={handleSubmit}
      onSkip={onSkip}
      onBack={onBack}
      isEmpty={!entries[0]?.language.trim()}
    >
      <div className="space-y-4">
        {entries.map((entry, idx) => (
          <div key={idx} className="flex items-end gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Language</label>
              <input
                type="text"
                value={entry.language}
                onChange={(e) => updateEntry(idx, 'language', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 dark:bg-gray-800 dark:text-gray-100"
                placeholder="English"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Proficiency</label>
              <select
                value={entry.proficiency}
                onChange={(e) => updateEntry(idx, 'proficiency', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-800 dark:text-gray-100"
              >
                {PROFICIENCY_OPTIONS.map((p) => (
                  <option key={p} value={p}>
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            {entries.length > 1 && (
              <button type="button" onClick={() => removeEntry(idx)} className="text-sm text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 pb-2">
                Remove
              </button>
            )}
          </div>
        ))}

        <button
          type="button"
          onClick={addEntry}
          className="w-full py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-500 dark:text-gray-400 hover:border-blue-400 dark:hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400"
        >
          + Add Language
        </button>
      </div>
    </SectionForm>
  )
}

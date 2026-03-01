'use client'

import { useState } from 'react'
import SectionForm from '../SectionForm'
import type { Award, AwardEntry } from '@/types'

interface AwardsStepProps {
  onSubmit: (data: Award) => void
  onSkip: () => void
  onBack?: () => void
  initialData: Partial<Award> | null
}

function emptyEntry(): AwardEntry {
  return { name: '', issuer: '', date: '', description: '' }
}

export default function AwardsStep({ onSubmit, onSkip, onBack, initialData }: AwardsStepProps) {
  const [entries, setEntries] = useState<AwardEntry[]>(
    initialData?.entries?.length ? initialData.entries : [emptyEntry()]
  )

  function updateEntry(index: number, field: keyof AwardEntry, value: string) {
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
        name: e.name,
        issuer: e.issuer,
        date: e.date || undefined,
        description: e.description || undefined,
      })),
    })
  }

  return (
    <SectionForm
      title="Awards & Honors"
      description="Add any awards, honors, or recognitions you have received."
      onSubmit={handleSubmit}
      onSkip={onSkip}
      onBack={onBack}
    >
      <div className="space-y-6">
        {entries.map((entry, idx) => (
          <div key={idx} className="p-4 border border-gray-200 rounded-lg space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-700">Award {idx + 1}</h3>
              {entries.length > 1 && (
                <button type="button" onClick={() => removeEntry(idx)} className="text-sm text-red-500 hover:text-red-700">
                  Remove
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Award Name</label>
                <input
                  type="text"
                  value={entry.name}
                  onChange={(e) => updateEntry(idx, 'name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Employee of the Year"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Issuer</label>
                <input
                  type="text"
                  value={entry.issuer}
                  onChange={(e) => updateEntry(idx, 'issuer', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Acme Corp"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="text"
                value={entry.date ?? ''}
                onChange={(e) => updateEntry(idx, 'date', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Dec 2023"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={entry.description ?? ''}
                onChange={(e) => updateEntry(idx, 'description', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                placeholder="Recognized for outstanding contributions..."
              />
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={addEntry}
          className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-blue-400 hover:text-blue-600"
        >
          + Add Award
        </button>
      </div>
    </SectionForm>
  )
}

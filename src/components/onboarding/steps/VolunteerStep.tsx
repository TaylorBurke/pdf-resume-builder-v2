'use client'

import { useState } from 'react'
import SectionForm from '../SectionForm'
import type { VolunteerWork, VolunteerEntry } from '@/types'

interface VolunteerStepProps {
  onSubmit: (data: VolunteerWork) => void
  onSkip: () => void
  onBack?: () => void
  initialData: Partial<VolunteerWork> | null
}

function emptyEntry(): VolunteerEntry {
  return { organization: '', role: '', startDate: '', endDate: '', description: '' }
}

export default function VolunteerStep({ onSubmit, onSkip, onBack, initialData }: VolunteerStepProps) {
  const [entries, setEntries] = useState<VolunteerEntry[]>(
    initialData?.entries?.length ? initialData.entries : [emptyEntry()]
  )

  function updateEntry(index: number, field: keyof VolunteerEntry, value: string) {
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
        organization: e.organization,
        role: e.role,
        startDate: e.startDate || undefined,
        endDate: e.endDate || undefined,
        description: e.description,
      })),
    })
  }

  return (
    <SectionForm
      title="Volunteer Experience"
      description="Add any volunteer work or community involvement."
      onSubmit={handleSubmit}
      onSkip={onSkip}
      onBack={onBack}
      isEmpty={!entries[0]?.organization.trim()}
    >
      <div className="space-y-6">
        {entries.map((entry, idx) => (
          <div key={idx} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Volunteer {idx + 1}</h3>
              {entries.length > 1 && (
                <button type="button" onClick={() => removeEntry(idx)} className="text-sm text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300">
                  Remove
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Organization</label>
                <input
                  type="text"
                  value={entry.organization}
                  onChange={(e) => updateEntry(idx, 'organization', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 dark:bg-gray-800 dark:text-gray-100"
                  placeholder="Red Cross"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label>
                <input
                  type="text"
                  value={entry.role}
                  onChange={(e) => updateEntry(idx, 'role', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 dark:bg-gray-800 dark:text-gray-100"
                  placeholder="Volunteer Coordinator"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date</label>
                <input
                  type="text"
                  value={entry.startDate ?? ''}
                  onChange={(e) => updateEntry(idx, 'startDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 dark:bg-gray-800 dark:text-gray-100"
                  placeholder="Jun 2021"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Date</label>
                <input
                  type="text"
                  value={entry.endDate ?? ''}
                  onChange={(e) => updateEntry(idx, 'endDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 dark:bg-gray-800 dark:text-gray-100"
                  placeholder="Present"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
              <textarea
                value={entry.description}
                onChange={(e) => updateEntry(idx, 'description', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 dark:bg-gray-800 dark:text-gray-100 resize-y"
                placeholder="Organized community events..."
              />
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={addEntry}
          className="w-full py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-500 dark:text-gray-400 hover:border-blue-400 dark:hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400"
        >
          + Add Volunteer Experience
        </button>
      </div>
    </SectionForm>
  )
}

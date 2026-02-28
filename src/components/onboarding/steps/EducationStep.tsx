'use client'

import { useState } from 'react'
import SectionForm from '../SectionForm'
import type { Education, EducationEntry } from '@/types'

interface EducationStepProps {
  onSubmit: (data: Education) => void
  onSkip: () => void
  initialData: Partial<Education> | null
}

function emptyEntry(): EducationEntry {
  return { school: '', degree: '', field: '', graduationDate: '', gpa: '', honors: '' }
}

export default function EducationStep({ onSubmit, onSkip, initialData }: EducationStepProps) {
  const [entries, setEntries] = useState<EducationEntry[]>(
    initialData?.entries?.length ? initialData.entries : [emptyEntry()]
  )

  function updateEntry(index: number, field: keyof EducationEntry, value: string) {
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
        school: e.school,
        degree: e.degree,
        field: e.field || undefined,
        graduationDate: e.graduationDate || undefined,
        gpa: e.gpa || undefined,
        honors: e.honors || undefined,
      })),
    })
  }

  return (
    <SectionForm
      title="Education"
      description="Add your educational background."
      onSubmit={handleSubmit}
      onSkip={onSkip}
    >
      <div className="space-y-6">
        {entries.map((entry, idx) => (
          <div key={idx} className="p-4 border border-gray-200 rounded-lg space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-700">Education {idx + 1}</h3>
              {entries.length > 1 && (
                <button type="button" onClick={() => removeEntry(idx)} className="text-sm text-red-500 hover:text-red-700">
                  Remove
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">School</label>
                <input
                  type="text"
                  value={entry.school}
                  onChange={(e) => updateEntry(idx, 'school', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="MIT"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Degree</label>
                <input
                  type="text"
                  value={entry.degree}
                  onChange={(e) => updateEntry(idx, 'degree', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="B.S."
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Field of Study</label>
                <input
                  type="text"
                  value={entry.field ?? ''}
                  onChange={(e) => updateEntry(idx, 'field', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Computer Science"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Graduation Date</label>
                <input
                  type="text"
                  value={entry.graduationDate ?? ''}
                  onChange={(e) => updateEntry(idx, 'graduationDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="May 2020"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">GPA</label>
                <input
                  type="text"
                  value={entry.gpa ?? ''}
                  onChange={(e) => updateEntry(idx, 'gpa', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="3.8"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Honors</label>
                <input
                  type="text"
                  value={entry.honors ?? ''}
                  onChange={(e) => updateEntry(idx, 'honors', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Magna Cum Laude"
                />
              </div>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={addEntry}
          className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-blue-400 hover:text-blue-600"
        >
          + Add Education
        </button>
      </div>
    </SectionForm>
  )
}

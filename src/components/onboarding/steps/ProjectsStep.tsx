'use client'

import { useState } from 'react'
import SectionForm from '../SectionForm'
import type { Project, ProjectEntry } from '@/types'

interface ProjectsStepProps {
  onSubmit: (data: Project) => void
  onSkip: () => void
  initialData: Partial<Project> | null
}

interface ProjectFormEntry extends Omit<ProjectEntry, 'techStack'> {
  techStackText: string
}

function emptyEntry(): ProjectFormEntry {
  return { name: '', description: '', url: '', techStackText: '', highlights: [''] }
}

export default function ProjectsStep({ onSubmit, onSkip, initialData }: ProjectsStepProps) {
  const [entries, setEntries] = useState<ProjectFormEntry[]>(
    initialData?.entries?.length
      ? initialData.entries.map((e) => ({
          ...e,
          techStackText: e.techStack.join(', '),
        }))
      : [emptyEntry()]
  )

  function updateEntry(index: number, field: keyof ProjectFormEntry, value: string) {
    setEntries((prev) => prev.map((e, i) => (i === index ? { ...e, [field]: value } : e)))
  }

  function addEntry() {
    setEntries((prev) => [...prev, emptyEntry()])
  }

  function removeEntry(index: number) {
    setEntries((prev) => prev.filter((_, i) => i !== index))
  }

  function updateHighlight(entryIndex: number, highlightIndex: number, value: string) {
    setEntries((prev) =>
      prev.map((e, i) =>
        i === entryIndex
          ? { ...e, highlights: e.highlights.map((h, hi) => (hi === highlightIndex ? value : h)) }
          : e
      )
    )
  }

  function addHighlight(entryIndex: number) {
    setEntries((prev) =>
      prev.map((e, i) => (i === entryIndex ? { ...e, highlights: [...e.highlights, ''] } : e))
    )
  }

  function removeHighlight(entryIndex: number, highlightIndex: number) {
    setEntries((prev) =>
      prev.map((e, i) =>
        i === entryIndex ? { ...e, highlights: e.highlights.filter((_, hi) => hi !== highlightIndex) } : e
      )
    )
  }

  function handleSubmit() {
    onSubmit({
      entries: entries.map((e) => ({
        name: e.name,
        description: e.description,
        url: e.url || undefined,
        techStack: e.techStackText.split(',').map((s) => s.trim()).filter(Boolean),
        highlights: e.highlights.filter((h) => h.trim() !== ''),
      })),
    })
  }

  return (
    <SectionForm
      title="Projects"
      description="Showcase personal or professional projects that demonstrate your skills."
      onSubmit={handleSubmit}
      onSkip={onSkip}
    >
      <div className="space-y-6">
        {entries.map((entry, idx) => (
          <div key={idx} className="p-4 border border-gray-200 rounded-lg space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-700">Project {idx + 1}</h3>
              {entries.length > 1 && (
                <button type="button" onClick={() => removeEntry(idx)} className="text-sm text-red-500 hover:text-red-700">
                  Remove
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
                <input
                  type="text"
                  value={entry.name}
                  onChange={(e) => updateEntry(idx, 'name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="My Awesome Project"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
                <input
                  type="url"
                  value={entry.url ?? ''}
                  onChange={(e) => updateEntry(idx, 'url', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://github.com/user/project"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={entry.description}
                onChange={(e) => updateEntry(idx, 'description', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                placeholder="A brief description of the project..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tech Stack (comma-separated)</label>
              <input
                type="text"
                value={entry.techStackText}
                onChange={(e) => updateEntry(idx, 'techStackText', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="React, Node.js, PostgreSQL"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Highlights</label>
              {entry.highlights.map((highlight, hIdx) => (
                <div key={hIdx} className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    value={highlight}
                    onChange={(e) => updateHighlight(idx, hIdx, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Achieved 1000+ users..."
                  />
                  {entry.highlights.length > 1 && (
                    <button type="button" onClick={() => removeHighlight(idx, hIdx)} className="text-sm text-red-500 hover:text-red-700">
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button type="button" onClick={() => addHighlight(idx)} className="text-sm text-blue-600 hover:text-blue-800">
                + Add Highlight
              </button>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={addEntry}
          className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-blue-400 hover:text-blue-600"
        >
          + Add Project
        </button>
      </div>
    </SectionForm>
  )
}

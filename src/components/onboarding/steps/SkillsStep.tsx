'use client'

import { useState } from 'react'
import SectionForm from '../SectionForm'
import type { Skill, SkillCategory } from '@/types'

interface SkillsStepProps {
  onSubmit: (data: Skill) => void
  onSkip: () => void
  onBack?: () => void
  initialData: Partial<Skill> | null
}

function emptyCategory(): SkillCategory {
  return { name: '', items: [] }
}

export default function SkillsStep({ onSubmit, onSkip, onBack, initialData }: SkillsStepProps) {
  const [categories, setCategories] = useState<(SkillCategory & { itemsText: string })[]>(
    initialData?.categories?.length
      ? initialData.categories.map((c) => ({ ...c, itemsText: c.items.join(', ') }))
      : [{ ...emptyCategory(), itemsText: '' }]
  )

  function updateCategory(index: number, field: 'name' | 'itemsText', value: string) {
    setCategories((prev) =>
      prev.map((c, i) => (i === index ? { ...c, [field]: value } : c))
    )
  }

  function addCategory() {
    setCategories((prev) => [...prev, { ...emptyCategory(), itemsText: '' }])
  }

  function removeCategory(index: number) {
    setCategories((prev) => prev.filter((_, i) => i !== index))
  }

  function handleSubmit() {
    onSubmit({
      categories: categories.map((c) => ({
        name: c.name,
        items: c.itemsText.split(',').map((s) => s.trim()).filter(Boolean),
      })),
    })
  }

  return (
    <SectionForm
      title="Skills"
      description="Group your skills by category (e.g., Programming Languages, Frameworks, Tools)."
      onSubmit={handleSubmit}
      onSkip={onSkip}
      onBack={onBack}
      isEmpty={!categories[0]?.name.trim()}
    >
      <div className="space-y-6">
        {categories.map((cat, idx) => (
          <div key={idx} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Category {idx + 1}</h3>
              {categories.length > 1 && (
                <button type="button" onClick={() => removeCategory(idx)} className="text-sm text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300">
                  Remove
                </button>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category Name</label>
              <input
                type="text"
                value={cat.name}
                onChange={(e) => updateCategory(idx, 'name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 dark:bg-gray-800 dark:text-gray-100"
                placeholder="Programming Languages"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Skills (comma-separated)</label>
              <input
                type="text"
                value={cat.itemsText}
                onChange={(e) => updateCategory(idx, 'itemsText', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 dark:bg-gray-800 dark:text-gray-100"
                placeholder="JavaScript, TypeScript, Python, Go"
              />
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={addCategory}
          className="w-full py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-500 dark:text-gray-400 hover:border-blue-400 dark:hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400"
        >
          + Add Category
        </button>
      </div>
    </SectionForm>
  )
}

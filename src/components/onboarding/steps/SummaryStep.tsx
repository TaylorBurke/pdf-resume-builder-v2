'use client'

import { useState } from 'react'
import SectionForm from '../SectionForm'
import type { Summary } from '@/types'

interface SummaryStepProps {
  onSubmit: (data: Summary) => void
  onSkip: () => void
  initialData: Partial<Summary> | null
}

export default function SummaryStep({ onSubmit, onSkip, initialData }: SummaryStepProps) {
  const [text, setText] = useState(initialData?.text ?? '')

  function handleSubmit() {
    onSubmit({ text })
  }

  return (
    <SectionForm
      title="Professional Summary"
      description="Write a brief professional summary or objective statement. This will be tailored for each resume you generate."
      onSubmit={handleSubmit}
      onSkip={onSkip}
    >
      <div>
        <label htmlFor="summary" className="block text-sm font-medium text-gray-700 mb-1">
          Summary
        </label>
        <textarea
          id="summary"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={5}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
          placeholder="Experienced software engineer with 5+ years building scalable web applications..."
        />
      </div>
    </SectionForm>
  )
}

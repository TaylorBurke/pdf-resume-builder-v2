'use client'

import { useState } from 'react'
import SectionForm from '../SectionForm'
import type { Interest } from '@/types'

interface InterestsStepProps {
  onSubmit: (data: Interest) => void
  onSkip: () => void
  onBack?: () => void
  initialData: Partial<Interest> | null
}

export default function InterestsStep({ onSubmit, onSkip, onBack, initialData }: InterestsStepProps) {
  const [text, setText] = useState(initialData?.items?.join(', ') ?? '')

  function handleSubmit() {
    onSubmit({
      items: text
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    })
  }

  return (
    <SectionForm
      title="Interests"
      description="Share your hobbies and interests. These can help make your resume more personable."
      onSubmit={handleSubmit}
      onSkip={onSkip}
      onBack={onBack}
    >
      <div>
        <label htmlFor="interests" className="block text-sm font-medium text-gray-700 mb-1">
          Interests (comma-separated)
        </label>
        <input
          id="interests"
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Hiking, Photography, Open Source, Machine Learning"
        />
      </div>
    </SectionForm>
  )
}

'use client'

import { type FormEvent, type ReactNode } from 'react'

interface SectionFormProps {
  title: string
  description: string
  onSubmit: () => void
  onSkip: () => void
  isRequired?: boolean
  children: ReactNode
  isLoading?: boolean
}

export default function SectionForm({
  title,
  description,
  onSubmit,
  onSkip,
  isRequired = false,
  children,
  isLoading = false,
}: SectionFormProps) {
  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    onSubmit()
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        <p className="mt-1 text-sm text-gray-500">{description}</p>
      </div>

      <div className="space-y-4">{children}</div>

      <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
        <div>
          {!isRequired && (
            <button
              type="button"
              onClick={onSkip}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Skip
            </button>
          )}
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Saving...' : 'Continue'}
        </button>
      </div>
    </form>
  )
}

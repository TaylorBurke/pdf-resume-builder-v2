'use client'

import { type FormEvent, type ReactNode } from 'react'

interface SectionFormProps {
  title: string
  description: string
  onSubmit: () => void
  onSkip: () => void
  onBack?: () => void
  isRequired?: boolean
  isEmpty?: boolean
  children: ReactNode
  isLoading?: boolean
}

export default function SectionForm({
  title,
  description,
  onSubmit,
  onSkip,
  onBack,
  isRequired = false,
  isEmpty = false,
  children,
  isLoading = false,
}: SectionFormProps) {
  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!isRequired && isEmpty) {
      onSkip()
    } else {
      onSubmit()
    }
  }

  const buttonLabel = isLoading
    ? 'Saving...'
    : !isRequired && isEmpty
      ? 'Skip'
      : 'Continue'

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{title}</h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{description}</p>
      </div>

      <div className="space-y-4">{children}</div>

      <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-800">
        <div>
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
          )}
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {buttonLabel}
        </button>
      </div>
    </form>
  )
}

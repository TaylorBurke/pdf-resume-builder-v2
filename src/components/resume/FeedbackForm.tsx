'use client'

import { useState } from 'react'

interface FeedbackFormProps {
  onSubmit: (feedback: string) => void
  isLoading?: boolean
}

export default function FeedbackForm({ onSubmit, isLoading = false }: FeedbackFormProps) {
  const [feedback, setFeedback] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!feedback.trim()) return
    onSubmit(feedback)
    setFeedback('')
  }

  return (
    <form onSubmit={handleSubmit}>
      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Feedback</h3>
      <textarea
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        rows={4}
        placeholder="Describe what you'd like to change..."
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 dark:bg-gray-800 dark:text-gray-100 resize-y"
        disabled={isLoading}
      />
      <div className="flex justify-end mt-2">
        <button
          type="submit"
          disabled={isLoading || !feedback.trim()}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Regenerating...' : 'Regenerate'}
        </button>
      </div>
    </form>
  )
}

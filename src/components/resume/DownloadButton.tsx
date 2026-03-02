'use client'

import { useState, useCallback } from 'react'

type DownloadState = 'idle' | 'loading' | 'error'

interface DownloadButtonProps {
  resumeId: string
  fullName: string
  company: string
  jobTitle: string
  iconOnly?: boolean
}

function sanitize(s: string) {
  return s.replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_|_$/g, '')
}

export default function DownloadButton({
  resumeId,
  fullName,
  company,
  jobTitle,
  iconOnly = false,
}: DownloadButtonProps) {
  const [state, setState] = useState<DownloadState>('idle')

  const handleDownload = useCallback(async () => {
    if (state === 'loading') return
    setState('loading')
    try {
      const res = await fetch(`/api/pdf/${resumeId}`)
      if (!res.ok) throw new Error('Download failed')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${sanitize(fullName)}-${sanitize(company)}-${sanitize(jobTitle)}.pdf`
      a.click()
      URL.revokeObjectURL(url)
      setState('idle')
    } catch {
      setState('error')
      setTimeout(() => setState('idle'), 2000)
    }
  }, [resumeId, fullName, company, jobTitle, state])

  const label =
    state === 'loading' ? 'Downloading...' :
    state === 'error' ? 'Download failed' :
    'Download PDF'

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={state === 'loading'}
      title={label}
      aria-label={label}
      className={
        iconOnly
          ? 'inline-flex items-center justify-center p-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50'
          : `inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 ${
              state === 'error'
                ? 'bg-red-600 text-white dark:bg-red-700'
                : 'bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-200'
            }`
      }
    >
      {state === 'loading' ? (
        <svg
          className={`animate-spin ${iconOnly ? 'w-5 h-5' : 'w-4 h-4 mr-2'}`}
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : state === 'error' ? (
        <svg
          className={iconOnly ? 'w-5 h-5 text-red-500' : 'w-4 h-4 mr-2'}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      ) : (
        <svg
          className={iconOnly ? 'w-5 h-5' : 'w-4 h-4 mr-2'}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      )}
      {!iconOnly && label}
    </button>
  )
}

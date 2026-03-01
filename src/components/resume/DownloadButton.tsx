'use client'

interface DownloadButtonProps {
  resumeId: string
  iconOnly?: boolean
}

export default function DownloadButton({ resumeId, iconOnly = false }: DownloadButtonProps) {
  return (
    <a
      href={`/api/pdf/${resumeId}`}
      download
      title="Download PDF"
      className={
        iconOnly
          ? 'inline-flex items-center justify-center p-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors'
          : 'inline-flex items-center px-4 py-2 bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900 text-sm font-medium rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors'
      }
    >
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
      {!iconOnly && 'Download PDF'}
    </a>
  )
}

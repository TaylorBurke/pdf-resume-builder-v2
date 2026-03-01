'use client'

import { useRef, useState, useCallback } from 'react'

const PAGE_WIDTH = 816
const PAGE_HEIGHT = 1056

interface PagedPreviewProps {
  html: string
}

export default function PagedPreview({ html }: PagedPreviewProps) {
  const measureRef = useRef<HTMLIFrameElement>(null)
  const [pageCount, setPageCount] = useState(1)

  const handleMeasureLoad = useCallback(() => {
    const iframe = measureRef.current
    if (!iframe?.contentDocument?.body) return
    const height = iframe.contentDocument.body.scrollHeight
    setPageCount(Math.max(1, Math.ceil(height / PAGE_HEIGHT)))
  }, [])

  function handlePageLoad(e: React.SyntheticEvent<HTMLIFrameElement>, pageIndex: number) {
    const iframe = e.currentTarget
    try {
      iframe.contentWindow?.scrollTo(0, pageIndex * PAGE_HEIGHT)
    } catch {
      // cross-origin safety — srcdoc should be same-origin so this shouldn't fire
    }
  }

  if (!html) {
    return (
      <div data-testid="paged-preview" className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">Generating preview...</p>
      </div>
    )
  }

  return (
    <div data-testid="paged-preview">
      {/* Hidden measurement iframe */}
      <iframe
        ref={measureRef}
        srcDoc={html}
        onLoad={handleMeasureLoad}
        aria-hidden="true"
        tabIndex={-1}
        style={{
          position: 'absolute',
          visibility: 'hidden',
          width: PAGE_WIDTH,
          height: 0,
          overflow: 'hidden',
          pointerEvents: 'none',
          border: 'none',
        }}
      />

      {/* Visible pages */}
      <div className="flex flex-col items-center gap-8">
        {Array.from({ length: pageCount }, (_, i) => (
          <div key={i}>
            <div
              className="shadow-lg border border-gray-200 dark:border-gray-700"
              style={{
                width: PAGE_WIDTH,
                height: PAGE_HEIGHT,
                overflow: 'hidden',
              }}
            >
              <iframe
                data-testid={`page-${i + 1}`}
                srcDoc={html}
                onLoad={(e) => handlePageLoad(e, i)}
                scrolling="no"
                style={{
                  width: PAGE_WIDTH,
                  height: PAGE_HEIGHT,
                  border: 'none',
                  display: 'block',
                }}
              />
            </div>
            <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-2">
              Page {i + 1} of {pageCount}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

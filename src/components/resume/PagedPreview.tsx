'use client'

import { useRef, useState, useCallback } from 'react'

const PAGE_WIDTH = 816
const PAGE_HEIGHT = 1056

interface PagedPreviewProps {
  html: string
}

/**
 * Inject a CSS offset into the HTML so page N shows content starting at
 * N * PAGE_HEIGHT pixels. Uses inline style on <body> which overrides the
 * stylesheet's `body { margin: 0 }`. This is purely CSS-driven — no JS
 * scrollTo timing issues.
 */
function getPageHtml(baseHtml: string, pageIndex: number): string {
  if (pageIndex === 0) return baseHtml
  const offset = pageIndex * PAGE_HEIGHT
  return baseHtml.replace('<body>', `<body style="margin-top: -${offset}px;">`)
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
                background: 'white',
              }}
            >
              <iframe
                data-testid={`page-${i + 1}`}
                srcDoc={getPageHtml(html, i)}
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

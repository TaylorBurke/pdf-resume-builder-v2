'use client'

import { useRef, useState, useEffect, type ReactNode } from 'react'

const PAGE_WIDTH = 816
const PAGE_HEIGHT = 1056

interface PagedPreviewProps {
  children: ReactNode
}

export default function PagedPreview({ children }: PagedPreviewProps) {
  const measureRef = useRef<HTMLDivElement>(null)
  const [pageCount, setPageCount] = useState(1)

  useEffect(() => {
    const el = measureRef.current
    if (!el) return

    function measure() {
      if (!el) return
      const height = el.scrollHeight
      setPageCount(Math.max(1, Math.ceil(height / PAGE_HEIGHT)))
    }

    measure()

    const observer = new ResizeObserver(measure)
    observer.observe(el)
    return () => observer.disconnect()
  // eslint-disable-next-line react-hooks/exhaustive-deps -- ResizeObserver handles content changes
  }, [])

  return (
    <div data-testid="paged-preview">
      {/* Hidden measurement container */}
      <div
        ref={measureRef}
        aria-hidden="true"
        style={{
          position: 'absolute',
          visibility: 'hidden',
          width: PAGE_WIDTH,
          overflow: 'hidden',
          pointerEvents: 'none',
        }}
      >
        {children}
      </div>

      {/* Visible pages */}
      <div className="flex flex-col items-center gap-8">
        {Array.from({ length: pageCount }, (_, i) => (
          <div key={i}>
            <div
              data-testid={`page-${i + 1}`}
              className="shadow-lg border border-gray-200 dark:border-gray-700 bg-white"
              style={{
                width: PAGE_WIDTH,
                height: PAGE_HEIGHT,
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              <div
                style={{
                  marginTop: -(i * PAGE_HEIGHT),
                }}
              >
                {children}
              </div>
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

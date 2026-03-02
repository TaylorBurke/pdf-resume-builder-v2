'use client'

import { useRef, useState, useCallback } from 'react'

const PAGE_WIDTH = 816
const PAGE_HEIGHT = 1056

interface PagedPreviewProps {
  html: string
}

/**
 * Measure where natural page breaks occur by walking elements in a
 * hidden iframe. Sections with break-inside:avoid stay whole.
 * The experience section (data-section="experience") can break
 * between entries but never mid-entry.
 */
function computeBreakOffsets(doc: Document): number[] {
  const container = doc.querySelector('[data-page-root]') ?? doc.body.firstElementChild
  if (!container) return [0]

  const offsets: number[] = [0]
  let currentPageBottom = PAGE_HEIGHT

  const children = Array.from(container.children) as HTMLElement[]

  for (const child of children) {
    const top = child.offsetTop
    const bottom = top + child.offsetHeight

    if (bottom <= currentPageBottom) {
      // Fits on current page — continue
      continue
    }

    // Check if this is the Experience section that can split
    if (child.getAttribute('data-section') === 'experience') {
      // Walk entries inside Experience to find where to break
      const entries = Array.from(child.children) as HTMLElement[]
      for (const entry of entries) {
        const entryTop = entry.offsetTop
        const entryBottom = entryTop + entry.offsetHeight

        if (entryBottom > currentPageBottom && entryTop < currentPageBottom) {
          // This entry would be split — break before it
          offsets.push(entryTop)
          currentPageBottom = entryTop + PAGE_HEIGHT
        } else if (entryTop >= currentPageBottom) {
          // Entry starts beyond current page — break at the page boundary
          offsets.push(entryTop)
          currentPageBottom = entryTop + PAGE_HEIGHT
        }
        // Advance currentPageBottom if entry extends past it
        while (entryBottom > currentPageBottom) {
          // Entry is somehow taller than a page (shouldn't happen but be safe)
          currentPageBottom += PAGE_HEIGHT
        }
      }
    } else {
      // Section doesn't fit and can't split — move it to next page
      offsets.push(top)
      currentPageBottom = top + PAGE_HEIGHT

      // If section is taller than a page, advance past it
      while (bottom > currentPageBottom) {
        currentPageBottom += PAGE_HEIGHT
      }
    }
  }

  return offsets
}

export default function PagedPreview({ html }: PagedPreviewProps) {
  const measureRef = useRef<HTMLIFrameElement>(null)
  const [breakOffsets, setBreakOffsets] = useState<number[]>([0])

  const handleMeasureLoad = useCallback(() => {
    const iframe = measureRef.current
    const doc = iframe?.contentDocument
    if (!doc?.body) return

    const offsets = computeBreakOffsets(doc)
    setBreakOffsets(offsets)
  }, [])

  if (!html) {
    return (
      <div data-testid="paged-preview" className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">Generating preview...</p>
      </div>
    )
  }

  // Add data-page-root to the body's first child for measurement
  const measurableHtml = html.replace(
    /<body>([\s\S]*?)<div /,
    '<body>$1<div data-page-root '
  )

  const pageCount = breakOffsets.length

  return (
    <div data-testid="paged-preview">
      {/* Hidden measurement iframe */}
      <iframe
        ref={measureRef}
        srcDoc={measurableHtml}
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
                srcDoc={getPageHtml(html, breakOffsets[i])}
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

/**
 * Offset the body content so the iframe shows content starting at the
 * given pixel offset.
 */
function getPageHtml(baseHtml: string, offset: number): string {
  if (offset === 0) return baseHtml
  return baseHtml.replace('<body>', `<body style="margin-top: -${offset}px;">`)
}

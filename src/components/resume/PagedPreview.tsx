'use client'

import { useRef, useState, useCallback } from 'react'

const PAGE_WIDTH = 816
const PAGE_HEIGHT = 1056
const PAGE_MARGIN_TOP = 120

interface PagedPreviewProps {
  html: string
}

/** Get an element's top position relative to the document root. */
function getAbsoluteTop(el: HTMLElement): number {
  let top = 0
  let current: HTMLElement | null = el
  while (current) {
    top += current.offsetTop
    current = current.offsetParent as HTMLElement | null
  }
  return top
}

/**
 * Measure where natural page breaks should occur by querying all
 * <section> elements in the document (regardless of nesting depth).
 * Sections stay whole unless they have data-section="experience",
 * which can split between entries.
 */
function computeBreakOffsets(doc: Document): number[] {
  const sections = doc.querySelectorAll('section')
  if (sections.length === 0) {
    // No sections found — fall back to total height
    const totalHeight = doc.body.scrollHeight
    if (totalHeight <= PAGE_HEIGHT) return [0]
    const offsets: number[] = [0]
    for (let y = PAGE_HEIGHT; y < totalHeight; y += PAGE_HEIGHT) {
      offsets.push(y)
    }
    return offsets
  }

  const offsets: number[] = [0]
  let currentPageBottom = PAGE_HEIGHT

  for (const section of sections) {
    const el = section as HTMLElement
    const top = getAbsoluteTop(el)
    const bottom = top + el.offsetHeight

    if (bottom <= currentPageBottom) continue

    if (el.getAttribute('data-section') === 'experience') {
      // Walk direct children (entries) inside Experience
      const entries = Array.from(el.children) as HTMLElement[]
      for (const entry of entries) {
        const entryTop = getAbsoluteTop(entry)
        const entryBottom = entryTop + entry.offsetHeight

        if (entryBottom > currentPageBottom) {
          // This entry crosses or starts beyond the page boundary
          offsets.push(entryTop)
          currentPageBottom = entryTop + PAGE_HEIGHT
        }
        while (entryBottom > currentPageBottom) {
          currentPageBottom += PAGE_HEIGHT
        }
      }
    } else {
      // Section doesn't fit — move it to the next page
      offsets.push(top)
      currentPageBottom = top + PAGE_HEIGHT

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

  const pageCount = breakOffsets.length

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
        {Array.from({ length: pageCount }, (_, i) => {
          const nextOffset = i + 1 < pageCount ? breakOffsets[i + 1] : undefined
          return (
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
                  srcDoc={getPageHtml(html, breakOffsets[i], nextOffset)}
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
          )
        })}
      </div>
    </div>
  )
}

/**
 * Create HTML for a single page by wrapping body content in clipping
 * divs. We use wrapper <div>s instead of styling <body> because
 * overflow:hidden on <body> propagates to the viewport per CSS spec.
 *
 * Page 1: single wrapper that clips at nextOffset.
 * Page 2+: a spacer div for top margin, then a clipping container
 * with an inner div that uses negative margin to offset content.
 */
function getPageHtml(baseHtml: string, offset: number, nextOffset?: number): string {
  if (offset === 0 && nextOffset === undefined) return baseHtml

  if (offset === 0) {
    // Page 1: just clip at the break point
    return baseHtml
      .replace('<body>', `<body><div style="height: ${nextOffset}px; overflow: hidden;">`)
      .replace('</body>', '</div></body>')
  }

  // Page 2+: spacer for top margin + clipping container + offset shift
  const contentAreaHeight = PAGE_HEIGHT - PAGE_MARGIN_TOP
  const innerStyles = [`margin-top: -${offset}px`]
  if (nextOffset !== undefined) {
    innerStyles.push(`height: ${nextOffset}px`, `overflow: hidden`)
  }

  const openTags =
    `<div style="height: ${PAGE_MARGIN_TOP}px;"></div>` +
    `<div style="height: ${contentAreaHeight}px; overflow: hidden;">` +
    `<div style="${innerStyles.join('; ')}">`

  return baseHtml
    .replace('<body>', `<body>${openTags}`)
    .replace('</body>', '</div></div></body>')
}

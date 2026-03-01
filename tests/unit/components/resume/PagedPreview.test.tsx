import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'

import PagedPreview from '@/components/resume/PagedPreview'

// Mock ResizeObserver which jsdom doesn't provide
class MockResizeObserver {
  callback: ResizeObserverCallback
  constructor(callback: ResizeObserverCallback) {
    this.callback = callback
  }
  observe(target: Element) {
    this.callback(
      [{ target, contentRect: {} } as ResizeObserverEntry],
      this as unknown as ResizeObserver
    )
  }
  unobserve() {}
  disconnect() {}
}

beforeEach(() => {
  vi.stubGlobal('ResizeObserver', MockResizeObserver)
})

describe('PagedPreview', () => {
  it('renders children inside page containers', () => {
    render(
      <PagedPreview>
        <div data-testid="template-content">Resume content</div>
      </PagedPreview>
    )

    // Children appear in both the hidden measurement container and the visible page
    const elements = screen.getAllByTestId('template-content')
    expect(elements.length).toBeGreaterThanOrEqual(1)
    expect(elements[0]).toBeInTheDocument()
  })

  it('renders at least one page container', () => {
    render(
      <PagedPreview>
        <div style={{ width: 816, minHeight: 1056 }}>Page 1 content</div>
      </PagedPreview>
    )

    expect(screen.getByTestId('paged-preview')).toBeInTheDocument()
    const pages = screen.getAllByTestId(/^page-\d+$/)
    expect(pages.length).toBeGreaterThanOrEqual(1)
  })

  it('shows page labels', () => {
    render(
      <PagedPreview>
        <div style={{ width: 816, minHeight: 1056 }}>Content</div>
      </PagedPreview>
    )

    expect(screen.getByText(/page 1/i)).toBeInTheDocument()
  })
})

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'

import PagedPreview from '@/components/resume/PagedPreview'

const mockHtml = '<html><body><div style="width:816px;min-height:1056px;">Page content</div></body></html>'

describe('PagedPreview', () => {
  it('renders the paged preview container', () => {
    render(<PagedPreview html={mockHtml} />)
    expect(screen.getByTestId('paged-preview')).toBeInTheDocument()
  })

  it('renders at least one page iframe', () => {
    render(<PagedPreview html={mockHtml} />)
    const pages = screen.getAllByTestId(/^page-\d+$/)
    expect(pages.length).toBeGreaterThanOrEqual(1)
  })

  it('renders iframes with srcdoc attribute', () => {
    render(<PagedPreview html={mockHtml} />)
    const pages = screen.getAllByTestId(/^page-\d+$/)
    // Each page is an iframe with srcdoc
    expect(pages[0].tagName).toBe('IFRAME')
    expect(pages[0]).toHaveAttribute('srcdoc', mockHtml)
  })

  it('shows page labels', () => {
    render(<PagedPreview html={mockHtml} />)
    expect(screen.getByText(/page 1/i)).toBeInTheDocument()
  })

  it('shows loading state when html is empty', () => {
    render(<PagedPreview html="" />)
    expect(screen.getByText(/generating preview/i)).toBeInTheDocument()
  })
})

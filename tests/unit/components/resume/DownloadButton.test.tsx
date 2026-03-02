import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import DownloadButton from '@/components/resume/DownloadButton'

// Mock global fetch
const mockFetch = vi.fn()

beforeEach(() => {
  vi.stubGlobal('fetch', mockFetch)
  vi.stubGlobal('URL', {
    createObjectURL: vi.fn(() => 'blob:http://localhost/fake'),
    revokeObjectURL: vi.fn(),
  })
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('DownloadButton', () => {
  const defaultProps = {
    resumeId: 'test-1',
    company: 'Acme Corp',
    jobTitle: 'Software Engineer',
    fullName: 'Jane Doe',
  }

  it('renders download button with text in full mode', () => {
    render(<DownloadButton {...defaultProps} />)
    expect(screen.getByRole('button', { name: /download pdf/i })).toBeInTheDocument()
  })

  it('renders icon-only button when iconOnly is true', () => {
    render(<DownloadButton {...defaultProps} iconOnly />)
    const btn = screen.getByRole('button', { name: /download pdf/i })
    expect(btn).toBeInTheDocument()
    expect(btn).not.toHaveTextContent('Download PDF')
  })

  it('shows loading state while downloading', async () => {
    const user = userEvent.setup()
    // Never resolve to keep loading state
    mockFetch.mockReturnValue(new Promise(() => {}))

    render(<DownloadButton {...defaultProps} />)
    await user.click(screen.getByRole('button', { name: /download pdf/i }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /downloading/i })).toBeDisabled()
    })
  })

  it('fetches PDF and triggers download on success', async () => {
    const user = userEvent.setup()
    const mockBlob = new Blob(['pdf-data'], { type: 'application/pdf' })
    mockFetch.mockResolvedValue({
      ok: true,
      blob: () => Promise.resolve(mockBlob),
    })

    // Mock createElement to capture the download link
    const clickSpy = vi.fn()
    const originalCreateElement = document.createElement.bind(document)
    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      const el = originalCreateElement(tag)
      if (tag === 'a') {
        vi.spyOn(el, 'click').mockImplementation(clickSpy)
      }
      return el
    })

    render(<DownloadButton {...defaultProps} />)
    await user.click(screen.getByRole('button', { name: /download pdf/i }))

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/pdf/test-1')
    })

    await waitFor(() => {
      expect(clickSpy).toHaveBeenCalled()
    })

    // Should return to idle
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /download pdf/i })).toBeEnabled()
    })
  })

  it('shows error state on fetch failure', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    mockFetch.mockResolvedValue({ ok: false, status: 500 })

    render(<DownloadButton {...defaultProps} />)
    await user.click(screen.getByRole('button', { name: /download pdf/i }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /download failed/i })).toBeInTheDocument()
    })

    // After 2 seconds, should reset to idle
    vi.advanceTimersByTime(2000)
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /download pdf/i })).toBeInTheDocument()
    })

    vi.useRealTimers()
  })

  it('uses correct filename with sanitized segments', async () => {
    const user = userEvent.setup()
    const mockBlob = new Blob(['pdf-data'], { type: 'application/pdf' })
    mockFetch.mockResolvedValue({
      ok: true,
      blob: () => Promise.resolve(mockBlob),
    })

    let capturedDownload = ''
    const originalCreateElement = document.createElement.bind(document)
    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      const el = originalCreateElement(tag)
      if (tag === 'a') {
        vi.spyOn(el, 'click').mockImplementation(() => {})
        const originalSet = Object.getOwnPropertyDescriptor(HTMLAnchorElement.prototype, 'download')!.set!
        Object.defineProperty(el, 'download', {
          set(v: string) { capturedDownload = v; originalSet.call(this, v) },
          get() { return capturedDownload },
        })
      }
      return el
    })

    render(<DownloadButton {...defaultProps} />)
    await user.click(screen.getByRole('button', { name: /download pdf/i }))

    await waitFor(() => {
      expect(capturedDownload).toBe('Jane_Doe-Acme_Corp-Software_Engineer.pdf')
    })
  })
})

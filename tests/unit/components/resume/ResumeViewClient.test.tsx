import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// Mock server actions
vi.mock('@/actions/generation', () => ({
  regenerateResume: vi.fn(),
  updateResumeTemplate: vi.fn(),
}))

// Mock preview server action to return HTML with identifiable template markers
const mockGetPreviewHtml = vi.fn()
vi.mock('@/actions/preview', () => ({
  getPreviewHtml: (...args: any[]) => mockGetPreviewHtml(...args),
}))

// Mock templates registry (still needed for isValidTemplateId and TemplateSelector)
vi.mock('@/templates', () => ({
  TEMPLATES: {
    clean: { name: 'Clean', component: () => null, description: 'Minimalist' },
    bold: { name: 'Bold', component: () => null, description: 'Modern' },
    executive: { name: 'Executive', component: () => null, description: 'Professional' },
  },
}))

import ResumeViewClient from '@/app/(app)/resume/[id]/client'

const mockResume = {
  id: 'test-1',
  jobTitle: 'Software Engineer',
  company: 'Acme Corp',
  templateId: null,
  resumeContent: {
    summary: 'Test summary',
    experience: [],
    skills: [],
  },
  feedbackHistory: [],
}

const mockPersonalInfo = {
  fullName: 'Jane Doe',
  email: 'jane@example.com',
}

beforeEach(() => {
  mockGetPreviewHtml.mockReset()
  mockGetPreviewHtml.mockResolvedValue('<html><body><div>Preview</div></body></html>')
})

describe('ResumeViewClient', () => {
  it('calls getPreviewHtml on mount with default template', async () => {
    render(
      <ResumeViewClient resume={mockResume} personalInfo={mockPersonalInfo} />
    )

    await waitFor(() => {
      expect(mockGetPreviewHtml).toHaveBeenCalledWith(
        mockResume.resumeContent,
        mockPersonalInfo,
        'clean'
      )
    })
  })

  it('calls getPreviewHtml with stored templateId', async () => {
    render(
      <ResumeViewClient
        resume={{ ...mockResume, templateId: 'bold' }}
        personalInfo={mockPersonalInfo}
      />
    )

    await waitFor(() => {
      expect(mockGetPreviewHtml).toHaveBeenCalledWith(
        mockResume.resumeContent,
        mockPersonalInfo,
        'bold'
      )
    })
  })

  it('renders PagedPreview with the returned HTML', async () => {
    mockGetPreviewHtml.mockResolvedValue('<html><body><div>Test HTML</div></body></html>')

    render(
      <ResumeViewClient resume={mockResume} personalInfo={mockPersonalInfo} />
    )

    await waitFor(() => {
      expect(screen.getByTestId('paged-preview')).toBeInTheDocument()
    })
  })

  it('calls getPreviewHtml again when template changes', async () => {
    const user = userEvent.setup()
    render(
      <ResumeViewClient resume={mockResume} personalInfo={mockPersonalInfo} />
    )

    await waitFor(() => {
      expect(mockGetPreviewHtml).toHaveBeenCalledTimes(1)
    })

    // Click "Executive" template button
    await user.click(screen.getByRole('button', { name: /executive/i }))

    await waitFor(() => {
      expect(mockGetPreviewHtml).toHaveBeenCalledWith(
        mockResume.resumeContent,
        mockPersonalInfo,
        'executive'
      )
    })
  })

  describe('Overlay drawer', () => {
    it('renders a drawer toggle button', () => {
      render(
        <ResumeViewClient resume={mockResume} personalInfo={mockPersonalInfo} />
      )
      expect(screen.getByRole('button', { name: /customize/i })).toBeInTheDocument()
    })

    it('opens drawer when toggle is clicked', async () => {
      const user = userEvent.setup()
      render(
        <ResumeViewClient resume={mockResume} personalInfo={mockPersonalInfo} />
      )

      const drawer = screen.getByTestId('controls-drawer')
      expect(drawer).toHaveClass('translate-x-full')

      await user.click(screen.getByRole('button', { name: /customize/i }))

      expect(drawer).toHaveClass('translate-x-0')
    })

    it('closes drawer when close button is clicked', async () => {
      const user = userEvent.setup()
      render(
        <ResumeViewClient resume={mockResume} personalInfo={mockPersonalInfo} />
      )

      await user.click(screen.getByRole('button', { name: /customize/i }))
      const drawer = screen.getByTestId('controls-drawer')
      expect(drawer).toHaveClass('translate-x-0')

      await user.click(screen.getByRole('button', { name: /close/i }))
      expect(drawer).toHaveClass('translate-x-full')
    })
  })
})

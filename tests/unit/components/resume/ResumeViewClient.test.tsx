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

const mockAnalysis = {
  keyRequirements: [
    { requirement: 'React experience', priority: 'high' as const },
    { requirement: 'Node.js', priority: 'medium' as const },
  ],
  skillMatches: [
    { skill: 'React', strength: 'strong' as const },
    { skill: 'TypeScript', strength: 'moderate' as const },
  ],
  gaps: ['Docker experience'],
  recommendedAngle: 'Focus on frontend expertise',
  sectionsToInclude: ['experience' as const, 'skills' as const],
}

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
  analysis: mockAnalysis,
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

    // Open drawer and switch to Customize tab to access template selector
    const customizeButtons = screen.getAllByRole('button', { name: /customize/i })
    await user.click(customizeButtons[0]) // Open drawer
    await user.click(screen.getAllByRole('button', { name: /customize/i })[1]) // Switch to Customize tab

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

  describe('Analysis panel', () => {
    it('renders collapsed analysis panel when analysis is present', () => {
      render(
        <ResumeViewClient resume={mockResume} personalInfo={mockPersonalInfo} />
      )
      expect(screen.getByRole('button', { name: /job analysis/i })).toBeInTheDocument()
      // Content is hidden when collapsed
      expect(screen.queryByText('React experience')).not.toBeInTheDocument()
    })

    it('expands analysis panel on click', async () => {
      const user = userEvent.setup()
      render(
        <ResumeViewClient resume={mockResume} personalInfo={mockPersonalInfo} />
      )

      await user.click(screen.getByRole('button', { name: /job analysis/i }))

      expect(screen.getByText('React experience')).toBeInTheDocument()
      expect(screen.getByText('Docker experience')).toBeInTheDocument()
      expect(screen.getByText('Focus on frontend expertise')).toBeInTheDocument()
    })

    it('does not render analysis panel when analysis is null', () => {
      render(
        <ResumeViewClient
          resume={{ ...mockResume, analysis: null }}
          personalInfo={mockPersonalInfo}
        />
      )
      expect(screen.queryByRole('button', { name: /job analysis/i })).not.toBeInTheDocument()
    })
  })

  describe('Overlay drawer', () => {
    it('renders a drawer toggle button', () => {
      render(
        <ResumeViewClient resume={mockResume} personalInfo={mockPersonalInfo} />
      )
      const customizeButtons = screen.getAllByRole('button', { name: /customize/i })
      expect(customizeButtons.length).toBeGreaterThanOrEqual(1)
    })

    it('opens drawer when toggle is clicked', async () => {
      const user = userEvent.setup()
      render(
        <ResumeViewClient resume={mockResume} personalInfo={mockPersonalInfo} />
      )

      const drawer = screen.getByTestId('controls-drawer')
      expect(drawer).toHaveClass('translate-x-full')

      await user.click(screen.getAllByRole('button', { name: /customize/i })[0])

      expect(drawer).toHaveClass('translate-x-0')
    })

    it('closes drawer when close button is clicked', async () => {
      const user = userEvent.setup()
      render(
        <ResumeViewClient resume={mockResume} personalInfo={mockPersonalInfo} />
      )

      await user.click(screen.getAllByRole('button', { name: /customize/i })[0])
      const drawer = screen.getByTestId('controls-drawer')
      expect(drawer).toHaveClass('translate-x-0')

      await user.click(screen.getByRole('button', { name: /close/i }))
      expect(drawer).toHaveClass('translate-x-full')
    })

    it('renders Edit and Customize tabs in drawer', async () => {
      const user = userEvent.setup()
      render(
        <ResumeViewClient resume={mockResume} personalInfo={mockPersonalInfo} />
      )
      await user.click(screen.getAllByRole('button', { name: /customize/i })[0])
      // Drawer is now open, both tabs visible
      expect(screen.getByRole('button', { name: /^edit$/i })).toBeInTheDocument()
      // "Customize" button exists as both the toggle and the tab — use getAllByRole
      const customizeButtons = screen.getAllByRole('button', { name: /customize/i })
      expect(customizeButtons.length).toBeGreaterThanOrEqual(2)
    })
  })
})

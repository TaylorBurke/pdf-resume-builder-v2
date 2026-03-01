import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}))

// Mock server actions
vi.mock('@/actions/generation', () => ({
  regenerateResume: vi.fn(),
  updateResumeTemplate: vi.fn(),
}))

// Mock template components so we can detect which renders
vi.mock('@/templates', () => ({
  TEMPLATES: {
    clean: {
      name: 'Clean',
      component: ({ resume, personalInfo }: any) => (
        <div data-testid="template-clean">Clean Template</div>
      ),
      description: 'Minimalist',
    },
    bold: {
      name: 'Bold',
      component: ({ resume, personalInfo }: any) => (
        <div data-testid="template-bold">Bold Template</div>
      ),
      description: 'Modern',
    },
    executive: {
      name: 'Executive',
      component: ({ resume, personalInfo }: any) => (
        <div data-testid="template-executive">Executive Template</div>
      ),
      description: 'Professional',
    },
  },
}))

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

describe('ResumeViewClient', () => {
  it('renders clean template by default when templateId is null', () => {
    render(
      <ResumeViewClient resume={mockResume} personalInfo={mockPersonalInfo} />
    )
    // PagedPreview renders children twice (measurement + visible), so use getAllByTestId
    expect(screen.getAllByTestId('template-clean').length).toBeGreaterThanOrEqual(1)
  })

  it('renders the template matching the stored templateId', () => {
    render(
      <ResumeViewClient
        resume={{ ...mockResume, templateId: 'bold' }}
        personalInfo={mockPersonalInfo}
      />
    )
    expect(screen.getAllByTestId('template-bold').length).toBeGreaterThanOrEqual(1)
  })

  it('switches template when user clicks a different template button', async () => {
    const user = userEvent.setup()
    render(
      <ResumeViewClient resume={mockResume} personalInfo={mockPersonalInfo} />
    )

    // Initially clean
    expect(screen.getAllByTestId('template-clean').length).toBeGreaterThanOrEqual(1)

    // Click "Executive" template button (in the drawer overlay)
    await user.click(screen.getByRole('button', { name: /executive/i }))

    // Should now show executive template
    expect(screen.getAllByTestId('template-executive').length).toBeGreaterThanOrEqual(1)
    expect(screen.queryByTestId('template-clean')).not.toBeInTheDocument()
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

import { describe, it, expect, vi } from 'vitest'
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
    expect(screen.getByTestId('template-clean')).toBeInTheDocument()
  })

  it('renders the template matching the stored templateId', () => {
    render(
      <ResumeViewClient
        resume={{ ...mockResume, templateId: 'bold' }}
        personalInfo={mockPersonalInfo}
      />
    )
    expect(screen.getByTestId('template-bold')).toBeInTheDocument()
  })

  it('switches template when user clicks a different template button', async () => {
    const user = userEvent.setup()
    render(
      <ResumeViewClient resume={mockResume} personalInfo={mockPersonalInfo} />
    )

    // Initially clean
    expect(screen.getByTestId('template-clean')).toBeInTheDocument()

    // Click "Executive" template button
    await user.click(screen.getByRole('button', { name: /executive/i }))

    // Should now show executive template
    expect(screen.getByTestId('template-executive')).toBeInTheDocument()
    expect(screen.queryByTestId('template-clean')).not.toBeInTheDocument()
  })
})

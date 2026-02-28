import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SectionForm from '@/components/onboarding/SectionForm'

describe('SectionForm', () => {
  const defaultProps = {
    title: 'Personal Information',
    description: 'Enter your basic details.',
    onSubmit: vi.fn(),
    onSkip: vi.fn(),
  }

  it('renders title and description', () => {
    render(<SectionForm {...defaultProps}><div>child</div></SectionForm>)
    expect(screen.getByText('Personal Information')).toBeInTheDocument()
    expect(screen.getByText('Enter your basic details.')).toBeInTheDocument()
  })

  it('shows skip button when not required', () => {
    render(<SectionForm {...defaultProps} isRequired={false}><div>child</div></SectionForm>)
    expect(screen.getByText('Skip')).toBeInTheDocument()
  })

  it('hides skip button when required', () => {
    render(<SectionForm {...defaultProps} isRequired={true}><div>child</div></SectionForm>)
    expect(screen.queryByText('Skip')).not.toBeInTheDocument()
  })

  it('has continue button', () => {
    render(<SectionForm {...defaultProps}><div>child</div></SectionForm>)
    expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument()
  })

  it('calls onSubmit when form is submitted', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<SectionForm {...defaultProps} onSubmit={onSubmit}><div>child</div></SectionForm>)
    await user.click(screen.getByRole('button', { name: /continue/i }))
    expect(onSubmit).toHaveBeenCalledOnce()
  })

  it('calls onSkip when skip button is clicked', async () => {
    const user = userEvent.setup()
    const onSkip = vi.fn()
    render(<SectionForm {...defaultProps} onSkip={onSkip}><div>child</div></SectionForm>)
    await user.click(screen.getByText('Skip'))
    expect(onSkip).toHaveBeenCalledOnce()
  })
})

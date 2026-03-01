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

  it('shows Skip as button text when not required and isEmpty', () => {
    render(<SectionForm {...defaultProps} isRequired={false} isEmpty={true}><div>child</div></SectionForm>)
    expect(screen.getByRole('button', { name: /skip/i })).toBeInTheDocument()
  })

  it('shows Continue when required', () => {
    render(<SectionForm {...defaultProps} isRequired={true}><div>child</div></SectionForm>)
    expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument()
  })

  it('shows Continue when not required but has content', () => {
    render(<SectionForm {...defaultProps} isRequired={false} isEmpty={false}><div>child</div></SectionForm>)
    expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument()
  })

  it('calls onSubmit when form has content', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<SectionForm {...defaultProps} onSubmit={onSubmit} isEmpty={false}><div>child</div></SectionForm>)
    await user.click(screen.getByRole('button', { name: /continue/i }))
    expect(onSubmit).toHaveBeenCalledOnce()
  })

  it('calls onSkip when form is empty and not required', async () => {
    const user = userEvent.setup()
    const onSkip = vi.fn()
    render(<SectionForm {...defaultProps} onSkip={onSkip} isRequired={false} isEmpty={true}><div>child</div></SectionForm>)
    await user.click(screen.getByRole('button', { name: /skip/i }))
    expect(onSkip).toHaveBeenCalledOnce()
  })
})

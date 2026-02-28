import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import PersonalInfoStep from '@/components/onboarding/steps/PersonalInfoStep'

describe('PersonalInfoStep', () => {
  const defaultProps = {
    onSubmit: vi.fn(),
    onSkip: vi.fn(),
    initialData: null,
  }

  it('renders name, email, phone, and location fields', () => {
    render(<PersonalInfoStep {...defaultProps} />)
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/phone/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/location/i)).toBeInTheDocument()
  })

  it('renders LinkedIn, GitHub, portfolio, and website URL fields', () => {
    render(<PersonalInfoStep {...defaultProps} />)
    expect(screen.getByLabelText(/linkedin url/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/github url/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/portfolio url/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/website url/i)).toBeInTheDocument()
  })

  it('pre-fills from initialData', () => {
    render(
      <PersonalInfoStep
        {...defaultProps}
        initialData={{
          fullName: 'John Doe',
          email: 'john@example.com',
          phone: '555-1234',
          location: 'NYC',
        }}
      />
    )
    expect(screen.getByLabelText(/full name/i)).toHaveValue('John Doe')
    expect(screen.getByLabelText(/email/i)).toHaveValue('john@example.com')
    expect(screen.getByLabelText(/phone/i)).toHaveValue('555-1234')
    expect(screen.getByLabelText(/location/i)).toHaveValue('NYC')
  })

  it('is marked as required (no skip button)', () => {
    render(<PersonalInfoStep {...defaultProps} />)
    expect(screen.queryByText('Skip')).not.toBeInTheDocument()
  })
})

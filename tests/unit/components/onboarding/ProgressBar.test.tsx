import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import ProgressBar from '@/components/onboarding/ProgressBar'

describe('ProgressBar', () => {
  it('renders with correct step count', () => {
    render(<ProgressBar currentStep={3} totalSteps={13} />)
    const progressbar = screen.getByRole('progressbar')
    expect(progressbar).toBeInTheDocument()
    const bars = progressbar.querySelectorAll('[data-step]')
    expect(bars).toHaveLength(13)
  })

  it('displays "X of Y" text', () => {
    render(<ProgressBar currentStep={5} totalSteps={13} />)
    expect(screen.getByText('5 of 13')).toBeInTheDocument()
  })

  it('marks completed steps', () => {
    render(<ProgressBar currentStep={4} totalSteps={13} />)
    const progressbar = screen.getByRole('progressbar')
    expect(progressbar).toHaveAttribute('data-completed', '3')

    const completed = progressbar.querySelectorAll('[data-status="completed"]')
    expect(completed).toHaveLength(3)

    const current = progressbar.querySelectorAll('[data-status="current"]')
    expect(current).toHaveLength(1)

    const remaining = progressbar.querySelectorAll('[data-status="remaining"]')
    expect(remaining).toHaveLength(9)
  })
})

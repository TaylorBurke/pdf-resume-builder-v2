import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import FeedbackForm from '@/components/resume/FeedbackForm'

describe('FeedbackForm', () => {
  it('renders a textarea and regenerate button', () => {
    render(<FeedbackForm onSubmit={vi.fn()} />)
    expect(screen.getByPlaceholderText(/describe what you'd like to change/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /regenerate/i })).toBeInTheDocument()
  })

  it('calls onSubmit with feedback text when submitted', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<FeedbackForm onSubmit={onSubmit} />)

    const textarea = screen.getByPlaceholderText(/describe what you'd like to change/i)
    await user.type(textarea, 'Make the summary more concise')
    await user.click(screen.getByRole('button', { name: /regenerate/i }))

    expect(onSubmit).toHaveBeenCalledWith('Make the summary more concise')
  })

  it('disables button when feedback is empty', () => {
    render(<FeedbackForm onSubmit={vi.fn()} />)
    expect(screen.getByRole('button', { name: /regenerate/i })).toBeDisabled()
  })

  it('shows loading state when isLoading is true', () => {
    render(<FeedbackForm onSubmit={vi.fn()} isLoading />)
    expect(screen.getByRole('button', { name: /regenerating/i })).toBeDisabled()
  })

  it('clears textarea after submission', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<FeedbackForm onSubmit={onSubmit} />)

    const textarea = screen.getByPlaceholderText(/describe what you'd like to change/i)
    await user.type(textarea, 'Some feedback')
    await user.click(screen.getByRole('button', { name: /regenerate/i }))

    expect(textarea).toHaveValue('')
  })
})

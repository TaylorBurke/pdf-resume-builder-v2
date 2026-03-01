import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SignInButtons } from '@/components/sign-in-buttons'

// Mock fetch for CSRF token
const mockFetch = vi.fn().mockResolvedValue({
  json: () => Promise.resolve({ csrfToken: 'test-csrf-token' }),
})
vi.stubGlobal('fetch', mockFetch)

describe('SignInButtons', () => {
  it('renders sign-in buttons for Google and GitHub', () => {
    render(<SignInButtons />)
    expect(screen.getByRole('button', { name: /google/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /github/i })).toBeInTheDocument()
  })

  it('renders forms that POST to auth endpoints', () => {
    const { container } = render(<SignInButtons />)
    const forms = container.querySelectorAll('form')
    expect(forms[0].getAttribute('action')).toBe('/api/auth/signin/google')
    expect(forms[0].getAttribute('method')).toBe('POST')
    expect(forms[1].getAttribute('action')).toBe('/api/auth/signin/github')
    expect(forms[1].getAttribute('method')).toBe('POST')
  })
})

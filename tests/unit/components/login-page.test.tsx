import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

// Mock server-only modules
vi.mock('@/lib/auth', () => ({
  signIn: vi.fn(),
}))

describe('LoginPage', () => {
  it('renders sign-in buttons for Google and GitHub', async () => {
    const { default: LoginPage } = await import('@/app/login/page')
    render(<LoginPage />)
    expect(screen.getByRole('button', { name: /google/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /github/i })).toBeInTheDocument()
  })

  it('displays app name', async () => {
    const { default: LoginPage } = await import('@/app/login/page')
    render(<LoginPage />)
    expect(screen.getByText(/resume builder/i)).toBeInTheDocument()
  })
})

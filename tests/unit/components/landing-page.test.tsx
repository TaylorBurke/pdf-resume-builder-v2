import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

// Mock server-only modules
vi.mock('@/lib/auth', () => ({
  auth: vi.fn().mockResolvedValue(null),
}))

// Mock next/navigation
vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}))

describe('Landing Page', () => {
  it('renders the hero title and CTA', async () => {
    const { default: Home } = await import('@/app/page')
    const result = await Home()
    render(result)

    expect(screen.getByText(/build your perfect resume/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /get started/i })).toBeInTheDocument()
  })

  it('renders the app name in header', async () => {
    const { default: Home } = await import('@/app/page')
    const result = await Home()
    render(result)

    expect(screen.getAllByText(/resume builder/i).length).toBeGreaterThan(0)
  })

  it('has a sign in link', async () => {
    const { default: Home } = await import('@/app/page')
    const result = await Home()
    render(result)

    expect(screen.getByRole('link', { name: /sign in/i })).toBeInTheDocument()
  })

  it('redirects to dashboard when authenticated', async () => {
    const { auth } = await import('@/lib/auth')
    const { redirect } = await import('next/navigation')
    vi.mocked(auth).mockResolvedValueOnce({
      user: { id: '1', name: 'Test', email: 'test@test.com' },
      expires: '',
    } as any)

    const { default: Home } = await import('@/app/page')
    await Home()

    expect(redirect).toHaveBeenCalledWith('/dashboard')
  })
})

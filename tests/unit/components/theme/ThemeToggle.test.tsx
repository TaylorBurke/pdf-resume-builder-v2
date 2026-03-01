import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider } from '@/components/theme/ThemeProvider'
import { ThemeToggle } from '@/components/theme/ThemeToggle'

const mockMatchMedia = vi.fn().mockReturnValue({
  matches: false,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
})

beforeEach(() => {
  window.matchMedia = mockMatchMedia
  localStorage.clear()
  document.documentElement.classList.remove('dark')
})

describe('ThemeToggle', () => {
  it('renders a theme toggle button', () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    )
    expect(screen.getByRole('button', { name: /theme/i })).toBeInTheDocument()
  })

  it('cycles through light, dark, system on click', async () => {
    const user = userEvent.setup()
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    )

    const button = screen.getByRole('button', { name: /theme/i })

    // Default is system (no localStorage), click -> light
    await user.click(button)
    expect(localStorage.getItem('theme')).toBe('light')

    // Click -> dark
    await user.click(button)
    expect(localStorage.getItem('theme')).toBe('dark')

    // Click -> system (removes localStorage)
    await user.click(button)
    expect(localStorage.getItem('theme')).toBeNull()
  })

  it('applies dark class when theme is dark', async () => {
    const user = userEvent.setup()
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    )

    const button = screen.getByRole('button', { name: /theme/i })

    // Click to light
    await user.click(button)
    expect(document.documentElement.classList.contains('dark')).toBe(false)

    // Click to dark
    await user.click(button)
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })
})

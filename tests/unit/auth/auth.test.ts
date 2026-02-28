import { describe, it, expect, vi } from 'vitest'

// Mock the db client
vi.mock('@/lib/db/client', () => ({
  db: {},
}))

// Mock next-auth to avoid Next.js server dependency in test environment
vi.mock('next-auth', () => {
  return {
    default: vi.fn(() => ({
      handlers: { GET: vi.fn(), POST: vi.fn() },
      auth: vi.fn(),
      signIn: vi.fn(),
      signOut: vi.fn(),
    })),
  }
})

// Mock the providers
vi.mock('next-auth/providers/google', () => ({
  default: vi.fn(),
}))

vi.mock('next-auth/providers/github', () => ({
  default: vi.fn(),
}))

// Mock the drizzle adapter
vi.mock('@auth/drizzle-adapter', () => ({
  DrizzleAdapter: vi.fn(),
}))

describe('Auth configuration', () => {
  it('exports auth, signIn, signOut, and handlers', async () => {
    const authModule = await import('@/lib/auth')
    expect(authModule.auth).toBeDefined()
    expect(authModule.signIn).toBeDefined()
    expect(authModule.signOut).toBeDefined()
    expect(authModule.handlers).toBeDefined()
  })

  it('handlers exports GET and POST', async () => {
    const { handlers } = await import('@/lib/auth')
    expect(handlers.GET).toBeDefined()
    expect(handlers.POST).toBeDefined()
  })

  it('calls NextAuth with the correct configuration', async () => {
    const NextAuth = (await import('next-auth')).default
    await import('@/lib/auth')
    expect(NextAuth).toHaveBeenCalledWith(
      expect.objectContaining({
        providers: expect.any(Array),
        pages: expect.objectContaining({
          signIn: '/login',
        }),
        callbacks: expect.objectContaining({
          session: expect.any(Function),
        }),
      })
    )
  })
})

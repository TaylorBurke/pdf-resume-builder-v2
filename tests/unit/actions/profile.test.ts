import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/db/client', () => ({ db: {} }))
vi.mock('@/lib/auth', () => ({
  auth: vi.fn(() => Promise.resolve({ user: { id: 'user-1' } })),
}))

describe('Profile Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('exports getProfileSections function', async () => {
    const { getProfileSections } = await import('@/actions/profile')
    expect(typeof getProfileSections).toBe('function')
  })

  it('exports getProfileSection function', async () => {
    const { getProfileSection } = await import('@/actions/profile')
    expect(typeof getProfileSection).toBe('function')
  })

  it('exports saveProfileSection function', async () => {
    const { saveProfileSection } = await import('@/actions/profile')
    expect(typeof saveProfileSection).toBe('function')
  })

  it('exports deleteProfileSection function', async () => {
    const { deleteProfileSection } = await import('@/actions/profile')
    expect(typeof deleteProfileSection).toBe('function')
  })
})

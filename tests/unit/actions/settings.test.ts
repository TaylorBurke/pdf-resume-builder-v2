import { describe, it, expect, vi } from 'vitest'

vi.mock('@/lib/db/client', () => ({ db: {} }))
vi.mock('@/lib/auth', () => ({
  auth: vi.fn(() => Promise.resolve({ user: { id: 'user-1' } })),
}))

describe('Settings Actions', () => {
  it('exports saveOpenRouterKey function', async () => {
    const { saveOpenRouterKey } = await import('@/actions/settings')
    expect(typeof saveOpenRouterKey).toBe('function')
  })

  it('exports savePreferredModel function', async () => {
    const { savePreferredModel } = await import('@/actions/settings')
    expect(typeof savePreferredModel).toBe('function')
  })

  it('exports getSettings function', async () => {
    const { getSettings } = await import('@/actions/settings')
    expect(typeof getSettings).toBe('function')
  })
})

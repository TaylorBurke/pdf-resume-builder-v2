import { describe, it, expect, vi } from 'vitest'

vi.mock('@/lib/db/client', () => ({ db: {} }))
vi.mock('@/lib/auth', () => ({
  auth: vi.fn(() => Promise.resolve({ user: { id: 'user-1' } })),
}))
vi.mock('@/lib/ai/openrouter', () => ({
  callOpenRouterJSON: vi.fn(),
}))

describe('Generation Actions', () => {
  it('exports analyzeJob function', async () => {
    const { analyzeJob } = await import('@/actions/generation')
    expect(typeof analyzeJob).toBe('function')
  })

  it('exports generateResume function', async () => {
    const { generateResume } = await import('@/actions/generation')
    expect(typeof generateResume).toBe('function')
  })

  it('exports regenerateResume function', async () => {
    const { regenerateResume } = await import('@/actions/generation')
    expect(typeof regenerateResume).toBe('function')
  })
})

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

  it('exports generateCoverLetters function', async () => {
    const { generateCoverLetters } = await import('@/actions/generation')
    expect(typeof generateCoverLetters).toBe('function')
  })

  it('exports updateCoverLetter function', async () => {
    const { updateCoverLetter } = await import('@/actions/generation')
    expect(typeof updateCoverLetter).toBe('function')
  })

  it('exports getCoverLetters function', async () => {
    const { getCoverLetters } = await import('@/actions/generation')
    expect(typeof getCoverLetters).toBe('function')
  })
})

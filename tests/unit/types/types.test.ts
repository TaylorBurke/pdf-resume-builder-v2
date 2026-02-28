import { describe, it, expect } from 'vitest'

describe('Types', () => {
  it('SECTION_TYPES contains all 13 section types', async () => {
    const { SECTION_TYPES } = await import('@/types')
    expect(SECTION_TYPES).toHaveLength(13)
    expect(SECTION_TYPES).toContain('personal_info')
    expect(SECTION_TYPES).toContain('summary')
    expect(SECTION_TYPES).toContain('experience')
    expect(SECTION_TYPES).toContain('education')
    expect(SECTION_TYPES).toContain('skills')
    expect(SECTION_TYPES).toContain('projects')
    expect(SECTION_TYPES).toContain('certificates')
    expect(SECTION_TYPES).toContain('references')
    expect(SECTION_TYPES).toContain('volunteer')
    expect(SECTION_TYPES).toContain('languages')
    expect(SECTION_TYPES).toContain('awards')
    expect(SECTION_TYPES).toContain('ip')
    expect(SECTION_TYPES).toContain('interests')
  })
})

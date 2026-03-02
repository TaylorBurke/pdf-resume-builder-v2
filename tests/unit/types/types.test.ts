import { describe, it, expect } from 'vitest'
import type { CoverLetterTone, CoverLetterSet } from '@/types'

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

  it('CoverLetterTone accepts valid tones', () => {
    const tones: CoverLetterTone[] = ['formal', 'culture_fit', 'technical']
    expect(tones).toHaveLength(3)
  })

  it('CoverLetterSet has all three tone fields', () => {
    const set: CoverLetterSet = {
      formal: 'Dear Hiring Manager...',
      cultureFit: 'Hi there...',
      technical: 'As a senior engineer...',
    }
    expect(set.formal).toBeDefined()
    expect(set.cultureFit).toBeDefined()
    expect(set.technical).toBeDefined()
  })
})

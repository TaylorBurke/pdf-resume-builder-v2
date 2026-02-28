import { describe, it, expect } from 'vitest'
import { buildAnalysisPrompt } from '@/lib/ai/prompts/analyze-job'

describe('buildAnalysisPrompt', () => {
  const jobText = 'We are looking for a Senior React Developer with 5+ years of experience.'

  const profileSections = [
    {
      sectionType: 'personal_info',
      data: { fullName: 'Jane Doe', email: 'jane@example.com' },
    },
    {
      sectionType: 'experience',
      data: {
        entries: [
          {
            company: 'Acme Corp',
            title: 'Frontend Developer',
            startDate: '2020-01',
            current: true,
            bullets: ['Built React apps'],
          },
        ],
      },
    },
    {
      sectionType: 'skills',
      data: {
        categories: [{ name: 'Frontend', items: ['React', 'TypeScript'] }],
      },
    },
  ]

  it('returns a string prompt', () => {
    const prompt = buildAnalysisPrompt({ jobText, profileSections })
    expect(typeof prompt).toBe('string')
    expect(prompt.length).toBeGreaterThan(0)
  })

  it('includes the job posting text', () => {
    const prompt = buildAnalysisPrompt({ jobText, profileSections })
    expect(prompt).toContain(jobText)
  })

  it('includes profile section data', () => {
    const prompt = buildAnalysisPrompt({ jobText, profileSections })
    expect(prompt).toContain('Jane Doe')
    expect(prompt).toContain('Acme Corp')
    expect(prompt).toContain('React')
  })

  it('asks for JSON output with required fields', () => {
    const prompt = buildAnalysisPrompt({ jobText, profileSections })
    expect(prompt).toContain('keyRequirements')
    expect(prompt).toContain('skillMatches')
    expect(prompt).toContain('gaps')
    expect(prompt).toContain('recommendedAngle')
    expect(prompt).toContain('sectionsToInclude')
  })

  it('instructs to always include core sections', () => {
    const prompt = buildAnalysisPrompt({ jobText, profileSections })
    expect(prompt).toContain('personal_info')
    expect(prompt).toContain('summary')
    expect(prompt).toContain('experience')
    expect(prompt).toContain('skills')
  })

  it('mentions optional sections should only be included if relevant', () => {
    const prompt = buildAnalysisPrompt({ jobText, profileSections })
    expect(prompt.toLowerCase()).toMatch(/optional.*relevant|relevant.*optional|only include.*if/i)
  })
})

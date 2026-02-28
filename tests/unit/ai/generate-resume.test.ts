import { describe, it, expect } from 'vitest'
import { buildGenerationPrompt } from '@/lib/ai/prompts/generate-resume'
import type { JobAnalysis } from '@/types'

describe('buildGenerationPrompt', () => {
  const analysis: JobAnalysis = {
    keyRequirements: [
      { requirement: 'React experience', priority: 'high' },
      { requirement: 'CI/CD knowledge', priority: 'medium' },
    ],
    skillMatches: [
      { skill: 'React', strength: 'strong' },
      { skill: 'TypeScript', strength: 'moderate' },
    ],
    gaps: ['No Kubernetes experience'],
    recommendedAngle: 'Emphasize frontend expertise and rapid learning ability',
    sectionsToInclude: ['personal_info', 'summary', 'experience', 'skills', 'projects'],
  }

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
            bullets: ['Built React applications serving 10k users'],
          },
        ],
      },
    },
    {
      sectionType: 'skills',
      data: {
        categories: [{ name: 'Frontend', items: ['React', 'TypeScript', 'CSS'] }],
      },
    },
  ]

  it('returns a string prompt', () => {
    const prompt = buildGenerationPrompt({ analysis, profileSections })
    expect(typeof prompt).toBe('string')
    expect(prompt.length).toBeGreaterThan(0)
  })

  it('includes the analysis data', () => {
    const prompt = buildGenerationPrompt({ analysis, profileSections })
    expect(prompt).toContain('React experience')
    expect(prompt).toContain('Emphasize frontend expertise')
    expect(prompt).toContain('No Kubernetes experience')
  })

  it('includes profile section data', () => {
    const prompt = buildGenerationPrompt({ analysis, profileSections })
    expect(prompt).toContain('Jane Doe')
    expect(prompt).toContain('Acme Corp')
    expect(prompt).toContain('TypeScript')
  })

  it('asks for JSON resume output with required fields', () => {
    const prompt = buildGenerationPrompt({ analysis, profileSections })
    expect(prompt).toContain('summary')
    expect(prompt).toContain('experience')
    expect(prompt).toContain('skills')
  })

  it('includes the no-fabrication rule', () => {
    const prompt = buildGenerationPrompt({ analysis, profileSections })
    expect(prompt.toLowerCase()).toMatch(/never fabricate|do not fabricate|never invent|no fabricat/i)
  })

  it('excludes references from resume content', () => {
    const prompt = buildGenerationPrompt({ analysis, profileSections })
    expect(prompt.toLowerCase()).toMatch(/references.*never|never.*references|do not include.*references|references.*not.*include/i)
  })
})

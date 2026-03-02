import { describe, it, expect } from 'vitest'
import { buildCoverLetterPrompt } from '@/lib/ai/prompts/generate-cover-letters'

describe('buildCoverLetterPrompt', () => {
  const jobText = 'We are looking for a Senior React Developer with 5+ years of experience.'
  const company = 'Acme Corp'
  const jobTitle = 'Senior React Developer'

  const analysis = {
    keyRequirements: [{ requirement: 'React experience', priority: 'high' as const }],
    skillMatches: [{ skill: 'React', strength: 'strong' as const }],
    gaps: [],
    recommendedAngle: 'Emphasize frontend expertise',
    sectionsToInclude: ['personal_info' as const, 'experience' as const, 'skills' as const, 'summary' as const],
  }

  const profileSections = [
    { sectionType: 'personal_info', data: { fullName: 'Jane Doe', email: 'jane@example.com' } },
    { sectionType: 'experience', data: { entries: [{ company: 'TechCo', title: 'Developer', startDate: '2020-01', current: true, bullets: ['Built React apps'] }] } },
    { sectionType: 'summary', data: { text: 'Experienced frontend developer' } },
  ]

  it('returns a string prompt', () => {
    const prompt = buildCoverLetterPrompt({ jobText, company, jobTitle, analysis, profileSections })
    expect(typeof prompt).toBe('string')
    expect(prompt.length).toBeGreaterThan(0)
  })

  it('includes the job posting text', () => {
    const prompt = buildCoverLetterPrompt({ jobText, company, jobTitle, analysis, profileSections })
    expect(prompt).toContain(jobText)
  })

  it('includes the company name', () => {
    const prompt = buildCoverLetterPrompt({ jobText, company, jobTitle, analysis, profileSections })
    expect(prompt).toContain('Acme Corp')
  })

  it('mentions all three tones', () => {
    const prompt = buildCoverLetterPrompt({ jobText, company, jobTitle, analysis, profileSections })
    expect(prompt).toContain('formal')
    expect(prompt).toContain('cultureFit')
    expect(prompt).toContain('technical')
  })

  it('includes the recommended angle from analysis', () => {
    const prompt = buildCoverLetterPrompt({ jobText, company, jobTitle, analysis, profileSections })
    expect(prompt).toContain('Emphasize frontend expertise')
  })

  it('requests JSON output', () => {
    const prompt = buildCoverLetterPrompt({ jobText, company, jobTitle, analysis, profileSections })
    expect(prompt).toContain('"formal"')
    expect(prompt).toContain('"cultureFit"')
    expect(prompt).toContain('"technical"')
  })
})

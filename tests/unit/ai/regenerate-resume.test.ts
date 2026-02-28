import { describe, it, expect } from 'vitest'
import { buildRegenerationPrompt } from '@/lib/ai/prompts/regenerate-resume'
import type { ResumeContent } from '@/types'

describe('buildRegenerationPrompt', () => {
  const currentResume: ResumeContent = {
    summary: 'Experienced frontend developer with React expertise.',
    experience: [
      {
        company: 'Acme Corp',
        title: 'Frontend Developer',
        dates: 'Jan 2020 - Present',
        bullets: ['Built React applications serving 10k users'],
      },
    ],
    skills: [{ name: 'Frontend', items: ['React', 'TypeScript', 'CSS'] }],
  }

  const feedback = 'Make the summary more impactful and add quantified achievements.'

  const feedbackHistory = [
    {
      feedback: 'Emphasize leadership experience more.',
      timestamp: '2025-01-15T10:30:00Z',
    },
    {
      feedback: 'Add more technical details to bullet points.',
      timestamp: '2025-01-15T11:00:00Z',
    },
  ]

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
            bullets: [
              'Built React applications serving 10k users',
              'Led team of 3 junior developers',
            ],
          },
        ],
      },
    },
  ]

  it('returns a string prompt', () => {
    const prompt = buildRegenerationPrompt({
      currentResume,
      feedback,
      feedbackHistory,
      profileSections,
    })
    expect(typeof prompt).toBe('string')
    expect(prompt.length).toBeGreaterThan(0)
  })

  it('includes the current resume content', () => {
    const prompt = buildRegenerationPrompt({
      currentResume,
      feedback,
      feedbackHistory,
      profileSections,
    })
    expect(prompt).toContain('Experienced frontend developer')
    expect(prompt).toContain('Acme Corp')
  })

  it('includes the new feedback', () => {
    const prompt = buildRegenerationPrompt({
      currentResume,
      feedback,
      feedbackHistory,
      profileSections,
    })
    expect(prompt).toContain('Make the summary more impactful')
  })

  it('includes feedback history', () => {
    const prompt = buildRegenerationPrompt({
      currentResume,
      feedback,
      feedbackHistory,
      profileSections,
    })
    expect(prompt).toContain('Emphasize leadership experience')
    expect(prompt).toContain('Add more technical details')
  })

  it('includes profile section data', () => {
    const prompt = buildRegenerationPrompt({
      currentResume,
      feedback,
      feedbackHistory,
      profileSections,
    })
    expect(prompt).toContain('Jane Doe')
  })

  it('instructs not to undo previous feedback', () => {
    const prompt = buildRegenerationPrompt({
      currentResume,
      feedback,
      feedbackHistory,
      profileSections,
    })
    expect(prompt.toLowerCase()).toMatch(
      /do not undo|don't undo|not.*undo.*previous|preserve.*previous|maintain.*previous/i
    )
  })

  it('asks for the same JSON structure', () => {
    const prompt = buildRegenerationPrompt({
      currentResume,
      feedback,
      feedbackHistory,
      profileSections,
    })
    expect(prompt).toContain('summary')
    expect(prompt).toContain('experience')
    expect(prompt).toContain('skills')
    expect(prompt.toLowerCase()).toContain('json')
  })
})

import { describe, it, expect } from 'vitest'
import { users, profileSections, resumes, templates } from '@/lib/db/schema'

describe('Database Schema', () => {
  it('exports users table with required columns', () => {
    expect(users).toBeDefined()
    const columns = Object.keys(users)
    expect(columns).toContain('id')
    expect(columns).toContain('email')
    expect(columns).toContain('tier')
    expect(columns).toContain('onboardingCompleted')
  })

  it('exports profileSections table with required columns', () => {
    expect(profileSections).toBeDefined()
    const columns = Object.keys(profileSections)
    expect(columns).toContain('id')
    expect(columns).toContain('userId')
    expect(columns).toContain('sectionType')
    expect(columns).toContain('data')
  })

  it('exports resumes table with required columns', () => {
    expect(resumes).toBeDefined()
    const columns = Object.keys(resumes)
    expect(columns).toContain('id')
    expect(columns).toContain('userId')
    expect(columns).toContain('jobTitle')
    expect(columns).toContain('resumeContent')
    expect(columns).toContain('feedbackHistory')
  })

  it('exports templates table with required columns', () => {
    expect(templates).toBeDefined()
    const columns = Object.keys(templates)
    expect(columns).toContain('id')
    expect(columns).toContain('slug')
    expect(columns).toContain('tier')
  })
})

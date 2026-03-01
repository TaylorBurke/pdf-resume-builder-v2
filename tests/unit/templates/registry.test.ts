import { describe, it, expect } from 'vitest'
import { TEMPLATES, type TemplateId } from '@/templates'
import { renderResumeToHtml } from '@/lib/pdf/generator'
import type { ResumeContent, PersonalInfo } from '@/types'

const mockResume: ResumeContent = {
  summary: 'Test summary.',
  experience: [
    {
      company: 'Test Corp',
      title: 'Developer',
      dates: '2020 - Present',
      bullets: ['Did things'],
    },
  ],
  skills: [{ name: 'Languages', items: ['TypeScript'] }],
}

const mockPersonalInfo: PersonalInfo = {
  fullName: 'Test User',
  email: 'test@example.com',
}

describe('Template Registry', () => {
  it('exports all three templates', () => {
    expect(TEMPLATES.clean).toBeDefined()
    expect(TEMPLATES.bold).toBeDefined()
    expect(TEMPLATES.executive).toBeDefined()
  })

  it('each template has name, component, and description', () => {
    for (const key of Object.keys(TEMPLATES) as TemplateId[]) {
      const tmpl = TEMPLATES[key]
      expect(tmpl.name).toBeTruthy()
      expect(tmpl.component).toBeTypeOf('function')
      expect(tmpl.description).toBeTruthy()
    }
  })
})

describe('renderResumeToHtml', () => {
  it('generates valid HTML for each template', async () => {
    for (const templateId of Object.keys(TEMPLATES) as TemplateId[]) {
      const html = await renderResumeToHtml(mockResume, mockPersonalInfo, templateId)
      expect(html).toContain('<!DOCTYPE html>')
      expect(html).toContain('<html>')
      expect(html).toContain('Test User')
      expect(html).toContain('test@example.com')
      expect(html).toContain('Test Corp')
    }
  })

  it('includes print-color-adjust for background colors', async () => {
    const html = await renderResumeToHtml(mockResume, mockPersonalInfo, 'clean')
    expect(html).toContain('print-color-adjust: exact')
  })

  it('includes title with user name', async () => {
    const html = await renderResumeToHtml(mockResume, mockPersonalInfo, 'clean')
    expect(html).toContain('<title>Resume - Test User</title>')
  })

  it('throws for unknown template', async () => {
    await expect(
      renderResumeToHtml(mockResume, mockPersonalInfo, 'nonexistent' as TemplateId)
    ).rejects.toThrow('Unknown template: nonexistent')
  })
})

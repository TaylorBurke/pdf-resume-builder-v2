import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ExecutiveTemplate } from '@/templates/executive/ExecutiveTemplate'
import type { ResumeContent, PersonalInfo } from '@/types'

const mockResume: ResumeContent = {
  summary: 'C-suite technology executive with 15 years of leadership experience.',
  experience: [
    {
      company: 'Enterprise Solutions Ltd',
      title: 'VP of Engineering',
      dates: '2019 - Present',
      bullets: ['Managed 50-person engineering org', 'Drove $20M revenue initiative'],
    },
    {
      company: 'MegaCorp',
      title: 'Director of Technology',
      dates: '2015 - 2019',
      bullets: ['Led digital transformation'],
    },
  ],
  skills: [
    { name: 'Leadership', items: ['Strategic Planning', 'Team Building', 'Agile'] },
    { name: 'Technical', items: ['Cloud Architecture', 'DevOps', 'AI/ML'] },
  ],
  education: [
    {
      school: 'Harvard Business School',
      degree: 'MBA',
      graduationDate: '2015',
    },
    {
      school: 'Stanford University',
      degree: 'B.S.',
      field: 'Engineering',
      graduationDate: '2009',
    },
  ],
  projects: [
    {
      name: 'Cloud Migration',
      description: 'Led enterprise-wide cloud migration serving 2M users',
      techStack: ['AWS', 'Kubernetes'],
      highlights: ['Reduced infrastructure costs by 40%'],
    },
  ],
  certificates: [
    { name: 'PMP', issuer: 'PMI', date: '2016' },
  ],
  awards: [
    { name: 'CTO of the Year', issuer: 'Tech Awards', date: '2023', description: 'Industry recognition for innovation' },
  ],
  languages: [
    { language: 'English', proficiency: 'native' },
    { language: 'Mandarin', proficiency: 'advanced' },
  ],
  volunteer: [
    { organization: 'STEM Alliance', role: 'Board Member', description: 'Advising on technology education programs' },
  ],
  interests: ['Venture capital', 'Sailing', 'Classical music'],
}

const mockPersonalInfo: PersonalInfo = {
  fullName: 'Alexandra Chen',
  email: 'alexandra@executive.com',
  phone: '555-0300',
  location: 'Boston, MA',
  linkedinUrl: 'linkedin.com/in/alexandrachen',
}

describe('ExecutiveTemplate', () => {
  it('renders name in dark header', () => {
    render(<ExecutiveTemplate resume={mockResume} personalInfo={mockPersonalInfo} />)
    expect(screen.getByText('Alexandra Chen')).toBeInTheDocument()
  })

  it('renders contact info in header', () => {
    render(<ExecutiveTemplate resume={mockResume} personalInfo={mockPersonalInfo} />)
    expect(screen.getByText('alexandra@executive.com')).toBeInTheDocument()
    expect(screen.getByText('555-0300')).toBeInTheDocument()
    expect(screen.getByText('Boston, MA')).toBeInTheDocument()
  })

  it('renders executive summary', () => {
    render(<ExecutiveTemplate resume={mockResume} personalInfo={mockPersonalInfo} />)
    expect(screen.getByText('C-suite technology executive with 15 years of leadership experience.')).toBeInTheDocument()
  })

  it('renders experience with dates column', () => {
    render(<ExecutiveTemplate resume={mockResume} personalInfo={mockPersonalInfo} />)
    expect(screen.getByText('Enterprise Solutions Ltd')).toBeInTheDocument()
    // "VP of Engineering" appears in the header (as current title) and in the experience section
    expect(screen.getAllByText('VP of Engineering')).toHaveLength(2)
    expect(screen.getByText('2019 - Present')).toBeInTheDocument()
    expect(screen.getByText('Managed 50-person engineering org')).toBeInTheDocument()
    expect(screen.getByText('MegaCorp')).toBeInTheDocument()
  })

  it('renders skills as tags', () => {
    render(<ExecutiveTemplate resume={mockResume} personalInfo={mockPersonalInfo} />)
    expect(screen.getByText('Strategic Planning')).toBeInTheDocument()
    expect(screen.getByText('Cloud Architecture')).toBeInTheDocument()
  })

  it('renders multiple education entries', () => {
    render(<ExecutiveTemplate resume={mockResume} personalInfo={mockPersonalInfo} />)
    expect(screen.getByText('Harvard Business School')).toBeInTheDocument()
    expect(screen.getByText('Stanford University')).toBeInTheDocument()
    expect(screen.getByText('MBA')).toBeInTheDocument()
  })

  it('renders projects', () => {
    render(<ExecutiveTemplate resume={mockResume} personalInfo={mockPersonalInfo} />)
    expect(screen.getByText('Cloud Migration')).toBeInTheDocument()
    expect(screen.getByText('Led enterprise-wide cloud migration serving 2M users')).toBeInTheDocument()
  })

  it('renders certificates', () => {
    render(<ExecutiveTemplate resume={mockResume} personalInfo={mockPersonalInfo} />)
    expect(screen.getByText('PMP')).toBeInTheDocument()
    expect(screen.getByText('PMI')).toBeInTheDocument()
  })

  it('renders awards with descriptions', () => {
    render(<ExecutiveTemplate resume={mockResume} personalInfo={mockPersonalInfo} />)
    expect(screen.getByText('CTO of the Year')).toBeInTheDocument()
    expect(screen.getByText('Industry recognition for innovation')).toBeInTheDocument()
  })

  it('renders languages', () => {
    render(<ExecutiveTemplate resume={mockResume} personalInfo={mockPersonalInfo} />)
    expect(screen.getByText('English')).toBeInTheDocument()
    expect(screen.getByText('Mandarin')).toBeInTheDocument()
  })

  it('renders volunteer work', () => {
    render(<ExecutiveTemplate resume={mockResume} personalInfo={mockPersonalInfo} />)
    expect(screen.getByText('STEM Alliance')).toBeInTheDocument()
    expect(screen.getByText('Board Member')).toBeInTheDocument()
  })

  it('renders interests', () => {
    render(<ExecutiveTemplate resume={mockResume} personalInfo={mockPersonalInfo} />)
    expect(screen.getByText(/Venture capital/)).toBeInTheDocument()
    expect(screen.getByText(/Sailing/)).toBeInTheDocument()
  })

  it('handles minimal resume gracefully', () => {
    const minimal: ResumeContent = {
      summary: 'Executive leader.',
      experience: [
        {
          company: 'Solo Inc',
          title: 'CEO',
          dates: '2020 - Present',
          bullets: [],
        },
      ],
      skills: [],
    }
    const minInfo: PersonalInfo = { fullName: 'Exec User', email: 'exec@test.com' }
    render(<ExecutiveTemplate resume={minimal} personalInfo={minInfo} />)
    expect(screen.getByText('Exec User')).toBeInTheDocument()
    expect(screen.getByText('Executive leader.')).toBeInTheDocument()
    expect(screen.getByText('Solo Inc')).toBeInTheDocument()
  })
})

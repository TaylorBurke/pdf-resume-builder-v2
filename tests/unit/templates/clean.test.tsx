import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CleanTemplate } from '@/templates/clean/CleanTemplate'
import type { ResumeContent, PersonalInfo } from '@/types'

const mockResume: ResumeContent = {
  summary: 'Experienced developer with 10+ years building web applications.',
  experience: [
    {
      company: 'Acme Corp',
      title: 'Senior Developer',
      dates: '2020 - Present',
      bullets: ['Built things', 'Led team of 5 engineers'],
    },
    {
      company: 'StartupCo',
      title: 'Full Stack Developer',
      dates: '2017 - 2020',
      bullets: ['Developed APIs', 'Improved performance by 40%'],
    },
  ],
  skills: [
    { name: 'Languages', items: ['TypeScript', 'Python', 'Go'] },
    { name: 'Frameworks', items: ['React', 'Next.js'] },
  ],
  education: [
    {
      school: 'State University',
      degree: 'B.S.',
      field: 'Computer Science',
      graduationDate: '2017',
    },
  ],
  projects: [
    {
      name: 'OpenWidget',
      description: 'An open-source dashboard framework',
      techStack: ['React', 'D3'],
      highlights: ['500+ GitHub stars'],
    },
  ],
  certificates: [
    { name: 'AWS Solutions Architect', issuer: 'Amazon', date: '2022' },
  ],
  awards: [
    { name: 'Employee of the Year', issuer: 'Tech Awards Board', date: '2021', description: 'Outstanding contributions' },
  ],
  languages: [
    { language: 'English', proficiency: 'native' },
    { language: 'Spanish', proficiency: 'intermediate' },
  ],
  volunteer: [
    { organization: 'Code.org', role: 'Mentor', description: 'Taught coding to underserved youth' },
  ],
  interests: ['Open source', 'Rock climbing'],
}

const mockPersonalInfo: PersonalInfo = {
  fullName: 'Jane Smith',
  email: 'jane@test.com',
  phone: '555-0100',
  location: 'San Francisco, CA',
  linkedinUrl: 'linkedin.com/in/janesmith',
}

describe('CleanTemplate', () => {
  it('renders personal info', () => {
    render(<CleanTemplate resume={mockResume} personalInfo={mockPersonalInfo} />)
    expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    expect(screen.getByText('jane@test.com')).toBeInTheDocument()
    expect(screen.getByText('555-0100')).toBeInTheDocument()
    expect(screen.getByText('San Francisco, CA')).toBeInTheDocument()
  })

  it('renders summary', () => {
    render(<CleanTemplate resume={mockResume} personalInfo={mockPersonalInfo} />)
    expect(screen.getByText('Experienced developer with 10+ years building web applications.')).toBeInTheDocument()
  })

  it('renders experience entries', () => {
    render(<CleanTemplate resume={mockResume} personalInfo={mockPersonalInfo} />)
    expect(screen.getByText('Acme Corp')).toBeInTheDocument()
    expect(screen.getByText('Senior Developer')).toBeInTheDocument()
    expect(screen.getByText('2020 - Present')).toBeInTheDocument()
    expect(screen.getByText('Built things')).toBeInTheDocument()
    expect(screen.getByText('Led team of 5 engineers')).toBeInTheDocument()
    expect(screen.getByText('StartupCo')).toBeInTheDocument()
  })

  it('renders skills as comma-separated text', () => {
    render(<CleanTemplate resume={mockResume} personalInfo={mockPersonalInfo} />)
    expect(screen.getByText('TypeScript, Python, Go')).toBeInTheDocument()
    expect(screen.getByText('React, Next.js')).toBeInTheDocument()
  })

  it('renders education', () => {
    render(<CleanTemplate resume={mockResume} personalInfo={mockPersonalInfo} />)
    expect(screen.getByText('State University')).toBeInTheDocument()
    expect(screen.getByText(/B\.S\..*Computer Science/)).toBeInTheDocument()
  })

  it('renders projects', () => {
    render(<CleanTemplate resume={mockResume} personalInfo={mockPersonalInfo} />)
    expect(screen.getByText('OpenWidget')).toBeInTheDocument()
    expect(screen.getByText('An open-source dashboard framework')).toBeInTheDocument()
  })

  it('renders certificates', () => {
    render(<CleanTemplate resume={mockResume} personalInfo={mockPersonalInfo} />)
    expect(screen.getByText('AWS Solutions Architect')).toBeInTheDocument()
    expect(screen.getByText('Amazon')).toBeInTheDocument()
  })

  it('renders awards', () => {
    render(<CleanTemplate resume={mockResume} personalInfo={mockPersonalInfo} />)
    expect(screen.getByText('Employee of the Year')).toBeInTheDocument()
  })

  it('renders languages', () => {
    render(<CleanTemplate resume={mockResume} personalInfo={mockPersonalInfo} />)
    expect(screen.getByText('English')).toBeInTheDocument()
    expect(screen.getByText(/native/)).toBeInTheDocument()
  })

  it('renders volunteer experience', () => {
    render(<CleanTemplate resume={mockResume} personalInfo={mockPersonalInfo} />)
    expect(screen.getByText('Code.org')).toBeInTheDocument()
    expect(screen.getByText('Mentor')).toBeInTheDocument()
  })

  it('renders interests', () => {
    render(<CleanTemplate resume={mockResume} personalInfo={mockPersonalInfo} />)
    expect(screen.getByText('Open source, Rock climbing')).toBeInTheDocument()
  })

  it('omits empty sections gracefully', () => {
    const minimal: ResumeContent = {
      summary: 'A brief summary.',
      experience: [],
      skills: [],
    }
    render(<CleanTemplate resume={minimal} personalInfo={mockPersonalInfo} />)
    expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    expect(screen.getByText('A brief summary.')).toBeInTheDocument()
    // Experience section title should not appear
    expect(screen.queryByText('Experience')).not.toBeInTheDocument()
  })
})

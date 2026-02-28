import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BoldTemplate } from '@/templates/bold/BoldTemplate'
import type { ResumeContent, PersonalInfo } from '@/types'

const mockResume: ResumeContent = {
  summary: 'Full-stack engineer passionate about scalable systems.',
  experience: [
    {
      company: 'TechGiant Inc',
      title: 'Staff Engineer',
      dates: '2021 - Present',
      bullets: ['Architected microservices platform', 'Mentored 8 engineers'],
    },
    {
      company: 'WebStudio',
      title: 'Senior Developer',
      dates: '2018 - 2021',
      bullets: ['Led frontend rewrite'],
    },
  ],
  skills: [
    { name: 'Backend', items: ['Node.js', 'Python', 'Rust'] },
    { name: 'Frontend', items: ['React', 'Vue'] },
  ],
  education: [
    {
      school: 'MIT',
      degree: 'M.S.',
      field: 'Computer Science',
      graduationDate: '2018',
    },
  ],
  projects: [
    {
      name: 'DataPipe',
      description: 'Real-time data pipeline framework',
      techStack: ['Kafka', 'Flink'],
      highlights: ['Processes 1M events/sec'],
    },
  ],
  certificates: [
    { name: 'GCP Professional', issuer: 'Google', date: '2023' },
  ],
  awards: [
    { name: 'Hackathon Winner', issuer: 'TechGiant', date: '2022' },
  ],
  languages: [
    { language: 'English', proficiency: 'native' },
    { language: 'Japanese', proficiency: 'basic' },
  ],
  volunteer: [
    { organization: 'Open Source Foundation', role: 'Contributor', description: 'Core maintainer of OSS tools' },
  ],
  interests: ['Distributed systems', 'Photography'],
}

const mockPersonalInfo: PersonalInfo = {
  fullName: 'John Doe',
  email: 'john@example.com',
  phone: '555-0200',
  location: 'New York, NY',
  githubUrl: 'github.com/johndoe',
}

describe('BoldTemplate', () => {
  it('renders name in sidebar', () => {
    render(<BoldTemplate resume={mockResume} personalInfo={mockPersonalInfo} />)
    expect(screen.getByText('John Doe')).toBeInTheDocument()
  })

  it('renders contact info in sidebar', () => {
    render(<BoldTemplate resume={mockResume} personalInfo={mockPersonalInfo} />)
    expect(screen.getByText('john@example.com')).toBeInTheDocument()
    expect(screen.getByText('555-0200')).toBeInTheDocument()
    expect(screen.getByText('New York, NY')).toBeInTheDocument()
    expect(screen.getByText('github.com/johndoe')).toBeInTheDocument()
  })

  it('renders summary in main content', () => {
    render(<BoldTemplate resume={mockResume} personalInfo={mockPersonalInfo} />)
    expect(screen.getByText('Full-stack engineer passionate about scalable systems.')).toBeInTheDocument()
  })

  it('renders experience entries', () => {
    render(<BoldTemplate resume={mockResume} personalInfo={mockPersonalInfo} />)
    expect(screen.getByText('TechGiant Inc')).toBeInTheDocument()
    // "Staff Engineer" appears both in the sidebar (as current title) and in main content
    expect(screen.getAllByText('Staff Engineer')).toHaveLength(2)
    expect(screen.getByText('Architected microservices platform')).toBeInTheDocument()
    expect(screen.getByText('WebStudio')).toBeInTheDocument()
  })

  it('renders skills with dot visualization', () => {
    render(<BoldTemplate resume={mockResume} personalInfo={mockPersonalInfo} />)
    expect(screen.getByText('Node.js')).toBeInTheDocument()
    expect(screen.getByText('Python')).toBeInTheDocument()
    expect(screen.getByText('Rust')).toBeInTheDocument()
  })

  it('renders education', () => {
    render(<BoldTemplate resume={mockResume} personalInfo={mockPersonalInfo} />)
    expect(screen.getByText('MIT')).toBeInTheDocument()
    expect(screen.getByText(/M\.S\..*Computer Science/)).toBeInTheDocument()
  })

  it('renders projects', () => {
    render(<BoldTemplate resume={mockResume} personalInfo={mockPersonalInfo} />)
    expect(screen.getByText('DataPipe')).toBeInTheDocument()
    expect(screen.getByText('Real-time data pipeline framework')).toBeInTheDocument()
    expect(screen.getByText('Kafka / Flink')).toBeInTheDocument()
  })

  it('renders certificates', () => {
    render(<BoldTemplate resume={mockResume} personalInfo={mockPersonalInfo} />)
    expect(screen.getByText('GCP Professional')).toBeInTheDocument()
    expect(screen.getByText('Google')).toBeInTheDocument()
  })

  it('renders languages in sidebar', () => {
    render(<BoldTemplate resume={mockResume} personalInfo={mockPersonalInfo} />)
    expect(screen.getByText('English')).toBeInTheDocument()
    expect(screen.getByText('Japanese')).toBeInTheDocument()
  })

  it('renders interests as tags in sidebar', () => {
    render(<BoldTemplate resume={mockResume} personalInfo={mockPersonalInfo} />)
    expect(screen.getByText('Distributed systems')).toBeInTheDocument()
    expect(screen.getByText('Photography')).toBeInTheDocument()
  })

  it('renders volunteer experience', () => {
    render(<BoldTemplate resume={mockResume} personalInfo={mockPersonalInfo} />)
    expect(screen.getByText('Open Source Foundation')).toBeInTheDocument()
    expect(screen.getByText('Core maintainer of OSS tools')).toBeInTheDocument()
  })

  it('handles minimal resume gracefully', () => {
    const minimal: ResumeContent = {
      summary: 'Short bio.',
      experience: [],
      skills: [],
    }
    const minInfo: PersonalInfo = { fullName: 'Min User', email: 'min@test.com' }
    render(<BoldTemplate resume={minimal} personalInfo={minInfo} />)
    expect(screen.getByText('Min User')).toBeInTheDocument()
    expect(screen.getByText('Short bio.')).toBeInTheDocument()
  })
})

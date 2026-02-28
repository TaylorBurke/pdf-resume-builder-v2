// ── Section Types ──────────────────────────────────────────────────────────

export const SECTION_TYPES = [
  'personal_info',
  'summary',
  'experience',
  'education',
  'skills',
  'projects',
  'certificates',
  'references',
  'volunteer',
  'languages',
  'awards',
  'ip',
  'interests',
] as const

export type SectionType = (typeof SECTION_TYPES)[number]

// ── Section Data Interfaces ───────────────────────────────────────────────

export interface PersonalInfo {
  fullName: string
  email: string
  phone?: string
  location?: string
  linkedinUrl?: string
  githubUrl?: string
  portfolioUrl?: string
  websiteUrl?: string
}

export interface Summary {
  text: string
}

export interface ExperienceEntry {
  company: string
  title: string
  startDate: string
  endDate?: string
  current: boolean
  location?: string
  bullets: string[]
}

export interface Experience {
  entries: ExperienceEntry[]
}

export interface EducationEntry {
  school: string
  degree: string
  field?: string
  graduationDate?: string
  gpa?: string
  honors?: string
}

export interface Education {
  entries: EducationEntry[]
}

export interface SkillCategory {
  name: string
  items: string[]
}

export interface Skill {
  categories: SkillCategory[]
}

export interface ProjectEntry {
  name: string
  description: string
  url?: string
  techStack: string[]
  highlights: string[]
}

export interface Project {
  entries: ProjectEntry[]
}

export interface CertificateEntry {
  name: string
  issuer: string
  date?: string
  credentialId?: string
  url?: string
}

export interface Certificate {
  entries: CertificateEntry[]
}

export interface ReferenceEntry {
  name: string
  title: string
  company: string
  email?: string
  phone?: string
  relationship?: string
}

export interface Reference {
  entries: ReferenceEntry[]
}

export interface VolunteerEntry {
  organization: string
  role: string
  startDate?: string
  endDate?: string
  description: string
}

export interface VolunteerWork {
  entries: VolunteerEntry[]
}

export interface LanguageEntry {
  language: string
  proficiency: 'native' | 'fluent' | 'advanced' | 'intermediate' | 'basic'
}

export interface Language {
  entries: LanguageEntry[]
}

export interface AwardEntry {
  name: string
  issuer: string
  date?: string
  description?: string
}

export interface Award {
  entries: AwardEntry[]
}

export interface IntellectualPropertyEntry {
  type: 'patent' | 'publication' | 'open_source' | 'other'
  title: string
  description?: string
  url?: string
  date?: string
}

export interface IntellectualProperty {
  entries: IntellectualPropertyEntry[]
}

export interface Interest {
  items: string[]
}

// ── Union & Mapped Types ──────────────────────────────────────────────────

export type SectionData =
  | PersonalInfo
  | Summary
  | Experience
  | Education
  | Skill
  | Project
  | Certificate
  | Reference
  | VolunteerWork
  | Language
  | Award
  | IntellectualProperty
  | Interest

export interface SectionDataMap {
  personal_info: PersonalInfo
  summary: Summary
  experience: Experience
  education: Education
  skills: Skill
  projects: Project
  certificates: Certificate
  references: Reference
  volunteer: VolunteerWork
  languages: Language
  awards: Award
  ip: IntellectualProperty
  interests: Interest
}

// ── Job Analysis ──────────────────────────────────────────────────────────

export interface JobAnalysis {
  keyRequirements: {
    requirement: string
    priority: 'high' | 'medium' | 'low'
  }[]
  skillMatches: {
    skill: string
    strength: 'strong' | 'moderate' | 'weak'
  }[]
  gaps: string[]
  recommendedAngle: string
  sectionsToInclude: SectionType[]
}

// ── Resume Content ────────────────────────────────────────────────────────

export interface ResumeContent {
  summary: string
  experience: {
    company: string
    title: string
    dates: string
    bullets: string[]
  }[]
  skills: {
    name: string
    items: string[]
  }[]
  projects?: {
    name: string
    description: string
    techStack?: string[]
    highlights?: string[]
  }[]
  education?: {
    school: string
    degree: string
    field?: string
    graduationDate?: string
  }[]
  certificates?: {
    name: string
    issuer: string
    date?: string
  }[]
  languages?: {
    language: string
    proficiency: string
  }[]
  awards?: {
    name: string
    issuer: string
    date?: string
    description?: string
  }[]
  ip?: {
    type: string
    title: string
    description?: string
    url?: string
    date?: string
  }[]
  volunteer?: {
    organization: string
    role: string
    description: string
  }[]
  interests?: string[]
}

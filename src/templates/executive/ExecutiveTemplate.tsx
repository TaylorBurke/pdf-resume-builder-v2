import React from 'react'
import type { ResumeContent, PersonalInfo } from '@/types'

export interface TemplateProps {
  resume: ResumeContent
  personalInfo: PersonalInfo
}

// ── Design tokens ──────────────────────────────────────────────────────────
const colors = {
  headerBg: '#0f172a',
  headerText: '#ffffff',
  headerMuted: 'rgba(255, 255, 255, 0.65)',
  body: '#ffffff',
  text: '#1e293b',
  textLight: '#475569',
  textMuted: '#64748b',
  accent: '#b8860b',
  accentLight: 'rgba(184, 134, 11, 0.12)',
  cardBorder: '#e2e8f0',
  cardBg: '#ffffff',
} as const

const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const

// ── Style definitions ──────────────────────────────────────────────────────
const s = {
  page: {
    width: 816,
    minHeight: 1056,
    backgroundColor: colors.body,
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    fontSize: 10.5,
    lineHeight: '1.5',
    color: colors.text,
  },

  // ── Header block ─────────────────────────────────────────────────────
  header: {
    backgroundColor: colors.headerBg,
    padding: `${spacing.xxl}px 64px ${spacing.xl}px`,
    textAlign: 'center' as const,
  },
  headerName: {
    fontFamily: "Georgia, 'Times New Roman', Times, serif",
    fontSize: 30,
    fontWeight: 400 as const,
    color: colors.headerText,
    letterSpacing: '1px',
    margin: 0,
    lineHeight: '1.2',
  },
  headerTitle: {
    fontSize: 12,
    fontWeight: 400 as const,
    color: colors.accent,
    letterSpacing: '2px',
    textTransform: 'uppercase' as const,
    margin: `${spacing.sm}px 0 ${spacing.md}px`,
  },
  headerContact: {
    display: 'flex' as const,
    justifyContent: 'center' as const,
    flexWrap: 'wrap' as const,
    gap: spacing.sm,
    fontSize: 10,
    color: colors.headerMuted,
  },
  headerContactSep: {
    color: 'rgba(255, 255, 255, 0.3)',
    margin: `0 ${spacing.xs}px`,
  },

  // ── Body / cards ─────────────────────────────────────────────────────
  body: {
    padding: `${spacing.lg}px 64px ${spacing.xl}px`,
  },
  card: {
    marginBottom: spacing.lg,
    border: `1px solid ${colors.cardBorder}`,
    borderRadius: 4,
    padding: `${spacing.md}px ${spacing.lg}px`,
    backgroundColor: colors.cardBg,
  },
  sectionTitle: {
    fontFamily: "Georgia, 'Times New Roman', Times, serif",
    fontSize: 14,
    fontWeight: 400 as const,
    color: colors.text,
    margin: `0 0 ${spacing.sm}px 0`,
    paddingBottom: spacing.xs,
    borderBottom: `2px solid ${colors.accent}`,
    lineHeight: '1.3',
  },
  summaryText: {
    fontSize: 11,
    color: colors.textLight,
    lineHeight: '1.7',
    margin: 0,
  },

  // ── Experience ───────────────────────────────────────────────────────
  expEntry: {
    display: 'flex' as const,
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  expDateCol: {
    width: 90,
    flexShrink: 0 as const,
    fontSize: 10,
    color: colors.accent,
    fontWeight: 600 as const,
    paddingTop: 2,
    lineHeight: '1.4',
  },
  expContent: {
    flex: 1,
    minWidth: 0,
  },
  expCompany: {
    fontWeight: 700 as const,
    fontSize: 11.5,
    color: colors.text,
    margin: 0,
    lineHeight: '1.3',
  },
  expTitle: {
    fontSize: 10.5,
    color: colors.textLight,
    fontStyle: 'italic' as const,
    margin: `2px 0 ${spacing.xs}px 0`,
  },
  bulletList: {
    margin: `${spacing.xs}px 0 0 0`,
    paddingLeft: 18,
    listStyleType: 'disc' as const,
  },
  bulletItem: {
    fontSize: 10,
    color: colors.textLight,
    lineHeight: '1.6',
    marginBottom: 2,
  },

  // ── Education ────────────────────────────────────────────────────────
  eduEntry: {
    display: 'flex' as const,
    marginBottom: spacing.sm,
    gap: spacing.md,
  },
  eduSchool: {
    fontWeight: 600 as const,
    fontSize: 11,
    color: colors.text,
  },
  eduDegree: {
    fontSize: 10.5,
    color: colors.textLight,
  },

  // ── Skills ───────────────────────────────────────────────────────────
  skillsGrid: {
    display: 'flex' as const,
    flexWrap: 'wrap' as const,
    gap: spacing.md,
  },
  skillCategory: {
    flex: '1 1 200px',
    marginBottom: spacing.sm,
  },
  skillCatName: {
    fontWeight: 700 as const,
    fontSize: 10.5,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  skillCatItems: {
    fontSize: 10,
    color: colors.textLight,
    lineHeight: '1.6',
  },
  skillTag: {
    display: 'inline-block' as const,
    fontSize: 9,
    color: colors.text,
    backgroundColor: colors.accentLight,
    borderRadius: 3,
    padding: '2px 8px',
    marginRight: 4,
    marginBottom: 4,
  },

  // ── Projects ─────────────────────────────────────────────────────────
  projEntry: {
    marginBottom: spacing.md,
  },
  projName: {
    fontWeight: 600 as const,
    fontSize: 11,
    color: colors.text,
  },
  projDesc: {
    fontSize: 10,
    color: colors.textLight,
    margin: `2px 0 ${spacing.xs}px 0`,
    lineHeight: '1.5',
  },
  projTech: {
    fontSize: 9,
    color: colors.accent,
    fontWeight: 600 as const,
    marginBottom: spacing.xs,
  },

  // ── Certificates / Awards ────────────────────────────────────────────
  certEntry: {
    display: 'flex' as const,
    marginBottom: spacing.sm,
    gap: spacing.md,
  },
  certName: {
    fontWeight: 600 as const,
    fontSize: 10.5,
    color: colors.text,
  },
  certIssuer: {
    fontSize: 10,
    color: colors.textLight,
  },
  certDate: {
    width: 90,
    flexShrink: 0 as const,
    fontSize: 10,
    color: colors.textMuted,
    paddingTop: 2,
  },
  awardDesc: {
    fontSize: 10,
    color: colors.textLight,
    lineHeight: '1.5',
    marginTop: 2,
  },

  // ── Languages / Interests / Volunteer ────────────────────────────────
  langGrid: {
    display: 'flex' as const,
    flexWrap: 'wrap' as const,
    gap: spacing.md,
  },
  langItem: {
    fontSize: 10.5,
    color: colors.text,
  },
  langProf: {
    fontSize: 9.5,
    color: colors.textMuted,
    display: 'block' as const,
  },
  volEntry: {
    marginBottom: spacing.md,
  },
  volOrg: {
    fontWeight: 600 as const,
    fontSize: 11,
    color: colors.text,
  },
  volRole: {
    fontSize: 10.5,
    color: colors.textLight,
    fontStyle: 'italic' as const,
    marginBottom: spacing.xs,
  },
  volDesc: {
    fontSize: 10,
    color: colors.textLight,
    lineHeight: '1.5',
  },
  interestsList: {
    fontSize: 10.5,
    color: colors.textLight,
  },
} as const

// ── Component ──────────────────────────────────────────────────────────────
export function ExecutiveTemplate({ resume, personalInfo }: TemplateProps) {
  const contactItems: string[] = []
  if (personalInfo.email) contactItems.push(personalInfo.email)
  if (personalInfo.phone) contactItems.push(personalInfo.phone)
  if (personalInfo.location) contactItems.push(personalInfo.location)
  if (personalInfo.linkedinUrl) contactItems.push(personalInfo.linkedinUrl)
  if (personalInfo.githubUrl) contactItems.push(personalInfo.githubUrl)
  if (personalInfo.portfolioUrl) contactItems.push(personalInfo.portfolioUrl)
  if (personalInfo.websiteUrl) contactItems.push(personalInfo.websiteUrl)

  return (
    <div style={s.page}>
      {/* ── Dark Header Block ─────────────────────────────────────── */}
      <header style={s.header}>
        <h1 style={s.headerName}>{personalInfo.fullName}</h1>
        {resume.experience?.[0]?.title && (
          <p style={s.headerTitle}>{resume.experience[0].title}</p>
        )}
        <div style={s.headerContact}>
          {contactItems.map((item, i) => (
            <React.Fragment key={i}>
              {i > 0 && <span style={s.headerContactSep}>|</span>}
              <span>{item}</span>
            </React.Fragment>
          ))}
        </div>
      </header>

      {/* ── Body ──────────────────────────────────────────────────── */}
      <div style={s.body}>
        {/* Summary */}
        {resume.summary && (
          <div style={s.card}>
            <h2 style={s.sectionTitle}>Executive Summary</h2>
            <p style={s.summaryText}>{resume.summary}</p>
          </div>
        )}

        {/* Experience */}
        {resume.experience && resume.experience.length > 0 && (
          <div style={s.card}>
            <h2 style={s.sectionTitle}>Professional Experience</h2>
            {resume.experience.map((exp, i) => (
              <div key={i} style={s.expEntry}>
                <div style={s.expDateCol}>{exp.dates}</div>
                <div style={s.expContent}>
                  <div style={s.expCompany}>{exp.company}</div>
                  <div style={s.expTitle}>{exp.title}</div>
                  {exp.bullets && exp.bullets.length > 0 && (
                    <ul style={s.bulletList}>
                      {exp.bullets.map((bullet, j) => (
                        <li key={j} style={s.bulletItem}>{bullet}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Education */}
        {resume.education && resume.education.length > 0 && (
          <div style={s.card}>
            <h2 style={s.sectionTitle}>Education</h2>
            {resume.education.map((edu, i) => (
              <div key={i} style={s.eduEntry}>
                <div style={s.certDate}>{edu.graduationDate}</div>
                <div>
                  <div style={s.eduSchool}>{edu.school}</div>
                  <div style={s.eduDegree}>
                    {edu.degree}{edu.field ? `, ${edu.field}` : ''}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Skills */}
        {resume.skills && resume.skills.length > 0 && (
          <div style={s.card}>
            <h2 style={s.sectionTitle}>Core Competencies</h2>
            <div style={s.skillsGrid}>
              {resume.skills.map((cat, i) => (
                <div key={i} style={s.skillCategory}>
                  <div style={s.skillCatName}>{cat.name}</div>
                  <div>
                    {cat.items.map((item, j) => (
                      <span key={j} style={s.skillTag}>{item}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Projects */}
        {resume.projects && resume.projects.length > 0 && (
          <div style={s.card}>
            <h2 style={s.sectionTitle}>Key Projects</h2>
            {resume.projects.map((proj, i) => (
              <div key={i} style={s.projEntry}>
                <div style={s.projName}>{proj.name}</div>
                <p style={s.projDesc}>{proj.description}</p>
                {proj.techStack && proj.techStack.length > 0 && (
                  <div style={s.projTech}>{proj.techStack.join(' / ')}</div>
                )}
                {proj.highlights && proj.highlights.length > 0 && (
                  <ul style={s.bulletList}>
                    {proj.highlights.map((h, j) => (
                      <li key={j} style={s.bulletItem}>{h}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Certificates */}
        {resume.certificates && resume.certificates.length > 0 && (
          <div style={s.card}>
            <h2 style={s.sectionTitle}>Certifications</h2>
            {resume.certificates.map((cert, i) => (
              <div key={i} style={s.certEntry}>
                <div style={s.certDate}>{cert.date}</div>
                <div>
                  <div style={s.certName}>{cert.name}</div>
                  <div style={s.certIssuer}>{cert.issuer}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Awards */}
        {resume.awards && resume.awards.length > 0 && (
          <div style={s.card}>
            <h2 style={s.sectionTitle}>Awards & Recognition</h2>
            {resume.awards.map((award, i) => (
              <div key={i} style={s.certEntry}>
                <div style={s.certDate}>{award.date}</div>
                <div>
                  <div style={s.certName}>{award.name}</div>
                  <div style={s.certIssuer}>{award.issuer}</div>
                  {award.description && (
                    <p style={s.awardDesc}>{award.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Languages */}
        {resume.languages && resume.languages.length > 0 && (
          <div style={s.card}>
            <h2 style={s.sectionTitle}>Languages</h2>
            <div style={s.langGrid}>
              {resume.languages.map((lang, i) => (
                <div key={i} style={s.langItem}>
                  {lang.language}
                  <span style={s.langProf}>{lang.proficiency}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Volunteer */}
        {resume.volunteer && resume.volunteer.length > 0 && (
          <div style={s.card}>
            <h2 style={s.sectionTitle}>Community Involvement</h2>
            {resume.volunteer.map((vol, i) => (
              <div key={i} style={s.volEntry}>
                <div style={s.volOrg}>{vol.organization}</div>
                <div style={s.volRole}>{vol.role}</div>
                <p style={s.volDesc}>{vol.description}</p>
              </div>
            ))}
          </div>
        )}

        {/* Interests */}
        {resume.interests && resume.interests.length > 0 && (
          <div style={s.card}>
            <h2 style={s.sectionTitle}>Interests</h2>
            <div style={s.interestsList}>{resume.interests.join('  /  ')}</div>
          </div>
        )}
      </div>
    </div>
  )
}

import React from 'react'
import type { ResumeContent, PersonalInfo } from '@/types'

export interface TemplateProps {
  resume: ResumeContent
  personalInfo: PersonalInfo
}

// ── Design tokens ──────────────────────────────────────────────────────────
const colors = {
  text: '#1a1a1a',
  textLight: '#4a4a4a',
  textMuted: '#6b7280',
  accent: '#2563eb',
  border: '#d1d5db',
  background: '#ffffff',
} as const

const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const

// ── Inline style helpers ───────────────────────────────────────────────────
const styles = {
  page: {
    width: 816,
    minHeight: 1056,
    backgroundColor: colors.background,
    color: colors.text,
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    fontSize: 11,
    lineHeight: '1.5',
    padding: '72px 72px 64px',
    boxSizing: 'border-box' as const,
  },
  header: {
    textAlign: 'center' as const,
    marginBottom: spacing.lg,
  },
  name: {
    fontFamily: "Georgia, 'Times New Roman', Times, serif",
    fontSize: 28,
    fontWeight: 400 as const,
    color: colors.text,
    letterSpacing: '0.5px',
    margin: 0,
    lineHeight: '1.2',
  },
  accentLine: {
    width: 48,
    height: 2,
    backgroundColor: colors.accent,
    margin: '12px auto 14px',
    border: 'none',
  },
  contactRow: {
    display: 'flex' as const,
    justifyContent: 'center' as const,
    flexWrap: 'wrap' as const,
    gap: spacing.xs,
    fontSize: 10.5,
    color: colors.textLight,
    lineHeight: '1.4',
  },
  contactSeparator: {
    color: colors.border,
    margin: `0 ${spacing.xs}px`,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionDivider: {
    border: 'none',
    borderTop: `1px solid ${colors.border}`,
    margin: `0 0 ${spacing.md}px 0`,
  },
  sectionTitle: {
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    fontSize: 10,
    fontWeight: 600 as const,
    textTransform: 'uppercase' as const,
    letterSpacing: '1.5px',
    color: colors.textMuted,
    margin: `0 0 ${spacing.sm}px 0`,
  },
  summary: {
    fontSize: 11,
    color: colors.textLight,
    lineHeight: '1.65',
    margin: 0,
  },
  entryHeader: {
    display: 'flex' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'baseline' as const,
    marginBottom: 2,
  },
  company: {
    fontWeight: 600 as const,
    fontSize: 11.5,
    color: colors.text,
  },
  dates: {
    fontSize: 10,
    color: colors.textMuted,
    flexShrink: 0 as const,
    marginLeft: spacing.sm,
  },
  title: {
    fontStyle: 'italic' as const,
    fontSize: 11,
    color: colors.textLight,
    margin: `0 0 ${spacing.xs}px 0`,
  },
  bulletList: {
    margin: `${spacing.xs}px 0 0 0`,
    paddingLeft: spacing.lg,
    listStyleType: 'disc' as const,
  },
  bulletItem: {
    fontSize: 10.5,
    color: colors.textLight,
    lineHeight: '1.6',
    marginBottom: 2,
  },
  experienceEntry: {
    marginBottom: spacing.md,
  },
  skillCategory: {
    marginBottom: spacing.sm,
    fontSize: 11,
    lineHeight: '1.5',
  },
  skillCategoryName: {
    fontWeight: 600 as const,
    color: colors.text,
  },
  skillCategoryItems: {
    color: colors.textLight,
  },
  educationEntry: {
    marginBottom: spacing.sm,
  },
  school: {
    fontWeight: 600 as const,
    fontSize: 11.5,
    color: colors.text,
  },
  degree: {
    fontSize: 11,
    color: colors.textLight,
  },
  projectEntry: {
    marginBottom: spacing.md,
  },
  projectName: {
    fontWeight: 600 as const,
    fontSize: 11.5,
    color: colors.text,
  },
  projectDescription: {
    fontSize: 10.5,
    color: colors.textLight,
    margin: `2px 0 ${spacing.xs}px 0`,
  },
  techStack: {
    fontSize: 10,
    color: colors.textMuted,
    fontStyle: 'italic' as const,
    marginBottom: spacing.xs,
  },
  certEntry: {
    marginBottom: spacing.sm,
  },
  certName: {
    fontWeight: 600 as const,
    fontSize: 11,
    color: colors.text,
  },
  certIssuer: {
    fontSize: 10.5,
    color: colors.textLight,
  },
  awardEntry: {
    marginBottom: spacing.sm,
  },
  volunteerEntry: {
    marginBottom: spacing.md,
  },
  volunteerOrg: {
    fontWeight: 600 as const,
    fontSize: 11.5,
    color: colors.text,
  },
  volunteerRole: {
    fontStyle: 'italic' as const,
    fontSize: 11,
    color: colors.textLight,
    margin: `0 0 ${spacing.xs}px 0`,
  },
  volunteerDescription: {
    fontSize: 10.5,
    color: colors.textLight,
    lineHeight: '1.6',
  },
} as const

// ── Component ──────────────────────────────────────────────────────────────
export function CleanTemplate({ resume, personalInfo }: TemplateProps) {
  const contactItems: string[] = []
  if (personalInfo.email) contactItems.push(personalInfo.email)
  if (personalInfo.phone) contactItems.push(personalInfo.phone)
  if (personalInfo.location) contactItems.push(personalInfo.location)
  if (personalInfo.linkedinUrl) contactItems.push(personalInfo.linkedinUrl)
  if (personalInfo.githubUrl) contactItems.push(personalInfo.githubUrl)
  if (personalInfo.portfolioUrl) contactItems.push(personalInfo.portfolioUrl)
  if (personalInfo.websiteUrl) contactItems.push(personalInfo.websiteUrl)

  return (
    <div style={styles.page}>
      {/* ── Header ────────────────────────────────────────────────── */}
      <header style={styles.header}>
        <h1 style={styles.name}>{personalInfo.fullName}</h1>
        <hr style={styles.accentLine} />
        <div style={styles.contactRow}>
          {contactItems.map((item, i) => (
            <React.Fragment key={i}>
              {i > 0 && <span style={styles.contactSeparator}>|</span>}
              <span>{item}</span>
            </React.Fragment>
          ))}
        </div>
      </header>

      {/* ── Summary ───────────────────────────────────────────────── */}
      {resume.summary && (
        <section style={styles.section}>
          <hr style={styles.sectionDivider} />
          <h2 style={styles.sectionTitle}>Summary</h2>
          <p style={styles.summary}>{resume.summary}</p>
        </section>
      )}

      {/* ── Experience ────────────────────────────────────────────── */}
      {resume.experience && resume.experience.length > 0 && (
        <section style={styles.section}>
          <hr style={styles.sectionDivider} />
          <h2 style={styles.sectionTitle}>Experience</h2>
          {resume.experience.map((exp, i) => (
            <div key={i} style={styles.experienceEntry}>
              <div style={styles.entryHeader}>
                <span style={styles.company}>{exp.company}</span>
                <span style={styles.dates}>{exp.dates}</span>
              </div>
              <div style={styles.title}>{exp.title}</div>
              {exp.bullets && exp.bullets.length > 0 && (
                <ul style={styles.bulletList}>
                  {exp.bullets.map((bullet, j) => (
                    <li key={j} style={styles.bulletItem}>{bullet}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </section>
      )}

      {/* ── Education ─────────────────────────────────────────────── */}
      {resume.education && resume.education.length > 0 && (
        <section style={styles.section}>
          <hr style={styles.sectionDivider} />
          <h2 style={styles.sectionTitle}>Education</h2>
          {resume.education.map((edu, i) => (
            <div key={i} style={styles.educationEntry}>
              <div style={styles.entryHeader}>
                <span style={styles.school}>{edu.school}</span>
                {edu.graduationDate && (
                  <span style={styles.dates}>{edu.graduationDate}</span>
                )}
              </div>
              <div style={styles.degree}>
                {edu.degree}{edu.field ? `, ${edu.field}` : ''}
              </div>
            </div>
          ))}
        </section>
      )}

      {/* ── Skills ────────────────────────────────────────────────── */}
      {resume.skills && resume.skills.length > 0 && (
        <section style={styles.section}>
          <hr style={styles.sectionDivider} />
          <h2 style={styles.sectionTitle}>Skills</h2>
          {resume.skills.map((cat, i) => (
            <div key={i} style={styles.skillCategory}>
              <span style={styles.skillCategoryName}>{cat.name}: </span>
              <span style={styles.skillCategoryItems}>{cat.items.join(', ')}</span>
            </div>
          ))}
        </section>
      )}

      {/* ── Projects ──────────────────────────────────────────────── */}
      {resume.projects && resume.projects.length > 0 && (
        <section style={styles.section}>
          <hr style={styles.sectionDivider} />
          <h2 style={styles.sectionTitle}>Projects</h2>
          {resume.projects.map((proj, i) => (
            <div key={i} style={styles.projectEntry}>
              <div style={styles.projectName}>{proj.name}</div>
              <p style={styles.projectDescription}>{proj.description}</p>
              {proj.techStack && proj.techStack.length > 0 && (
                <div style={styles.techStack}>Tech: {proj.techStack.join(', ')}</div>
              )}
              {proj.highlights && proj.highlights.length > 0 && (
                <ul style={styles.bulletList}>
                  {proj.highlights.map((h, j) => (
                    <li key={j} style={styles.bulletItem}>{h}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </section>
      )}

      {/* ── Certificates ──────────────────────────────────────────── */}
      {resume.certificates && resume.certificates.length > 0 && (
        <section style={styles.section}>
          <hr style={styles.sectionDivider} />
          <h2 style={styles.sectionTitle}>Certificates</h2>
          {resume.certificates.map((cert, i) => (
            <div key={i} style={styles.certEntry}>
              <div style={styles.entryHeader}>
                <span style={styles.certName}>{cert.name}</span>
                {cert.date && <span style={styles.dates}>{cert.date}</span>}
              </div>
              <div style={styles.certIssuer}>{cert.issuer}</div>
            </div>
          ))}
        </section>
      )}

      {/* ── Awards ────────────────────────────────────────────────── */}
      {resume.awards && resume.awards.length > 0 && (
        <section style={styles.section}>
          <hr style={styles.sectionDivider} />
          <h2 style={styles.sectionTitle}>Awards</h2>
          {resume.awards.map((award, i) => (
            <div key={i} style={styles.awardEntry}>
              <div style={styles.entryHeader}>
                <span style={styles.certName}>{award.name}</span>
                {award.date && <span style={styles.dates}>{award.date}</span>}
              </div>
              <div style={styles.certIssuer}>{award.issuer}</div>
              {award.description && (
                <p style={{ ...styles.summary, marginTop: 2 }}>{award.description}</p>
              )}
            </div>
          ))}
        </section>
      )}

      {/* ── Languages ─────────────────────────────────────────────── */}
      {resume.languages && resume.languages.length > 0 && (
        <section style={styles.section}>
          <hr style={styles.sectionDivider} />
          <h2 style={styles.sectionTitle}>Languages</h2>
          <div style={styles.skillCategory}>
            {resume.languages.map((lang, i) => (
              <span key={i}>
                {i > 0 && ', '}
                <span style={styles.skillCategoryName}>{lang.language}</span>
                {' '}
                <span style={styles.skillCategoryItems}>({lang.proficiency})</span>
              </span>
            ))}
          </div>
        </section>
      )}

      {/* ── Volunteer ─────────────────────────────────────────────── */}
      {resume.volunteer && resume.volunteer.length > 0 && (
        <section style={styles.section}>
          <hr style={styles.sectionDivider} />
          <h2 style={styles.sectionTitle}>Volunteer Experience</h2>
          {resume.volunteer.map((vol, i) => (
            <div key={i} style={styles.volunteerEntry}>
              <div style={styles.volunteerOrg}>{vol.organization}</div>
              <div style={styles.volunteerRole}>{vol.role}</div>
              <p style={styles.volunteerDescription}>{vol.description}</p>
            </div>
          ))}
        </section>
      )}

      {/* ── Interests ─────────────────────────────────────────────── */}
      {resume.interests && resume.interests.length > 0 && (
        <section style={styles.section}>
          <hr style={styles.sectionDivider} />
          <h2 style={styles.sectionTitle}>Interests</h2>
          <div style={styles.skillCategory}>
            <span style={styles.skillCategoryItems}>{resume.interests.join(', ')}</span>
          </div>
        </section>
      )}
    </div>
  )
}

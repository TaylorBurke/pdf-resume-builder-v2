import React from 'react'
import type { ResumeContent, PersonalInfo } from '@/types'
import { formatDisplayUrl } from '@/lib/url'

export interface TemplateProps {
  resume: ResumeContent
  personalInfo: PersonalInfo
}

// ── Design tokens ──────────────────────────────────────────────────────────
const colors = {
  sidebar: '#1e3a5f',
  sidebarText: '#ffffff',
  sidebarMuted: 'rgba(255, 255, 255, 0.7)',
  sidebarDivider: 'rgba(255, 255, 255, 0.2)',
  body: '#ffffff',
  text: '#1f2937',
  textLight: '#4b5563',
  textMuted: '#6b7280',
  accent: '#0d9488',
  accentLight: 'rgba(13, 148, 136, 0.15)',
  border: '#e5e7eb',
  skillBarBg: 'rgba(255, 255, 255, 0.2)',
  skillBarFill: '#0d9488',
} as const

const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const

// ── Style definitions ──────────────────────────────────────────────────────
const s = {
  page: {
    width: 816,
    minHeight: 1056,
    display: 'flex' as const,
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Inter, Roboto, Helvetica, Arial, sans-serif",
    fontSize: 10.5,
    lineHeight: '1.5',
    color: colors.text,
    background: `linear-gradient(to right, ${colors.sidebar} 250px, ${colors.body} 250px)`,
  },

  // ── Sidebar ──────────────────────────────────────────────────────────
  sidebar: {
    width: 250,
    color: colors.sidebarText,
    padding: `${spacing.xl}px ${spacing.lg}px`,
    boxSizing: 'border-box' as const,
    flexShrink: 0 as const,
  },
  sidebarName: {
    fontSize: 22,
    fontWeight: 700 as const,
    color: colors.sidebarText,
    margin: `0 0 ${spacing.xs}px 0`,
    lineHeight: '1.2',
  },
  sidebarTitle: {
    fontSize: 11,
    color: colors.sidebarMuted,
    fontWeight: 400 as const,
    margin: `0 0 ${spacing.lg}px 0`,
  },
  sidebarSection: {
    marginBottom: spacing.lg,
  },
  sidebarSectionTitle: {
    fontSize: 9,
    fontWeight: 700 as const,
    textTransform: 'uppercase' as const,
    letterSpacing: '2px',
    color: colors.sidebarMuted,
    margin: `0 0 ${spacing.sm}px 0`,
    paddingBottom: spacing.xs,
    borderBottom: `1px solid ${colors.sidebarDivider}`,
  },
  contactItem: {
    fontSize: 10,
    color: colors.sidebarText,
    marginBottom: 6,
    lineHeight: '1.4',
    wordBreak: 'break-all' as const,
  },
  contactLabel: {
    fontSize: 9,
    color: colors.sidebarMuted,
    display: 'block' as const,
    marginBottom: 1,
  },
  contactLink: {
    color: colors.accent,
    textDecoration: 'none',
  },
  skillGroup: {
    marginBottom: spacing.md,
  },
  skillGroupName: {
    fontSize: 10,
    fontWeight: 600 as const,
    color: colors.sidebarText,
    marginBottom: spacing.xs,
  },
  skillDot: (filled: boolean) => ({
    display: 'inline-block' as const,
    width: 8,
    height: 8,
    borderRadius: '50%',
    backgroundColor: filled ? colors.skillBarFill : colors.skillBarBg,
    marginRight: 3,
  }),
  skillItem: {
    fontSize: 10,
    color: colors.sidebarText,
    marginBottom: spacing.xs,
    display: 'flex' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
  },
  skillItemName: {
    flexShrink: 0 as const,
    marginRight: spacing.sm,
  },
  skillBar: {
    display: 'flex' as const,
    gap: 3,
  },
  languageItem: {
    fontSize: 10,
    color: colors.sidebarText,
    marginBottom: 6,
  },
  languageProficiency: {
    fontSize: 9,
    color: colors.sidebarMuted,
    display: 'block' as const,
  },
  interestTag: {
    display: 'inline-block' as const,
    fontSize: 9,
    color: colors.sidebarText,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    padding: '2px 8px',
    marginRight: 4,
    marginBottom: 4,
  },

  // ── Main content ─────────────────────────────────────────────────────
  main: {
    flex: 1,
    padding: `${spacing.xl}px ${spacing.lg}px ${spacing.xl}px ${spacing.xl}px`,
    boxSizing: 'border-box' as const,
    minWidth: 0,
  },
  mainSection: {
    marginBottom: spacing.lg,
  },
  mainSectionTitle: {
    fontSize: 13,
    fontWeight: 700 as const,
    color: colors.text,
    margin: `0 0 ${spacing.sm}px 0`,
    paddingBottom: spacing.xs,
    paddingLeft: spacing.sm,
    borderLeft: `3px solid ${colors.accent}`,
    lineHeight: '1.2',
  },
  summaryText: {
    fontSize: 10.5,
    color: colors.textLight,
    lineHeight: '1.65',
    margin: 0,
  },
  expEntry: {
    marginBottom: spacing.md,
  },
  expHeader: {
    display: 'flex' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'baseline' as const,
    marginBottom: 2,
  },
  expCompany: {
    fontWeight: 700 as const,
    fontSize: 11.5,
    color: colors.text,
  },
  expDates: {
    fontSize: 10,
    color: colors.accent,
    fontWeight: 600 as const,
    flexShrink: 0 as const,
    marginLeft: spacing.sm,
  },
  expTitle: {
    fontSize: 10.5,
    color: colors.textLight,
    fontStyle: 'italic' as const,
    margin: `0 0 ${spacing.xs}px 0`,
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
  eduEntry: {
    marginBottom: spacing.sm,
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
  eduDate: {
    fontSize: 10,
    color: colors.textMuted,
  },
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
  certEntry: {
    marginBottom: spacing.sm,
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
    fontSize: 9.5,
    color: colors.textMuted,
  },
  awardEntry: {
    marginBottom: spacing.sm,
  },
  awardName: {
    fontWeight: 600 as const,
    fontSize: 10.5,
    color: colors.text,
  },
  awardIssuer: {
    fontSize: 10,
    color: colors.textLight,
  },
  awardDesc: {
    fontSize: 10,
    color: colors.textLight,
    lineHeight: '1.5',
    marginTop: 2,
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
} as const

// ── Helpers ────────────────────────────────────────────────────────────────
function SkillDots({ count }: { count: number }) {
  const total = 5
  const filled = Math.min(count, total)
  return (
    <span style={s.skillBar}>
      {Array.from({ length: total }, (_, i) => (
        <span key={i} style={s.skillDot(i < filled)} />
      ))}
    </span>
  )
}

// ── Component ──────────────────────────────────────────────────────────────
export function BoldTemplate({ resume, personalInfo }: TemplateProps) {
  return (
    <div style={s.page}>
      {/* ── Sidebar ───────────────────────────────────────────────── */}
      <aside style={s.sidebar}>
        <h1 style={s.sidebarName}>{personalInfo.fullName}</h1>
        {resume.experience?.[0]?.title && (
          <p style={s.sidebarTitle}>{resume.experience[0].title}</p>
        )}

        {/* Contact */}
        <div style={s.sidebarSection}>
          <h2 style={s.sidebarSectionTitle}>Contact</h2>
          {personalInfo.email && (
            <div style={s.contactItem}>
              <span style={s.contactLabel}>Email</span>
              <a href={`mailto:${personalInfo.email}`} style={s.contactLink}>{personalInfo.email}</a>
            </div>
          )}
          {personalInfo.phone && (
            <div style={s.contactItem}>
              <span style={s.contactLabel}>Phone</span>
              {personalInfo.phone}
            </div>
          )}
          {personalInfo.location && (
            <div style={s.contactItem}>
              <span style={s.contactLabel}>Location</span>
              {personalInfo.location}
            </div>
          )}
          {personalInfo.linkedinUrl && (
            <div style={s.contactItem}>
              <span style={s.contactLabel}>LinkedIn</span>
              <a href={personalInfo.linkedinUrl} style={s.contactLink}>{formatDisplayUrl(personalInfo.linkedinUrl)}</a>
            </div>
          )}
          {personalInfo.githubUrl && (
            <div style={s.contactItem}>
              <span style={s.contactLabel}>GitHub</span>
              <a href={personalInfo.githubUrl} style={s.contactLink}>{formatDisplayUrl(personalInfo.githubUrl)}</a>
            </div>
          )}
          {personalInfo.portfolioUrl && (
            <div style={s.contactItem}>
              <span style={s.contactLabel}>Portfolio</span>
              <a href={personalInfo.portfolioUrl} style={s.contactLink}>{formatDisplayUrl(personalInfo.portfolioUrl)}</a>
            </div>
          )}
          {personalInfo.websiteUrl && (
            <div style={s.contactItem}>
              <span style={s.contactLabel}>Website</span>
              <a href={personalInfo.websiteUrl} style={s.contactLink}>{formatDisplayUrl(personalInfo.websiteUrl)}</a>
            </div>
          )}
        </div>

        {/* Skills (sidebar) */}
        {resume.skills && resume.skills.length > 0 && (
          <div style={s.sidebarSection}>
            <h2 style={s.sidebarSectionTitle}>Skills</h2>
            {resume.skills.map((cat, i) => (
              <div key={i} style={s.skillGroup}>
                <div style={s.skillGroupName}>{cat.name}</div>
                {cat.items.map((item, j) => (
                  <div key={j} style={s.skillItem}>
                    <span style={s.skillItemName}>{item}</span>
                    <SkillDots count={Math.max(3, 5 - j)} />
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* Languages (sidebar) */}
        {resume.languages && resume.languages.length > 0 && (
          <div style={s.sidebarSection}>
            <h2 style={s.sidebarSectionTitle}>Languages</h2>
            {resume.languages.map((lang, i) => (
              <div key={i} style={s.languageItem}>
                {lang.language}
                <span style={s.languageProficiency}>{lang.proficiency}</span>
              </div>
            ))}
          </div>
        )}

        {/* Interests (sidebar) */}
        {resume.interests && resume.interests.length > 0 && (
          <div style={s.sidebarSection}>
            <h2 style={s.sidebarSectionTitle}>Interests</h2>
            <div>
              {resume.interests.map((item, i) => (
                <span key={i} style={s.interestTag}>{item}</span>
              ))}
            </div>
          </div>
        )}
      </aside>

      {/* ── Main Content ──────────────────────────────────────────── */}
      <main style={s.main}>
        {/* Summary */}
        {resume.summary && (
          <section style={s.mainSection}>
            <h2 style={s.mainSectionTitle}>Profile</h2>
            <p style={s.summaryText}>{resume.summary}</p>
          </section>
        )}

        {/* Experience */}
        {resume.experience && resume.experience.length > 0 && (
          <section style={s.mainSection}>
            <h2 style={s.mainSectionTitle}>Experience</h2>
            {resume.experience.map((exp, i) => (
              <div key={i} style={s.expEntry}>
                <div style={s.expHeader}>
                  <span style={s.expCompany}>{exp.company}</span>
                  <span style={s.expDates}>{exp.dates}</span>
                </div>
                <div style={s.expTitle}>{exp.title}</div>
                {exp.bullets && exp.bullets.length > 0 && (
                  <ul style={s.bulletList}>
                    {exp.bullets.map((bullet, j) => (
                      <li key={j} style={s.bulletItem}>{bullet}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </section>
        )}

        {/* Education */}
        {resume.education && resume.education.length > 0 && (
          <section style={s.mainSection}>
            <h2 style={s.mainSectionTitle}>Education</h2>
            {resume.education.map((edu, i) => (
              <div key={i} style={s.eduEntry}>
                <div style={s.expHeader}>
                  <span style={s.eduSchool}>{edu.school}</span>
                  {edu.graduationDate && (
                    <span style={s.expDates}>{edu.graduationDate}</span>
                  )}
                </div>
                <div style={s.eduDegree}>
                  {edu.degree}{edu.field ? `, ${edu.field}` : ''}
                </div>
              </div>
            ))}
          </section>
        )}

        {/* Projects */}
        {resume.projects && resume.projects.length > 0 && (
          <section style={s.mainSection}>
            <h2 style={s.mainSectionTitle}>Projects</h2>
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
          </section>
        )}

        {/* Certificates */}
        {resume.certificates && resume.certificates.length > 0 && (
          <section style={s.mainSection}>
            <h2 style={s.mainSectionTitle}>Certificates</h2>
            {resume.certificates.map((cert, i) => (
              <div key={i} style={s.certEntry}>
                <div style={s.expHeader}>
                  <span style={s.certName}>{cert.name}</span>
                  {cert.date && <span style={s.certDate}>{cert.date}</span>}
                </div>
                <div style={s.certIssuer}>{cert.issuer}</div>
              </div>
            ))}
          </section>
        )}

        {/* Awards */}
        {resume.awards && resume.awards.length > 0 && (
          <section style={s.mainSection}>
            <h2 style={s.mainSectionTitle}>Awards</h2>
            {resume.awards.map((award, i) => (
              <div key={i} style={s.awardEntry}>
                <div style={s.expHeader}>
                  <span style={s.awardName}>{award.name}</span>
                  {award.date && <span style={s.certDate}>{award.date}</span>}
                </div>
                <div style={s.awardIssuer}>{award.issuer}</div>
                {award.description && (
                  <p style={s.awardDesc}>{award.description}</p>
                )}
              </div>
            ))}
          </section>
        )}

        {/* Volunteer */}
        {resume.volunteer && resume.volunteer.length > 0 && (
          <section style={s.mainSection}>
            <h2 style={s.mainSectionTitle}>Volunteer Experience</h2>
            {resume.volunteer.map((vol, i) => (
              <div key={i} style={s.volEntry}>
                <div style={s.volOrg}>{vol.organization}</div>
                <div style={s.volRole}>{vol.role}</div>
                <p style={s.volDesc}>{vol.description}</p>
              </div>
            ))}
          </section>
        )}
      </main>
    </div>
  )
}

'use client'

import type { ResumeContent } from '@/types'

interface ResumePreviewProps {
  content: ResumeContent
  personalInfo?: { fullName?: string; email?: string; phone?: string; location?: string }
}

export default function ResumePreview({ content, personalInfo }: ResumePreviewProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-8 shadow-sm">
      {/* Header / Personal Info */}
      {personalInfo && (
        <div className="mb-6 pb-4 border-b border-gray-300">
          {personalInfo.fullName && (
            <h1 className="text-2xl font-bold text-gray-900">{personalInfo.fullName}</h1>
          )}
          <div className="flex flex-wrap gap-3 mt-1 text-sm text-gray-600">
            {personalInfo.email && <span>{personalInfo.email}</span>}
            {personalInfo.phone && <span>{personalInfo.phone}</span>}
            {personalInfo.location && <span>{personalInfo.location}</span>}
          </div>
        </div>
      )}

      {/* Summary */}
      {content.summary && (
        <div className="mb-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-700 mb-2">
            Professional Summary
          </h2>
          <p className="text-sm text-gray-700 leading-relaxed">{content.summary}</p>
        </div>
      )}

      {/* Experience */}
      {content.experience && content.experience.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-700 mb-3">
            Experience
          </h2>
          <div className="space-y-4">
            {content.experience.map((exp, i) => (
              <div key={i}>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">{exp.title}</h3>
                    <p className="text-sm text-gray-600">{exp.company}</p>
                  </div>
                  {exp.dates && (
                    <span className="text-xs text-gray-500 whitespace-nowrap">{exp.dates}</span>
                  )}
                </div>
                {exp.bullets && exp.bullets.length > 0 && (
                  <ul className="mt-1 space-y-1">
                    {exp.bullets.map((bullet, j) => (
                      <li key={j} className="text-sm text-gray-700 pl-4 relative before:content-['•'] before:absolute before:left-0 before:text-gray-400">
                        {bullet}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      {content.skills && content.skills.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-700 mb-2">
            Skills
          </h2>
          <div className="space-y-1">
            {content.skills.map((cat, i) => (
              <div key={i} className="text-sm">
                <span className="font-medium text-gray-800">{cat.name}: </span>
                <span className="text-gray-600">{cat.items.join(', ')}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {content.education && content.education.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-700 mb-2">
            Education
          </h2>
          <div className="space-y-2">
            {content.education.map((edu, i) => (
              <div key={i} className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">{edu.degree}{edu.field ? ` in ${edu.field}` : ''}</h3>
                  <p className="text-sm text-gray-600">{edu.school}</p>
                </div>
                {edu.graduationDate && (
                  <span className="text-xs text-gray-500 whitespace-nowrap">{edu.graduationDate}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Projects */}
      {content.projects && content.projects.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-700 mb-2">
            Projects
          </h2>
          <div className="space-y-3">
            {content.projects.map((proj, i) => (
              <div key={i}>
                <h3 className="text-sm font-semibold text-gray-900">{proj.name}</h3>
                <p className="text-sm text-gray-600">{proj.description}</p>
                {proj.techStack && proj.techStack.length > 0 && (
                  <p className="text-xs text-gray-500 mt-1">Tech: {proj.techStack.join(', ')}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Certificates */}
      {content.certificates && content.certificates.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-700 mb-2">
            Certifications
          </h2>
          <div className="space-y-1">
            {content.certificates.map((cert, i) => (
              <div key={i} className="flex items-start justify-between text-sm">
                <div>
                  <span className="font-medium text-gray-800">{cert.name}</span>
                  <span className="text-gray-500"> &mdash; {cert.issuer}</span>
                </div>
                {cert.date && <span className="text-xs text-gray-500">{cert.date}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Languages */}
      {content.languages && content.languages.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-700 mb-2">
            Languages
          </h2>
          <div className="flex flex-wrap gap-3">
            {content.languages.map((lang, i) => (
              <span key={i} className="text-sm text-gray-700">
                {lang.language} <span className="text-gray-400">({lang.proficiency})</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Awards */}
      {content.awards && content.awards.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-700 mb-2">
            Awards
          </h2>
          <div className="space-y-1">
            {content.awards.map((award, i) => (
              <div key={i} className="text-sm">
                <span className="font-medium text-gray-800">{award.name}</span>
                <span className="text-gray-500"> &mdash; {award.issuer}</span>
                {award.date && <span className="text-gray-400 text-xs ml-2">{award.date}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Volunteer */}
      {content.volunteer && content.volunteer.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-700 mb-2">
            Volunteer Experience
          </h2>
          <div className="space-y-2">
            {content.volunteer.map((vol, i) => (
              <div key={i}>
                <h3 className="text-sm font-semibold text-gray-900">{vol.role}</h3>
                <p className="text-sm text-gray-600">{vol.organization}</p>
                <p className="text-sm text-gray-500">{vol.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Interests */}
      {content.interests && content.interests.length > 0 && (
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-700 mb-2">
            Interests
          </h2>
          <p className="text-sm text-gray-600">{content.interests.join(', ')}</p>
        </div>
      )}
    </div>
  )
}

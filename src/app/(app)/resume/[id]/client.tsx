'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import ResumePreview from '@/components/resume/ResumePreview'
import TemplateSelector from '@/components/resume/TemplateSelector'
import FeedbackForm from '@/components/resume/FeedbackForm'
import DownloadButton from '@/components/resume/DownloadButton'
import { regenerateResume, updateResumeTemplate } from '@/actions/generation'
import type { ResumeContent, PersonalInfo } from '@/types'

interface ResumeData {
  id: string
  jobTitle: string
  company: string
  templateId: string | null
  resumeContent: ResumeContent | null
  feedbackHistory: { feedback: string; timestamp: string }[]
}

interface ResumeViewClientProps {
  resume: ResumeData
  personalInfo?: PersonalInfo
}

export default function ResumeViewClient({ resume, personalInfo }: ResumeViewClientProps) {
  const router = useRouter()
  const [content, setContent] = useState<ResumeContent | null>(resume.resumeContent)
  const [templateId, setTemplateId] = useState(resume.templateId ?? 'clean')
  const [isPending, startTransition] = useTransition()

  function handleTemplateChange(newTemplateId: string) {
    setTemplateId(newTemplateId)
    startTransition(async () => {
      await updateResumeTemplate(resume.id, newTemplateId)
    })
  }

  function handleFeedbackSubmit(feedback: string) {
    startTransition(async () => {
      const result = await regenerateResume(resume.id, feedback)
      setContent(result.resumeContent)
    })
  }

  if (!content) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">This resume has no content yet.</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{resume.jobTitle}</h1>
          <p className="text-gray-600">{resume.company}</p>
        </div>
        <DownloadButton resumeId={resume.id} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Resume Preview */}
        <div className="lg:col-span-2">
          <ResumePreview content={content} personalInfo={personalInfo} />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <TemplateSelector
            selectedTemplate={templateId}
            onSelect={handleTemplateChange}
          />

          <div className="border-t border-gray-200 pt-6">
            <FeedbackForm
              onSubmit={handleFeedbackSubmit}
              isLoading={isPending}
            />
          </div>

          {resume.feedbackHistory.length > 0 && (
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Feedback History</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {resume.feedbackHistory.map((entry, i) => (
                  <div key={i} className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm text-gray-700">{entry.feedback}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(entry.timestamp).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

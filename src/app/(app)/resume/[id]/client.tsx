'use client'

import { useState, useTransition, useEffect, useMemo } from 'react'
import PagedPreview from '@/components/resume/PagedPreview'
import TemplateSelector from '@/components/resume/TemplateSelector'
import FeedbackForm from '@/components/resume/FeedbackForm'
import DownloadButton from '@/components/resume/DownloadButton'
import { regenerateResume, updateResumeTemplate } from '@/actions/generation'
import { getPreviewHtml } from '@/actions/preview'
import { TEMPLATES } from '@/templates'
import type { TemplateId } from '@/templates'
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

function isValidTemplateId(id: string): id is TemplateId {
  return id in TEMPLATES
}

export default function ResumeViewClient({ resume, personalInfo }: ResumeViewClientProps) {
  const [content, setContent] = useState<ResumeContent | null>(resume.resumeContent)
  const [templateId, setTemplateId] = useState<TemplateId>(
    resume.templateId && isValidTemplateId(resume.templateId) ? resume.templateId : 'clean'
  )
  const [isPending, startTransition] = useTransition()
  const [previewHtml, setPreviewHtml] = useState('')
  const [drawerOpen, setDrawerOpen] = useState(false)

  const personalInfoKey = JSON.stringify(personalInfo)
  const resolvedPersonalInfo = useMemo(
    () => personalInfo ?? { fullName: '', email: '' },
    // eslint-disable-next-line react-hooks/exhaustive-deps -- serialized key tracks value changes
    [personalInfoKey]
  )

  // Load preview HTML on mount and when content/template changes
  useEffect(() => {
    if (!content) return
    let cancelled = false
    ;(async () => {
      try {
        const html = await getPreviewHtml(content, resolvedPersonalInfo, templateId)
        if (!cancelled) setPreviewHtml(html)
      } catch (err) {
        if (!cancelled) console.error('Failed to load preview:', err)
      }
    })()
    return () => { cancelled = true }
  }, [content, templateId, resolvedPersonalInfo])

  function handleTemplateChange(newTemplateId: string) {
    if (!isValidTemplateId(newTemplateId)) return
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
        <p className="text-gray-500 dark:text-gray-400">This resume has no content yet.</p>
      </div>
    )
  }

  const sidebarContent = (
    <>
      <TemplateSelector
        selectedTemplate={templateId}
        onSelect={handleTemplateChange}
      />
      <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
        <FeedbackForm
          onSubmit={handleFeedbackSubmit}
          isLoading={isPending}
        />
      </div>
      {resume.feedbackHistory.length > 0 && (
        <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Feedback History</h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {resume.feedbackHistory.map((entry, i) => (
              <div key={i} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                <p className="text-sm text-gray-700 dark:text-gray-300">{entry.feedback}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  {new Date(entry.timestamp).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{resume.jobTitle}</h1>
          <p className="text-gray-600 dark:text-gray-400">{resume.company}</p>
        </div>
        <div className="flex items-center gap-2">
          <DownloadButton resumeId={resume.id} iconOnly />
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 shadow-sm transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
            </svg>
            Customize
          </button>
        </div>
      </div>

      <PagedPreview html={previewHtml} />

      {drawerOpen && (
        <div
          className="fixed inset-0 bg-black/30 dark:bg-black/50 z-40"
          onClick={() => setDrawerOpen(false)}
        />
      )}
      <div
        data-testid="controls-drawer"
        className={`fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white dark:bg-gray-900 shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
          drawerOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Customize</h2>
          <button
            type="button"
            onClick={() => setDrawerOpen(false)}
            aria-label="Close"
            className="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 rounded-lg"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-4 space-y-6 overflow-y-auto h-[calc(100%-65px)]">
          <DownloadButton resumeId={resume.id} />
          {sidebarContent}
        </div>
      </div>
    </div>
  )
}

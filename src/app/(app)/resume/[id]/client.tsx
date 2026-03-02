'use client'

import { useState, useTransition, useEffect, useMemo } from 'react'
import PagedPreview from '@/components/resume/PagedPreview'
import TemplateSelector from '@/components/resume/TemplateSelector'
import FeedbackForm from '@/components/resume/FeedbackForm'
import DownloadButton from '@/components/resume/DownloadButton'
import AnalysisPanel from '@/components/resume/AnalysisPanel'
import SectionEditor from '@/components/resume/SectionEditor'
import { regenerateResume, updateResumeTemplate, updateResumeContent } from '@/actions/generation'
import { getPreviewHtml } from '@/actions/preview'
import { TEMPLATES } from '@/templates'
import type { TemplateId } from '@/templates'
import type { ResumeContent, PersonalInfo, JobAnalysis } from '@/types'

interface ResumeData {
  id: string
  jobTitle: string
  company: string
  templateId: string | null
  resumeContent: ResumeContent | null
  analysis: JobAnalysis | null
  feedbackHistory: { feedback: string; timestamp: string }[]
}

interface ResumeViewClientProps {
  resume: ResumeData
  personalInfo?: PersonalInfo
}

function isValidTemplateId(id: string): id is TemplateId {
  return id in TEMPLATES
}

const TEMPLATE_ICONS: { id: TemplateId; title: string; icon: React.ReactNode }[] = [
  {
    id: 'clean',
    title: 'Clean template',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <rect x="4" y="3" width="16" height="18" rx="1" />
        <line x1="7" y1="7" x2="17" y2="7" />
        <line x1="7" y1="11" x2="17" y2="11" />
        <line x1="7" y1="15" x2="13" y2="15" />
      </svg>
    ),
  },
  {
    id: 'bold',
    title: 'Bold template',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <rect x="4" y="3" width="16" height="18" rx="1" />
        <rect x="4" y="3" width="6" height="18" rx="1" fill="currentColor" opacity="0.2" />
        <line x1="12" y1="7" x2="17" y2="7" />
        <line x1="12" y1="11" x2="17" y2="11" />
      </svg>
    ),
  },
  {
    id: 'executive',
    title: 'Executive template',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <rect x="4" y="3" width="16" height="18" rx="1" />
        <rect x="4" y="3" width="16" height="6" rx="1" fill="currentColor" opacity="0.2" />
        <line x1="7" y1="13" x2="17" y2="13" />
        <line x1="7" y1="17" x2="13" y2="17" />
      </svg>
    ),
  },
]

export default function ResumeViewClient({ resume, personalInfo }: ResumeViewClientProps) {
  const [content, setContent] = useState<ResumeContent | null>(resume.resumeContent)
  const [templateId, setTemplateId] = useState<TemplateId>(
    resume.templateId && isValidTemplateId(resume.templateId) ? resume.templateId : 'clean'
  )
  const [isPending, startTransition] = useTransition()
  const [previewHtml, setPreviewHtml] = useState('')
  const [panelOpen, setPanelOpen] = useState(true)
  const [drawerTab, setDrawerTab] = useState<'edit' | 'customize'>('edit')

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

  function handleContentSave(updatedContent: ResumeContent) {
    const previousContent = content
    setContent(updatedContent)
    startTransition(async () => {
      try {
        await updateResumeContent(resume.id, updatedContent)
      } catch {
        setContent(previousContent)
      }
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
      </div>

      {resume.analysis && <AnalysisPanel analysis={resume.analysis} />}

      <div className="flex gap-0">
        {/* Preview area */}
        <div className="flex-1 min-w-0 transition-all duration-300 ease-in-out">
          <PagedPreview html={previewHtml} />
        </div>

        {/* Side panel */}
        <div
          data-testid="controls-panel"
          className={`flex-shrink-0 transition-all duration-300 ease-in-out ${
            panelOpen ? 'w-80' : 'w-12'
          }`}
        >
          {panelOpen ? (
            /* ── Expanded panel ── */
            <div className="h-full border-l border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
                <div className="flex gap-1" role="tablist">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={drawerTab === 'edit'}
                    onClick={() => setDrawerTab('edit')}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                      drawerTab === 'edit'
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                    }`}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={drawerTab === 'customize'}
                    onClick={() => setDrawerTab('customize')}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                      drawerTab === 'customize'
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                    }`}
                  >
                    Customize
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setPanelOpen(false)}
                  aria-label="Collapse panel"
                  className="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 rounded-lg"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
              <div className="p-4 space-y-6 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
                <DownloadButton resumeId={resume.id} />
                {drawerTab === 'edit' ? (
                  <SectionEditor content={content} onSave={handleContentSave} isSaving={isPending} />
                ) : (
                  sidebarContent
                )}
              </div>
            </div>
          ) : (
            /* ── Collapsed toolbar ── */
            <div
              data-testid="collapsed-toolbar"
              className="h-full border-l border-gray-200 dark:border-gray-700 flex flex-col items-center py-3 gap-2"
            >
              <button
                type="button"
                onClick={() => setPanelOpen(true)}
                aria-label="Expand panel"
                className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <DownloadButton resumeId={resume.id} iconOnly />

              <div className="w-6 border-t border-gray-300 dark:border-gray-600" />

              {/* Template switcher icons */}
              {TEMPLATE_ICONS.map(({ id, title, icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => handleTemplateChange(id)}
                  title={title}
                  className={`p-2 rounded-lg transition-colors ${
                    templateId === id
                      ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950'
                      : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

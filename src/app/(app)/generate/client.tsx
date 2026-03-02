'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { analyzeJob, generateResume, generateCoverLetters } from '@/actions/generation'
import type { JobAnalysis, CoverLetterSet, CoverLetterTone } from '@/types'

type Step = 'input' | 'analyzing' | 'analysis' | 'generating'

export default function GenerateClient() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('input')
  const [company, setCompany] = useState('')
  const [jobTitle, setJobTitle] = useState('')
  const [jobText, setJobText] = useState('')
  const [analysis, setAnalysis] = useState<JobAnalysis | null>(null)
  const [parsedSections, setParsedSections] = useState<{ sectionType: string; data: unknown }[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [wantCoverLetters, setWantCoverLetters] = useState(false)
  const [coverLetters, setCoverLetters] = useState<CoverLetterSet | null>(null)
  const [coverLetterTab, setCoverLetterTab] = useState<'formal' | 'cultureFit' | 'technical'>('formal')
  const [isGeneratingCoverLetters, setIsGeneratingCoverLetters] = useState(false)
  const [coverLetterError, setCoverLetterError] = useState(false)

  function handleAnalyze() {
    if (!company.trim() || !jobTitle.trim() || !jobText.trim()) return
    setError(null)
    setStep('analyzing')

    startTransition(async () => {
      try {
        const result = await analyzeJob(jobText, company, jobTitle)
        setAnalysis(result.analysis)
        setParsedSections(result.parsedSections)
        setStep('analysis')

        if (wantCoverLetters) {
          setIsGeneratingCoverLetters(true)
          setCoverLetterError(false)
          try {
            const letters = await generateCoverLetters(jobText, company, jobTitle, result.analysis, result.parsedSections)
            setCoverLetters(letters)
          } catch {
            setCoverLetterError(true)
          } finally {
            setIsGeneratingCoverLetters(false)
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to analyze job posting')
        setStep('input')
      }
    })
  }

  function handleGenerate() {
    if (!analysis) return
    setError(null)
    setStep('generating')

    const toneMap: Record<string, CoverLetterTone> = {
      formal: 'formal',
      cultureFit: 'culture_fit',
      technical: 'technical',
    }

    startTransition(async () => {
      try {
        const result = await generateResume(
          jobText, company, jobTitle, analysis, parsedSections,
          (wantCoverLetters && coverLetters) ? coverLetters : undefined,
          (wantCoverLetters && coverLetters) ? toneMap[coverLetterTab] : undefined
        )
        router.push(`/resume/${result.id}`)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to generate resume')
        setStep('analysis')
      }
    })
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Generate Resume</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        Paste a job posting and we&apos;ll create a tailored resume for you.
      </p>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      {/* Step 1: Input */}
      {(step === 'input' || step === 'analyzing') && (
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="company" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Company Name
              </label>
              <input
                id="company"
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 dark:bg-gray-800 dark:text-gray-100"
                placeholder="Acme Corp"
                disabled={step === 'analyzing'}
              />
            </div>

            <div>
              <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Job Title
              </label>
              <input
                id="jobTitle"
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 dark:bg-gray-800 dark:text-gray-100"
                placeholder="Senior Software Engineer"
                disabled={step === 'analyzing'}
              />
            </div>

            <div>
              <label htmlFor="jobText" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Job Posting
              </label>
              <textarea
                id="jobText"
                value={jobText}
                onChange={(e) => setJobText(e.target.value)}
                rows={12}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 dark:bg-gray-800 dark:text-gray-100 resize-y"
                placeholder="Paste the full job posting text here..."
                disabled={step === 'analyzing'}
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={wantCoverLetters}
                onChange={(e) => {
                  setWantCoverLetters(e.target.checked)
                  if (!e.target.checked) setCoverLetters(null)
                }}
                disabled={step === 'analyzing'}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Also generate cover letters</span>
            </label>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleAnalyze}
                disabled={step === 'analyzing' || !company.trim() || !jobTitle.trim() || !jobText.trim()}
                className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {step === 'analyzing' ? 'Analyzing...' : 'Analyze'}
              </button>
            </div>
          </div>

          {step === 'analyzing' && (
            <div className="mt-6 flex items-center justify-center gap-3 text-sm text-gray-600 dark:text-gray-400">
              <div className="h-5 w-5 border-2 border-blue-600 dark:border-blue-400 border-t-transparent rounded-full animate-spin" />
              Analyzing job posting...
            </div>
          )}
        </div>
      )}

      {/* Step 2: Analysis Results */}
      {(step === 'analysis' || step === 'generating') && analysis && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Analysis Results</h2>

            {/* Key Requirements */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Key Requirements</h3>
              <div className="space-y-2">
                {analysis.keyRequirements.map((req, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span
                      className={`inline-block px-2 py-0.5 text-xs font-medium rounded ${
                        req.priority === 'high'
                          ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                          : req.priority === 'medium'
                          ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                          : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                      }`}
                    >
                      {req.priority}
                    </span>
                    <span className="text-sm text-gray-700 dark:text-gray-300">{req.requirement}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Skill Matches */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Skill Matches</h3>
              <div className="flex flex-wrap gap-2">
                {analysis.skillMatches.map((match, i) => (
                  <span
                    key={i}
                    className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${
                      match.strength === 'strong'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                        : match.strength === 'moderate'
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                        : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                    }`}
                  >
                    {match.skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Gaps */}
            {analysis.gaps.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Gaps to Address</h3>
                <ul className="list-disc list-inside space-y-1">
                  {analysis.gaps.map((gap, i) => (
                    <li key={i} className="text-sm text-gray-600 dark:text-gray-400">{gap}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommended Angle */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Recommended Angle</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{analysis.recommendedAngle}</p>
            </div>
          </div>

          {/* Cover Letters */}
          {wantCoverLetters && (
            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Cover Letters</h2>

              {isGeneratingCoverLetters && (
                <div className="flex items-center justify-center gap-3 py-8 text-sm text-gray-600 dark:text-gray-400">
                  <div className="h-5 w-5 border-2 border-blue-600 dark:border-blue-400 border-t-transparent rounded-full animate-spin" />
                  Generating cover letters...
                </div>
              )}

              {coverLetterError && !coverLetters && (
                <p className="text-sm text-amber-600 dark:text-amber-400">
                  Cover letter generation failed. You can still generate your resume without cover letters.
                </p>
              )}

              {coverLetters && (
                <>
                  <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
                    {([
                      ['formal', 'Direct & Formal'],
                      ['cultureFit', 'Culture Fit'],
                      ['technical', 'Technically Impressive'],
                    ] as const).map(([key, label]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setCoverLetterTab(key)}
                        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                          coverLetterTab === key
                            ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                            : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={coverLetters[coverLetterTab]}
                    onChange={(e) =>
                      setCoverLetters((prev) =>
                        prev ? { ...prev, [coverLetterTab]: e.target.value } : prev
                      )
                    }
                    rows={16}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 dark:bg-gray-800 dark:text-gray-100 resize-y leading-relaxed"
                  />
                </>
              )}
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleGenerate}
              disabled={step === 'generating' || isGeneratingCoverLetters}
              className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {step === 'generating' ? 'Generating...' : 'Generate Resume'}
            </button>
          </div>

          {step === 'generating' && (
            <div className="flex items-center justify-center gap-3 text-sm text-gray-600 dark:text-gray-400">
              <div className="h-5 w-5 border-2 border-blue-600 dark:border-blue-400 border-t-transparent rounded-full animate-spin" />
              Generating resume...
            </div>
          )}
        </div>
      )}
    </div>
  )
}

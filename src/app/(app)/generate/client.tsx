'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { analyzeJob, generateResume } from '@/actions/generation'
import type { JobAnalysis } from '@/types'

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

    startTransition(async () => {
      try {
        const result = await generateResume(jobText, company, jobTitle, analysis, parsedSections)
        router.push(`/resume/${result.id}`)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to generate resume')
        setStep('analysis')
      }
    })
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Generate Resume</h1>
      <p className="text-gray-600 mb-8">
        Paste a job posting and we&apos;ll create a tailored resume for you.
      </p>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Step 1: Input */}
      {(step === 'input' || step === 'analyzing') && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
                Company Name
              </label>
              <input
                id="company"
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Acme Corp"
                disabled={step === 'analyzing'}
              />
            </div>

            <div>
              <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-700 mb-1">
                Job Title
              </label>
              <input
                id="jobTitle"
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Senior Software Engineer"
                disabled={step === 'analyzing'}
              />
            </div>

            <div>
              <label htmlFor="jobText" className="block text-sm font-medium text-gray-700 mb-1">
                Job Posting
              </label>
              <textarea
                id="jobText"
                value={jobText}
                onChange={(e) => setJobText(e.target.value)}
                rows={12}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                placeholder="Paste the full job posting text here..."
                disabled={step === 'analyzing'}
              />
            </div>

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
            <div className="mt-6 flex items-center justify-center gap-3 text-sm text-gray-600">
              <div className="h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              Analyzing job posting...
            </div>
          )}
        </div>
      )}

      {/* Step 2: Analysis Results */}
      {(step === 'analysis' || step === 'generating') && analysis && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Analysis Results</h2>

            {/* Key Requirements */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Key Requirements</h3>
              <div className="space-y-2">
                {analysis.keyRequirements.map((req, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span
                      className={`inline-block px-2 py-0.5 text-xs font-medium rounded ${
                        req.priority === 'high'
                          ? 'bg-red-100 text-red-700'
                          : req.priority === 'medium'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {req.priority}
                    </span>
                    <span className="text-sm text-gray-700">{req.requirement}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Skill Matches */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Skill Matches</h3>
              <div className="flex flex-wrap gap-2">
                {analysis.skillMatches.map((match, i) => (
                  <span
                    key={i}
                    className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${
                      match.strength === 'strong'
                        ? 'bg-green-100 text-green-700'
                        : match.strength === 'moderate'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-600'
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
                <h3 className="text-sm font-medium text-gray-700 mb-2">Gaps to Address</h3>
                <ul className="list-disc list-inside space-y-1">
                  {analysis.gaps.map((gap, i) => (
                    <li key={i} className="text-sm text-gray-600">{gap}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommended Angle */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Recommended Angle</h3>
              <p className="text-sm text-gray-600">{analysis.recommendedAngle}</p>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleGenerate}
              disabled={step === 'generating'}
              className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {step === 'generating' ? 'Generating...' : 'Generate Resume'}
            </button>
          </div>

          {step === 'generating' && (
            <div className="flex items-center justify-center gap-3 text-sm text-gray-600">
              <div className="h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              Generating resume...
            </div>
          )}
        </div>
      )}
    </div>
  )
}

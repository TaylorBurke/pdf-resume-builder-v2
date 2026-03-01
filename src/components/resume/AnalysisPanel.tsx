'use client'

import { useState } from 'react'
import type { JobAnalysis } from '@/types'

interface AnalysisPanelProps {
  analysis: JobAnalysis
}

export default function AnalysisPanel({ analysis }: AnalysisPanelProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="mb-6 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 text-left"
      >
        <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Job Analysis</h2>
        <svg
          className={`w-5 h-5 text-gray-400 dark:text-gray-500 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-4">
          {/* Key Requirements */}
          <div>
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
          <div>
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
            <div>
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
      )}
    </div>
  )
}

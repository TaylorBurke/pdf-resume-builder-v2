'use client'

import { useState } from 'react'
import SectionForm from '../SectionForm'
import type { Certificate, CertificateEntry } from '@/types'

interface CertificatesStepProps {
  onSubmit: (data: Certificate) => void
  onSkip: () => void
  initialData: Partial<Certificate> | null
}

function emptyEntry(): CertificateEntry {
  return { name: '', issuer: '', date: '', credentialId: '', url: '' }
}

export default function CertificatesStep({ onSubmit, onSkip, initialData }: CertificatesStepProps) {
  const [entries, setEntries] = useState<CertificateEntry[]>(
    initialData?.entries?.length ? initialData.entries : [emptyEntry()]
  )

  function updateEntry(index: number, field: keyof CertificateEntry, value: string) {
    setEntries((prev) => prev.map((e, i) => (i === index ? { ...e, [field]: value } : e)))
  }

  function addEntry() {
    setEntries((prev) => [...prev, emptyEntry()])
  }

  function removeEntry(index: number) {
    setEntries((prev) => prev.filter((_, i) => i !== index))
  }

  function handleSubmit() {
    onSubmit({
      entries: entries.map((e) => ({
        name: e.name,
        issuer: e.issuer,
        date: e.date || undefined,
        credentialId: e.credentialId || undefined,
        url: e.url || undefined,
      })),
    })
  }

  return (
    <SectionForm
      title="Certifications"
      description="Add any professional certifications you hold."
      onSubmit={handleSubmit}
      onSkip={onSkip}
    >
      <div className="space-y-6">
        {entries.map((entry, idx) => (
          <div key={idx} className="p-4 border border-gray-200 rounded-lg space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-700">Certificate {idx + 1}</h3>
              {entries.length > 1 && (
                <button type="button" onClick={() => removeEntry(idx)} className="text-sm text-red-500 hover:text-red-700">
                  Remove
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Certificate Name</label>
                <input
                  type="text"
                  value={entry.name}
                  onChange={(e) => updateEntry(idx, 'name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="AWS Solutions Architect"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Issuer</label>
                <input
                  type="text"
                  value={entry.issuer}
                  onChange={(e) => updateEntry(idx, 'issuer', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Amazon Web Services"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="text"
                  value={entry.date ?? ''}
                  onChange={(e) => updateEntry(idx, 'date', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Jan 2023"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Credential ID</label>
                <input
                  type="text"
                  value={entry.credentialId ?? ''}
                  onChange={(e) => updateEntry(idx, 'credentialId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="ABC123XYZ"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
              <input
                type="url"
                value={entry.url ?? ''}
                onChange={(e) => updateEntry(idx, 'url', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://credential.example.com/verify"
              />
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={addEntry}
          className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-blue-400 hover:text-blue-600"
        >
          + Add Certificate
        </button>
      </div>
    </SectionForm>
  )
}

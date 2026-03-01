'use client'

import { useState } from 'react'
import SectionForm from '../SectionForm'
import type { PersonalInfo } from '@/types'

interface PersonalInfoStepProps {
  onSubmit: (data: PersonalInfo) => void
  onSkip: () => void
  onBack?: () => void
  initialData: Partial<PersonalInfo> | null
}

export default function PersonalInfoStep({ onSubmit, onSkip, onBack, initialData }: PersonalInfoStepProps) {
  const [fullName, setFullName] = useState(initialData?.fullName ?? '')
  const [email, setEmail] = useState(initialData?.email ?? '')
  const [phone, setPhone] = useState(initialData?.phone ?? '')
  const [location, setLocation] = useState(initialData?.location ?? '')
  const [linkedinUrl, setLinkedinUrl] = useState(initialData?.linkedinUrl ?? '')
  const [githubUrl, setGithubUrl] = useState(initialData?.githubUrl ?? '')
  const [portfolioUrl, setPortfolioUrl] = useState(initialData?.portfolioUrl ?? '')
  const [websiteUrl, setWebsiteUrl] = useState(initialData?.websiteUrl ?? '')

  function handleSubmit() {
    onSubmit({
      fullName,
      email,
      phone: phone || undefined,
      location: location || undefined,
      linkedinUrl: linkedinUrl || undefined,
      githubUrl: githubUrl || undefined,
      portfolioUrl: portfolioUrl || undefined,
      websiteUrl: websiteUrl || undefined,
    })
  }

  return (
    <SectionForm
      title="Personal Information"
      description="Let's start with your basic contact details. This information will appear at the top of your resume."
      onSubmit={handleSubmit}
      onSkip={onSkip}
      onBack={onBack}
      isRequired
    >
      <div className="space-y-4">
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
            Full Name *
          </label>
          <input
            id="fullName"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="John Doe"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email *
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="john@example.com"
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
            Phone
          </label>
          <input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="+1 (555) 123-4567"
          />
        </div>

        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
            Location
          </label>
          <input
            id="location"
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="San Francisco, CA"
          />
        </div>

        <div>
          <label htmlFor="linkedinUrl" className="block text-sm font-medium text-gray-700 mb-1">
            LinkedIn URL
          </label>
          <input
            id="linkedinUrl"
            type="url"
            value={linkedinUrl}
            onChange={(e) => setLinkedinUrl(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="https://linkedin.com/in/johndoe"
          />
        </div>

        <div>
          <label htmlFor="githubUrl" className="block text-sm font-medium text-gray-700 mb-1">
            GitHub URL
          </label>
          <input
            id="githubUrl"
            type="url"
            value={githubUrl}
            onChange={(e) => setGithubUrl(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="https://github.com/johndoe"
          />
        </div>

        <div>
          <label htmlFor="portfolioUrl" className="block text-sm font-medium text-gray-700 mb-1">
            Portfolio URL
          </label>
          <input
            id="portfolioUrl"
            type="url"
            value={portfolioUrl}
            onChange={(e) => setPortfolioUrl(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="https://portfolio.example.com"
          />
        </div>

        <div>
          <label htmlFor="websiteUrl" className="block text-sm font-medium text-gray-700 mb-1">
            Website URL
          </label>
          <input
            id="websiteUrl"
            type="url"
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="https://johndoe.com"
          />
        </div>
      </div>
    </SectionForm>
  )
}

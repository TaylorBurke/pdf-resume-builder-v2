import Link from 'next/link'
import { completeOnboarding } from '@/actions/onboarding'

export default async function OnboardingCompletePage() {
  await completeOnboarding()

  return (
    <div className="text-center py-16">
      <div className="mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
          <svg
            className="w-8 h-8 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">You&apos;re all set!</h1>
        <p className="mt-2 text-gray-500">
          Your profile has been set up. You can now start generating tailored resumes.
        </p>
      </div>
      <Link
        href="/dashboard"
        className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
      >
        Go to Dashboard
      </Link>
    </div>
  )
}

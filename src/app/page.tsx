import { redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/lib/auth'

export default async function Home() {
  const session = await auth()
  if (session?.user) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <span className="text-xl font-bold text-gray-900">Resume Builder</span>
          <Link
            href="/login"
            className="text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            Sign in
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="max-w-2xl text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 tracking-tight leading-tight">
            Build your perfect resume
          </h1>
          <p className="mt-6 text-lg text-gray-600 leading-relaxed">
            Paste a job posting and our AI will craft a tailored resume highlighting
            your most relevant experience, skills, and achievements. Stand out from
            the crowd and land more interviews.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link
              href="/login"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Get Started
            </Link>
          </div>
          <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8 text-left">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">AI-Powered</h3>
              <p className="text-sm text-gray-500">
                Our AI analyzes job postings and generates resumes optimized for each position.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Tailored Every Time</h3>
              <p className="text-sm text-gray-500">
                Each resume is custom-built from your profile to match specific job requirements.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">PDF Export</h3>
              <p className="text-sm text-gray-500">
                Download professional PDFs ready to submit with your applications.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-400">
            Resume Builder &mdash; AI-powered resume generation
          </p>
        </div>
      </footer>
    </div>
  )
}

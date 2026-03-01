import { redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db/client'
import { users, resumes } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1)

  if (!user?.onboardingCompleted) {
    redirect('/onboarding/personal-info')
  }

  const recentResumes = await db
    .select()
    .from(resumes)
    .where(eq(resumes.userId, session.user.id))
    .orderBy(desc(resumes.createdAt))
    .limit(10)

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Welcome back, {session.user.name ?? 'there'}
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Build tailored resumes for any job opportunity.
        </p>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <Link
          href="/generate"
          className="block p-6 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md hover:border-blue-300 dark:hover:border-blue-500 transition-all"
        >
          <div className="text-2xl mb-3">&#128196;</div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Generate Resume
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Create a tailored resume for a specific job posting using AI.
          </p>
        </Link>

        <Link
          href="/profile"
          className="block p-6 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md hover:border-blue-300 dark:hover:border-blue-500 transition-all"
        >
          <div className="text-2xl mb-3">&#128100;</div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Edit Profile
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Update your experience, skills, education, and other sections.
          </p>
        </Link>

        <Link
          href="/settings"
          className="block p-6 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md hover:border-blue-300 dark:hover:border-blue-500 transition-all"
        >
          <div className="text-2xl mb-3">&#9881;</div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Settings
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Configure your API key and preferred AI model.
          </p>
        </Link>
      </div>

      {/* Recent Resumes */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Recent Resumes
        </h2>
        {recentResumes.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-8 text-center">
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              You haven&apos;t generated any resumes yet.
            </p>
            <Link
              href="/generate"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
            >
              Generate your first resume
            </Link>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 divide-y divide-gray-200 dark:divide-gray-800">
            {recentResumes.map((resume) => (
              <Link
                key={resume.id}
                href={`/resume/${resume.id}`}
                className="block px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {resume.jobTitle}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{resume.company}</p>
                  </div>
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    {new Date(resume.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

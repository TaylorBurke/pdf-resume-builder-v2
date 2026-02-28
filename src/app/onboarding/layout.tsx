import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session?.user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-start justify-center px-4 py-12">
      <div className="w-full max-w-2xl">{children}</div>
    </div>
  )
}

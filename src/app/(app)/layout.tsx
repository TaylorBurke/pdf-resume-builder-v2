import { redirect } from 'next/navigation'
import { auth, signOut } from '@/lib/auth'
import AppNav from '@/components/layout/AppNav'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session?.user) {
    redirect('/login')
  }

  async function handleSignOut() {
    'use server'
    await signOut({ redirectTo: '/login' })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppNav
        userName={session.user.name}
        userImage={session.user.image}
        signOutAction={handleSignOut}
      />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}

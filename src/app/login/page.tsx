import { signIn } from '@/lib/auth'

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h1 className="mb-2 text-center text-3xl font-bold text-gray-900">
          Resume Builder
        </h1>
        <p className="mb-8 text-center text-gray-600">
          Sign in to build your perfect resume
        </p>

        <div className="space-y-4">
          <form
            action={async () => {
              'use server'
              await signIn('google', { redirectTo: '/' })
            }}
          >
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-3 rounded-md border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
            >
              Sign in with Google
            </button>
          </form>

          <form
            action={async () => {
              'use server'
              await signIn('github', { redirectTo: '/' })
            }}
          >
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-3 rounded-md bg-gray-900 px-4 py-3 text-sm font-medium text-white shadow-sm hover:bg-gray-800"
            >
              Sign in with GitHub
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

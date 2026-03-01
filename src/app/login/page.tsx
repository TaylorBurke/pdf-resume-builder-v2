import { SignInButtons } from '@/components/sign-in-buttons'

const ERROR_MESSAGES: Record<string, string> = {
  Configuration: 'Server configuration error. Check server logs for details.',
  AccessDenied: 'Access denied. You do not have permission to sign in.',
  Verification: 'Verification link expired or already used.',
  OAuthSignin: 'Could not start OAuth sign-in flow.',
  OAuthCallback: 'Error during OAuth callback.',
  OAuthCreateAccount: 'Could not create OAuth account in database.',
  EmailCreateAccount: 'Could not create email account in database.',
  Callback: 'Error in auth callback handler.',
  OAuthAccountNotLinked: 'This email is already associated with another sign-in method.',
  SessionRequired: 'Please sign in to access this page.',
  MissingCSRF: 'Session expired. Please try again.',
  Default: 'An unexpected authentication error occurred.',
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; callbackUrl?: string }>
}) {
  const { error, callbackUrl } = await searchParams
  const errorMessage = error ? ERROR_MESSAGES[error] || `${ERROR_MESSAGES.Default} (${error})` : null

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h1 className="mb-2 text-center text-3xl font-bold text-gray-900">
          Resume Builder
        </h1>
        <p className="mb-8 text-center text-gray-600">
          Sign in to build your perfect resume
        </p>

        {errorMessage && (
          <div className="mb-6 rounded-md border border-red-200 bg-red-50 p-4">
            <p className="text-sm font-medium text-red-800">{errorMessage}</p>
            {error && (
              <p className="mt-1 text-xs text-red-600">Error code: {error}</p>
            )}
          </div>
        )}

        <SignInButtons callbackUrl={callbackUrl} />
      </div>
    </div>
  )
}

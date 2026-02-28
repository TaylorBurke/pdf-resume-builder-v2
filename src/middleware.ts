export { auth as middleware } from '@/lib/auth'

export const config = {
  matcher: ['/dashboard/:path*', '/onboarding/:path*', '/generate/:path*', '/resume/:path*', '/profile/:path*', '/settings/:path*'],
}

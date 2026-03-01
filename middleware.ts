import { updateSession } from '@/lib/supabase/middleware'
import { type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match only these protected routes:
     * - /dashboard, /search, /connections, /messages, /profile, /onboarding
     * Exclude:
     * - /auth/* (login, signup, callback, etc.)
     * - /api/* (API routes)
     * - /_next/* (Next.js internals)
     * - Static files
     */
    '/dashboard/:path*',
    '/search/:path*',
    '/connections/:path*',
    '/messages/:path*',
    '/profile/:path*',
    '/onboarding/:path*',
  ],
}

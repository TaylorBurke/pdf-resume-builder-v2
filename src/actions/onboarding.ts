'use server'

import { db } from '@/lib/db/client'
import { users } from '@/lib/db/schema'
import { auth } from '@/lib/auth'
import { eq } from 'drizzle-orm'

export async function completeOnboarding() {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Not authenticated')
  await db
    .update(users)
    .set({ onboardingCompleted: true, updatedAt: new Date().toISOString() })
    .where(eq(users.id, session.user.id))
}

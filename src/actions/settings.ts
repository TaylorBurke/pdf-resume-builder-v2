'use server'

import { db } from '@/lib/db/client'
import { users } from '@/lib/db/schema'
import { auth } from '@/lib/auth'
import { eq } from 'drizzle-orm'

async function getAuthenticatedUserId(): Promise<string> {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error('Not authenticated')
  }
  return session.user.id
}

export async function getSettings() {
  const userId = await getAuthenticatedUserId()
  const [user] = await db
    .select({
      hasApiKey: users.openrouterApiKey,
      preferredModel: users.preferredModel,
      onboardingCompleted: users.onboardingCompleted,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  return {
    hasApiKey: !!user?.hasApiKey,
    preferredModel: user?.preferredModel ?? null,
    onboardingCompleted: user?.onboardingCompleted ?? false,
  }
}

export async function saveOpenRouterKey(apiKey: string) {
  const userId = await getAuthenticatedUserId()
  await db
    .update(users)
    .set({ openrouterApiKey: apiKey, updatedAt: new Date().toISOString() })
    .where(eq(users.id, userId))
}

export async function savePreferredModel(model: string) {
  const userId = await getAuthenticatedUserId()
  await db
    .update(users)
    .set({ preferredModel: model, updatedAt: new Date().toISOString() })
    .where(eq(users.id, userId))
}

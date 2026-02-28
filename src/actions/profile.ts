'use server'

import { db } from '@/lib/db/client'
import { profileSections } from '@/lib/db/schema'
import { auth } from '@/lib/auth'
import { eq, and } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import type { SectionType, SectionData } from '@/types'

async function getAuthenticatedUserId(): Promise<string> {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error('Not authenticated')
  }
  return session.user.id
}

export async function getProfileSections() {
  const userId = await getAuthenticatedUserId()
  const sections = await db
    .select()
    .from(profileSections)
    .where(eq(profileSections.userId, userId))
    .orderBy(profileSections.sortOrder)
  return sections.map((s) => ({
    ...s,
    data: JSON.parse(s.data) as SectionData,
  }))
}

export async function getProfileSection(sectionType: SectionType) {
  const userId = await getAuthenticatedUserId()
  const [section] = await db
    .select()
    .from(profileSections)
    .where(
      and(
        eq(profileSections.userId, userId),
        eq(profileSections.sectionType, sectionType)
      )
    )
    .limit(1)
  if (!section) return null
  return { ...section, data: JSON.parse(section.data) as SectionData }
}

export async function saveProfileSection(
  sectionType: SectionType,
  data: SectionData
) {
  const userId = await getAuthenticatedUserId()
  const existing = await db
    .select()
    .from(profileSections)
    .where(
      and(
        eq(profileSections.userId, userId),
        eq(profileSections.sectionType, sectionType)
      )
    )
    .limit(1)

  const jsonData = JSON.stringify(data)
  const now = new Date().toISOString()

  if (existing.length > 0) {
    await db
      .update(profileSections)
      .set({ data: jsonData, updatedAt: now })
      .where(eq(profileSections.id, existing[0].id))
    return { id: existing[0].id, sectionType, data }
  }

  const id = nanoid()
  await db.insert(profileSections).values({
    id,
    userId,
    sectionType,
    data: jsonData,
    sortOrder: 0,
    createdAt: now,
    updatedAt: now,
  })
  return { id, sectionType, data }
}

export async function deleteProfileSection(sectionType: SectionType) {
  const userId = await getAuthenticatedUserId()
  await db
    .delete(profileSections)
    .where(
      and(
        eq(profileSections.userId, userId),
        eq(profileSections.sectionType, sectionType)
      )
    )
}

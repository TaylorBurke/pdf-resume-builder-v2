import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db/client'
import { coverLetters, profileSections } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { renderCoverLetterToHtml } from '@/lib/pdf/cover-letter-template'
import { generatePdf } from '@/lib/pdf/puppeteer'
import { sanitizeFilenameSegment } from '@/lib/filename'
import type { PersonalInfo, CoverLetterTone } from '@/types'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ resumeId: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { resumeId } = await params
  const tone = (request.nextUrl.searchParams.get('tone') ?? 'formal') as CoverLetterTone

  try {
    const [letter] = await db
      .select()
      .from(coverLetters)
      .where(
        and(
          eq(coverLetters.resumeId, resumeId),
          eq(coverLetters.tone, tone),
          eq(coverLetters.userId, session.user.id)
        )
      )
      .limit(1)

    if (!letter) {
      return NextResponse.json({ error: 'Cover letter not found' }, { status: 404 })
    }

    const sections = await db
      .select()
      .from(profileSections)
      .where(
        and(
          eq(profileSections.userId, session.user.id),
          eq(profileSections.sectionType, 'personal_info')
        )
      )
      .limit(1)

    const personalInfo: PersonalInfo = sections[0]
      ? JSON.parse(sections[0].data)
      : { fullName: 'Unknown', email: '' }

    const html = renderCoverLetterToHtml(letter.content, personalInfo)
    const pdfBuffer = await generatePdf(html)

    const namePart = sanitizeFilenameSegment(personalInfo.fullName)
    const filename = namePart ? `${namePart}-cover-letter.pdf` : 'cover-letter.pdf'

    return new Response(Buffer.from(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('Cover letter PDF generation error:', message, error)
    return NextResponse.json(
      { error: 'Failed to generate cover letter PDF', detail: message },
      { status: 500 }
    )
  }
}

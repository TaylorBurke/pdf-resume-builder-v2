import { NextResponse } from 'next/server'
import { eq, and } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db/client'
import { resumes, profileSections } from '@/lib/db/schema'
import { renderResumeToHtml } from '@/lib/pdf/generator'
import { generatePdf } from '@/lib/pdf/puppeteer'
import type { TemplateId } from '@/templates'
import type { ResumeContent, PersonalInfo } from '@/types'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  try {
    // Load resume
    const resume = await db.query.resumes.findFirst({
      where: and(eq(resumes.id, id), eq(resumes.userId, session.user.id)),
    })

    if (!resume) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 })
    }

    if (!resume.resumeContent) {
      return NextResponse.json(
        { error: 'Resume has no generated content' },
        { status: 400 }
      )
    }

    // Load personal info from profile_sections
    const personalInfoSection = await db.query.profileSections.findFirst({
      where: and(
        eq(profileSections.userId, session.user.id),
        eq(profileSections.sectionType, 'personal_info')
      ),
    })

    if (!personalInfoSection) {
      return NextResponse.json(
        { error: 'Personal info not found. Complete your profile first.' },
        { status: 400 }
      )
    }

    const resumeContent: ResumeContent = JSON.parse(resume.resumeContent)
    const personalInfo: PersonalInfo = JSON.parse(personalInfoSection.data)
    const templateId: TemplateId = (resume.templateId as TemplateId) || 'clean'

    const html = await renderResumeToHtml(resumeContent, personalInfo, templateId)
    const pdfBuffer = await generatePdf(html)

    const filename = `Resume-${personalInfo.fullName.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`

    return new Response(Buffer.from(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error('PDF generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate resume' },
      { status: 500 }
    )
  }
}

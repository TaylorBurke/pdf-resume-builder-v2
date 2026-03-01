import { createElement } from 'react'
import { TEMPLATES, type TemplateId } from '@/templates'
import type { ResumeContent, PersonalInfo } from '@/types'

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

/**
 * Render a resume to a self-contained HTML document suitable for
 * Puppeteer PDF conversion or direct browser preview.
 */
export async function renderResumeToHtml(
  resume: ResumeContent,
  personalInfo: PersonalInfo,
  templateId: TemplateId
): Promise<string> {
  const template = TEMPLATES[templateId]
  if (!template) {
    throw new Error(`Unknown template: ${templateId}`)
  }

  const { renderToStaticMarkup } = await import('react-dom/server')

  const markup = renderToStaticMarkup(
    createElement(template.component, { resume, personalInfo })
  )

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Resume - ${escapeHtml(personalInfo.fullName)}</title>
  <style>
    @page { size: letter; margin: 0; }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      print-color-adjust: exact;
      -webkit-print-color-adjust: exact;
    }
    section > div, aside > div > div { break-inside: avoid; }
    h2 { break-after: avoid; }
  </style>
</head>
<body>${markup}</body>
</html>`
}

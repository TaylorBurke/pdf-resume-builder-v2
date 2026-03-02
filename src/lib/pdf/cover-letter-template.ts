import type { PersonalInfo } from '@/types'

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

export function renderCoverLetterToHtml(
  content: string,
  personalInfo: PersonalInfo
): string {
  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  // Split content into paragraphs, preserving the letter structure
  const paragraphs = content
    .split('\n')
    .filter((line) => line.trim())
    .map((p) => `<p style="margin: 0 0 12px 0; line-height: 1.7;">${escapeHtml(p)}</p>`)
    .join('\n')

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Cover Letter - ${escapeHtml(personalInfo.fullName)}</title>
  <style>
    @page { size: letter; margin: 72px; }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 0;
      font-family: Georgia, 'Times New Roman', Times, serif;
      font-size: 11.5px;
      color: #1f2937;
      line-height: 1.7;
      print-color-adjust: exact;
      -webkit-print-color-adjust: exact;
    }
  </style>
</head>
<body>
  <div style="max-width: 816px;">
    <div style="margin-bottom: 32px;">
      <div style="font-weight: 600; font-size: 14px;">${escapeHtml(personalInfo.fullName)}</div>
      ${personalInfo.email ? `<div style="font-size: 10.5px; color: #4b5563;">${escapeHtml(personalInfo.email)}</div>` : ''}
      ${personalInfo.phone ? `<div style="font-size: 10.5px; color: #4b5563;">${escapeHtml(personalInfo.phone)}</div>` : ''}
      ${personalInfo.location ? `<div style="font-size: 10.5px; color: #4b5563;">${escapeHtml(personalInfo.location)}</div>` : ''}
    </div>
    <div style="margin-bottom: 24px; font-size: 11px; color: #6b7280;">${today}</div>
    <div style="font-size: 11.5px;">
      ${paragraphs}
    </div>
  </div>
</body>
</html>`
}

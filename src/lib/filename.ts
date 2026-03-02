/** Collapse non-alphanumeric runs into a single underscore and trim edges. */
export function sanitizeFilenameSegment(s: string) {
  return s.replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_|_$/g, '')
}

/** Build a PDF filename from name, company, and title segments. */
export function buildResumeFilename(fullName: string, company: string, jobTitle: string) {
  const parts = [fullName, company, jobTitle].map(sanitizeFilenameSegment).filter(Boolean)
  return parts.length > 0 ? `${parts.join('-')}.pdf` : 'resume.pdf'
}

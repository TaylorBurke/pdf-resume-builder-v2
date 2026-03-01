import { describe, it, expect } from 'vitest'
import { formatDisplayUrl, isUrl } from '@/lib/url'

describe('formatDisplayUrl', () => {
  it('strips https://', () => {
    expect(formatDisplayUrl('https://linkedin.com/in/jane')).toBe('linkedin.com/in/jane')
  })

  it('strips http://', () => {
    expect(formatDisplayUrl('http://example.com')).toBe('example.com')
  })

  it('strips www.', () => {
    expect(formatDisplayUrl('https://www.example.com')).toBe('example.com')
  })

  it('strips trailing slash', () => {
    expect(formatDisplayUrl('https://example.com/')).toBe('example.com')
  })

  it('strips all prefixes combined', () => {
    expect(formatDisplayUrl('https://www.github.com/user/')).toBe('github.com/user')
  })

  it('returns non-URL strings unchanged', () => {
    expect(formatDisplayUrl('jane@example.com')).toBe('jane@example.com')
  })
})

describe('isUrl', () => {
  it('returns true for https URLs', () => {
    expect(isUrl('https://example.com')).toBe(true)
  })

  it('returns true for http URLs', () => {
    expect(isUrl('http://example.com')).toBe(true)
  })

  it('returns false for email addresses', () => {
    expect(isUrl('jane@example.com')).toBe(false)
  })

  it('returns false for plain text', () => {
    expect(isUrl('New York, NY')).toBe(false)
  })

  it('returns false for phone numbers', () => {
    expect(isUrl('+1-555-123-4567')).toBe(false)
  })
})

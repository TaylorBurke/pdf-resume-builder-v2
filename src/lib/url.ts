/**
 * Strip URL display prefixes (https://, http://, www.) and trailing slash.
 */
export function formatDisplayUrl(url: string): string {
  return url
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/$/, '')
}

/**
 * Check if a string looks like a URL (starts with http:// or https://).
 */
export function isUrl(str: string): boolean {
  return /^https?:\/\//.test(str)
}

import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'

describe('Dark mode configuration', () => {
  it('globals.css contains dark variant configuration', () => {
    const css = readFileSync(resolve('src/app/globals.css'), 'utf-8')
    expect(css).toContain('@custom-variant dark')
  })

  it('globals.css does not use prefers-color-scheme for variable switching', () => {
    const css = readFileSync(resolve('src/app/globals.css'), 'utf-8')
    expect(css).not.toContain('prefers-color-scheme')
  })
})

describe('Root layout', () => {
  it('layout.tsx imports and renders ThemeProvider', () => {
    const layout = readFileSync(resolve('src/app/layout.tsx'), 'utf-8')
    expect(layout).toContain('ThemeProvider')
  })

  it('layout.tsx has inline theme script for flash prevention', () => {
    const layout = readFileSync(resolve('src/app/layout.tsx'), 'utf-8')
    expect(layout).toContain('suppressHydrationWarning')
    expect(layout).toContain('theme')
  })
})

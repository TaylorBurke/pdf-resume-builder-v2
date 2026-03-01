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

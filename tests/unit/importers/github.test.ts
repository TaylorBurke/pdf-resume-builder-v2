import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

const server = setupServer(
  http.get('https://api.github.com/users/testuser', () => {
    return HttpResponse.json({
      name: 'Test User',
      bio: 'Developer',
      location: 'San Francisco',
      blog: 'https://test.com',
      html_url: 'https://github.com/testuser',
      email: 'test@example.com',
    })
  }),
  http.get('https://api.github.com/users/testuser/repos', () => {
    return HttpResponse.json([
      {
        name: 'cool-project',
        description: 'A cool project',
        html_url: 'https://github.com/testuser/cool-project',
        language: 'TypeScript',
        fork: false,
        stargazers_count: 10,
      },
      {
        name: 'another-project',
        description: 'Another project',
        html_url: 'https://github.com/testuser/another-project',
        language: 'Python',
        fork: false,
        stargazers_count: 5,
      },
      {
        name: 'forked-repo',
        description: 'A fork',
        html_url: 'https://github.com/testuser/forked-repo',
        language: 'JavaScript',
        fork: true,
        stargazers_count: 0,
      },
    ])
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('GitHub Importer', () => {
  it('fetches user profile', async () => {
    const { importFromGitHub } = await import('@/lib/importers/github')
    const result = await importFromGitHub('testuser')
    expect(result.personalInfo.fullName).toBe('Test User')
    expect(result.personalInfo.location).toBe('San Francisco')
    expect(result.personalInfo.githubUrl).toBe('https://github.com/testuser')
  })

  it('extracts projects from non-forked repos', async () => {
    const { importFromGitHub } = await import('@/lib/importers/github')
    const result = await importFromGitHub('testuser')
    expect(result.projects.entries).toHaveLength(2)
    expect(result.projects.entries[0].name).toBe('cool-project')
  })

  it('excludes forked repos', async () => {
    const { importFromGitHub } = await import('@/lib/importers/github')
    const result = await importFromGitHub('testuser')
    const names = result.projects.entries.map((e) => e.name)
    expect(names).not.toContain('forked-repo')
  })

  it('extracts skills from repo languages', async () => {
    const { importFromGitHub } = await import('@/lib/importers/github')
    const result = await importFromGitHub('testuser')
    expect(result.skills.categories[0].items).toContain('TypeScript')
    expect(result.skills.categories[0].items).toContain('Python')
  })

  it('includes star count in highlights for starred repos', async () => {
    const { importFromGitHub } = await import('@/lib/importers/github')
    const result = await importFromGitHub('testuser')
    expect(result.projects.entries[0].highlights).toContain('10 stars')
  })

  it('extracts website URL from user profile', async () => {
    const { importFromGitHub } = await import('@/lib/importers/github')
    const result = await importFromGitHub('testuser')
    expect(result.personalInfo.websiteUrl).toBe('https://test.com')
  })

  it('extracts email from user profile', async () => {
    const { importFromGitHub } = await import('@/lib/importers/github')
    const result = await importFromGitHub('testuser')
    expect(result.personalInfo.email).toBe('test@example.com')
  })

  it('throws error for non-existent user', async () => {
    server.use(
      http.get('https://api.github.com/users/nonexistent', () => {
        return HttpResponse.json({ message: 'Not Found' }, { status: 404 })
      })
    )
    const { importFromGitHub } = await import('@/lib/importers/github')
    await expect(importFromGitHub('nonexistent')).rejects.toThrow(
      'GitHub user not found: nonexistent'
    )
  })
})

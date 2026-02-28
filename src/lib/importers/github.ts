import type { PersonalInfo, Project, Skill } from '@/types'

interface GitHubImportResult {
  personalInfo: Partial<PersonalInfo>
  projects: Project
  skills: Skill
}

export async function importFromGitHub(username: string): Promise<GitHubImportResult> {
  // Fetch user profile from GitHub API
  const userResponse = await fetch(`https://api.github.com/users/${username}`)
  if (!userResponse.ok) throw new Error(`GitHub user not found: ${username}`)
  const user = await userResponse.json()

  // Fetch repos (non-forked, sorted by stars)
  const reposResponse = await fetch(
    `https://api.github.com/users/${username}/repos?sort=stars&per_page=100`
  )
  const repos = await reposResponse.json()

  // Extract personal info
  const personalInfo: Partial<PersonalInfo> = {
    fullName: user.name || username,
    email: user.email || undefined,
    location: user.location || undefined,
    githubUrl: user.html_url,
    websiteUrl: user.blog || undefined,
  }

  // Extract projects from top repos (non-forked, with description)
  const topRepos = repos
    .filter((r: any) => !r.fork && r.description)
    .slice(0, 10)

  const projects: Project = {
    entries: topRepos.map((r: any) => ({
      name: r.name,
      description: r.description || '',
      url: r.html_url,
      techStack: [r.language].filter(Boolean),
      highlights: [`${r.stargazers_count} stars`].filter(
        (s: string) => !s.startsWith('0')
      ),
    })),
  }

  // Extract skills from repo languages
  const languageCounts = new Map<string, number>()
  for (const repo of repos) {
    if (repo.language && !repo.fork) {
      languageCounts.set(
        repo.language,
        (languageCounts.get(repo.language) || 0) + 1
      )
    }
  }

  const skills: Skill = {
    categories: [
      {
        name: 'Languages',
        items: Array.from(languageCounts.entries())
          .sort((a, b) => b[1] - a[1])
          .map(([lang]) => lang)
          .slice(0, 15),
      },
    ],
  }

  return { personalInfo, projects, skills }
}

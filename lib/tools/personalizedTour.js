import { searchProjects } from './searchProjects.js'
import { getLiveGithub }  from './getLiveGithub.js'

export async function personalizedTour({ role, interest }) {
  const matches = searchProjects({ query: interest, limit: 3 })

  if (matches.length === 0) {
    return { role, projects: [] }
  }

  const liveResults = await Promise.all(
    matches.map(async (project) => {
      try {
        const live = await getLiveGithub({ repo_name: project.name })
        return {
          name:          live.name,
          one_line:      project.description || live.description || '',
          stack:         live.topics.length ? live.topics : (project.stack ?? []),
          recent_commit: live.recent_commits[0]?.message ?? null,
          last_active:   live.last_pushed?.slice(0, 10) ?? null,
          url:           live.url,
        }
      } catch {
        return {
          name:          project.name,
          one_line:      project.description || '',
          stack:         project.stack ?? [],
          recent_commit: null,
          last_active:   null,
          url:           project.url,
        }
      }
    })
  )

  return { role, projects: liveResults }
}

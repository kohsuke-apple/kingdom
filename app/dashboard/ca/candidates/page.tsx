import { recruitingRepository } from '@/lib/recruiting-repository'
import { CaCandidatesManager } from '@/components/ca-candidates-manager'

export const dynamic = 'force-dynamic'

export default async function CaCandidatesPage() {
  let candidates: Awaited<ReturnType<typeof recruitingRepository.listCandidates>> = []
  let agents: Awaited<ReturnType<typeof recruitingRepository.listAgents>> = []
  try {
    ;[candidates, agents] = await Promise.all([
      recruitingRepository.listCandidates(),
      recruitingRepository.listAgents(),
    ])
  } catch {
    // Supabase 停止中またはネットワーク障害時は空リストで表示を継続
  }

  const assignees = agents
    .filter(agent => agent.id && agent.name)
    .map(agent => ({ id: agent.id, name: agent.name }))

  return <CaCandidatesManager initialCandidates={candidates} initialAssignees={assignees} />
}

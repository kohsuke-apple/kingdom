import { recruitingRepository } from '@/lib/recruiting-repository'
import { CaCandidatesManager } from '@/components/ca-candidates-manager'

export const dynamic = 'force-dynamic'

export default async function CaCandidatesPage() {
  const [candidates, agents] = await Promise.all([
    recruitingRepository.listCandidates(),
    recruitingRepository.listAgents(),
  ])

  const assignees = agents
    .filter(agent => agent.id && agent.name)
    .map(agent => ({ id: agent.id, name: agent.name }))

  return <CaCandidatesManager initialCandidates={candidates} initialAssignees={assignees} />
}

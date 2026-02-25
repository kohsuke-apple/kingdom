import { recruitingRepository } from '@/lib/recruiting-repository'
import RaAgentsManager from '@/components/ra-agents-manager'

export const dynamic = 'force-dynamic'

export default async function RaAgentsPage() {
  const agents = await recruitingRepository.listAgents()
  return (
    <div className="mx-auto max-w-5xl p-8">
      <RaAgentsManager initialAgents={agents} />
    </div>
  )
}

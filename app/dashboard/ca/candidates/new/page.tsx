import { CaCandidateForm } from '@/components/ca-candidate-form'
import { recruitingRepository } from '@/lib/recruiting-repository'

export const dynamic = 'force-dynamic'

export default async function NewCandidatePage() {
  const agents = await recruitingRepository.listAgents()
  return <CaCandidateForm agents={agents} />
}

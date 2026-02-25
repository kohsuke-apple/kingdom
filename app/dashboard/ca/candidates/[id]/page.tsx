import { notFound } from 'next/navigation'
import { CaCandidateForm } from '@/components/ca-candidate-form'
import { recruitingRepository } from '@/lib/recruiting-repository'

export const dynamic = 'force-dynamic'

type Props = {
  params: Promise<{ id: string }>
}

export default async function CandidateDetailPage({ params }: Props) {
  const { id } = await params

  const [candidate, agents] = await Promise.all([
    recruitingRepository.getCandidate(id),
    recruitingRepository.listAgents(),
  ])

  if (!candidate) {
    notFound()
  }

  return <CaCandidateForm candidate={candidate} agents={agents} />
}

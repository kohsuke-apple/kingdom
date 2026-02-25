import { recruitingRepository } from '@/lib/recruiting-repository'
import CaSelectionsManager from '@/components/ca-selections-manager'
import type { CandidateJobStatus } from '@/types/recruiting'

export default async function CaSelectionsPage() {
  const [rawSelections, jobs, candidates, companies] = await Promise.all([
    recruitingRepository.listSelections('ca'),
    recruitingRepository.listJobs(),
    recruitingRepository.listCandidates(),
    recruitingRepository.listCompanies(),
  ])

  const selections = rawSelections as CandidateJobStatus[]

  return (
    <CaSelectionsManager
      initialSelections={selections}
      companies={companies}
      jobs={jobs}
      candidates={candidates}
    />
  )
}


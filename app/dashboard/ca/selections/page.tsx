import { recruitingRepository } from '@/lib/recruiting-repository'
import CaSelectionsManager from '@/components/ca-selections-manager'
import type { CandidateJobStatus } from '@/types/recruiting'

export default async function CaSelectionsPage() {
  let rawSelections: Awaited<ReturnType<typeof recruitingRepository.listSelections>> = []
  let jobs: Awaited<ReturnType<typeof recruitingRepository.listJobs>> = []
  let candidates: Awaited<ReturnType<typeof recruitingRepository.listCandidates>> = []
  let companies: Awaited<ReturnType<typeof recruitingRepository.listCompanies>> = []
  try {
    ;[rawSelections, jobs, candidates, companies] = await Promise.all([
      recruitingRepository.listSelections('ca'),
      recruitingRepository.listJobs(),
      recruitingRepository.listCandidates(),
      recruitingRepository.listCompanies(),
    ])
  } catch {
    // Supabase 停止中またはネットワーク障害時は空リストで表示を継続
  }

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


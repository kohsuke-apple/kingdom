import { recruitingRepository } from '@/lib/recruiting-repository'
import SelectionManager from '@/components/selection-manager'
import type { CompanyCandidateSelection, CandidateJobStatus, Job, Candidate, Company } from '@/types/recruiting'

export const dynamic = 'force-dynamic'

export default async function SelectionsPage() {
  let selections: (CompanyCandidateSelection | CandidateJobStatus)[] = []
  let jobs: Job[] = []
  let candidates: Candidate[] = []
  let companies: Company[] = []
  try {
    const res = await Promise.all([
      recruitingRepository.listSelections('ra'),
      recruitingRepository.listJobs(),
      recruitingRepository.listCandidates(),
      recruitingRepository.listCompanies(),
    ])
    selections = res[0]
    jobs = res[1]
    candidates = res[2]
    companies = res[3]
  } catch {
    // Supabase 停止中やネットワーク障害時は空で表示
  }

  return (
    <SelectionManager initialSelections={selections} companies={companies} jobs={jobs} candidates={candidates} scope="ca" />
  )
}

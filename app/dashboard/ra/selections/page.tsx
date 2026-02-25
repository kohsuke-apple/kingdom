import { recruitingRepository } from '@/lib/recruiting-repository'
import SelectionManager from '@/components/selection-manager'

export default async function RaSelectionsPage() {
  const [selections, jobs, candidates, companies] = await Promise.all([
    recruitingRepository.listSelections('ra'),
    recruitingRepository.listJobs(),
    recruitingRepository.listCandidates(),
    recruitingRepository.listCompanies(),
  ])

  return <SelectionManager initialSelections={selections} companies={companies} jobs={jobs} candidates={candidates} scope="ra" />
}


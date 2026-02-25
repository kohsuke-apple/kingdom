import { RaJobsManager } from '@/components/ra-jobs-manager'
import { recruitingRepository } from '@/lib/recruiting-repository'

export const dynamic = 'force-dynamic'

export default async function RaJobsPage() {
  const [jobs, companies] = await Promise.all([
    recruitingRepository.listJobs(),
    recruitingRepository.listCompanies(),
  ])

  return <RaJobsManager initialJobs={jobs} companies={companies} />
}

import { HiringJobsManager } from '@/components/hiring-jobs-manager'
import { recruitingRepository } from '@/lib/recruiting-repository'

export const dynamic = 'force-dynamic'

export default async function HiringJobsPage() {
  const [jobs, companies] = await Promise.all([
    recruitingRepository.listJobs(),
    recruitingRepository.listCompanies(),
  ])

  return <HiringJobsManager initialJobs={jobs} companies={companies} />
}

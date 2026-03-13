import { RaJobsManager } from '@/components/ra-jobs-manager'
import { recruitingRepository } from '@/lib/recruiting-repository'

export const dynamic = 'force-dynamic'

export default async function RaJobsPage() {
  let jobs: Awaited<ReturnType<typeof recruitingRepository.listJobs>> = []
  let companies: Awaited<ReturnType<typeof recruitingRepository.listCompanies>> = []
  try {
    ;[jobs, companies] = await Promise.all([
      recruitingRepository.listJobs(),
      recruitingRepository.listCompanies(),
    ])
  } catch {
    // Supabase 停止中またはネットワーク障害時は空リストで表示を継続
  }

  return <RaJobsManager initialJobs={jobs} companies={companies} />
}

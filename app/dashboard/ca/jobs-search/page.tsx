import { JobsReadonlyTable } from '@/components/jobs-readonly-table'
import { recruitingRepository } from '@/lib/recruiting-repository'

export const dynamic = 'force-dynamic'

export default async function CaJobsSearchPage() {
  let jobs: Awaited<ReturnType<typeof recruitingRepository.listJobs>> = []
  let companies: Awaited<ReturnType<typeof recruitingRepository.listCompanies>> = []
  let savedJobs: Awaited<ReturnType<typeof recruitingRepository.listSavedJobs>> = []
  try {
    ;[jobs, companies, savedJobs] = await Promise.all([
      recruitingRepository.listJobs({ status: 'open' }),
      recruitingRepository.listCompanies(),
      recruitingRepository.listSavedJobs(),
    ])
  } catch {
    // Supabase 停止中またはネットワーク障害時は空リストで表示を継続
  }

  return (
    <div className="mx-auto max-w-6xl p-4 md:p-8">
      <div className="mb-6 border-b border-border pb-5">
        <h1 className="text-2xl font-bold tracking-tight">求人検索（閲覧）</h1>
        <p className="mt-1 text-sm text-muted-foreground">採用担当が追加した公開求人のみ表示します。</p>
      </div>
      <JobsReadonlyTable jobs={jobs} companies={companies} savedJobs={savedJobs} />
    </div>
  )
}

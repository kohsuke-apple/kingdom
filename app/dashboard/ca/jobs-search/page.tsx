import { JobsReadonlyTable } from '@/components/jobs-readonly-table'
import { recruitingRepository } from '@/lib/recruiting-repository'

export const dynamic = 'force-dynamic'

export default async function CaJobsSearchPage() {
  const [jobs, companies, savedJobs] = await Promise.all([
    recruitingRepository.listJobs({ status: 'open' }),
    recruitingRepository.listCompanies(),
    recruitingRepository.listSavedJobs(),
  ])

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

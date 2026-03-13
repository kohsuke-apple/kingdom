import { recruitingRepository } from '@/lib/recruiting-repository'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export const dynamic = 'force-dynamic'

export default async function CaSavedCategoryPage({
  params,
}: {
  params: { category: string }
}) {
  const category = decodeURIComponent(params.category)
  if (!category) return notFound()

  let savedJobs: Awaited<ReturnType<typeof recruitingRepository.listSavedJobs>> = []
  let jobs: Awaited<ReturnType<typeof recruitingRepository.listJobs>> = []
  let companies: Awaited<ReturnType<typeof recruitingRepository.listCompanies>> = []
  try {
    ;[savedJobs, jobs, companies] = await Promise.all([
      recruitingRepository.listSavedJobs(),
      recruitingRepository.listJobs(),
      recruitingRepository.listCompanies(),
    ])
  } catch {
    // Supabase 停止中またはネットワーク障害時は空リストで表示を継続
  }

  const jobMap     = new Map(jobs.map(j => [j.id, j]))
  const companyMap = new Map(companies.map(c => [c.id, c.name]))

  const entries = savedJobs.filter(s => (s.customCategory ?? '未分類') === category)
  if (entries.length === 0) return notFound()

  const latestDate = entries.reduce((m, x) => x.createdAt > m ? x.createdAt : m, '')

  return (
    <div className="mx-auto max-w-6xl p-4 md:p-8">
      {/* パンくず */}
      <Link
        href="/dashboard/ca/saved"
        className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
      >
        <ArrowLeft className="h-4 w-4" />
        保存した求人に戻る
      </Link>

      {/* ヘッダー */}
      <div className="mb-6 border-b border-border pb-5">
        <h1 className="text-2xl font-bold tracking-tight">{category}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {entries.length} 件　更新日：{new Date(latestDate).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* 求人リスト */}
      <div className="space-y-3">
        {entries.map(entry => {
          const job     = jobMap.get(entry.jobId)
          const company = job ? (companyMap.get(job.companyId) ?? '') : ''

          return (
            <div key={entry.id} className="rounded-lg border border-border bg-white px-5 py-4 flex items-start justify-between gap-4 hover:shadow-sm transition-shadow">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground mb-0.5">{company || '企業名なし'}</p>
                {job ? (
                  <Link
                    href={`/dashboard/jobs/${job.id}`}
                    className="text-sm font-semibold text-foreground hover:text-sky-600 transition-colors"
                  >
                    {job.title}
                  </Link>
                ) : (
                  <span className="text-sm text-muted-foreground">（削除済み）</span>
                )}
                {job && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {job.jobType && (
                      <Badge variant="secondary" className="text-xs">{job.jobType}</Badge>
                    )}
                    {(job.salaryMin || job.salaryMax) && (
                      <Badge variant="secondary" className="text-xs">
                        {job.salaryMin ? `${job.salaryMin.toLocaleString()}万` : ''}
                        {job.salaryMin && job.salaryMax ? '〜' : ''}
                        {job.salaryMax ? `${job.salaryMax.toLocaleString()}万` : ''}
                      </Badge>
                    )}
                    <Badge
                      variant="secondary"
                      className={job.status === 'open'
                        ? 'text-xs bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'text-xs bg-muted text-muted-foreground'}
                    >
                      {job.status === 'open' ? '公開中' : '非公開'}
                    </Badge>
                  </div>
                )}
              </div>
              {job && (
                <Link
                  href={`/dashboard/jobs/${job.id}`}
                  className="shrink-0 mt-1 rounded p-1.5 text-muted-foreground hover:bg-muted transition-colors"
                  aria-label="求人詳細"
                >
                  <ExternalLink className="h-4 w-4" />
                </Link>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

import { recruitingRepository } from '@/lib/recruiting-repository'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { JobThumbnailEditor } from '@/components/job-thumbnail-editor'
import { JobCandidateSelectorTrigger } from '@/components/job-candidate-selector-trigger'
import type { SelectionStage, SelectionStatus } from '@/types/recruiting'

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('ja-JP')
}

const stageLabelMap: Record<SelectionStage, string> = {
  applied: '応募',
  document_pass: '書類通過',
  interview_1: '面接1次',
  interview_2: '面接2次',
  final: '最終',
  offer: '内定',
  hired: '入社',
  rejected: '不合格',
}

const statusBadgeClass: Record<SelectionStatus, string> = {
  active: 'bg-sky-50 text-sky-700 border-sky-200',
  rejected: 'bg-red-50 text-red-700 border-red-200',
  hired: 'bg-emerald-50 text-emerald-700 border-emerald-200',
}

const statusLabelMap: Record<SelectionStatus, string> = {
  active: '選考中',
  rejected: '不合格',
  hired: '内定/入社',
}

export default async function JobDetailPage({ params }: { params: Promise<{ id: string }> | { id: string } }) {
  const { id } = await params
  if (!id) return notFound()

  let job
  try {
    job = await recruitingRepository.getJob(id)
  } catch (err) {
    console.error('Failed to load job', err)
    return notFound()
  }
  if (!job) return notFound()

  const [company, selections, allCandidates] = await Promise.all([
    recruitingRepository.getCompany(job.companyId),
    recruitingRepository.listSelectionsForJob(id),
    recruitingRepository.listCandidates(),
  ])

  const candidateMap = new Map(allCandidates.map(c => [c.id, c]))

  return (
    <div className="mx-auto max-w-5xl p-8">
      {/* ヘッダー */}
      <div className="mb-8 border-b border-border pb-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{job.title}</h1>
            <div className="mt-2 flex items-center gap-3">
              {company && (
                <Link
                  href={`/dashboard/companies/${company.id}`}
                  className="text-sm text-muted-foreground hover:underline"
                >
                  {company.name}
                </Link>
              )}
              <Badge
                variant="secondary"
                className={job.status === 'open'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-muted text-muted-foreground border border-border'}
              >
                {job.status === 'open' ? '公開中' : '非公開'}
              </Badge>
              {job.sourceMode && (
                <Badge
                  variant="secondary"
                  className={job.sourceMode === 'RA'
                    ? 'bg-sky-50 text-sky-700 border border-sky-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'}
                >
                  {job.sourceMode === 'RA' ? 'RA登録' : '採用担当登録'}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2カラムレイアウト */}
      <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
        {/* 左: 求人情報 + 求職者一覧 */}
        <div className="space-y-8">
          {/* 求人基本情報 */}
          <section>
            <h2 className="mb-4 text-base font-semibold">求人情報</h2>
            <div className="rounded-lg border bg-white p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">雇用形態</p>
                  <p className="mt-1 text-sm">{job.jobType ?? '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">年収</p>
                  <p className="mt-1 text-sm">
                    {job.salaryMin != null ? `${job.salaryMin.toLocaleString()} 万円` : '-'}
                    {job.salaryMax != null ? ` 〜 ${job.salaryMax.toLocaleString()} 万円` : ''}
                  </p>
                </div>
              </div>
              {job.description && (
                <div>
                  <p className="text-xs text-muted-foreground">詳細</p>
                  <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed">{job.description}</p>
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                作成: {formatDate(job.createdAt)} / 更新: {formatDate(job.updatedAt)}
              </p>
            </div>
          </section>

          {/* 応募中の求職者一覧 */}
          <section>
            <div className="mb-4 flex items-center justify-between">
                <h2 className="text-base font-semibold">応募中の求職者</h2>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">{selections.length} 件</span>
                  <JobCandidateSelectorTrigger jobId={id} companyId={company?.id} />
                </div>
              </div>
            <div className="rounded-lg border bg-white overflow-hidden">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b bg-muted/30 text-left text-muted-foreground">
                    <th className="px-4 py-3">求職者名</th>
                    <th className="px-4 py-3">ステージ</th>
                    <th className="px-4 py-3">状態</th>
                    <th className="px-4 py-3">更新日</th>
                  </tr>
                </thead>
                <tbody>
                  {selections.map(sel => {
                    const candidate = candidateMap.get(sel.candidateId)
                    return (
                      <tr key={sel.id} className="border-b last:border-0">
                        <td className="px-4 py-3 font-medium">
                          {candidate ? (
                            <Link
                              href={`/dashboard/ca/candidates/${candidate.id}`}
                              className="hover:underline"
                            >
                              {candidate.name}
                            </Link>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {stageLabelMap[sel.stage] ?? sel.stage}
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            variant="secondary"
                            className={`border ${statusBadgeClass[sel.status]}`}
                          >
                            {statusLabelMap[sel.status] ?? sel.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {formatDate(sel.updatedAt)}
                        </td>
                      </tr>
                    )
                  })}
                  {selections.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                        まだ応募者がいません
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* 右: サムネイル + 会社情報カード */}
        <div className="space-y-6">
          {/* サムネイル */}
          <div>
            <h2 className="mb-3 text-base font-semibold">サムネイル画像</h2>
            <JobThumbnailEditor jobId={id} initialUrl={job.thumbnailUrl} />
          </div>

          {/* 会社情報カード */}
          {company && (
            <div>
            <h2 className="mb-4 text-base font-semibold">企業情報</h2>
            <div className="rounded-lg border bg-white p-5 space-y-3">
              <div>
                <Link
                  href={`/dashboard/companies/${company.id}`}
                  className="font-semibold hover:underline"
                >
                  {company.name}
                </Link>
              </div>
              {company.industry && (
                <div>
                  <p className="text-xs text-muted-foreground">業界</p>
                  <p className="mt-0.5 text-sm">{company.industry}</p>
                </div>
              )}
              {company.location && (
                <div>
                  <p className="text-xs text-muted-foreground">所在地</p>
                  <p className="mt-0.5 text-sm">{company.location}</p>
                </div>
              )}
              {company.officialWebsite && (
                <div>
                  <a
                    href={company.officialWebsite}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-sky-600 hover:underline"
                  >
                    公式サイト
                  </a>
                </div>
              )}
            </div>
          </div>
          )}
        </div>
      </div>
    </div>
  )
}

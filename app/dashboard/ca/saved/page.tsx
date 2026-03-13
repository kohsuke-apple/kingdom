import { recruitingRepository } from '@/lib/recruiting-repository'
import { CaSavedListsView } from '@/components/ca-saved-lists-view'

export const dynamic = 'force-dynamic'

export default async function CaSavedPage() {
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

  return (
    <div className="mx-auto max-w-6xl p-4 md:p-8">
      <div className="mb-6 border-b border-border pb-5">
        <h1 className="text-2xl font-bold tracking-tight">保存した求人</h1>
        <p className="mt-1 text-sm text-muted-foreground">カテゴリ別に管理されたブックマーク求人の一覧です。</p>
      </div>
      <CaSavedListsView savedJobs={savedJobs} jobs={jobs} companies={companies} />
    </div>
  )
}


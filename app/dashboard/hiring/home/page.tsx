import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { recruitingRepository } from '@/lib/recruiting-repository'

export const dynamic = 'force-dynamic'

export default async function HiringHomePage() {
  const jobs = await recruitingRepository.listJobs()

  return (
    <div className="mx-auto max-w-5xl p-8">
      <div className="mb-8 border-b border-border pb-6">
        <h1 className="text-2xl font-bold tracking-tight">採用担当モード</h1>
        <p className="mt-1 text-sm text-muted-foreground">会社の採用担当者が求人を登録・更新するためのモードです。</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>求人管理へ</CardTitle>
          <CardDescription>現在登録されている求人数: {jobs.length} 件</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <a href="/dashboard/hiring/jobs" className="block font-medium underline">
            求人追加・編集ページを開く
          </a>
          <a href="/dashboard/hiring/company-profile" className="block font-medium underline">
            会社プロフィール設定を開く
          </a>
        </CardContent>
      </Card>
    </div>
  )
}

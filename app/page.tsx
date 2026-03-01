import { Users, Building2, BriefcaseBusiness, ClipboardList } from 'lucide-react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { personRepository } from '@/lib/repository'

export const dynamic = 'force-dynamic'

type SummaryCardProps = {
  label: string
  value: number
  unit: string
  icon: React.ReactNode
}

function SummaryCard({ label, value, unit, icon }: SummaryCardProps) {
  return (
    <div className="rounded-xl border bg-white p-5">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">{label}</p>
        <span className="text-muted-foreground">{icon}</span>
      </div>
      <div className="flex items-end gap-2">
        <span className="text-3xl font-bold leading-none">{value}</span>
        <span className="pb-0.5 text-sm text-muted-foreground">{unit}</span>
      </div>
    </div>
  )
}

export default async function HomePage() {
  const peopleCount = await personRepository.count()

  return (
    <div className="mx-auto max-w-6xl p-4 md:p-8">
      <div className="mb-8 border-b border-border pb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">全体管理</h1>
        <p className="mt-1 text-sm text-muted-foreground">CA/RAの業務全体をこの画面から管理します。</p>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard label="候補者データ" value={peopleCount} unit="件" icon={<Users className="h-4 w-4" />} />
        <SummaryCard label="企業管理" value={1} unit="モード" icon={<Building2 className="h-4 w-4" />} />
        <SummaryCard label="求人管理" value={1} unit="モード" icon={<BriefcaseBusiness className="h-4 w-4" />} />
        <SummaryCard label="選考管理" value={2} unit="モード" icon={<ClipboardList className="h-4 w-4" />} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>RA業務</CardTitle>
            <CardDescription>企業・求人・選考・エージェント・テンプレート・タスク管理</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/ra/home" className="text-sm font-medium underline">
              RAダッシュボードへ移動
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>CA業務</CardTitle>
            <CardDescription>候補者・求人検索・保存求人・進捗・テンプレート管理</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/ca/home" className="text-sm font-medium underline">
              CAダッシュボードへ移動
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

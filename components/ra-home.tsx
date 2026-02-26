import Link from 'next/link'
import {
  Building2,
  Users,
  BriefcaseBusiness,
  ClipboardList,
  FileText,
  ListChecks,
  ArrowRight,
} from 'lucide-react'

const tiles = [
  {
    href: '/dashboard/ra/companies',
    icon: Building2,
    label: '企業管理',
    description: '取引先企業の登録・編集・詳細閲覧',
    color: 'bg-sky-50 text-sky-600 border-sky-100',
    accent: 'group-hover:bg-sky-100',
  },
  {
    href: '/dashboard/ra/agents',
    icon: Users,
    label: 'エージェント管理',
    description: '社内エージェントの登録・管理',
    color: 'bg-violet-50 text-violet-600 border-violet-100',
    accent: 'group-hover:bg-violet-100',
  },
  {
    href: '/dashboard/ra/jobs',
    icon: BriefcaseBusiness,
    label: '求人管理',
    description: '求人の追加・編集・ステータス管理',
    color: 'bg-amber-50 text-amber-600 border-amber-100',
    accent: 'group-hover:bg-amber-100',
  },
  {
    href: '/dashboard/ra/selections',
    icon: ClipboardList,
    label: '選考管理',
    description: '候補者の選考進捗・ステージ管理',
    color: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    accent: 'group-hover:bg-emerald-100',
  },
  {
    href: '/dashboard/ra/templates',
    icon: FileText,
    label: 'テンプレート',
    description: '採用担当・候補者へのメッセージ定型文',
    color: 'bg-rose-50 text-rose-600 border-rose-100',
    accent: 'group-hover:bg-rose-100',
  },
  {
    href: '/dashboard/ra/tasks',
    icon: ListChecks,
    label: 'タスク',
    description: 'フォローアップやToDo管理',
    color: 'bg-orange-50 text-orange-600 border-orange-100',
    accent: 'group-hover:bg-orange-100',
  },
]

export function RaHome() {
  return (
    <div className="mx-auto max-w-5xl p-8">
      {/* ヘッダー */}
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">RA モード</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-foreground">ホーム</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          各管理ページへ移動してください。
        </p>
      </div>

      {/* タイルグリッド */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tiles.map(({ href, icon: Icon, label, description, color, accent }) => (
          <Link
            key={href}
            href={href}
            className="group flex flex-col gap-4 rounded-xl border border-border bg-white p-6 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
          >
            <div className={`flex h-11 w-11 items-center justify-center rounded-lg border transition-colors ${color} ${accent}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-foreground">{label}</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{description}</p>
            </div>
            <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
              開く
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

import Link from 'next/link'
import {
  Users,
  BriefcaseBusiness,
  Bookmark,
  ClipboardList,
  FileText,
  ArrowRight,
} from 'lucide-react'

const tiles = [
  {
    href: '/dashboard/ca/candidates',
    icon: Users,
    label: '候補者管理',
    description: '担当する求職者の登録・プロフィール管理',
    color: 'bg-sky-50 text-sky-600 border-sky-100',
    accent: 'group-hover:bg-sky-100',
  },
  {
    href: '/dashboard/ca/jobs-search',
    icon: BriefcaseBusiness,
    label: '求人検索',
    description: '条件から求人を検索・確認',
    color: 'bg-amber-50 text-amber-600 border-amber-100',
    accent: 'group-hover:bg-amber-100',
  },
  {
    href: '/dashboard/ca/saved',
    icon: Bookmark,
    label: '保存求人',
    description: 'カテゴリ別にブックマークした求人一覧',
    color: 'bg-violet-50 text-violet-600 border-violet-100',
    accent: 'group-hover:bg-violet-100',
  },
  {
    href: '/dashboard/ca/selections',
    icon: ClipboardList,
    label: '進捗管理',
    description: '候補者の選考ステージ・状況を一覧で確認',
    color: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    accent: 'group-hover:bg-emerald-100',
  },
  {
    href: '/dashboard/ca/templates',
    icon: FileText,
    label: 'テンプレート',
    description: '候補者・企業への連絡定型文を管理',
    color: 'bg-rose-50 text-rose-600 border-rose-100',
    accent: 'group-hover:bg-rose-100',
  },
]

export function CaHome() {
  return (
    <div className="mx-auto max-w-5xl p-4 md:p-8">
      {/* ヘッダー */}
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">CA モード</p>
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

import { personRepository } from '@/lib/repository'
import { Badge } from '@/components/ui/badge'

export const dynamic = 'force-dynamic'
import { Users, Cake, Clock, Tag } from 'lucide-react'
import Link from 'next/link'

function formatBirthday(birthDate: string) {
  const parts = birthDate.split('-')
  if (parts.length >= 3) return `${parts[1]}月${parts[2]}日`
  if (parts.length === 2) return `${parts[1]}月`
  return birthDate
}

type StatCardProps = {
  label: string
  value: number
  unit: string
  icon: React.ReactNode
}

function StatCard({ label, value, unit, icon }: StatCardProps) {
  return (
    <div className="bg-white border border-border p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground font-medium">{label}</span>
        <span className="text-muted-foreground">{icon}</span>
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-4xl font-bold text-foreground leading-none">{value}</span>
        <span className="text-sm text-muted-foreground">{unit}</span>
      </div>
    </div>
  )
}

export default async function DashboardPage() {
  const now = new Date()
  const currentMonth = now.getMonth() + 1

  const [total, birthdayThisMonth, recentlyAdded, tagStats] = await Promise.all([
    personRepository.count(),
    personRepository.findBirthdayInMonth(currentMonth),
    personRepository.findRecent(5),
    personRepository.getAllTags(),
  ])

  return (
    <div className="p-8 max-w-5xl">
      {/* ページヘッダー */}
      <div className="mb-8 pb-6 border-b border-border">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">ダッシュボード</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {now.getFullYear()}年{currentMonth}月
        </p>
      </div>

      {/* サマリー */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-px bg-border mb-8">
        <StatCard
          label="総登録人数"
          value={total}
          unit="人"
          icon={<Users className="h-4 w-4" />}
        />
        <StatCard
          label="今月の誕生日"
          value={birthdayThisMonth.length}
          unit="人"
          icon={<Cake className="h-4 w-4" />}
        />
        <StatCard
          label="タグ種類"
          value={tagStats.length}
          unit="種類"
          icon={<Tag className="h-4 w-4" />}
        />
        <StatCard
          label="最近の追加"
          value={recentlyAdded.length}
          unit="件"
          icon={<Clock className="h-4 w-4" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 今月誕生日 */}
        <div className="bg-white border border-border">
          <div className="px-5 py-4 border-b border-border">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Cake className="h-4 w-4 text-muted-foreground" />
              今月の誕生日
            </h3>
          </div>
          <div className="p-5">
            {birthdayThisMonth.length === 0 ? (
              <p className="text-sm text-muted-foreground">今月の誕生日はいません</p>
            ) : (
              <ul className="space-y-1">
                {birthdayThisMonth.map(p => (
                  <li key={p.id}>
                    <Link
                      href={`/people/${p.id}`}
                      className="flex items-center justify-between py-1.5 px-2 -mx-2 hover:bg-muted transition-colors"
                    >
                      <span className="text-sm font-medium text-foreground">{p.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {p.birthDate ? formatBirthday(p.birthDate) : ''}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* 最近追加 */}
        <div className="bg-white border border-border">
          <div className="px-5 py-4 border-b border-border">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              最近追加した人
            </h3>
          </div>
          <div className="p-5">
            {recentlyAdded.length === 0 ? (
              <p className="text-sm text-muted-foreground">まだ登録がありません</p>
            ) : (
              <ul className="space-y-1">
                {recentlyAdded.map(p => (
                  <li key={p.id}>
                    <Link
                      href={`/people/${p.id}`}
                      className="flex items-center justify-between py-1.5 px-2 -mx-2 hover:bg-muted transition-colors"
                    >
                      <div>
                        <p className="text-sm font-medium text-foreground">{p.name}</p>
                        {p.relationship && (
                          <p className="text-xs text-muted-foreground">{p.relationship}</p>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {new Date(p.createdAt).toLocaleDateString('ja-JP', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* タグ別 */}
        <div className="bg-white border border-border">
          <div className="px-5 py-4 border-b border-border">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Tag className="h-4 w-4 text-muted-foreground" />
              タグ別人数
            </h3>
          </div>
          <div className="p-5">
            {tagStats.length === 0 ? (
              <p className="text-sm text-muted-foreground">タグがありません</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {tagStats.map(({ tag, count }) => (
                  <Link key={tag} href={`/people?tag=${encodeURIComponent(tag)}`}>
                    <Badge
                      variant="secondary"
                      className="cursor-pointer hover:bg-foreground hover:text-background transition-colors text-xs"
                    >
                      {tag}
                      <span className="ml-1.5 font-bold">{count}</span>
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

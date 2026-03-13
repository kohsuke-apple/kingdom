import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { recruitingRepository } from '@/lib/recruiting-repository'

export default async function DashboardEntryPage() {
  const tasks = await recruitingRepository.listTasks()

  // 未完了かつ契約関連と思われるタスクを抽出
  const keywords = ['契約', '成約', '契約書']
  const contractTasks = tasks.filter((t) => {
    if (t.status === 'done') return false
    const hay = `${t.title ?? ''} ${t.description ?? ''}`
    if (keywords.some((k) => hay.includes(k))) return true
    return false
  })

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>運営ダッシュボード</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm">運営からのアップデートと未完了の契約タスクを表示します。</p>
          </div>

          <div>
            <h3 className="text-sm font-medium">未完了の契約タスク</h3>
            <p className="text-xs text-muted-foreground">該当: {contractTasks.length} 件</p>

            <ul className="mt-2 space-y-2">
              {contractTasks.length === 0 && (
                <li className="text-sm text-muted-foreground">未完了の契約タスクはありません。</li>
              )}
              {contractTasks.map((t) => (
                <li key={t.id} className="rounded-md bg-white p-3 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-sm font-medium">{t.title}</div>
                      {t.dueDate && <div className="text-xs text-muted-foreground">期限: {t.dueDate}</div>}
                    </div>
                    <div className="text-xs text-muted-foreground">状態: {t.status}</div>
                  </div>
                  {t.description && <div className="mt-2 text-sm text-muted-foreground">{t.description}</div>}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <Link href="/dashboard/ra/tasks" className="underline text-sm">タスク管理に移動</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Plus, Search, SlidersHorizontal, Ellipsis } from 'lucide-react'
import { toast } from 'sonner'
import type { Candidate } from '@/types/recruiting'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('ja-JP')
}

function truncate(text?: string, max = 16) {
  if (!text) return '入力する'
  return text.length > max ? `${text.slice(0, max)}...` : text
}

export function CaCandidatesManager({
  initialCandidates,
  initialAssignees,
}: {
  initialCandidates: Candidate[]
  initialAssignees: Array<{ id: string; name: string }>
}) {
  const router = useRouter()
  const [keyword, setKeyword] = useState('')
  const [assigneeId, setAssigneeId] = useState<'all' | string>('all')
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const assigneeNameMap = useMemo(() => {
    const map = new Map<string, string>()
    for (const assignee of initialAssignees) {
      map.set(assignee.id, assignee.name)
    }
    return map
  }, [initialAssignees])

  const filtered = useMemo(() => {
    const lower = keyword.toLowerCase()
    return initialCandidates.filter(candidate => {
      const text = [candidate.name, candidate.email, candidate.phone, candidate.memo, candidate.desiredJobType]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      const matchKeyword = text.includes(lower)
      const matchAssignee = assigneeId === 'all' || candidate.createdBy === assigneeId

      return matchKeyword && matchAssignee
    })
  }, [assigneeId, initialCandidates, keyword])

  async function handleDelete(id: string) {
    if (!confirm('候補者を削除しますか？')) return
    setLoadingId(id)

    const res = await fetch(`/api/candidates?id=${id}`, { method: 'DELETE' })
    if (res.ok) {
      toast.success('候補者を削除しました')
      router.refresh()
    } else {
      toast.error('削除に失敗しました')
    }
    setLoadingId(null)
  }

  return (
    <div className="mx-auto max-w-6xl p-4 md:p-8">
      <div className="mb-6 border-b border-border pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">求職者一覧</h1>
      </div>

      <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
        <Link href="/dashboard/ca/candidates/new">
          <Button className="h-12 gap-2 px-6 text-base">
            <Plus className="h-5 w-5" />
            求職者登録
          </Button>
        </Link>

        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">担当者:</span>
          <select
            className="h-10 min-w-64 rounded-md border border-input bg-white px-3 text-sm"
            value={assigneeId}
            onChange={e => setAssigneeId(e.target.value as 'all' | string)}
          >
            <option value="all">すべて</option>
            {initialAssignees.length > 0 ? (
              initialAssignees.map(item => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))
            ) : (
              <option value="all">担当者が未登録です</option>
            )}
          </select>
        </div>
      </div>

      <div className="mb-4 flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
            placeholder="求職者名やメモなどのキーワード（30文字以内）"
            className="h-12 pl-12 text-base"
            maxLength={30}
          />
        </div>
        <Button variant="ghost" size="icon" aria-label="フィルター" className="h-10 w-10">
          <SlidersHorizontal className="h-5 w-5" />
        </Button>
      </div>

      <div className="overflow-x-auto rounded-md border bg-white">
        <table className="w-full min-w-[1100px] border-collapse text-sm">
          <thead>
            <tr className="border-b bg-muted/30 text-left text-muted-foreground">
              <th className="w-14 px-4 py-3">
                <input type="checkbox" aria-label="all" className="h-5 w-5" />
              </th>
              <th className="px-4 py-3">氏名</th>
              <th className="px-4 py-3">ラベル</th>
              <th className="px-4 py-3">担当者</th>
              <th className="px-4 py-3 text-center">応募前</th>
              <th className="px-4 py-3 text-center">選考中</th>
              <th className="px-4 py-3 text-center">内定</th>
              <th className="px-4 py-3 text-center">終了</th>
              <th className="px-4 py-3">メモ</th>
              <th className="px-4 py-3">最終更新日</th>
              <th className="w-20 px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {filtered.map(candidate => (
              <tr key={candidate.id} className="border-b">
                <td className="px-4 py-4 align-top">
                  <input type="checkbox" aria-label={candidate.name} className="h-5 w-5" />
                </td>
                <td className="px-4 py-4 align-top">
                  <Link href={`/dashboard/ca/candidates/${candidate.id}`} className="font-medium text-foreground hover:underline">
                    {candidate.name}
                  </Link>
                </td>
                <td className="px-4 py-4 align-top">
                  <select className="rounded border border-input px-2 py-1 text-sm">
                    <option>未選択</option>
                    <option>要フォロー</option>
                    <option>優先</option>
                  </select>
                </td>
                <td className="px-4 py-4 align-top">
                  <div>{candidate.createdBy ? assigneeNameMap.get(candidate.createdBy) ?? '未設定' : '未設定'}</div>
                </td>
                <td className="px-4 py-4 text-center align-top">0</td>
                <td className="px-4 py-4 text-center align-top">0</td>
                <td className="px-4 py-4 text-center align-top">0</td>
                <td className="px-4 py-4 text-center align-top">0</td>
                <td className="px-4 py-4 align-top">{truncate(candidate.memo)}</td>
                <td className="px-4 py-4 align-top">{formatDate(candidate.updatedAt)}</td>
                <td className="px-4 py-4 align-top">
                  <div className="flex items-center justify-end gap-1">
                    <Link href={`/dashboard/ca/candidates/${candidate.id}`} className="rounded px-2 py-1 hover:bg-muted">
                      <Ellipsis className="h-5 w-5" />
                    </Link>
                    <button
                      type="button"
                      className="rounded px-2 py-1 text-sm text-destructive hover:bg-destructive/10"
                      onClick={() => handleDelete(candidate.id)}
                      disabled={loadingId === candidate.id}
                    >
                      削除
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={11} className="px-4 py-10 text-center text-muted-foreground">
                  該当する求職者が見つかりません
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

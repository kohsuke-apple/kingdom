"use client"

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Edit, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import type { Agent } from '@/types/recruiting'

export default function CaAgentDetail({ agent }: { agent: Agent }) {
  const router = useRouter()

  async function handleDelete() {
    if (!confirm(`「${agent.name}」を削除しますか？`)) return
    const res = await fetch(`/api/agents?id=${agent.id}`, { method: 'DELETE' })
    if (res.ok) {
      toast.success('削除しました')
      router.push('/dashboard/all/ca')
      router.refresh()
    } else {
      toast.error('削除に失敗しました')
    }
  }

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-6">
        <Link href="/dashboard/all/ca" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft className="h-4 w-4" />
          CA一覧へ戻る
        </Link>
      </div>

      <div className="bg-white border border-border">
        <div className="px-6 py-6 border-b border-border">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight">{agent.name}</h1>
              {agent.email && <p className="text-sm text-muted-foreground mt-1">{agent.email}</p>}
              <div className="flex gap-2 mt-3 text-sm">
                <div className="text-muted-foreground">役割: {agent.roleType}</div>
              </div>
            </div>

            <div className="flex gap-2 shrink-0">
              <Link href={`/dashboard/ca/agents/${agent.id}/edit`}>
                <Button variant="outline" size="sm" className="gap-2">
                  <Edit className="h-4 w-4" />
                  編集
                </Button>
              </Link>
              <Button variant="destructive" size="sm" className="gap-2" onClick={handleDelete}>
                <Trash2 className="h-4 w-4" />
                削除
              </Button>
            </div>
          </div>
        </div>

        <div className="px-6 py-4">
          <p className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground mb-2">メモ</p>
          <div className="bg-muted p-4 text-sm text-foreground whitespace-pre-wrap leading-relaxed">{agent.memo ?? 'なし'}</div>
        </div>

        <div className="px-6 py-3 border-t border-border bg-muted/30">
          <div className="flex gap-6 text-[11px] text-muted-foreground">
            <span>登録: {new Date(agent.createdAt).toLocaleString('ja-JP')}</span>
            <span>更新: {new Date(agent.updatedAt).toLocaleString('ja-JP')}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

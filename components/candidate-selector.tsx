'use client'

import { useEffect, useMemo, useState } from 'react'
import { useMode } from './mode-context'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import type { Candidate } from '@/types/recruiting'

export function CandidateSelector({ jobId, companyId, onClose, onApplied }: { jobId: string; companyId: string; onClose: () => void; onApplied?: () => void }) {
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [loading, setLoading] = useState(false)
  const [query, setQuery] = useState('')
  const [applyingId, setApplyingId] = useState<string | null>(null)
  const [addingId, setAddingId] = useState<string | null>(null)
  const { mode } = useMode()

  useEffect(() => {
    let mounted = true
    setLoading(true)
    fetch('/api/candidates')
      .then(res => res.json())
      .then((data: Candidate[]) => {
        if (!mounted) return
        setCandidates(data)
      })
      .catch(err => {
        console.error(err)
        toast.error('候補者の取得に失敗しました')
      })
      .finally(() => setLoading(false))
    return () => { mounted = false }
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return candidates
    return candidates.filter(c => (c.name ?? '').toLowerCase().includes(q) || (c.memo ?? '').toLowerCase().includes(q))
  }, [candidates, query])

  async function handleApply(candidateId: string) {
    setApplyingId(candidateId)
    try {
      const scope = mode === 'CA' ? 'ca' : 'ra'
      const url = `/api/selections?scope=${scope}`
      const body = scope === 'ca'
        ? { candidateId, jobId, stage: 'applied', memo: '' }
        : { companyId, jobId, candidateId, stage: 'applied', status: 'active' }

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        toast.error(err.error ?? '応募に失敗しました')
        return
      }
      toast.success('応募を作成しました')
      if (onApplied) onApplied()
    } catch (e) {
      console.error(e)
      toast.error('応募に失敗しました')
    } finally {
      setApplyingId(null)
    }
  }

  async function handleAdd(candidateId: string) {
    setAddingId(candidateId)
    try {
      const res = await fetch('/api/saved-jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId, candidateId }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        toast.error(err.error ?? '追加に失敗しました')
        return
      }
      toast.success('保存求人に追加しました')
    } catch (e) {
      console.error(e)
      toast.error('追加に失敗しました')
    } finally {
      setAddingId(null)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/30 pt-16 pb-8">
      <div className="w-full max-w-3xl rounded-lg border border-border bg-white shadow-xl">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-semibold">求職者を選択</h3>
            <span className="text-xs text-muted-foreground">応募または保存に追加できます</span>
          </div>
          <div className="flex items-center gap-2">
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="氏名で検索" className="rounded border px-2 py-1 text-sm" />
            <button className="rounded p-1 hover:bg-muted" onClick={onClose}><X className="h-4 w-4" /></button>
          </div>
        </div>
        <div className="max-h-[60vh] overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30 text-left text-muted-foreground">
                <th className="px-4 py-3">氏名</th>
                <th className="px-4 py-3">メール</th>
                <th className="px-4 py-3">最終更新</th>
                <th className="w-40 px-4 py-3">操作</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} className="px-4 py-6 text-center text-muted-foreground">読み込み中...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-6 text-center text-muted-foreground">候補者が見つかりません</td></tr>
              ) : (filtered.map(c => (
                <tr key={c.id} className="border-b">
                  <td className="px-4 py-3 font-medium">{c.name}</td>
                  <td className="px-4 py-3">{c.email ?? '-'}</td>
                  <td className="px-4 py-3">{new Date(c.updatedAt).toLocaleDateString('ja-JP')}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <Button size="sm" disabled={applyingId === c.id} onClick={() => void handleApply(c.id)}>
                        {applyingId === c.id ? '応募中...' : '応募する'}
                      </Button>
                      <Button size="sm" variant="outline" disabled={addingId === c.id} onClick={() => void handleAdd(c.id)}>
                        {addingId === c.id ? '追加中...' : '追加する'}
                      </Button>
                    </div>
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

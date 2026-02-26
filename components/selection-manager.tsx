"use client"

import { useMemo, useState } from 'react'
import { Search, X, Ellipsis } from 'lucide-react'
import { toast } from 'sonner'
import type { Company, Job, Candidate, CompanyCandidateSelection, CandidateJobStatus, SelectionStage, SelectionStatus } from '@/types/recruiting'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RichTextEditor } from '@/components/ui/rich-text-editor'

type SelectionUnion = CompanyCandidateSelection | CandidateJobStatus

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('ja-JP')
}

const stages: SelectionStage[] = ['applied','document_pass','interview_1','interview_2','final','offer','hired','rejected']
const statuses: SelectionStatus[] = ['active','rejected','hired']

export default function SelectionManager({
  initialSelections,
  companies,
  jobs,
  candidates,
  scope, // 'ra' | 'ca'
}: {
  initialSelections: SelectionUnion[]
  companies: Company[]
  jobs: Job[]
  candidates: Candidate[]
  scope: 'ra' | 'ca'
}) {
  const [items, setItems] = useState<SelectionUnion[]>(initialSelections)
  const [keyword, setKeyword] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formKey, setFormKey] = useState(0)
  type FormShape = { id: string; companyId: string; jobId: string; candidateId: string; stage: SelectionStage; status: SelectionStatus; memo: string }
  const [form, setForm] = useState<Partial<FormShape>>({})

  const companyMap = useMemo(() => new Map(companies.map(c => [c.id, c.name])), [companies])
  const jobMap = useMemo(() => new Map(jobs.map(j => [j.id, j.title])), [jobs])
  const candidateMap = useMemo(() => new Map(candidates.map(c => [c.id, c.name])), [candidates])

  function openEdit(item: SelectionUnion) {
    setForm({ id: item.id, companyId: 'companyId' in item ? item.companyId : undefined, jobId: item.jobId, candidateId: item.candidateId, stage: item.stage, status: 'status' in item ? item.status : undefined, memo: 'memo' in item ? item.memo : undefined })
    setFormKey(k => k + 1)
    setModalOpen(true)
  }

  function handleChange<K extends keyof FormShape>(key: K, value: FormShape[K] | undefined) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  async function reload() {
    const res = await fetch(`/api/selections?scope=${scope}`)
    if (!res.ok) return
    setItems(await res.json())
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    if (!form.id) {
      toast.error('編集対象が不明です')
      setSaving(false)
      return
    }
    const payload: Record<string, unknown> = {
      jobId: form.jobId,
      candidateId: form.candidateId,
      stage: form.stage,
    }
    if (scope === 'ra') {
      payload.companyId = form.companyId
      payload.status = form.status
    } else {
      payload.memo = form.memo
    }

    const method = 'PUT'
    const url = `/api/selections?scope=${scope}&id=${form.id}`
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    if (!res.ok) {
      toast.error((await res.json().catch(() => ({}))).error ?? '保存に失敗しました')
      setSaving(false)
      return
    }
    toast.success(form.id ? '更新しました' : '追加しました')
    setModalOpen(false)
    await reload()
    setSaving(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('この選考を削除しますか？')) return
    const res = await fetch(`/api/selections?scope=${scope}&id=${id}`, { method: 'DELETE' })
    if (!res.ok) {
      toast.error((await res.json().catch(() => ({}))).error ?? '削除に失敗しました')
      return
    }
    toast.success('削除しました')
    await reload()
  }

  const filtered = items.filter(it => {
    const kw = keyword.trim().toLowerCase()
    if (!kw) return true
    const companyId = 'companyId' in it ? (it as { companyId: string }).companyId : (jobs.find(j => j.id === it.jobId)?.companyId ?? '')
    const text = [jobMap.get(it.jobId), candidateMap.get(it.candidateId), companyMap.get(companyId)].filter(Boolean).join(' ').toLowerCase()
    return text.includes(kw)
  })

  return (
    <>
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/30 pt-16 pb-8">
          <div className="w-full max-w-lg rounded-lg border border-border bg-white shadow-xl">
            <div className="flex items-center justify-between border-b px-6 py-4">
              <h2 className="text-base font-semibold">選考を編集</h2>
              <button type="button" onClick={() => setModalOpen(false)} className="rounded p-1 hover:bg-muted"><X className="h-4 w-4" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
              {scope === 'ra' && (
                <div className="space-y-1.5">
                  <Label>会社 *</Label>
                  <select className="h-10 w-full rounded-md border border-input bg-white px-3 text-sm" value={form.companyId} onChange={e => handleChange('companyId', e.target.value)} required>
                    {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              )}

              <div className="space-y-1.5">
                <Label>求人 *</Label>
                <select className="h-10 w-full rounded-md border border-input bg-white px-3 text-sm" value={form.jobId} onChange={e => handleChange('jobId', e.target.value)} required>
                  {jobs.map(j => <option key={j.id} value={j.id}>{j.title} — {companyMap.get(j.companyId) ?? ''}</option>)}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label>求職者 *</Label>
                <select className="h-10 w-full rounded-md border border-input bg-white px-3 text-sm" value={form.candidateId} onChange={e => handleChange('candidateId', e.target.value)} required>
                  {candidates.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label>ステージ</Label>
                <select className="h-10 w-full rounded-md border border-input bg-white px-3 text-sm" value={form.stage} onChange={e => handleChange('stage', e.target.value as SelectionStage)}>
                  {stages.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              {scope === 'ra' ? (
                <div className="space-y-1.5">
                  <Label>状態</Label>
                  <select className="h-10 w-full rounded-md border border-input bg-white px-3 text-sm" value={form.status} onChange={e => handleChange('status', e.target.value as SelectionStatus)}>
                    {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <Label>メモ</Label>
                  <RichTextEditor key={formKey} defaultValue={form.memo ?? ''} onChange={v => handleChange('memo', v)} placeholder="選考に関するメモを入力..." />
                </div>
              )}

              <div className="flex gap-2">
                <Button type="submit" disabled={saving}>{saving ? '保存中...' : '更新する'}</Button>
                <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>キャンセル</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-6xl p-8">
        <div className="mb-6 border-b border-border pb-5">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">選考管理</h1>
        </div>

        <div className="mb-4 flex items-start justify-between gap-4" />

        <div className="mb-4 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input value={keyword} onChange={e => setKeyword(e.target.value)} placeholder="求人・求職者・企業で検索" className="h-12 pl-12 text-base" />
          </div>
        </div>

        <div className="overflow-x-auto rounded-md border bg-white">
          <table className="w-full min-w-[900px] border-collapse text-sm">
            <thead>
              <tr className="border-b bg-muted/30 text-left text-muted-foreground">
                <th className="w-14 px-4 py-3"><input type="checkbox" aria-label="all" className="h-5 w-5" /></th>
                <th className="px-4 py-3">会社</th>
                <th className="px-4 py-3">求人</th>
                <th className="px-4 py-3">求職者</th>
                <th className="px-4 py-3">ステージ</th>
                <th className="px-4 py-3">状態 / メモ</th>
                <th className="px-4 py-3">更新日</th>
                <th className="w-20 px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => (
                <tr key={item.id} className="border-b">
                  <td className="px-4 py-4 align-top"><input type="checkbox" aria-label={item.id} className="h-5 w-5" /></td>
                  <td className="px-4 py-4 align-top">{'companyId' in item ? companyMap.get(item.companyId) ?? '-' : (companyMap.get(jobs.find(j => j.id === item.jobId)?.companyId ?? '') ?? '-')}</td>
                  <td className="px-4 py-4 align-top font-medium">{jobMap.get(item.jobId) ?? '-'}</td>
                  <td className="px-4 py-4 align-top">{candidateMap.get(item.candidateId) ?? '-'}</td>
                  <td className="px-4 py-4 align-top">{item.stage}</td>
                  <td className="px-4 py-4 align-top text-muted-foreground">{'status' in item ? item.status : ('memo' in item ? item.memo ?? '-' : '-')}</td>
                  <td className="px-4 py-4 align-top">{formatDate(item.updatedAt)}</td>
                  <td className="px-4 py-4 align-top">
                    <div className="flex items-center justify-end gap-1">
                      <button type="button" className="rounded px-2 py-1 hover:bg-muted" onClick={() => openEdit(item)} aria-label="編集"><Ellipsis className="h-5 w-5" /></button>
                      <button type="button" className="rounded px-2 py-1 text-sm text-destructive hover:bg-destructive/10" onClick={() => void handleDelete(item.id)}>削除</button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-muted-foreground">選考がまだ登録されていません</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}

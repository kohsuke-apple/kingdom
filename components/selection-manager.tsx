"use client"

import { useMemo, useState } from 'react'
import { Search, X, User, Building2, Briefcase, Calendar } from 'lucide-react'
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

const stages: SelectionStage[] = ['applied', 'document_pass', 'interview_1', 'interview_2', 'final', 'offer', 'hired', 'rejected']
const statuses: SelectionStatus[] = ['active', 'rejected', 'hired']

const STAGE_META: Record<SelectionStage, { label: string; color: string; headerBg: string; dot: string }> = {
  applied:       { label: '推薦',     color: 'bg-slate-50 border-slate-200',   headerBg: 'bg-slate-100',   dot: 'bg-slate-400' },
  document_pass: { label: '書類通過', color: 'bg-blue-50 border-blue-200',     headerBg: 'bg-blue-100',    dot: 'bg-blue-500'  },
  interview_1:   { label: '面接1次',  color: 'bg-violet-50 border-violet-200', headerBg: 'bg-violet-100',  dot: 'bg-violet-500'},
  interview_2:   { label: '面接2次',  color: 'bg-purple-50 border-purple-200', headerBg: 'bg-purple-100',  dot: 'bg-purple-500'},
  final:         { label: '最終面接', color: 'bg-fuchsia-50 border-fuchsia-200',headerBg: 'bg-fuchsia-100', dot: 'bg-fuchsia-500'},
  offer:         { label: '内定',     color: 'bg-amber-50 border-amber-200',   headerBg: 'bg-amber-100',   dot: 'bg-amber-500' },
  hired:         { label: '決定',     color: 'bg-emerald-50 border-emerald-200',headerBg: 'bg-emerald-100', dot: 'bg-emerald-500'},
  rejected:      { label: '不合格',   color: 'bg-red-50 border-red-200',       headerBg: 'bg-red-100',     dot: 'bg-red-400'   },
}

export default function SelectionManager({
  initialSelections,
  companies,
  jobs,
  candidates,
  scope,
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
  const jobMap    = useMemo(() => new Map(jobs.map(j => [j.id, j])), [jobs])
  const candidateMap = useMemo(() => new Map(candidates.map(c => [c.id, c.name])), [candidates])

  function jobCompanyName(jobId: string) {
    const job = jobMap.get(jobId)
    if (!job) return '-'
    return companyMap.get(job.companyId) ?? '-'
  }

  function openEdit(item: SelectionUnion) {
    setForm({
      id: item.id,
      companyId: 'companyId' in item ? item.companyId : undefined,
      jobId: item.jobId,
      candidateId: item.candidateId,
      stage: item.stage,
      status: 'status' in item ? item.status : undefined,
      memo: 'memo' in item ? item.memo : undefined,
    })
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
    const payload: Record<string, unknown> = { jobId: form.jobId, candidateId: form.candidateId, stage: form.stage }
    if (scope === 'ra') {
      payload.companyId = form.companyId
      payload.status = form.status
    } else {
      payload.memo = form.memo
    }
    const res = await fetch(`/api/selections?scope=${scope}&id=${form.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) {
      toast.error((await res.json().catch(() => ({}))).error ?? '保存に失敗しました')
      setSaving(false)
      return
    }
    toast.success('更新しました')
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

  const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase()
    return items.filter(it => {
      if (!kw) return true
      const job = jobMap.get(it.jobId)
      const company = job ? companyMap.get(job.companyId) : ''
      const text = [job?.title, job?.jobType, candidateMap.get(it.candidateId), company].filter(Boolean).join(' ').toLowerCase()
      return text.includes(kw)
    })
  }, [items, keyword, jobMap, companyMap, candidateMap])

  const byStage = useMemo(() => {
    const map = new Map<SelectionStage, SelectionUnion[]>()
    for (const s of stages) map.set(s, [])
    for (const it of filtered) {
      map.get(it.stage)?.push(it)
    }
    return map
  }, [filtered])

  return (
    <>
      {/* ── 編集モーダル ── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/30 pt-16 pb-8">
          <div className="w-full max-w-lg rounded-lg border border-border bg-white shadow-xl">
            <div className="flex items-center justify-between border-b px-6 py-4">
              <h2 className="text-base font-semibold">選考を編集</h2>
              <button type="button" onClick={() => setModalOpen(false)} className="rounded p-1 hover:bg-muted">
                <X className="h-4 w-4" />
              </button>
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
                  {stages.map(s => <option key={s} value={s}>{STAGE_META[s].label}</option>)}
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

      {/* ── ページ本体 ── */}
      <div className="flex h-[calc(100vh-56px)] flex-col">
        {/* ヘッダー */}
        <div className="flex shrink-0 items-center justify-between border-b border-border bg-white px-6 py-4">
          <h1 className="text-xl font-bold tracking-tight text-foreground">選考管理</h1>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={keyword}
                onChange={e => setKeyword(e.target.value)}
                placeholder="求職者・求人・企業で検索"
                className="h-9 w-64 pl-9 text-sm"
              />
            </div>
            <span className="text-sm text-muted-foreground">{filtered.length} 件</span>
          </div>
        </div>

        {/* カンバンボード */}
        <div className="flex flex-1 gap-3 overflow-x-auto overflow-y-hidden p-4">
          {stages.map(stage => {
            const meta = STAGE_META[stage]
            const cards = byStage.get(stage) ?? []
            return (
              <div key={stage} className="flex w-56 shrink-0 flex-col rounded-xl border border-border bg-white shadow-sm">
                {/* カラムヘッダー */}
                <div className={`flex items-center justify-between rounded-t-xl px-3 py-2.5 ${meta.headerBg}`}>
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${meta.dot}`} />
                    <span className="text-xs font-semibold text-foreground">{meta.label}</span>
                  </div>
                  <span className="rounded-full bg-white/70 px-1.5 py-0.5 text-[10px] font-bold text-foreground">
                    {cards.length}
                  </span>
                </div>

                {/* カード一覧 */}
                <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-2">
                  {cards.length === 0 && (
                    <p className="py-6 text-center text-[11px] text-muted-foreground">なし</p>
                  )}
                  {cards.map(item => {
                    const job = jobMap.get(item.jobId)
                    const candidateName = candidateMap.get(item.candidateId) ?? '-'
                    const companyName = job ? (companyMap.get(job.companyId) ?? '-') : jobCompanyName(item.jobId)
                    const jobTitle = job?.title ?? '-'
                    const jobType = job?.jobType
                    return (
                      <div
                        key={item.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => openEdit(item)}
                        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openEdit(item) } }}
                        className={`group w-full rounded-lg border p-3 text-left transition-shadow hover:shadow-md ${meta.color}`}
                      >
                        {/* 求職者名 */}
                        <div className="flex items-center gap-1.5 mb-2">
                          <User className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                          <span className="text-sm font-semibold leading-tight text-foreground line-clamp-1">{candidateName}</span>
                        </div>

                        {/* 会社名 */}
                        <div className="flex items-center gap-1.5 mb-1">
                          <Building2 className="h-3 w-3 shrink-0 text-muted-foreground" />
                          <span className="text-[11px] text-muted-foreground line-clamp-1">{companyName}</span>
                        </div>

                        {/* 求人タイトル */}
                        <div className="flex items-start gap-1.5 mb-1">
                          <Briefcase className="mt-0.5 h-3 w-3 shrink-0 text-muted-foreground" />
                          <span className="text-[11px] text-muted-foreground line-clamp-2 leading-tight">{jobTitle}</span>
                        </div>

                        {/* 雇用形態 */}
                        {jobType && (
                          <span className="inline-block mt-1 rounded border border-muted bg-white/70 px-1.5 py-0.5 text-[10px] text-muted-foreground">
                            {jobType}
                          </span>
                        )}

                        {/* 更新日 */}
                        <div className="mt-2 flex items-center gap-1 border-t border-black/5 pt-2">
                          <Calendar className="h-3 w-3 text-muted-foreground/60" />
                          <span className="text-[10px] text-muted-foreground/60">{formatDate(item.updatedAt)}</span>
                          <button
                            type="button"
                            className="ml-auto text-[10px] text-destructive opacity-0 group-hover:opacity-100 hover:underline"
                            onClick={e => { e.stopPropagation(); void handleDelete(item.id) }}
                          >
                            削除
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}

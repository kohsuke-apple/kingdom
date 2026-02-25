"use client"

import { useMemo, useState } from 'react'
import { Plus, Search, X, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import type { Company, Job, Candidate, CandidateJobStatus, SelectionStage } from '@/types/recruiting'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'

// ─── ステージ定義 ─────────────────────────────────────────────────────

const stageLabelMap: Record<SelectionStage, string> = {
  applied:        '応募済み',
  document_pass:  '書類通過',
  interview_1:    '1次面接',
  interview_2:    '2次面接',
  final:          '最終面接',
  offer:          '内定',
  hired:          '入社',
  rejected:       '不合格',
}

const stageBadgeClass: Record<SelectionStage, string> = {
  applied:        'border-slate-200 bg-slate-50 text-slate-600',
  document_pass:  'border-blue-200 bg-blue-50 text-blue-700',
  interview_1:    'border-sky-200 bg-sky-50 text-sky-700',
  interview_2:    'border-indigo-200 bg-indigo-50 text-indigo-700',
  final:          'border-purple-200 bg-purple-50 text-purple-700',
  offer:          'border-amber-200 bg-amber-50 text-amber-700',
  hired:          'border-emerald-200 bg-emerald-50 text-emerald-700',
  rejected:       'border-red-200 bg-red-50 text-red-700',
}

// ─── タブ定義 ─────────────────────────────────────────────────────────

type TabKey = 'all' | 'candidate_list' | 'in_selection' | 'offer' | 'finished'

const tabs: { key: TabKey; label: string; stages: SelectionStage[] | null }[] = [
  { key: 'all',            label: 'すべて',     stages: null },
  { key: 'candidate_list', label: '候補リスト', stages: ['applied'] },
  { key: 'in_selection',   label: '選考中',     stages: ['document_pass', 'interview_1', 'interview_2', 'final'] },
  { key: 'offer',          label: '内定',       stages: ['offer', 'hired'] },
  { key: 'finished',       label: '選考終了',   stages: ['rejected'] },
]

const ALL_STAGES: SelectionStage[] = ['applied', 'document_pass', 'interview_1', 'interview_2', 'final', 'offer', 'hired', 'rejected']

function formatDate(dateStr?: string) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' })
}

// ─── Props ────────────────────────────────────────────────────────────

type Props = {
  initialSelections: CandidateJobStatus[]
  companies: Company[]
  jobs: Job[]
  candidates: Candidate[]
}

// ─── Component ───────────────────────────────────────────────────────

export default function CaSelectionsManager({ initialSelections, companies, jobs, candidates }: Props) {
  const [items, setItems]       = useState<CandidateJobStatus[]>(initialSelections)
  const [keyword, setKeyword]   = useState('')
  const [activeTab, setActiveTab] = useState<TabKey>('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving]     = useState(false)
  const [form, setForm]         = useState<Partial<{
    id: string
    candidateId: string
    jobId: string
    stage: SelectionStage
    memo: string
  }>>({})

  const companyMap   = useMemo(() => new Map(companies.map(c => [c.id, c.name])), [companies])
  const jobMap       = useMemo(() => new Map(jobs.map(j => [j.id, j])), [jobs])
  const candidateMap = useMemo(() => new Map(candidates.map(c => [c.id, c.name])), [candidates])

  // ── フィルタ ──────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const tabStages = tabs.find(t => t.key === activeTab)?.stages ?? null
    const kw = keyword.trim().toLowerCase()
    return items.filter(it => {
      if (tabStages && !tabStages.includes(it.stage)) return false
      if (!kw) return true
      const job = jobMap.get(it.jobId)
      const company = job ? companyMap.get(job.companyId) ?? '' : ''
      const text = [candidateMap.get(it.candidateId), job?.title, company].filter(Boolean).join(' ').toLowerCase()
      return text.includes(kw)
    })
  }, [items, activeTab, keyword, candidateMap, jobMap, companyMap])

  // タブごとの件数
  const countByTab = useMemo<Record<TabKey, number>>(() => {
    const result: Record<TabKey, number> = { all: items.length, candidate_list: 0, in_selection: 0, offer: 0, finished: 0 }
    items.forEach(it => {
      if (['applied'].includes(it.stage)) result.candidate_list++
      else if (['document_pass', 'interview_1', 'interview_2', 'final'].includes(it.stage)) result.in_selection++
      else if (['offer', 'hired'].includes(it.stage)) result.offer++
      else if (['rejected'].includes(it.stage)) result.finished++
    })
    return result
  }, [items])

  // ── モーダル ─────────────────────────────────────────────────────────
  function openNew() {
    setForm({
      candidateId: candidates[0]?.id,
      jobId: jobs[0]?.id,
      stage: 'applied',
      memo: '',
    })
    setModalOpen(true)
  }

  function openEdit(item: CandidateJobStatus) {
    setForm({ id: item.id, candidateId: item.candidateId, jobId: item.jobId, stage: item.stage, memo: item.memo ?? '' })
    setModalOpen(true)
  }

  function handleChange<K extends keyof typeof form>(key: K, value: typeof form[K]) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  async function reload() {
    const res = await fetch('/api/selections?scope=ca')
    if (res.ok) setItems(await res.json())
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const payload = { jobId: form.jobId, candidateId: form.candidateId, stage: form.stage, memo: form.memo }
    const method = form.id ? 'PUT' : 'POST'
    const url = form.id ? `/api/selections?scope=ca&id=${form.id}` : '/api/selections?scope=ca'
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
    const res = await fetch(`/api/selections?scope=ca&id=${id}`, { method: 'DELETE' })
    if (!res.ok) {
      toast.error((await res.json().catch(() => ({}))).error ?? '削除に失敗しました')
      return
    }
    toast.success('削除しました')
    await reload()
  }

  // ── レンダリング ─────────────────────────────────────────────────────
  return (
    <>
      {/* ─── 追加/編集モーダル ──────────────────────────────────────── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/30 pt-16 pb-8">
          <div className="w-full max-w-lg rounded-lg border border-border bg-white shadow-xl">
            <div className="flex items-center justify-between border-b px-6 py-4">
              <h2 className="text-base font-semibold">{form.id ? '選考を編集' : '選考を追加'}</h2>
              <button type="button" onClick={() => setModalOpen(false)} className="rounded p-1 hover:bg-muted">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
              <div className="space-y-1.5">
                <Label>求職者 *</Label>
                <select
                  className="h-10 w-full rounded-md border border-input bg-white px-3 text-sm"
                  value={form.candidateId}
                  onChange={e => handleChange('candidateId', e.target.value)}
                  required
                >
                  {candidates.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label>求人 *</Label>
                <select
                  className="h-10 w-full rounded-md border border-input bg-white px-3 text-sm"
                  value={form.jobId}
                  onChange={e => handleChange('jobId', e.target.value)}
                  required
                >
                  {jobs.map(j => (
                    <option key={j.id} value={j.id}>
                      {j.title}　―　{companyMap.get(j.companyId) ?? ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label>選考ステージ</Label>
                <select
                  className="h-10 w-full rounded-md border border-input bg-white px-3 text-sm"
                  value={form.stage}
                  onChange={e => handleChange('stage', e.target.value as SelectionStage)}
                >
                  {ALL_STAGES.map(s => <option key={s} value={s}>{stageLabelMap[s]}</option>)}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label>選考日程・メモ</Label>
                <Textarea
                  rows={4}
                  placeholder="面接日時や担当者メモを入力..."
                  value={form.memo ?? ''}
                  onChange={e => handleChange('memo', e.target.value)}
                />
              </div>

              <div className="flex gap-2 pt-1">
                <Button type="submit" disabled={saving}>{saving ? '保存中...' : form.id ? '更新する' : '追加する'}</Button>
                <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>キャンセル</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── メインコンテンツ ─────────────────────────────────────── */}
      <div className="mx-auto max-w-6xl p-8">
        <div className="mb-6 border-b border-border pb-5">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">進捗管理</h1>
        </div>

        {/* ツールバー */}
        <div className="mb-4 flex items-center justify-between gap-4">
          <Button className="h-10 gap-2 px-5" onClick={openNew}>
            <Plus className="h-4 w-4" /> 新規追加
          </Button>
          <div className="relative w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              placeholder="求職者・求人・企業で検索"
              className="h-10 pl-9 text-sm"
            />
          </div>
        </div>

        {/* ─── ステータスタブ ──────────────────────────────────── */}
        <div className="mb-0 flex border-b border-border">
          {tabs.map(tab => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={[
                'flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors',
                activeTab === tab.key
                  ? 'border-foreground text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground',
              ].join(' ')}
            >
              {tab.label}
              <span className={[
                'rounded-full px-1.5 py-0.5 text-xs font-semibold tabular-nums',
                activeTab === tab.key ? 'bg-foreground text-white' : 'bg-muted text-muted-foreground',
              ].join(' ')}>
                {countByTab[tab.key]}
              </span>
            </button>
          ))}
        </div>

        {/* ─── テーブル ────────────────────────────────────────── */}
        <div className="overflow-x-auto rounded-b-md border border-t-0 bg-white">
          <table className="w-full min-w-[780px] border-collapse text-sm">
            <thead>
              <tr className="border-b bg-muted/30 text-left text-xs text-muted-foreground">
                <th className="w-12 px-4 py-3">
                  <input type="checkbox" className="h-4 w-4" />
                </th>
                <th className="px-4 py-3">応募日 / 応募者</th>
                <th className="px-4 py-3">選考企業 / 該当求人</th>
                <th className="px-4 py-3">選考状況</th>
                <th className="px-4 py-3">選考日程・メモ</th>
                <th className="w-20 px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => {
                const job     = jobMap.get(item.jobId)
                const company = job ? companyMap.get(job.companyId) ?? '-' : '-'
                return (
                  <tr key={item.id} className="border-b last:border-0 hover:bg-muted/20">
                    <td className="px-4 py-4 align-top">
                      <input type="checkbox" className="h-4 w-4" />
                    </td>
                    {/* 応募日 / 応募者 */}
                    <td className="px-4 py-4 align-top">
                      <p className="text-xs text-muted-foreground">{formatDate(item.createdAt ?? item.updatedAt)}</p>
                      <p className="mt-0.5 font-medium text-foreground">
                        {candidateMap.get(item.candidateId) ?? '-'}
                      </p>
                    </td>
                    {/* 選考企業 / 該当求人 */}
                    <td className="px-4 py-4 align-top">
                      <p className="text-xs text-muted-foreground">{company}</p>
                      <p className="mt-0.5 text-foreground">{job?.title ?? '-'}</p>
                    </td>
                    {/* 選考状況 */}
                    <td className="px-4 py-4 align-top">
                      <Badge variant="secondary" className={`border ${stageBadgeClass[item.stage]}`}>
                        {stageLabelMap[item.stage]}
                      </Badge>
                    </td>
                    {/* 選考日程・メモ */}
                    <td className="px-4 py-4 align-top max-w-xs">
                      <p className="whitespace-pre-wrap break-words text-muted-foreground text-xs leading-relaxed">
                        {item.memo || '-'}
                      </p>
                    </td>
                    {/* アクション */}
                    <td className="px-4 py-4 align-top">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          className="rounded p-1.5 hover:bg-muted"
                          onClick={() => openEdit(item)}
                          aria-label="編集"
                        >
                          <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                        </button>
                        <button
                          type="button"
                          className="rounded p-1.5 hover:bg-destructive/10"
                          onClick={() => void handleDelete(item.id)}
                          aria-label="削除"
                        >
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                    該当する選考がありません
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}

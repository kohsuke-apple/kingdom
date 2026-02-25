'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Plus, Search, SlidersHorizontal, Ellipsis, X } from 'lucide-react'
import { toast } from 'sonner'
import type { Company, Job, JobStatus } from '@/types/recruiting'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RichTextEditor } from '@/components/ui/rich-text-editor'

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('ja-JP')
}

function SourceBadge({ mode }: { mode?: string }) {
  if (mode === 'RA') {
    return (
      <Badge variant="secondary" className="bg-sky-50 text-sky-700 border border-sky-200 font-medium">
        RA
      </Badge>
    )
  }
  return (
    <Badge variant="secondary" className="bg-amber-50 text-amber-700 border border-amber-200 font-medium">
      採用担当
    </Badge>
  )
}

type JobFormState = {
  id?: string
  companyId: string
  title: string
  jobType: string
  salaryMin: string
  salaryMax: string
  status: JobStatus
  description: string
}

const emptyForm = (defaultCompanyId = ''): JobFormState => ({
  companyId: defaultCompanyId,
  title: '',
  jobType: '',
  salaryMin: '',
  salaryMax: '',
  status: 'open',
  description: '',
})

function JobFormModal({
  form,
  companies,
  saving,
  appMode,
  formKey,
  onClose,
  onSubmit,
  onChange,
}: {
  form: JobFormState
  companies: Company[]
  saving: boolean
  appMode: 'RA' | 'HIRING'
  formKey: number
  onClose: () => void
  onSubmit: (e: React.FormEvent) => void
  onChange: <K extends keyof JobFormState>(key: K, value: JobFormState[K]) => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/30 pt-16 pb-8">
      <div className="w-full max-w-lg rounded-lg border border-border bg-white shadow-xl">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="flex items-center gap-2 text-base font-semibold">
            {form.id ? '求人を編集' : '求人を追加'}
            {appMode === 'RA' && <SourceBadge mode="RA" />}
          </h2>
          <button type="button" onClick={onClose} className="rounded p-1 hover:bg-muted">
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={onSubmit} className="space-y-4 px-6 py-5">
          <div className="space-y-1.5">
            <Label>会社 *</Label>
            <select
              className="h-10 w-full rounded-md border border-input bg-white px-3 text-sm"
              value={form.companyId}
              onChange={e => onChange('companyId', e.target.value)}
              required
            >
              {companies.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label>求人タイトル *</Label>
            <Input value={form.title} onChange={e => onChange('title', e.target.value)} required />
          </div>
          <div className="space-y-1.5">
            <Label>雇用形態</Label>
            <Input value={form.jobType} onChange={e => onChange('jobType', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>年収下限</Label>
              <Input type="number" min={0} value={form.salaryMin} onChange={e => onChange('salaryMin', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>年収上限</Label>
              <Input type="number" min={0} value={form.salaryMax} onChange={e => onChange('salaryMax', e.target.value)} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>公開状態</Label>
            <select
              className="h-10 w-full rounded-md border border-input bg-white px-3 text-sm"
              value={form.status}
              onChange={e => onChange('status', e.target.value as JobStatus)}
            >
              <option value="open">open</option>
              <option value="closed">closed</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label>求人詳細</Label>
            <RichTextEditor key={formKey} defaultValue={form.description} onChange={v => onChange('description', v)} placeholder="求人の詳細情報を入力..." />
          </div>
          <div className="flex gap-2 pt-1">
            <Button type="submit" disabled={saving}>
              {saving ? '保存中...' : form.id ? '更新する' : '追加する'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>キャンセル</Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export function HiringJobsManager({
  initialJobs,
  companies,
}: {
  initialJobs: Job[]
  companies: Company[]
}) {
  const [jobs, setJobs] = useState(initialJobs)
  const [form, setForm] = useState<JobFormState>(() => emptyForm(companies[0]?.id ?? ''))
  const [saving, setSaving] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [formKey, setFormKey] = useState(0)
  const [keyword, setKeyword] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'closed'>('all')

  const companyNameMap = useMemo(() => {
    const map = new Map<string, string>()
    companies.forEach(c => map.set(c.id, c.name))
    return map
  }, [companies])

  const filtered = useMemo(() => {
    const lower = keyword.toLowerCase()
    return jobs.filter(job => {
      const text = [job.title, job.jobType, job.description, companyNameMap.get(job.companyId)]
        .filter(Boolean).join(' ').toLowerCase()
      const matchKw = !lower || text.includes(lower)
      const matchStatus = statusFilter === 'all' || job.status === statusFilter
      return matchKw && matchStatus
    })
  }, [jobs, keyword, statusFilter, companyNameMap])

  function openNew() {
    setForm(emptyForm(companies[0]?.id ?? ''))
    setFormKey(k => k + 1)
    setModalOpen(true)
  }

  function openEdit(job: Job) {
    setForm({
      id: job.id,
      companyId: job.companyId,
      title: job.title,
      jobType: job.jobType ?? '',
      salaryMin: job.salaryMin?.toString() ?? '',
      salaryMax: job.salaryMax?.toString() ?? '',
      status: job.status,
      description: job.description ?? '',
    })
    setFormKey(k => k + 1)
    setModalOpen(true)
  }

  function handleChange<K extends keyof JobFormState>(key: K, value: JobFormState[K]) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  async function reloadJobs() {
    const res = await fetch('/api/jobs')
    if (!res.ok) return
    setJobs((await res.json()) as Job[])
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const payload = {
      companyId: form.companyId,
      title: form.title,
      jobType: form.jobType || undefined,
      salaryMin: form.salaryMin ? Number(form.salaryMin) : undefined,
      salaryMax: form.salaryMax ? Number(form.salaryMax) : undefined,
      status: form.status,
      description: form.description || undefined,
    }
    const method = form.id ? 'PUT' : 'POST'
    const url = form.id ? `/api/jobs?id=${form.id}` : '/api/jobs'
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', 'x-app-mode': 'HIRING' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) {
      toast.error((await res.json().catch(() => ({}))).error ?? '保存に失敗しました')
      setSaving(false)
      return
    }
    toast.success(form.id ? '求人を更新しました' : '求人を追加しました')
    setModalOpen(false)
    await reloadJobs()
    setSaving(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('この求人を削除しますか？')) return
    const res = await fetch(`/api/jobs?id=${id}`, {
      method: 'DELETE',
      headers: { 'x-app-mode': 'HIRING' },
    })
    if (!res.ok) {
      toast.error((await res.json().catch(() => ({}))).error ?? '削除に失敗しました')
      return
    }
    toast.success('求人を削除しました')
    await reloadJobs()
  }

  return (
    <>
      {modalOpen && (
        <JobFormModal
          form={form}
          companies={companies}
          saving={saving}
          appMode="HIRING"
          formKey={formKey}
          onClose={() => setModalOpen(false)}
          onSubmit={handleSubmit}
          onChange={handleChange}
        />
      )}

      <div className="mx-auto max-w-6xl p-8">
        <div className="mb-6 border-b border-border pb-5">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">求人管理</h1>
        </div>

        <div className="mb-4 flex items-start justify-between gap-4">
          <Button className="h-12 gap-2 px-6 text-base" onClick={openNew}>
            <Plus className="h-5 w-5" />
            求人追加
          </Button>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">状態:</span>
            <select
              className="h-10 min-w-40 rounded-md border border-input bg-white px-3 text-sm"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as typeof statusFilter)}
            >
              <option value="all">すべて</option>
              <option value="open">公開中</option>
              <option value="closed">非公開</option>
            </select>
          </div>
        </div>

        <div className="mb-4 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              placeholder="求人タイトル・会社名・雇用形態などのキーワード"
              className="h-12 pl-12 text-base"
            />
          </div>
          <Button variant="ghost" size="icon" className="h-10 w-10">
            <SlidersHorizontal className="h-5 w-5" />
          </Button>
        </div>

        <div className="overflow-x-auto rounded-md border bg-white">
          <table className="w-full min-w-[900px] border-collapse text-sm">
            <thead>
              <tr className="border-b bg-muted/30 text-left text-muted-foreground">
                <th className="w-14 px-4 py-3">
                  <input type="checkbox" aria-label="all" className="h-5 w-5" />
                </th>
                <th className="px-4 py-3">会社</th>
                <th className="px-4 py-3">求人タイトル</th>
                <th className="px-4 py-3">雇用形態</th>
                <th className="px-4 py-3">年収</th>
                <th className="px-4 py-3">状態</th>
                <th className="px-4 py-3">作成元</th>
                <th className="px-4 py-3">更新日</th>
                <th className="w-20 px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map(job => (
                <tr key={job.id} className="border-b">
                  <td className="px-4 py-4 align-top">
                    <input type="checkbox" aria-label={job.title} className="h-5 w-5" />
                  </td>
                  <td className="px-4 py-4 align-top">
                    <Link href={`/dashboard/companies/${job.companyId}`} className="text-foreground hover:underline">
                      {companyNameMap.get(job.companyId) ?? '-'}
                    </Link>
                  </td>
                  <td className="px-4 py-4 align-top font-medium">{job.title}</td>
                  <td className="px-4 py-4 align-top">{job.jobType ?? '-'}</td>
                  <td className="px-4 py-4 align-top">
                    {job.salaryMin ?? '-'}{job.salaryMax ? ` 〜 ${job.salaryMax}` : ''}
                  </td>
                  <td className="px-4 py-4 align-top">{job.status}</td>
                  <td className="px-4 py-4 align-top">
                    <SourceBadge mode={job.sourceMode} />
                  </td>
                  <td className="px-4 py-4 align-top">{formatDate(job.updatedAt)}</td>
                  <td className="px-4 py-4 align-top">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        className="rounded px-2 py-1 hover:bg-muted"
                        onClick={() => openEdit(job)}
                        aria-label="編集"
                      >
                        <Ellipsis className="h-5 w-5" />
                      </button>
                      <button
                        type="button"
                        className="rounded px-2 py-1 text-sm text-destructive hover:bg-destructive/10"
                        onClick={() => handleDelete(job.id)}
                      >
                        削除
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-muted-foreground">
                    {keyword || statusFilter !== 'all' ? '条件に一致する求人が見つかりません' : 'まだ求人が登録されていません'}
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

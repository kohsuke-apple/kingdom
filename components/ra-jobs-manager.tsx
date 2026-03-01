'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Plus, Search, SlidersHorizontal, Ellipsis, X, LayoutGrid, List, Building2, Briefcase, Banknote, Star, BookmarkPlus, ImagePlus, Loader2, UserPlus } from 'lucide-react'
import { CandidateSelector } from './candidate-selector'
import { toast } from 'sonner'
import { useMode } from './mode-context'
import type { Company, Job, JobStatus } from '@/types/recruiting'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RichTextEditor } from '@/components/ui/rich-text-editor'

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('ja-JP')
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
  thumbnailUrl?: string
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

export function RaJobsManager({
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
  const [viewMode, setViewMode] = useState<'list' | 'gallery'>('gallery')
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [openSelector, setOpenSelector] = useState(false)
  const [selectorJob, setSelectorJob] = useState<{ jobId: string; companyId: string } | null>(null)
  const { mode } = useMode()
  const router = useRouter()

  const companyNameMap = useMemo(() => {
    const map = new Map<string, string>()
    companies.forEach(c => map.set(c.id, c.name))
    return map
  }, [companies])

  function openNew() {
    setForm(emptyForm(companies[0]?.id ?? ''))
    setFormKey(k => k + 1)
    setThumbnailFile(null)
    setThumbnailPreview(null)
    setModalOpen(true)
  }

  // Editing is handled via the modal opened from the "求人を追加" button or job detail page

  function setField<K extends keyof JobFormState>(key: K, value: JobFormState[K]) {
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

    // サムネイルが選択されていればアップロード
    let resolvedThumbnailUrl = form.thumbnailUrl
    if (thumbnailFile) {
      setUploading(true)
      const fd = new FormData()
      fd.append('file', thumbnailFile)
      const uploadRes = await fetch('/api/jobs/thumbnail', { method: 'POST', body: fd })
      setUploading(false)
      if (!uploadRes.ok) {
        const err = await uploadRes.json().catch(() => ({}))
        toast.error((err as { error?: string }).error ?? 'サムネイルのアップロードに失敗しました')
        setSaving(false)
        return
      }
      const { url } = await uploadRes.json() as { url: string }
      resolvedThumbnailUrl = url
    }

    const payload = {
      companyId: form.companyId,
      title: form.title,
      jobType: form.jobType || undefined,
      salaryMin: form.salaryMin ? Number(form.salaryMin) : undefined,
      salaryMax: form.salaryMax ? Number(form.salaryMax) : undefined,
      status: form.status,
      description: form.description || undefined,
      thumbnailUrl: resolvedThumbnailUrl || undefined,
    }

    const method = form.id ? 'PUT' : 'POST'
    const url = form.id ? `/api/jobs?id=${form.id}` : '/api/jobs'
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', 'x-app-mode': 'RA' },
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
    const res = await fetch(`/api/jobs?id=${id}`, { method: 'DELETE', headers: { 'x-app-mode': 'RA' } })
    if (!res.ok) {
      toast.error((await res.json().catch(() => ({}))).error ?? '削除に失敗しました')
      return
    }
    toast.success('求人を削除しました')
    await reloadJobs()
  }

  const filtered = useMemo(() => {
    const lower = keyword.toLowerCase()
    return jobs.filter(job => {
      const text = [job.title, job.jobType, job.description, companyNameMap.get(job.companyId)]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      const matchKw = !lower || text.includes(lower)
      const matchStatus = statusFilter === 'all' || job.status === statusFilter
      return matchKw && matchStatus
    })
  }, [jobs, keyword, statusFilter, companyNameMap])

  // SourceBadge is declared at module scope to avoid recreating components during render

  return (
    <>
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/30 pt-16 pb-8">
          <div className="w-full max-w-lg rounded-lg border border-border bg-white shadow-xl">
            <div className="flex items-center justify-between border-b px-6 py-4">
              <h2 className="flex items-center gap-2 text-base font-semibold">
                {form.id ? '求人を編集' : '求人を追加'}
                {form.id == null && <SourceBadge mode="RA" />}
              </h2>
              <button type="button" onClick={() => setModalOpen(false)} className="rounded p-1 hover:bg-muted">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
              <div className="space-y-1.5">
                <Label>会社 *</Label>
                <select
                  className="h-10 w-full rounded-md border border-input bg-white px-3 text-sm"
                  value={form.companyId}
                  onChange={e => {
                    if (e.target.value === '__add_company__') {
                      router.push('/dashboard/ra/companies')
                      return
                    }
                    setField('companyId', e.target.value)
                  }}
                  required
                >
                  <option value="__add_company__">＋ 会社を追加する</option>
                  {companies.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>求人タイトル *</Label>
                <Input value={form.title} onChange={e => setField('title', e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label>雇用形態</Label>
                <Input value={form.jobType} onChange={e => setField('jobType', e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>年収下限（万円）</Label>
                  <div className="flex items-center gap-2">
                    <Input type="number" min={0} value={form.salaryMin} onChange={e => setField('salaryMin', e.target.value)} />
                    <span className="text-sm text-muted-foreground">万円</span>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>年収上限（万円）</Label>
                  <div className="flex items-center gap-2">
                    <Input type="number" min={0} value={form.salaryMax} onChange={e => setField('salaryMax', e.target.value)} />
                    <span className="text-sm text-muted-foreground">万円</span>
                  </div>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>公開状態</Label>
                <select className="h-10 w-full rounded-md border border-input bg-white px-3 text-sm" value={form.status} onChange={e => setField('status', e.target.value as JobStatus)}>
                  <option value="open">open</option>
                  <option value="closed">closed</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>サムネイル画像</Label>
                <div className="flex items-start gap-3">
                  {/* プレビュー */}
                  <div className="flex h-24 w-32 shrink-0 items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-input bg-muted/30">
                    {thumbnailPreview ?? form.thumbnailUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={thumbnailPreview ?? form.thumbnailUrl}
                        alt="サムネイルプレビュー"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <ImagePlus className="h-7 w-7 text-muted-foreground/50" />
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="cursor-pointer">
                      <span className="inline-flex h-9 items-center rounded-md border border-input bg-white px-3 text-sm hover:bg-muted">
                        {uploading ? (
                          <><Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />アップロード中...</>
                        ) : '画像を選択'}
                      </span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        className="sr-only"
                        onChange={e => {
                          const f = e.target.files?.[0] ?? null
                          setThumbnailFile(f)
                          if (f) {
                            const reader = new FileReader()
                            reader.onload = ev => setThumbnailPreview(ev.target?.result as string)
                            reader.readAsDataURL(f)
                          } else {
                            setThumbnailPreview(null)
                          }
                        }}
                      />
                    </label>
                    {(thumbnailPreview ?? form.thumbnailUrl) && (
                      <button
                        type="button"
                        className="text-xs text-destructive hover:underline"
                        onClick={() => {
                          setThumbnailFile(null)
                          setThumbnailPreview(null)
                          setField('thumbnailUrl', undefined)
                        }}
                      >
                        画像を削除
                      </button>
                    )}
                    <p className="text-[11px] text-muted-foreground">JPEG / PNG / WebP / GIF, 5 MB 以下</p>
                  </div>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>求人詳細</Label>
                <RichTextEditor key={formKey} defaultValue={form.description} onChange={v => setField('description', v)} placeholder="求人の詳細情報を入力..." />
              </div>
              <div className="flex gap-2 pt-1">
                <Button type="submit" disabled={saving}>{saving ? '保存中...' : form.id ? '更新する' : '追加する'}</Button>
                <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>キャンセル</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-6xl p-4 md:p-8">
        <div className="mb-6 border-b border-border pb-5">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">RA モード / 求人管理</h1>
        </div>

        <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
          <Button className="h-12 gap-2 px-6 text-base" onClick={openNew}>
            <Plus className="h-5 w-5" />
            求人追加
          </Button>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">状態:</span>
            <select className="h-10 min-w-40 rounded-md border border-input bg-white px-3 text-sm" value={statusFilter} onChange={e => setStatusFilter(e.target.value as typeof statusFilter)}>
              <option value="all">すべて</option>
              <option value="open">公開中</option>
              <option value="closed">非公開</option>
            </select>
            <div className="flex items-center rounded-md border border-input bg-white">
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`flex h-10 w-10 items-center justify-center rounded-l-md transition-colors ${
                  viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                }`}
                aria-label="リスト表示"
              >
                <List className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('gallery')}
                className={`flex h-10 w-10 items-center justify-center rounded-r-md border-l border-input transition-colors ${
                  viewMode === 'gallery' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                }`}
                aria-label="ギャラリー表示"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="mb-4 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input value={keyword} onChange={e => setKeyword(e.target.value)} placeholder="求人タイトル・会社名・雇用形態などのキーワード" className="h-12 pl-12 text-base" />
          </div>
          <Button variant="ghost" size="icon" className="h-10 w-10"><SlidersHorizontal className="h-5 w-5" /></Button>
        </div>

        {viewMode === 'gallery' && (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map(job => {
              const companyName = companyNameMap.get(job.companyId) ?? '-'
              const detailHref = job.sourceMode === 'RA' ? `/dashboard/ra/jobs/${job.id}` : `/dashboard/jobs/${job.id}`
              return (
                <div key={job.id} className="relative flex flex-col rounded-xl border border-border bg-white shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                  {/* サムネイル */}
                  {job.thumbnailUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={job.thumbnailUrl}
                      alt={job.title}
                      className="h-36 w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-20 items-center justify-center bg-muted/30">
                      <ImagePlus className="h-7 w-7 text-muted-foreground/30" />
                    </div>
                  )}
                  {/* ソースリボン */}
                  <div className={`absolute top-0 left-0 px-3 py-1 text-[10px] font-bold tracking-wide text-white ${
                    job.sourceMode === 'RA' ? 'bg-sky-500' : 'bg-amber-500'
                  }`}>
                    {job.sourceMode === 'RA' ? 'RA' : '採用担当'}
                  </div>

                  {/* 年収バッジ */}
                  {(job.salaryMin != null || job.salaryMax != null) && (
                    <div className="absolute top-0 right-0 bg-rose-600 text-white text-xs font-bold px-3 py-1">
                      {job.salaryMax != null
                        ? `${job.salaryMax.toLocaleString()}万円`
                        : `${job.salaryMin!.toLocaleString()}万円〜`}
                    </div>
                  )}

                  {/* カードボディ */}
                  <div className="flex flex-col gap-3 px-5 pt-9 pb-4 flex-1">
                    {/* タグ行 */}
                    <div className="flex flex-wrap gap-1.5">
                      {job.jobType && (
                        <span className="inline-flex items-center rounded border border-sky-300 bg-sky-50 px-2 py-0.5 text-[11px] text-sky-700">
                          {job.jobType}
                        </span>
                      )}
                      <span className={`inline-flex items-center rounded border px-2 py-0.5 text-[11px] ${
                        job.status === 'open'
                          ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                          : 'border-muted bg-muted text-muted-foreground'
                      }`}>
                        {job.status === 'open' ? '公開中' : '非公開'}
                      </span>
                    </div>

                    {/* タイトル */}
                    <Link href={detailHref} className="font-bold text-sm leading-snug text-foreground hover:underline line-clamp-3">
                      {job.title}
                    </Link>

                    {/* 会社名 */}
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Building2 className="h-3.5 w-3.5 shrink-0" />
                      <Link href={`/dashboard/ra/companies/${job.companyId}`} className="hover:underline truncate">
                        {companyName}
                      </Link>
                    </div>

                    {/* 詳細情報 */}
                    <dl className="space-y-1">
                      {job.jobType && (
                        <div className="flex items-center gap-2 text-xs">
                          <Briefcase className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                          <dt className="w-14 shrink-0 text-muted-foreground">雇用形態</dt>
                          <dd>{job.jobType}</dd>
                        </div>
                      )}
                      {(job.salaryMin != null || job.salaryMax != null) && (
                        <div className="flex items-center gap-2 text-xs">
                          <Banknote className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                          <dt className="w-14 shrink-0 text-muted-foreground">年収</dt>
                          <dd>
                            {job.salaryMin != null ? `${job.salaryMin.toLocaleString()}万円` : ''}
                            {job.salaryMin != null && job.salaryMax != null ? '〜' : ''}
                            {job.salaryMax != null ? `${job.salaryMax.toLocaleString()}万円` : ''}
                          </dd>
                        </div>
                      )}
                    </dl>
                  </div>

                  {/* フッター */}
                  <div className="flex items-center justify-between border-t border-border px-5 py-3">
                    <span className="text-[10px] text-muted-foreground">
                      更新: {formatDate(job.updatedAt)}
                    </span>
                    <div className="flex items-center gap-1">
                      <button type="button" className="rounded p-1.5 hover:bg-muted" aria-label="保存" title="保存">
                        <Star className="h-3.5 w-3.5 text-muted-foreground" />
                      </button>
                      <button type="button" className="rounded p-1.5 hover:bg-muted" aria-label="ブックマーク" title="ブックマーク">
                        <BookmarkPlus className="h-3.5 w-3.5 text-muted-foreground" />
                      </button>
                      {mode === 'CA' && (
                        <button type="button" className="rounded p-1.5 hover:bg-muted" aria-label="求職者を選択" title="求職者を選択" onClick={() => { setSelectorJob({ jobId: job.id, companyId: job.companyId }); setOpenSelector(true) }}>
                          <UserPlus className="h-3.5 w-3.5 text-muted-foreground" />
                        </button>
                      )}
                      <Link
                        href={detailHref}
                        className="ml-1 inline-flex items-center gap-1 rounded bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
                      >
                        詳細
                      </Link>
                      {job.sourceMode === 'RA' && (
                        <button
                          type="button"
                          className="rounded px-2 py-1.5 text-xs text-destructive hover:bg-destructive/10"
                          onClick={() => void handleDelete(job.id)}
                        >
                          削除
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
            {filtered.length === 0 && (
              <p className="col-span-full py-10 text-center text-sm text-muted-foreground">
                {keyword || statusFilter !== 'all' ? '条件に一致する求人が見つかりません' : 'まだ求人が登録されていません'}
              </p>
            )}
          </div>
        )}

        {viewMode === 'list' && (
        <div className="overflow-x-auto rounded-md border bg-white">
          <table className="w-full min-w-[900px] border-collapse text-sm">
            <thead>
              <tr className="border-b bg-muted/30 text-left text-muted-foreground">
                  <th className="w-14 px-4 py-3"><input type="checkbox" aria-label="all" className="h-5 w-5" /></th>
                  <th className="px-4 py-3">求人タイトル</th>
                  <th className="px-4 py-3">会社</th>
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
                  <td className="px-4 py-4 align-top"><input type="checkbox" aria-label={job.title} className="h-5 w-5" /></td>
                    <td className="px-4 py-4 align-top font-medium">
                      <Link
                        href={job.sourceMode === 'RA' ? `/dashboard/ra/jobs/${job.id}` : `/dashboard/jobs/${job.id}`}
                        className="text-foreground hover:underline"
                      >
                        {job.title}
                      </Link>
                    </td>
                    <td className="px-4 py-4 align-top">
                      <Link href={`/dashboard/companies/${job.companyId}`} className="text-foreground hover:underline">{companyNameMap.get(job.companyId) ?? '-'}</Link>
                    </td>
                  <td className="px-4 py-4 align-top">{job.jobType ?? '-'}</td>
                  <td className="px-4 py-4 align-top">{job.salaryMin ?? '-'}{job.salaryMax ? ` 〜 ${job.salaryMax}` : ''}</td>
                  <td className="px-4 py-4 align-top">{job.status}</td>
                  <td className="px-4 py-4 align-top"><SourceBadge mode={job.sourceMode} /></td>
                  <td className="px-4 py-4 align-top">{formatDate(job.updatedAt)}</td>
                  <td className="px-4 py-4 align-top">
                    <div className="flex items-center justify-end gap-1">
                      {job.sourceMode === 'RA' ? (
                        <>
                          {mode === 'CA' && (
                            <button type="button" className="rounded px-2 py-1 hover:bg-muted inline-flex items-center" aria-label="求職者を選択" title="求職者を選択" onClick={() => { setSelectorJob({ jobId: job.id, companyId: job.companyId }); setOpenSelector(true) }}>
                              <UserPlus className="h-5 w-5" />
                            </button>
                          )}
                          <Link href={`/dashboard/ra/jobs/${job.id}`} className="rounded px-2 py-1 hover:bg-muted inline-flex items-center" aria-label="詳細">
                            <Ellipsis className="h-5 w-5" />
                          </Link>
                          <button type="button" className="rounded px-2 py-1 text-sm text-destructive hover:bg-destructive/10" onClick={() => void handleDelete(job.id)}>削除</button>
                        </>
                      ) : (
                        <span className="text-muted-foreground">閲覧のみ</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-muted-foreground">{keyword || statusFilter !== 'all' ? '条件に一致する求人が見つかりません' : 'まだ求人が登録されていません'}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        )}
      </div>
      {openSelector && selectorJob && (
        <CandidateSelector
          jobId={selectorJob.jobId}
          companyId={selectorJob.companyId}
          onClose={() => { setOpenSelector(false); setSelectorJob(null) }}
          onApplied={reloadJobs}
        />
      )}
    </>
  )
}


'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Search, SlidersHorizontal, Ellipsis, Building2, Plus, X } from 'lucide-react'
import { toast } from 'sonner'
import type { Company } from '@/types/recruiting'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RichTextEditor } from '@/components/ui/rich-text-editor'
import type { PublishStatus } from '@/types/recruiting'

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('ja-JP')
}

export function RaCompaniesManager({ initialCompanies }: { initialCompanies: Company[] }) {
  const [keyword, setKeyword] = useState('')
  const [industryFilter, setIndustryFilter] = useState('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formKey, setFormKey] = useState(0)
  const [form, setForm] = useState<{ id?: string; name: string; companyNumber: string; publishStatus: PublishStatus; industry: string; location: string; officialWebsite: string; memo: string }>(() => ({ name: '', companyNumber: '', publishStatus: 'published', industry: '', location: '', officialWebsite: '', memo: '' }))

  const industries = useMemo(() => {
    const set = new Set<string>()
    for (const c of initialCompanies) {
      if (c.industry) set.add(c.industry)
    }
    return Array.from(set).sort()
  }, [initialCompanies])

  const filtered = useMemo(() => {
    const lower = keyword.toLowerCase()
    return initialCompanies.filter(company => {
      const text = [company.name, company.industry, company.location, company.memo]
        .filter(Boolean).join(' ').toLowerCase()
      const matchKw = !lower || text.includes(lower)
      const matchIndustry = industryFilter === 'all' || company.industry === industryFilter
      return matchKw && matchIndustry
    })
  }, [initialCompanies, keyword, industryFilter])

  function openNew() {
    setForm({ name: '', companyNumber: '', publishStatus: 'published', industry: '', location: '', officialWebsite: '', memo: '' })
    setFormKey(k => k + 1)
    setModalOpen(true)
  }

  // edit flow is available via the detail page for now

  function handleChange<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  async function reload() {
    const res = await fetch('/api/companies')
    if (!res.ok) return
    // replace list in-place by reloading page data client-side
    await res.json().catch(() => ({}))
    // simple replace: mutate initialCompanies reference isn't ideal, but update via state by re-rendering is complex here
    // For now, refresh by reloading the window to get server props
    window.location.reload()
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const payload = { name: form.name, companyNumber: form.companyNumber || undefined, publishStatus: form.publishStatus, industry: form.industry || undefined, location: form.location || undefined, officialWebsite: form.officialWebsite || undefined, memo: form.memo || undefined }
    const method = form.id ? 'PUT' : 'POST'
    const url = form.id ? `/api/companies?id=${form.id}` : '/api/companies'
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      toast.error(data.error ?? '保存に失敗しました')
      setSaving(false)
      return
    }
    setModalOpen(false)
    await reload()
    setSaving(false)
  }

  // deletion is handled on the company detail page

  return (
    <div className="mx-auto max-w-6xl p-4 md:p-8">
      <div className="mb-6 border-b border-border pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">企業管理</h1>
      </div>

      {/* ツールバー */}
      <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <Button className="h-12 gap-2 px-6 text-base" onClick={openNew}>
            <Plus className="h-5 w-5" />
            企業を追加
          </Button>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">業界:</span>
          <select
            className="h-10 min-w-48 rounded-md border border-input bg-white px-3 text-sm"
            value={industryFilter}
            onChange={e => setIndustryFilter(e.target.value)}
          >
            <option value="all">すべて</option>
            {industries.map(ind => (
              <option key={ind} value={ind}>{ind}</option>
            ))}
          </select>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/30 pt-16 pb-8">
          <div className="w-full max-w-lg rounded-lg border border-border bg-white shadow-xl">
            <div className="flex items-center justify-between border-b px-6 py-4">
              <h2 className="text-base font-semibold">{form.id ? '企業を編集' : '企業を追加'}</h2>
              <button type="button" onClick={() => setModalOpen(false)} className="rounded p-1 hover:bg-muted">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>企業No.</Label>
                  <Input value={form.companyNumber} onChange={e => handleChange('companyNumber', e.target.value)} placeholder="例: C-001" />
                </div>
                <div className="space-y-1.5">
                  <Label>公開ステータス</Label>
                  <select
                    className="h-10 w-full rounded-md border border-input bg-white px-3 text-sm"
                    value={form.publishStatus}
                    onChange={e => handleChange('publishStatus', e.target.value as PublishStatus)}
                  >
                    <option value="published">公開</option>
                    <option value="suspended">一時停止</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>企業名 *</Label>
                <Input value={form.name} onChange={e => handleChange('name', e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label>業界</Label>
                <Input value={form.industry} onChange={e => handleChange('industry', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>所在地</Label>
                <Input value={form.location} onChange={e => handleChange('location', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>公式サイト</Label>
                <Input value={form.officialWebsite} onChange={e => handleChange('officialWebsite', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>メモ</Label>
                <RichTextEditor key={formKey} defaultValue={form.memo} onChange={v => handleChange('memo', v)} placeholder="企業に関するメモを入力..." />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={saving}>{saving ? '保存中...' : form.id ? '更新する' : '追加する'}</Button>
                <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>キャンセル</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 検索バー */}
      <div className="mb-4 flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
            placeholder="企業名・業界・所在地などのキーワード"
            className="h-12 pl-12 text-base"
          />
        </div>
        <Button variant="ghost" size="icon" className="h-10 w-10">
          <SlidersHorizontal className="h-5 w-5" />
        </Button>
      </div>

      {/* テーブル */}
      <div className="overflow-x-auto rounded-md border bg-white">
        <table className="w-full min-w-[900px] border-collapse text-sm">
          <thead>
            <tr className="border-b bg-muted/30 text-left text-muted-foreground">
              <th className="w-14 px-4 py-3">
                <input type="checkbox" aria-label="all" className="h-5 w-5" />
              </th>
              <th className="px-4 py-3">No.</th>
              <th className="px-4 py-3">企業名</th>
              <th className="px-4 py-3">状態</th>
              <th className="px-4 py-3">業界</th>
              <th className="px-4 py-3">募集状況</th>
              <th className="px-4 py-3">難易度</th>
              <th className="px-4 py-3">登録日</th>
              <th className="w-20 px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {filtered.map(company => (
              <tr key={company.id} className="border-b">
                <td className="px-4 py-4 align-top">
                  <input type="checkbox" aria-label={company.name} className="h-5 w-5" />
                </td>
                <td className="px-4 py-4 align-top text-muted-foreground">
                  {company.companyNumber ?? <span className="text-muted-foreground/30">-</span>}
                </td>
                <td className="px-4 py-4 align-top">
                  <Link
                    href={`/dashboard/ra/companies/${company.id}`}
                    className="inline-flex items-center gap-1.5 font-medium text-foreground hover:underline"
                  >
                    <Building2 className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    {company.name}
                  </Link>
                </td>
                <td className="px-4 py-4 align-top">
                  {company.publishStatus === 'published' ? (
                    <Badge variant="secondary" className="bg-green-50 text-green-700 border border-green-200">外部公開</Badge>
                  ) : company.publishStatus === 'ca_ra' ? (
                    <Badge variant="secondary" className="bg-blue-50 text-blue-700 border border-blue-200">CA・RA公開</Badge>
                  ) : company.publishStatus === 'ra_only' ? (
                    <Badge variant="secondary" className="bg-yellow-50 text-yellow-700 border border-yellow-200">RA公開</Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-muted text-muted-foreground">非公開</Badge>
                  )}
                </td>
                <td className="px-4 py-4 align-top">
                  {company.industries && company.industries.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {company.industries.map(ind => (
                        <Badge key={ind} variant="secondary">{ind}</Badge>
                      ))}
                    </div>
                  ) : company.industry ? (
                    <Badge variant="secondary">{company.industry}</Badge>
                  ) : (
                    <span className="text-muted-foreground/50">-</span>
                  )}
                </td>
                <td className="px-4 py-4 align-top">
                  {company.recruitingStatus === 'active' ? (
                    <Badge variant="secondary" className="bg-sky-50 text-sky-700 border border-sky-200">積極採用</Badge>
                  ) : company.recruitingStatus === 'fulfilled' ? (
                    <Badge variant="secondary" className="bg-muted text-muted-foreground">採用充足</Badge>
                  ) : (
                    <span className="text-muted-foreground/50">-</span>
                  )}
                </td>
                <td className="px-4 py-4 align-top">
                  {company.hiringDifficulty ? (
                    <span className="font-mono font-semibold">{company.hiringDifficulty}</span>
                  ) : (
                    <span className="text-muted-foreground/50">-</span>
                  )}
                </td>
                <td className="px-4 py-4 align-top text-muted-foreground">{formatDate(company.createdAt)}</td>
                <td className="px-4 py-4 align-top">
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      href={`/dashboard/ra/companies/${company.id}`}
                      className="rounded px-2 py-1 hover:bg-muted"
                      aria-label="詳細"
                    >
                      <Ellipsis className="h-5 w-5" />
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">
                  {keyword || industryFilter !== 'all' ? '条件に一致する企業が見つかりませんでした' : '企業がまだ登録されていません'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

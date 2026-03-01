"use client"

import { useState } from 'react'
import { Plus, Search, X, Ellipsis } from 'lucide-react'
import { toast } from 'sonner'
import type { MessageTemplate } from '@/types/recruiting'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RichTextEditor } from '@/components/ui/rich-text-editor'

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('ja-JP')
}

type TemplateFormState = {
  id?: string
  title: string
  category: string
  content: string
}

const emptyForm = (): TemplateFormState => ({ title: '', category: '', content: '' })

function TemplateFormModal({ form, saving, formKey, onClose, onSubmit, onChange }: {
  form: TemplateFormState
  saving: boolean
  formKey: number
  onClose: () => void
  onSubmit: (e: React.FormEvent) => void
  onChange: <K extends keyof TemplateFormState>(key: K, value: TemplateFormState[K]) => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/30 pt-16 pb-8">
      <div className="w-full max-w-lg rounded-lg border border-border bg-white shadow-xl">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-base font-semibold">{form.id ? 'テンプレートを編集' : 'テンプレートを追加'}</h2>
          <button type="button" onClick={onClose} className="rounded p-1 hover:bg-muted">
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={onSubmit} className="space-y-4 px-6 py-5">
          <div className="space-y-1.5">
            <Label>タイトル *</Label>
            <Input value={form.title} onChange={e => onChange('title', e.target.value)} required />
          </div>
          <div className="space-y-1.5">
            <Label>カテゴリ</Label>
            <Input value={form.category} onChange={e => onChange('category', e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>本文 *</Label>
            <RichTextEditor key={formKey} defaultValue={form.content} onChange={v => onChange('content', v)} placeholder="テンプレートの本文を入力..." minHeight="150px" />
          </div>
          <div className="flex gap-2 pt-1">
            <Button type="submit" disabled={saving}>{saving ? '保存中...' : form.id ? '更新する' : '追加する'}</Button>
            <Button type="button" variant="outline" onClick={onClose}>キャンセル</Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function RaTemplatesManager({ initialTemplates }: { initialTemplates: MessageTemplate[] }) {
  const [templates, setTemplates] = useState<MessageTemplate[]>(initialTemplates)
  const [keyword, setKeyword] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formKey, setFormKey] = useState(0)
  const [form, setForm] = useState<TemplateFormState>(emptyForm)

  function openNew() {
    setForm(emptyForm())
    setFormKey(k => k + 1)
    setModalOpen(true)
  }

  function openEdit(t: MessageTemplate) {
    setForm({ id: t.id, title: t.title, category: t.category ?? '', content: t.content })
    setFormKey(k => k + 1)
    setModalOpen(true)
  }

  function handleChange<K extends keyof TemplateFormState>(key: K, value: TemplateFormState[K]) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  async function reload() {
    const res = await fetch('/api/templates?mode=ra')
    if (!res.ok) return
    setTemplates(await res.json())
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const payload = { title: form.title, content: form.content, category: form.category || undefined }
    const method = form.id ? 'PUT' : 'POST'
    const url = form.id ? `/api/templates?mode=ra&id=${form.id}` : '/api/templates?mode=ra'
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    if (!res.ok) {
      toast.error((await res.json().catch(() => ({}))).error ?? '保存に失敗しました')
      setSaving(false)
      return
    }
    toast.success(form.id ? 'テンプレートを更新しました' : 'テンプレートを追加しました')
    setModalOpen(false)
    await reload()
    setSaving(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('このテンプレートを削除しますか？')) return
    const res = await fetch(`/api/templates?mode=ra&id=${id}`, { method: 'DELETE' })
    if (!res.ok) {
      toast.error((await res.json().catch(() => ({}))).error ?? '削除に失敗しました')
      return
    }
    toast.success('テンプレートを削除しました')
    await reload()
  }

  const filtered = templates.filter(t => {
    const kw = keyword.trim().toLowerCase()
    if (!kw) return true
    return [t.title, t.category ?? '', t.content].join(' ').toLowerCase().includes(kw)
  })

  return (
    <>
      {modalOpen && (
        <TemplateFormModal form={form} saving={saving} formKey={formKey} onClose={() => setModalOpen(false)} onSubmit={handleSubmit} onChange={handleChange} />
      )}

      <div className="mx-auto max-w-6xl p-4 md:p-8">
        <div className="mb-6 border-b border-border pb-5">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">RAテンプレート</h1>
        </div>

        <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
          <Button className="h-12 gap-2 px-6 text-base" onClick={openNew}>
            <Plus className="h-5 w-5" />
            新しいテンプレート
          </Button>
        </div>

        <div className="mb-4 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input value={keyword} onChange={e => setKeyword(e.target.value)} placeholder="タイトル・カテゴリ・本文で検索" className="h-12 pl-12 text-base" />
          </div>
        </div>

        <div className="overflow-x-auto rounded-md border bg-white">
          <table className="w-full min-w-[800px] border-collapse text-sm">
            <thead>
              <tr className="border-b bg-muted/30 text-left text-muted-foreground">
                <th className="w-14 px-4 py-3"><input type="checkbox" aria-label="all" className="h-5 w-5" /></th>
                <th className="px-4 py-3">タイトル</th>
                <th className="px-4 py-3">カテゴリ</th>
                <th className="px-4 py-3">本文</th>
                <th className="px-4 py-3">作成日</th>
                <th className="w-20 px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map(t => (
                <tr key={t.id} className="border-b">
                  <td className="px-4 py-4 align-top"><input type="checkbox" aria-label={t.title} className="h-5 w-5" /></td>
                  <td className="px-4 py-4 align-top font-medium">{t.title}</td>
                  <td className="px-4 py-4 align-top">{t.category ?? '-'}</td>
                  <td className="px-4 py-4 align-top text-muted-foreground">{t.content.length > 100 ? `${t.content.slice(0, 100)}...` : t.content}</td>
                  <td className="px-4 py-4 align-top">{formatDate(t.createdAt)}</td>
                  <td className="px-4 py-4 align-top">
                    <div className="flex items-center justify-end gap-1">
                      <button type="button" className="rounded px-2 py-1 hover:bg-muted" onClick={() => openEdit(t)} aria-label="編集"><Ellipsis className="h-5 w-5" /></button>
                      <button type="button" className="rounded px-2 py-1 text-sm text-destructive hover:bg-destructive/10" onClick={() => handleDelete(t.id)}>削除</button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">テンプレートが見つかりません</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}

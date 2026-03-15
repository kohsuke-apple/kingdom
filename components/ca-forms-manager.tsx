'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { Plus, Copy, Trash2, CheckCircle2, Clock, ExternalLink, X } from 'lucide-react'
import type { CandidateForm } from '@/types/recruiting'

export function CaFormsManager() {
  const [forms, setForms] = useState<CandidateForm[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [label, setLabel] = useState('')
  const [expiresAt, setExpiresAt] = useState('')
  const [creating, setCreating] = useState(false)

  useEffect(() => { fetchForms() }, [])

  async function fetchForms() {
    setLoading(true)
    try {
      const res = await fetch('/api/candidate-forms')
      const data = await res.json()
      setForms(Array.isArray(data) ? data : [])
    } catch {
      toast.error('読み込みに失敗しました')
    } finally {
      setLoading(false)
    }
  }

  async function createForm() {
    setCreating(true)
    try {
      const res = await fetch('/api/candidate-forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label: label || undefined, expiresAt: expiresAt || undefined }),
      })
      if (!res.ok) throw new Error()
      const form: CandidateForm = await res.json()
      setForms(prev => [form, ...prev])
      setModalOpen(false)
      setLabel('')
      setExpiresAt('')
      toast.success('フォームリンクを作成しました')
      // 作成直後にURLをコピー
      copyUrl(form.token)
    } catch {
      toast.error('作成に失敗しました')
    } finally {
      setCreating(false)
    }
  }

  function getFormUrl(token: string) {
    return `${window.location.origin}/apply/${token}`
  }

  function copyUrl(token: string) {
    navigator.clipboard.writeText(getFormUrl(token))
      .then(() => toast.success('URLをコピーしました'))
      .catch(() => toast.error('コピーに失敗しました'))
  }

  async function deleteForm(id: string) {
    if (!confirm('このフォームリンクを削除しますか？')) return
    try {
      const res = await fetch(`/api/candidate-forms?id=${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      setForms(prev => prev.filter(f => f.id !== id))
      toast.success('削除しました')
    } catch {
      toast.error('削除に失敗しました')
    }
  }

  const pendingCount = forms.filter(f => f.status === 'pending').length
  const submittedCount = forms.filter(f => f.status === 'submitted').length

  return (
    <div>
      {/* サマリー */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6 max-w-lg">
        <SummaryCard label="回答待ち" value={pendingCount} color="text-amber-600" />
        <SummaryCard label="回答済み" value={submittedCount} color="text-green-600" />
        <SummaryCard label="合計" value={forms.length} color="text-foreground" />
      </div>

      {/* アクション */}
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-muted-foreground">{forms.length} 件のフォームリンク</p>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 text-sm font-semibold text-white bg-foreground hover:bg-foreground/80 px-3 py-2 rounded-md transition-colors"
        >
          <Plus className="w-4 h-4" />
          新しいリンクを作成
        </button>
      </div>

      {/* フォームリスト */}
      {loading ? (
        <p className="text-sm text-muted-foreground py-8 text-center">読み込み中…</p>
      ) : forms.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground border border-dashed border-border rounded-lg">
          <p className="text-sm mb-2">フォームリンクがありません</p>
          <p className="text-xs">「新しいリンクを作成」からURLを発行してください</p>
        </div>
      ) : (
        <div className="space-y-3 max-w-2xl">
          {forms.map(form => {
            const isExpired = form.expiresAt && new Date(form.expiresAt) < new Date()
            const isSubmitted = form.status === 'submitted'

            return (
              <div
                key={form.id}
                className="bg-white border border-border rounded-lg p-4 flex flex-col sm:flex-row sm:items-center gap-3"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {isSubmitted ? (
                      <span className="flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3" /> 回答済み
                      </span>
                    ) : isExpired ? (
                      <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">期限切れ</span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                        <Clock className="w-3 h-3" /> 回答待ち
                      </span>
                    )}
                    {form.label && (
                      <span className="text-sm font-semibold text-foreground truncate">{form.label}</span>
                    )}
                  </div>

                  <p className="text-xs text-muted-foreground font-mono truncate">
                    /apply/{form.token}
                  </p>

                  <div className="flex gap-3 mt-1 text-xs text-muted-foreground">
                    <span>作成: {new Date(form.createdAt).toLocaleDateString('ja-JP')}</span>
                    {form.expiresAt && (
                      <span className={isExpired ? 'text-red-500' : ''}>
                        期限: {new Date(form.expiresAt).toLocaleDateString('ja-JP')}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {isSubmitted && form.candidateId && (
                    <Link
                      href={`/dashboard/ca/candidates/${form.candidateId}`}
                      className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 border border-blue-200 px-2.5 py-1.5 rounded-md transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" />
                      候補者を見る
                    </Link>
                  )}
                  {!isSubmitted && !isExpired && (
                    <button
                      onClick={() => copyUrl(form.token)}
                      className="flex items-center gap-1 text-xs font-semibold border border-border px-2.5 py-1.5 rounded-md hover:bg-muted transition-colors"
                    >
                      <Copy className="w-3 h-3" />
                      URLをコピー
                    </button>
                  )}
                  <button
                    onClick={() => deleteForm(form.id)}
                    className="p-1.5 text-muted-foreground hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* 作成モーダル */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="text-sm font-bold">フォームリンクを作成</h2>
              <button onClick={() => setModalOpen(false)}>
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                  ラベル（任意）
                </label>
                <input
                  type="text"
                  value={label}
                  onChange={e => setLabel(e.target.value)}
                  placeholder="例: 田中さん用、〇〇求人向け"
                  className="w-full text-sm border border-border rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-foreground"
                />
                <p className="text-xs text-muted-foreground mt-1">自分が識別するためのメモです。求職者には表示されません。</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                  有効期限（任意）
                </label>
                <input
                  type="date"
                  value={expiresAt}
                  onChange={e => setExpiresAt(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full text-sm border border-border rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-foreground"
                />
              </div>
              <div className="bg-blue-50 text-blue-700 text-xs rounded-lg p-3">
                作成後、URLが自動でコピーされます。メール・LINE などで求職者に共有してください。
              </div>
            </div>
            <div className="flex justify-end gap-2 px-6 py-4 border-t border-border">
              <button
                onClick={() => setModalOpen(false)}
                className="text-sm px-4 py-2 border border-border rounded-md hover:bg-muted transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={createForm}
                disabled={creating}
                className="text-sm font-semibold px-4 py-2 bg-foreground text-background rounded-md hover:bg-foreground/80 disabled:opacity-50 transition-colors"
              >
                {creating ? '作成中…' : '作成してURLをコピー'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function SummaryCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-white border border-border rounded-lg px-4 py-3">
      <div className={`text-2xl font-black ${color}`}>{value}</div>
      <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
    </div>
  )
}

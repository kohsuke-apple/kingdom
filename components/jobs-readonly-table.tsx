'use client'

import { useState, useRef, useEffect } from 'react'
import type { Company, Job, SavedJob } from '@/types/recruiting'
import Link from 'next/link'
import { Bookmark, X, Plus } from 'lucide-react'

function BookmarkCell({ job, savedJobs, onChange }: {
  job: Job
  savedJobs: SavedJob[]
  onChange: (next: SavedJob[]) => void
}) {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const ref = useRef<HTMLTableDataCellElement>(null)

  const entries = savedJobs.filter(s => s.jobId === job.id)
  const isSaved = entries.length > 0

  // 全カテゴリの一覧（重複なし）
  const allCategories = Array.from(new Set(savedJobs.map(s => s.customCategory))).sort((a, b) =>
    a.localeCompare(b, 'ja')
  )
  // この求人にまだ追加されていないカテゴリ
  const savedCategories = new Set(entries.map(e => e.customCategory))
  const quickCategories = allCategories.filter(c => !savedCategories.has(c))

  useEffect(() => {
    if (!open) return
    function onMouseDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [open])

  async function handleAdd(category: string) {
    if (!category.trim()) return
    setLoading(true)
    try {
      const res = await fetch('/api/saved-jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId: job.id, customCategory: category.trim() }),
      })
      if (res.ok) {
        const created: SavedJob = await res.json()
        onChange([...savedJobs, created])
        setInput('')
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    setLoading(true)
    try {
      const res = await fetch(`/api/saved-jobs?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        onChange(savedJobs.filter(s => s.id !== id))
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <td className="px-3 py-3 relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="rounded p-1 hover:bg-muted transition-colors"
        title="保存求人に追加"
      >
        <Bookmark
          className={`h-4 w-4 ${isSaved ? 'fill-blue-500 text-blue-500' : 'text-muted-foreground'}`}
        />
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-1 w-64 rounded-md border bg-white shadow-lg p-3 space-y-2 top-full">
          <p className="text-xs font-semibold text-muted-foreground">カテゴリ</p>

          {entries.length > 0 ? (
            <ul className="space-y-1">
              {entries.map(e => (
                <li key={e.id} className="flex items-center justify-between rounded bg-blue-50 px-2 py-1 text-xs">
                  <span className="truncate">{e.customCategory}</span>
                  <button
                    type="button"
                    onClick={() => handleDelete(e.id)}
                    disabled={loading}
                    className="ml-1 shrink-0 rounded hover:bg-blue-100 p-0.5"
                  >
                    <X className="h-3 w-3 text-blue-700" />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-muted-foreground">まだ保存されていません</p>
          )}

          {quickCategories.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">クイック追加</p>
              <div className="flex flex-wrap gap-1">
                {quickCategories.map(c => (
                  <button
                    key={c}
                    type="button"
                    disabled={loading}
                    onClick={() => handleAdd(c)}
                    className="rounded-full border px-2 py-0.5 text-xs hover:bg-muted"
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-1">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleAdd(input)
                }
              }}
              placeholder="新しいカテゴリ名"
              className="flex-1 rounded border px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
            />
            <button
              type="button"
              disabled={loading || !input.trim()}
              onClick={() => handleAdd(input)}
              className="rounded border px-2 py-1 text-xs hover:bg-muted disabled:opacity-50"
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>
        </div>
      )}
    </td>
  )
}

export function JobsReadonlyTable({
  jobs,
  companies,
  savedJobs: initialSavedJobs = [],
}: {
  jobs: Job[]
  companies: Company[]
  savedJobs?: SavedJob[]
}) {
  const companyMap = new Map(companies.map(company => [company.id, company.name]))
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>(initialSavedJobs)

  return (
    <div className="overflow-x-auto rounded-md border bg-white">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b bg-muted/30 text-left text-muted-foreground">
            <th className="px-4 py-3">会社</th>
            <th className="px-4 py-3">求人タイトル</th>
            <th className="px-4 py-3">雇用形態</th>
            <th className="px-4 py-3">年収</th>
            <th className="px-4 py-3">状態</th>
            <th className="px-4 py-3">更新日</th>
            <th className="px-3 py-3 w-10"></th>
          </tr>
        </thead>
        <tbody>
          {jobs.map(job => (
            <tr key={job.id} className="border-b">
              <td className="px-4 py-3">
                <Link href={`/dashboard/companies/${job.companyId}`} className="underline">
                  {companyMap.get(job.companyId) ?? '-'}
                </Link>
              </td>
              <td className="px-4 py-3 font-medium">{job.title}</td>
              <td className="px-4 py-3">{job.jobType ?? '-'}</td>
              <td className="px-4 py-3">
                {job.salaryMin ?? '-'}{job.salaryMax ? ` 〜 ${job.salaryMax}` : ''}
              </td>
              <td className="px-4 py-3">{job.status}</td>
              <td className="px-4 py-3">{new Date(job.updatedAt).toLocaleDateString('ja-JP')}</td>
              <BookmarkCell job={job} savedJobs={savedJobs} onChange={setSavedJobs} />
            </tr>
          ))}
          {jobs.length === 0 && (
            <tr>
              <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                公開中の求人はありません
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

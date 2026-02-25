'use client'

import { useState, useMemo } from 'react'
import type { Company, Job, SavedJob } from '@/types/recruiting'
import { Bookmark, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Props {
  savedJobs: SavedJob[]
  jobs: Job[]
  companies: Company[]
}

export function CaSavedJobsManager({ savedJobs: initialSavedJobs, jobs, companies }: Props) {
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>(initialSavedJobs)

  const jobMap = useMemo(() => new Map(jobs.map(j => [j.id, j])), [jobs])
  const companyMap = useMemo(() => new Map(companies.map(c => [c.id, c.name])), [companies])

  // カテゴリごとにグループ化（50音順）
  const grouped = useMemo(() => {
    const map = new Map<string, SavedJob[]>()
    for (const s of savedJobs) {
      const list = map.get(s.customCategory) ?? []
      list.push(s)
      map.set(s.customCategory, list)
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b, 'ja'))
  }, [savedJobs])

  async function handleDelete(id: string) {
    const res = await fetch(`/api/saved-jobs?id=${id}`, { method: 'DELETE' })
    if (res.ok) {
      setSavedJobs(prev => prev.filter(s => s.id !== id))
    }
  }

  if (savedJobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
        <Bookmark className="h-10 w-10 mb-3 opacity-30" />
        <p className="text-sm">保存した求人はありません</p>
        <p className="text-xs mt-1">求人検索ページのブックマークアイコンから保存できます</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {grouped.map(([category, entries]) => (
        <section key={category}>
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-base font-semibold">{category}</h2>
            <span className="text-xs text-muted-foreground">({entries.length}件)</span>
          </div>
          <div className="overflow-x-auto rounded-md border bg-white">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b bg-muted/30 text-left text-muted-foreground">
                  <th className="px-4 py-3">会社名</th>
                  <th className="px-4 py-3">求人タイトル</th>
                  <th className="px-4 py-3">雇用形態</th>
                  <th className="px-4 py-3">年収</th>
                  <th className="px-4 py-3">状態</th>
                  <th className="px-4 py-3 w-16">操作</th>
                </tr>
              </thead>
              <tbody>
                {entries.map(entry => {
                  const job = jobMap.get(entry.jobId)
                  return (
                    <tr key={entry.id} className="border-b last:border-b-0">
                      <td className="px-4 py-3">
                        {job ? (companyMap.get(job.companyId) ?? '-') : '-'}
                      </td>
                      <td className="px-4 py-3 font-medium">{job?.title ?? '（削除済み）'}</td>
                      <td className="px-4 py-3">{job?.jobType ?? '-'}</td>
                      <td className="px-4 py-3">
                        {job?.salaryMin ?? '-'}{job?.salaryMax ? ` 〜 ${job.salaryMax}` : ''}
                      </td>
                      <td className="px-4 py-3">{job?.status ?? '-'}</td>
                      <td className="px-4 py-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                          onClick={() => handleDelete(entry.id)}
                          title="削除"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </div>
  )
}

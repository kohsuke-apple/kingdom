'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import type { Company, Job, SavedJob } from '@/types/recruiting'

interface Props {
  savedJobs: SavedJob[]
  jobs: Job[]
  companies: Company[]
}

// カテゴリ名ごとに決定論的なグラデーション色を返す
const GRADIENTS = [
  'from-blue-500 to-blue-700',
  'from-orange-400 to-orange-600',
  'from-sky-500 to-sky-700',
  'from-violet-500 to-violet-700',
  'from-emerald-500 to-emerald-700',
  'from-rose-500 to-rose-700',
  'from-amber-500 to-amber-700',
  'from-teal-500 to-teal-700',
]

function gradientForCategory(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) & 0xffff
  return GRADIENTS[hash % GRADIENTS.length]
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('ja-JP', {
    year: 'numeric', month: 'long', day: 'numeric',
  })
}

function encodeCategory(cat: string) {
  return encodeURIComponent(cat)
}

export function CaSavedListsView({ savedJobs, jobs, companies }: Props) {
  const jobMap     = useMemo(() => new Map(jobs.map(j => [j.id, j])), [jobs])
  const companyMap = useMemo(() => new Map(companies.map(c => [c.id, c.name])), [companies])

  // カテゴリ別グループ化
  const groups = useMemo(() => {
    const map = new Map<string, SavedJob[]>()
    for (const s of savedJobs) {
      const cat = s.customCategory ?? '未分類'
      const arr = map.get(cat) ?? []
      arr.push(s)
      map.set(cat, arr)
    }
    // 更新日降順
    return Array.from(map.entries()).sort(([, a], [, b]) => {
      const latestA = a.reduce((m, x) => x.createdAt > m ? x.createdAt : m, '')
      const latestB = b.reduce((m, x) => x.createdAt > m ? x.createdAt : m, '')
      return latestB.localeCompare(latestA)
    })
  }, [savedJobs])

  if (groups.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
        <svg className="h-10 w-10 mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <p className="text-sm">保存した求人はありません</p>
        <p className="text-xs mt-1">求人検索ページのブックマークアイコンから保存できます</p>
      </div>
    )
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {groups.map(([category, entries]) => {
        const gradient = gradientForCategory(category)
        const latestDate = entries.reduce((m, x) => x.createdAt > m ? x.createdAt : m, '')
        const preview = entries.slice(0, 3)

        return (
          <Link
            key={category}
            href={`/dashboard/ca/saved/${encodeCategory(category)}`}
            className="group rounded-xl border border-border bg-white shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col"
          >
            {/* ─── ヘッダー：グラデーション背景 ─────────────────── */}
            <div className={`relative bg-gradient-to-br ${gradient} h-28 flex flex-col justify-end px-4 pb-3`}>
              {/* ノイズテクスチャ風オーバーレイ */}
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white to-transparent" />
              <div className="relative">
                <p className="text-white/80 text-[11px] font-medium tracking-wide">
                  {category}
                </p>
                <p className="text-white text-lg font-bold leading-tight">
                  {category}
                  <span className="ml-2 font-normal text-white/80 text-sm">({entries.length}件)</span>
                </p>
              </div>
            </div>

            {/* ─── 求人プレビュー ───────────────────────────────── */}
            <div className="flex-1 px-4 pt-3 pb-2 space-y-2.5">
              {preview.map(entry => {
                const job = jobMap.get(entry.jobId)
                const company = job ? (companyMap.get(job.companyId) ?? '') : ''
                return (
                  <div key={entry.id} className="space-y-0.5">
                    <p className="text-xs text-muted-foreground truncate">{company || '企業名なし'}</p>
                    <p className="text-[13px] font-medium leading-snug text-foreground line-clamp-2 group-hover:text-sky-600 transition-colors">
                      {job?.title ?? '（削除済み）'}
                    </p>
                  </div>
                )
              })}
              {entries.length > 3 && (
                <p className="text-xs text-muted-foreground pt-1">他 {entries.length - 3} 件…</p>
              )}
            </div>

            {/* ─── フッター ─────────────────────────────────────── */}
            <div className="px-4 py-2.5 border-t border-border/60 text-[11px] text-muted-foreground">
              更新日：{formatDate(latestDate)}
            </div>
          </Link>
        )
      })}
    </div>
  )
}

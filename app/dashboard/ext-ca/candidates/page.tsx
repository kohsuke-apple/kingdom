import { recruitingRepository } from '@/lib/recruiting-repository'
import Link from 'next/link'

export default async function ExtCaCandidatesPage() {
  // NOTE: placeholder — later restrict to "my candidates" / permitted ones
  let candidates: Awaited<ReturnType<typeof recruitingRepository.listCandidates>> = []
  try {
    candidates = await recruitingRepository.listCandidates()
  } catch {
    // Supabase 停止中またはネットワーク障害時は空リストで表示を継続
  }

  return (
    <div className="mx-auto max-w-6xl p-4 md:p-8">
      <div className="mb-6 border-b border-border pb-5">
        <h1 className="text-2xl font-bold">候補者（自分の候補者のみ表示）</h1>
      </div>
      <div className="rounded-md border bg-white">
        <ul>
          {candidates.map(c => (
            <li key={c.id} className="px-6 py-4 border-b">
              <Link href={`/dashboard/ca/candidates/${c.id}`} className="font-medium text-foreground hover:underline">{c.name}</Link>
              <div className="text-sm text-muted-foreground">{c.email ?? '-'}</div>
            </li>
          ))}
          {candidates.length === 0 && <li className="px-6 py-6 text-center text-muted-foreground">候補者がいません</li>}
        </ul>
      </div>
    </div>
  )
}

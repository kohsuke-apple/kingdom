import { recruitingRepository } from '@/lib/recruiting-repository'
import Link from 'next/link'

export default async function ExtCaJobsPage() {
  const jobs = await recruitingRepository.listJobs()

  return (
    <div className="mx-auto max-w-6xl p-4 md:p-8">
      <div className="mb-6 border-b border-border pb-5">
        <h1 className="text-2xl font-bold">求人一覧（閲覧のみ）</h1>
      </div>
      <div className="rounded-md border bg-white">
        <ul>
          {jobs.map(j => (
            <li key={j.id} className="px-6 py-4 border-b">
              <Link href={`/dashboard/jobs/${j.id}`} className="font-medium text-foreground hover:underline">{j.title}</Link>
              <div className="text-sm text-muted-foreground">{j.jobType ?? '-'} • {j.status}</div>
            </li>
          ))}
          {jobs.length === 0 && <li className="px-6 py-6 text-center text-muted-foreground">求人がありません</li>}
        </ul>
      </div>
    </div>
  )
}

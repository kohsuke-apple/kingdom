import Link from 'next/link'
import { notFound } from 'next/navigation'
import { recruitingRepository } from '@/lib/recruiting-repository'
import CaAgentDetail from '@/components/ca-agent-detail'
import { CaCandidatesManager } from '@/components/ca-candidates-manager'
import type { Candidate, Job, CompanyCandidateSelection } from '@/types/recruiting'

type Props = {
  params: Promise<{ id: string }>
}

export const dynamic = 'force-dynamic'

export default async function CaAgentDetailPage({ params }: Props) {
  const { id } = await params

  const [agent, allCandidates, allJobs, selections] = await Promise.all([
    recruitingRepository.getAgent(id),
    recruitingRepository.listCandidates(),
    recruitingRepository.listJobs(),
    recruitingRepository.listSelections('ra'),
  ])

  if (!agent) return notFound()

  const myCandidates: Candidate[] = allCandidates.filter(c => c.mainAgentId === id || c.subAgentId === id)

  // selections created by this agent
  const selectionsTyped = selections as CompanyCandidateSelection[]
  const mySelectionJobIds = new Set(selectionsTyped.filter(s => s.createdBy === id).map(s => s.jobId))

  const myJobs: Job[] = allJobs.filter(j => j.createdBy === id || mySelectionJobIds.has(j.id))

  const assignees = [{ id: agent.id, name: agent.name }]

  return (
    <div className="mx-auto max-w-6xl p-4 md:p-8 space-y-8">
      <CaAgentDetail agent={agent} />

      <section>
        <div className="mb-6 border-b border-border pb-5">
          <h2 className="text-xl font-semibold">担当している求職者</h2>
        </div>
        <CaCandidatesManager initialCandidates={myCandidates} initialAssignees={assignees} />
      </section>

      <section>
        <div className="mb-6 border-b border-border pb-5">
          <h2 className="text-xl font-semibold">関連求人</h2>
        </div>

        <div className="overflow-x-auto rounded-md border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30 text-left text-muted-foreground">
                <th className="px-4 py-3">求人タイトル</th>
                <th className="px-4 py-3">企業</th>
                <th className="px-4 py-3">ステータス</th>
                <th className="px-4 py-3">更新日</th>
              </tr>
            </thead>
            <tbody>
              {myJobs.map(job => (
                <tr key={job.id} className="border-b">
                  <td className="px-4 py-3 font-medium">
                    <Link href={`/dashboard/jobs/${job.id}`} className="hover:underline">
                      {job.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{job.sourceCompanyName ?? '-'}</td>
                  <td className="px-4 py-3">{job.status}</td>
                  <td className="px-4 py-3">{new Date(job.updatedAt).toLocaleDateString('ja-JP')}</td>
                </tr>
              ))}
              {myJobs.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">関連する求人が見つかりません</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

import { notFound } from 'next/navigation'
import { recruitingRepository } from '@/lib/recruiting-repository'
import { RaJobDetailForm } from '@/components/ra-job-detail-form'

export const dynamic = 'force-dynamic'

type Props = {
  params: Promise<{ id: string }>
}

export default async function RaJobDetailPage({ params }: Props) {
  const { id } = await params

  let job: Awaited<ReturnType<typeof recruitingRepository.getJob>> = null
  try {
    job = await recruitingRepository.getJob(id)
  } catch {
    return notFound()
  }
  if (!job) return notFound()

  let company: Awaited<ReturnType<typeof recruitingRepository.getCompany>> = null
  try {
    if (job.companyId) {
      company = await recruitingRepository.getCompany(job.companyId)
    }
  } catch {
    // Supabase 停止中またはネットワーク障害時は会社情報なしで表示を継続
  }

  return <RaJobDetailForm job={job} company={company} />
}

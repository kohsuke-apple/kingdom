import { notFound } from 'next/navigation'
import { recruitingRepository } from '@/lib/recruiting-repository'
import { RaJobDetailForm } from '@/components/ra-job-detail-form'

export const dynamic = 'force-dynamic'

type Props = {
  params: Promise<{ id: string }>
}

export default async function RaJobDetailPage({ params }: Props) {
  const { id } = await params

  const job = await recruitingRepository.getJob(id)
  if (!job) notFound()

  const company = job.companyId ? await recruitingRepository.getCompany(job.companyId) : null

  return <RaJobDetailForm job={job} company={company} />
}

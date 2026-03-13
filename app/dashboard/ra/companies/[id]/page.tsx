import { notFound } from 'next/navigation'
import { recruitingRepository } from '@/lib/recruiting-repository'
import { RaCompanyEditForm } from '@/components/ra-company-edit-form'

type Props = {
  params: Promise<{ id: string }>
}

export const dynamic = 'force-dynamic'

export default async function RaCompanyDetailPage({ params }: Props) {
  const { id } = await params

  let company: Awaited<ReturnType<typeof recruitingRepository.getCompany>> = null
  let jobs: Awaited<ReturnType<typeof recruitingRepository.listJobs>> = []
  let selections: Awaited<ReturnType<typeof recruitingRepository.listSelectionsForCompany>> = []
  let allCandidates: Awaited<ReturnType<typeof recruitingRepository.listCandidates>> = []
  let communications: Awaited<ReturnType<typeof recruitingRepository.listCompanyCommunications>> = []
  try {
    ;[company, jobs, selections, allCandidates, communications] = await Promise.all([
      recruitingRepository.getCompany(id),
      recruitingRepository.listJobs({ companyId: id }),
      recruitingRepository.listSelectionsForCompany(id),
      recruitingRepository.listCandidates(),
      recruitingRepository.listCompanyCommunications(id),
    ])
  } catch {
    return notFound()
  }

  if (!company) notFound()

  return (
    <RaCompanyEditForm
      company={company}
      jobs={jobs}
      selections={selections}
      candidates={allCandidates}
      communications={communications}
    />
  )
}

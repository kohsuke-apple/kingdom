import { notFound } from 'next/navigation'
import { recruitingRepository } from '@/lib/recruiting-repository'
import { RaCompanyEditForm } from '@/components/ra-company-edit-form'

type Props = {
  params: Promise<{ id: string }>
}

export const dynamic = 'force-dynamic'

export default async function RaCompanyDetailPage({ params }: Props) {
  const { id } = await params

  const [company, jobs, selections, allCandidates, communications] = await Promise.all([
    recruitingRepository.getCompany(id),
    recruitingRepository.listJobs({ companyId: id }),
    recruitingRepository.listSelectionsForCompany(id),
    recruitingRepository.listCandidates(),
    recruitingRepository.listCompanyCommunications(id),
  ])

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

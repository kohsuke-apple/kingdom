import { HiringCompanyProfileForm } from '@/components/hiring-company-profile-form'
import { recruitingRepository } from '@/lib/recruiting-repository'

export const dynamic = 'force-dynamic'

export default async function HiringCompanyProfilePage() {
  const companies = await recruitingRepository.listCompanies()
  return <HiringCompanyProfileForm companies={companies} />
}

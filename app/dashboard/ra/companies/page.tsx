import { recruitingRepository } from '@/lib/recruiting-repository'
import { RaCompaniesManager } from '@/components/ra-companies-manager'

export const dynamic = 'force-dynamic'

export default async function RaCompaniesPage() {
  const companies = await recruitingRepository.listCompanies()
  return <RaCompaniesManager initialCompanies={companies} />
}

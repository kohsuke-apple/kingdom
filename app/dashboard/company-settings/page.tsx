import { CompanySettingsManager } from '@/components/company-settings-manager'
import { recruitingRepository } from '@/lib/recruiting-repository'

export const dynamic = 'force-dynamic'

export default async function CompanySettingsPage() {
  const companies = await recruitingRepository.listCompanies()
  const targetCompany = companies.find(c => c.isMyCompany) ?? companies[0]
  const agents = targetCompany ? await recruitingRepository.listAgents(targetCompany.id) : []

  return <CompanySettingsManager companies={companies} initialAgents={agents} />
}

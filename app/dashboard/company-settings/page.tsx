import { CompanySettingsManager } from '@/components/company-settings-manager'
import { recruitingRepository } from '@/lib/recruiting-repository'

export const dynamic = 'force-dynamic'

export default async function CompanySettingsPage() {
  let companies: Awaited<ReturnType<typeof recruitingRepository.listCompanies>> = []
  let agents: Awaited<ReturnType<typeof recruitingRepository.listAgents>> = []
  try {
    companies = await recruitingRepository.listCompanies()
    const targetCompany = companies.find(c => c.isMyCompany) ?? companies[0]
    agents = targetCompany ? await recruitingRepository.listAgents(targetCompany.id) : []
  } catch {
    // Supabase 停止中またはネットワーク障害時は空リストで表示を継続
  }

  return <CompanySettingsManager companies={companies} initialAgents={agents} />
}

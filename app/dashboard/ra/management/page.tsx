import { recruitingRepository } from '@/lib/recruiting-repository'
import RaManagementManager from '@/components/ra-management-manager'

export const dynamic = 'force-dynamic'

export default async function RaManagementPage() {
  let companies: Awaited<ReturnType<typeof recruitingRepository.listCompanies>> = []
  let agents: Awaited<ReturnType<typeof recruitingRepository.listAgents>> = []
  try {
    companies = await recruitingRepository.listCompanies()
    const targetCompany = companies.find(c => c.isMyCompany) ?? companies[0]
    agents = targetCompany ? await recruitingRepository.listAgents(targetCompany.id) : []
    agents = agents.filter(a => a.roleType === 'RA')
  } catch {
    // Supabase 停止中またはネットワーク障害時は空リストで表示を継続
  }

  return (
    <div className="mx-auto max-w-5xl p-4 md:p-8">
      <RaManagementManager companies={companies} initialAgents={agents} />
    </div>
  )
}

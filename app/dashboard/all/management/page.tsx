import { recruitingRepository } from '@/lib/recruiting-repository'
import RaManagementManager from '@/components/ra-management-manager'

export const dynamic = 'force-dynamic'

export default async function ManagementPage() {
  let companies: Awaited<ReturnType<typeof recruitingRepository.listCompanies>> = []
  let agents: Awaited<ReturnType<typeof recruitingRepository.listAgents>> = []
  try {
    companies = await recruitingRepository.listCompanies()
    const targetCompany = companies.find(c => c.isMyCompany) ?? companies[0]
    agents = targetCompany ? await recruitingRepository.listAgents(targetCompany.id) : []
    agents = agents.filter(a => a.roleType !== 'CA' && a.roleType !== 'RA')
  } catch {
    // Supabase 停止中またはネットワーク障害時は空リストで表示を継続
  }

  return (
    <div className="px-6 py-6">
      <h1 className="mb-4 text-2xl font-semibold">メンバー管理（全体）</h1>
      <RaManagementManager companies={companies} initialAgents={agents} />
    </div>
  )
}

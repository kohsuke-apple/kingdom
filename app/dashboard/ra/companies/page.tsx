import { recruitingRepository } from '@/lib/recruiting-repository'
import { RaCompaniesManager } from '@/components/ra-companies-manager'

export const dynamic = 'force-dynamic'

export default async function RaCompaniesPage() {
  let companies: Awaited<ReturnType<typeof recruitingRepository.listCompanies>> = []
  try {
    companies = await recruitingRepository.listCompanies()
  } catch {
    // Supabase 停止中またはネットワーク障害時は空リストで表示を継続
  }
  return <RaCompaniesManager initialCompanies={companies} />
}

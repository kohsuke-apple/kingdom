import { HiringCompanyProfileForm } from '@/components/hiring-company-profile-form'
import { recruitingRepository } from '@/lib/recruiting-repository'

export const dynamic = 'force-dynamic'

export default async function HiringCompanyProfilePage() {
  let companies: Awaited<ReturnType<typeof recruitingRepository.listCompanies>> = []
  try {
    companies = await recruitingRepository.listCompanies()
  } catch {
    // Supabase 停止中またはネットワーク障害時は空リストで表示を継続
  }
  return <HiringCompanyProfileForm companies={companies} />
}

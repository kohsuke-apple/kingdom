import { recruitingRepository } from '@/lib/recruiting-repository'
import RaTemplatesManager from '@/components/ra-templates-manager'

export default async function RaTemplatesPage() {
  let templates: Awaited<ReturnType<typeof recruitingRepository.listTemplates>> = []
  try {
    templates = await recruitingRepository.listTemplates('ra')
  } catch {
    // Supabase 停止中またはネットワーク障害時は空リストで表示を継続
  }
  return <RaTemplatesManager initialTemplates={templates} />
}

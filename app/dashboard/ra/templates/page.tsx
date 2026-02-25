import { recruitingRepository } from '@/lib/recruiting-repository'
import RaTemplatesManager from '@/components/ra-templates-manager'

export default async function RaTemplatesPage() {
  const templates = await recruitingRepository.listTemplates('ra')
  return <RaTemplatesManager initialTemplates={templates} />
}

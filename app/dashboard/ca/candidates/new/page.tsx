import { CaCandidateForm } from '@/components/ca-candidate-form'
import { recruitingRepository } from '@/lib/recruiting-repository'
import type { Candidate } from '@/types/recruiting'

export const dynamic = 'force-dynamic'

type CandidatePrefill = Partial<Omit<Candidate, 'id' | 'createdAt' | 'updatedAt'>>

const CANDIDATE_TEMPLATES: Record<string, CandidatePrefill> = {
  saas_sales: {
    experienceJobTypes: 'SaaS営業 / インサイドセールス',
    desiredJobType: 'SaaS営業・インサイドセールス',
    memo: 'SaaS営業テンプレートから作成',
  },
  engineer: {
    experienceJobTypes: 'ソフトウェアエンジニア',
    desiredJobType: 'バックエンドエンジニア / フルスタックエンジニア',
    memo: 'エンジニアテンプレートから作成',
  },
}

export default async function NewCandidatePage({
  searchParams,
}: {
  searchParams: Promise<{ template?: string; clone?: string }>
}) {
  const { template, clone } = await searchParams

  let agents: Awaited<ReturnType<typeof recruitingRepository.listAgents>> = []
  let prefill: CandidatePrefill | undefined
  try {
    agents = await recruitingRepository.listAgents()
    if (clone) {
      const src = await recruitingRepository.getCandidate(clone)
      if (src) {
        const { id: _id, createdAt: _ca, updatedAt: _ua, ...rest } = src
        void _id
        void _ca
        void _ua
        prefill = { ...rest, name: rest.name ? `${rest.name}（複製）` : '' }
      }
    } else if (template && CANDIDATE_TEMPLATES[template]) {
      prefill = CANDIDATE_TEMPLATES[template]
    }
  } catch {
    // Supabase 停止中またはネットワーク障害時は空リストで表示を継続
  }
  return <CaCandidateForm agents={agents} prefill={prefill} />
}

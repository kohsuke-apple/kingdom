import AgentsManagement from '@/components/agents-management'

export const dynamic = 'force-dynamic'

export default function RaAgentsPage() {
  return (
    <div className="mx-auto max-w-5xl p-4 md:p-8">
      <AgentsManagement roleFilter="RA" selectionScope="ra" />
    </div>
  )
}

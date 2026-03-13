import AgentsManagement from '@/components/agents-management'

export default function Page() {
  return (
    <div className="px-6 py-6">
      <h1 className="mb-4 text-2xl font-semibold">CA管理（全体）</h1>
      <AgentsManagement roleFilter="CA" selectionScope="ca" />
    </div>
  )
}

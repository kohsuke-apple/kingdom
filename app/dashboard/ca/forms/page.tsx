import { CaFormsManager } from '@/components/ca-forms-manager'

export const dynamic = 'force-dynamic'

export default function CaFormsPage() {
  return (
    <div className="px-6 py-6">
      <h1 className="mb-1 text-2xl font-semibold">求職者フォーム管理</h1>
      <p className="text-sm text-muted-foreground mb-6">
        URLを発行して求職者に共有すると、回答内容が自動で候補者として登録されます
      </p>
      <CaFormsManager />
    </div>
  )
}

import { DashboardPlaceholder } from '@/components/dashboard-placeholder'

export default function CaTemplatesPage() {
  return (
    <DashboardPlaceholder
      title="CAテンプレート"
      description="CA向けメッセージテンプレート管理"
      apiPath="/api/templates?mode=ca"
    />
  )
}

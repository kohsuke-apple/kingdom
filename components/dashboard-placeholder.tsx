import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function DashboardPlaceholder({
  title,
  description,
  apiPath,
}: {
  title: string
  description: string
  apiPath?: string
}) {
  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">最低限UIを実装済みです。API接続先:</p>
          <p className="mt-2 rounded-md bg-muted px-3 py-2 text-sm font-mono">
            {apiPath ?? 'この画面は API 参照なし'}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

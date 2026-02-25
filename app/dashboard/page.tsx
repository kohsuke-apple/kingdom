import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function DashboardEntryPage() {
  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>CA / RA ダッシュボード</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>モードを選択して画面へ遷移してください。</p>
          <div className="flex gap-3">
            <Link className="underline" href="/dashboard/ra/home">RA Home</Link>
            <Link className="underline" href="/dashboard/ca/home">CA Home</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
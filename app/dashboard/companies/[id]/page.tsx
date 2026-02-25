import Link from 'next/link'
import { notFound } from 'next/navigation'
import { recruitingRepository } from '@/lib/recruiting-repository'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type Props = {
  params: Promise<{ id: string }>
}

export const dynamic = 'force-dynamic'

export default async function CompanyDetailPage({ params }: Props) {
  const { id } = await params

  const [company, jobs] = await Promise.all([
    recruitingRepository.getCompany(id),
    recruitingRepository.listJobs({ companyId: id }),
  ])

  if (!company) notFound()

  return (
    <div className="mx-auto max-w-6xl p-8">
      <div className="mb-6 border-b border-border pb-5">
        <h1 className="text-2xl font-bold tracking-tight">{company.name}</h1>
        <p className="mt-1 text-sm text-muted-foreground">企業プロフィールと公開求人情報</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>基本情報</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p><span className="text-muted-foreground">業界:</span> {company.industry ?? '-'}</p>
            <p><span className="text-muted-foreground">所在地:</span> {company.location ?? '-'}</p>
            <p>
              <span className="text-muted-foreground">公式HP:</span>{' '}
              {company.officialWebsite ? (
                <a href={company.officialWebsite} target="_blank" rel="noreferrer" className="underline">
                  {company.officialWebsite}
                </a>
              ) : (
                '-'
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>企業紹介</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <section>
              <h3 className="mb-1 font-medium">事業内容</h3>
              <p className="whitespace-pre-wrap text-muted-foreground">{company.businessDescription ?? '-'}</p>
            </section>
            <section>
              <h3 className="mb-1 font-medium">転職事例</h3>
              <p className="whitespace-pre-wrap text-muted-foreground">{company.transferCase ?? '-'}</p>
            </section>
            <section>
              <h3 className="mb-1 font-medium">社員紹介</h3>
              <p className="whitespace-pre-wrap text-muted-foreground">{company.employeeIntroduction ?? '-'}</p>
            </section>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 rounded-md border bg-white">
        <div className="border-b px-4 py-3">
          <h2 className="font-medium">この会社の求人</h2>
        </div>
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b bg-muted/30 text-left text-muted-foreground">
              <th className="px-4 py-3">タイトル</th>
              <th className="px-4 py-3">雇用形態</th>
              <th className="px-4 py-3">年収</th>
              <th className="px-4 py-3">状態</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map(job => (
              <tr key={job.id} className="border-b">
                <td className="px-4 py-3 font-medium">{job.title}</td>
                <td className="px-4 py-3">{job.jobType ?? '-'}</td>
                <td className="px-4 py-3">{job.salaryMin ?? '-'}{job.salaryMax ? ` 〜 ${job.salaryMax}` : ''}</td>
                <td className="px-4 py-3">{job.status}</td>
              </tr>
            ))}
            {jobs.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                  この会社の求人はまだありません
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 text-sm">
        <Link href="/dashboard/hiring/jobs" className="underline">求人管理へ戻る</Link>
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ChevronLeft } from 'lucide-react'
import type { Company, Job, JobStatus } from '@/types/recruiting'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { RichTextEditor } from '@/components/ui/rich-text-editor'

type Props = {
  job: Job
  company: Company | null
}

const PRESENCE_OPTIONS = ['あり', 'なし', '状況に応じてある']
const EMPLOYMENT_TYPES = ['正社員', '契約社員', '派遣社員', 'パート・アルバイト', '業務委託', 'その他']
const RECRUIT_TYPES = ['中途採用', '新卒採用', '第二新卒', '両方']
const SHARE_TYPES = ['シェアリング求人', '通常求人']

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border bg-white p-6 space-y-4">
      <h2 className="text-base font-semibold border-b border-border pb-2">{title}</h2>
      {children}
    </section>
  )
}

export function RaJobDetailForm({ job, company }: Props) {
  const router = useRouter()
  const fk = job.id // formKey base

  // ヘッダー・基本情報
  const [title, setTitle] = useState(job.title)
  const [shareType, setShareType] = useState(job.shareType ?? '')
  const [employmentType, setEmploymentType] = useState(job.employmentType ?? '')
  const [recruitType, setRecruitType] = useState(job.recruitType ?? '')
  const [noReprint, setNoReprint] = useState(job.noReprint ?? false)
  const [jobType, setJobType] = useState(job.jobType ?? '')
  const [position, setPosition] = useState(job.position ?? '')
  const [salaryMin, setSalaryMin] = useState(job.salaryMin?.toString() ?? '')
  const [salaryMax, setSalaryMax] = useState(job.salaryMax?.toString() ?? '')
  const [salaryText, setSalaryText] = useState(job.salaryText ?? '')
  const [monthlySalaryMin, setMonthlySalaryMin] = useState(job.monthlySalaryMin?.toString() ?? '')
  const [monthlySalaryMax, setMonthlySalaryMax] = useState(job.monthlySalaryMax?.toString() ?? '')
  const [bonusCount, setBonusCount] = useState(job.bonusCount?.toString() ?? '')
  const [jobLocation, setJobLocation] = useState(job.jobLocation ?? '')
  const [publishedAt, setPublishedAt] = useState(job.publishedAt ?? '')
  const [sourceCompanyName, setSourceCompanyName] = useState(job.sourceCompanyName ?? '')
  const [status, setStatus] = useState<JobStatus>(job.status)

  // 企業情報
  const [companyFoundedYear, setCompanyFoundedYear] = useState(job.companyFoundedYear ?? '')
  const [companyPhase, setCompanyPhase] = useState(job.companyPhase ?? '')
  const [companyEmployeeCount, setCompanyEmployeeCount] = useState(job.companyEmployeeCount ?? '')
  const [companyAddress, setCompanyAddress] = useState(job.companyAddress ?? '')
  const [companyListingType, setCompanyListingType] = useState(job.companyListingType ?? '')
  const [companyAvgAge, setCompanyAvgAge] = useState(job.companyAvgAge ?? '')
  const [companyGenderRatio, setCompanyGenderRatio] = useState(job.companyGenderRatio ?? '')

  // 採用要件
  const [requiredConditions, setRequiredConditions] = useState(job.requiredConditions ?? '')
  const [rejectionReasons, setRejectionReasons] = useState(job.rejectionReasons ?? '')
  const [highPassConditions, setHighPassConditions] = useState(job.highPassConditions ?? '')
  const [interviewRejectionReasons, setInterviewRejectionReasons] = useState(job.interviewRejectionReasons ?? '')

  // この求人の魅力
  const [visionText, setVisionText] = useState(job.visionText ?? '')
  const [businessText, setBusinessText] = useState(job.businessText ?? '')

  // 求人概要
  const [businessContent, setBusinessContent] = useState(job.businessContent ?? '')
  const [recruitBackground, setRecruitBackground] = useState(job.recruitBackground ?? '')
  const [plannedHeadcount, setPlannedHeadcount] = useState(job.plannedHeadcount ?? '')
  const [prPoints, setPrPoints] = useState(job.prPoints ?? '')
  const [jobDetail, setJobDetail] = useState(job.jobDetail ?? '')
  const [orgStructure, setOrgStructure] = useState(job.orgStructure ?? '')
  const [salaryDetail, setSalaryDetail] = useState(job.salaryDetail ?? '')
  const [workTimeDetail, setWorkTimeDetail] = useState(job.workTimeDetail ?? '')
  const [holidayBenefits, setHolidayBenefits] = useState(job.holidayBenefits ?? '')
  const [smokingPolicy, setSmokingPolicy] = useState(job.smokingPolicy ?? '')

  // 選考情報
  const [hasCasualInterview, setHasCasualInterview] = useState(job.hasCasualInterview ?? '')
  const [hasInfoSession, setHasInfoSession] = useState(job.hasInfoSession ?? '')
  const [hasAptitudeTest, setHasAptitudeTest] = useState(job.hasAptitudeTest ?? '')
  const [selectionFlow, setSelectionFlow] = useState(job.selectionFlow ?? '')
  const [selectionNote, setSelectionNote] = useState(job.selectionNote ?? '')

  // 成約手数料
  const [successFeeAmount, setSuccessFeeAmount] = useState(job.successFeeAmount?.toString() ?? '')
  const [successFeePoint, setSuccessFeePoint] = useState(job.successFeePoint ?? '')
  const [paymentTerm, setPaymentTerm] = useState(job.paymentTerm ?? '')
  const [refundPolicy, setRefundPolicy] = useState(job.refundPolicy ?? '')
  const [theoreticalSalaryNote, setTheoreticalSalaryNote] = useState(job.theoreticalSalaryNote ?? '')

  // 求人提供元
  const [sourceAgencyName, setSourceAgencyName] = useState(job.sourceAgencyName ?? '')
  const [sourceAgencyAddress, setSourceAgencyAddress] = useState(job.sourceAgencyAddress ?? '')
  const [sourceAgencyLicenseNo, setSourceAgencyLicenseNo] = useState(job.sourceAgencyLicenseNo ?? '')

  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const payload = {
      title,
      status,
      shareType: shareType || undefined,
      employmentType: employmentType || undefined,
      recruitType: recruitType || undefined,
      noReprint,
      jobType: jobType || undefined,
      position: position || undefined,
      salaryMin: salaryMin ? Number(salaryMin) : undefined,
      salaryMax: salaryMax ? Number(salaryMax) : undefined,
      salaryText: salaryText || undefined,
      monthlySalaryMin: monthlySalaryMin ? Number(monthlySalaryMin) : undefined,
      monthlySalaryMax: monthlySalaryMax ? Number(monthlySalaryMax) : undefined,
      bonusCount: bonusCount ? Number(bonusCount) : undefined,
      jobLocation: jobLocation || undefined,
      publishedAt: publishedAt || undefined,
      sourceCompanyName: sourceCompanyName || undefined,
      companyFoundedYear: companyFoundedYear || undefined,
      companyPhase: companyPhase || undefined,
      companyEmployeeCount: companyEmployeeCount || undefined,
      companyAddress: companyAddress || undefined,
      companyListingType: companyListingType || undefined,
      companyAvgAge: companyAvgAge || undefined,
      companyGenderRatio: companyGenderRatio || undefined,
      requiredConditions: requiredConditions || undefined,
      rejectionReasons: rejectionReasons || undefined,
      highPassConditions: highPassConditions || undefined,
      interviewRejectionReasons: interviewRejectionReasons || undefined,
      visionText: visionText || undefined,
      businessText: businessText || undefined,
      businessContent: businessContent || undefined,
      recruitBackground: recruitBackground || undefined,
      plannedHeadcount: plannedHeadcount || undefined,
      prPoints: prPoints || undefined,
      jobDetail: jobDetail || undefined,
      orgStructure: orgStructure || undefined,
      salaryDetail: salaryDetail || undefined,
      workTimeDetail: workTimeDetail || undefined,
      holidayBenefits: holidayBenefits || undefined,
      smokingPolicy: smokingPolicy || undefined,
      hasCasualInterview: hasCasualInterview || undefined,
      hasInfoSession: hasInfoSession || undefined,
      hasAptitudeTest: hasAptitudeTest || undefined,
      selectionFlow: selectionFlow || undefined,
      selectionNote: selectionNote || undefined,
      successFeeAmount: successFeeAmount ? Number(successFeeAmount) : undefined,
      successFeePoint: successFeePoint || undefined,
      paymentTerm: paymentTerm || undefined,
      refundPolicy: refundPolicy || undefined,
      theoreticalSalaryNote: theoreticalSalaryNote || undefined,
      sourceAgencyName: sourceAgencyName || undefined,
      sourceAgencyAddress: sourceAgencyAddress || undefined,
      sourceAgencyLicenseNo: sourceAgencyLicenseNo || undefined,
    }

    const res = await fetch(`/api/jobs?id=${job.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'x-app-mode': 'RA' },
      body: JSON.stringify(payload),
    })

    if (res.ok) {
      toast.success('求人情報を更新しました')
      router.refresh()
    } else {
      const err = await res.json().catch(() => ({}))
      toast.error(err.error ?? '保存に失敗しました')
    }
    setLoading(false)
  }

  return (
    <div className="mx-auto max-w-3xl p-6">
      <button
        type="button"
        onClick={() => router.back()}
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" />
        戻る
      </button>

      <div className="mb-6 border-b border-border pb-4">
        <p className="text-xs text-muted-foreground mb-1">
          {company?.name ?? '―'}
        </p>
        <h1 className="text-2xl font-bold tracking-tight">{job.title}</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* ヘッダー・基本情報 */}
        <SectionCard title="ヘッダー・基本情報">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="shareType">求人タイプ</Label>
              <select
                id="shareType"
                value={shareType}
                onChange={e => setShareType(e.target.value)}
                className="h-10 w-full rounded-md border border-input bg-white px-3 text-sm"
              >
                <option value="">未選択</option>
                {SHARE_TYPES.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="employmentType">雇用形態</Label>
              <select
                id="employmentType"
                value={employmentType}
                onChange={e => setEmploymentType(e.target.value)}
                className="h-10 w-full rounded-md border border-input bg-white px-3 text-sm"
              >
                <option value="">未選択</option>
                {EMPLOYMENT_TYPES.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="recruitType">採用区分</Label>
              <select
                id="recruitType"
                value={recruitType}
                onChange={e => setRecruitType(e.target.value)}
                className="h-10 w-full rounded-md border border-input bg-white px-3 text-sm"
              >
                <option value="">未選択</option>
                {RECRUIT_TYPES.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              id="noReprint"
              type="checkbox"
              checked={noReprint}
              onChange={e => setNoReprint(e.target.checked)}
              className="h-4 w-4"
            />
            <Label htmlFor="noReprint" className="cursor-pointer">転載NG</Label>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="title">求人タイトル *</Label>
            <Input id="title" value={title} onChange={e => setTitle(e.target.value)} required />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="jobType">職種</Label>
              <Input id="jobType" value={jobType} onChange={e => setJobType(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="position">職位</Label>
              <Input id="position" value={position} onChange={e => setPosition(e.target.value)} placeholder="例：メンバー" />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="salaryMin">年収下限（万円）</Label>
              <Input id="salaryMin" type="number" min={0} value={salaryMin} onChange={e => setSalaryMin(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="salaryMax">年収上限（万円）</Label>
              <Input id="salaryMax" type="number" min={0} value={salaryMax} onChange={e => setSalaryMax(e.target.value)} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="salaryText">年収テキスト表示</Label>
            <Input id="salaryText" value={salaryText} onChange={e => setSalaryText(e.target.value)} placeholder="例：400万円〜420万円（月給 24.6万円〜26.7万円）" />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="monthlySalaryMin">月給下限（万円）</Label>
              <Input id="monthlySalaryMin" type="number" min={0} value={monthlySalaryMin} onChange={e => setMonthlySalaryMin(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="monthlySalaryMax">月給上限（万円）</Label>
              <Input id="monthlySalaryMax" type="number" min={0} value={monthlySalaryMax} onChange={e => setMonthlySalaryMax(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="bonusCount">賞与回数</Label>
              <Input id="bonusCount" type="number" min={0} value={bonusCount} onChange={e => setBonusCount(e.target.value)} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="jobLocation">勤務地</Label>
            <Input id="jobLocation" value={jobLocation} onChange={e => setJobLocation(e.target.value)} placeholder="例：愛知" />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="publishedAt">掲載開始日</Label>
              <Input id="publishedAt" value={publishedAt} onChange={e => setPublishedAt(e.target.value)} placeholder="例：2025年11月24日" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sourceCompanyName">求人取扱企業</Label>
              <Input id="sourceCompanyName" value={sourceCompanyName} onChange={e => setSourceCompanyName(e.target.value)} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="status">公開状態</Label>
            <select
              id="status"
              value={status}
              onChange={e => setStatus(e.target.value as JobStatus)}
              className="h-10 w-full rounded-md border border-input bg-white px-3 text-sm"
            >
              <option value="open">公開中</option>
              <option value="closed">非公開</option>
            </select>
          </div>
        </SectionCard>

        {/* 企業情報 */}
        <SectionCard title="企業情報">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="companyFoundedYear">設立年</Label>
              <Input id="companyFoundedYear" value={companyFoundedYear} onChange={e => setCompanyFoundedYear(e.target.value)} placeholder="例：1996年" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="companyPhase">企業フェーズ</Label>
              <Input id="companyPhase" value={companyPhase} onChange={e => setCompanyPhase(e.target.value)} placeholder="例：メガベンチャー" />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="companyEmployeeCount">従業員数</Label>
              <Input id="companyEmployeeCount" value={companyEmployeeCount} onChange={e => setCompanyEmployeeCount(e.target.value)} placeholder="例：1001〜5000名" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="companyListingType">上場区分</Label>
              <Input id="companyListingType" value={companyListingType} onChange={e => setCompanyListingType(e.target.value)} placeholder="例：未上場" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="companyAddress">住所</Label>
            <Input id="companyAddress" value={companyAddress} onChange={e => setCompanyAddress(e.target.value)} />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="companyAvgAge">平均年齢</Label>
              <Input id="companyAvgAge" value={companyAvgAge} onChange={e => setCompanyAvgAge(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="companyGenderRatio">男女比</Label>
              <Input id="companyGenderRatio" value={companyGenderRatio} onChange={e => setCompanyGenderRatio(e.target.value)} placeholder="例：男性70%・女性30%" />
            </div>
          </div>
        </SectionCard>

        {/* 採用要件 */}
        <SectionCard title="採用要件">
          <div className="space-y-1.5">
            <Label>応募必須条件</Label>
            <RichTextEditor key={`${fk}-req`} defaultValue={requiredConditions} onChange={setRequiredConditions} placeholder="応募必須条件を入力..." minHeight="120px" />
          </div>
          <div className="space-y-1.5">
            <Label>書類見送りの主な理由</Label>
            <RichTextEditor key={`${fk}-rej`} defaultValue={rejectionReasons} onChange={setRejectionReasons} placeholder="書類見送りの主な理由を入力..." minHeight="100px" />
          </div>
          <div className="space-y-1.5">
            <Label>内定の可能性が高い人</Label>
            <RichTextEditor key={`${fk}-high`} defaultValue={highPassConditions} onChange={setHighPassConditions} placeholder="内定の可能性が高い人の特徴を入力..." minHeight="100px" />
          </div>
          <div className="space-y-1.5">
            <Label>面接見送りの主な理由</Label>
            <RichTextEditor key={`${fk}-irej`} defaultValue={interviewRejectionReasons} onChange={setInterviewRejectionReasons} placeholder="面接見送りの主な理由を入力..." minHeight="100px" />
          </div>
        </SectionCard>

        {/* この求人の魅力 */}
        <SectionCard title="この求人の魅力">
          <div className="space-y-1.5">
            <Label>理念・ビジョン</Label>
            <RichTextEditor key={`${fk}-vision`} defaultValue={visionText} onChange={setVisionText} placeholder="企業の理念・ビジョンを入力..." minHeight="150px" />
          </div>
          <div className="space-y-1.5">
            <Label>仕事・事業</Label>
            <RichTextEditor key={`${fk}-biz`} defaultValue={businessText} onChange={setBusinessText} placeholder="仕事・事業内容の魅力を入力..." minHeight="150px" />
          </div>
        </SectionCard>

        {/* 求人概要 */}
        <SectionCard title="求人概要">
          <div className="space-y-1.5">
            <Label>事業内容と今後の事業展開</Label>
            <Textarea
              value={businessContent}
              onChange={e => setBusinessContent(e.target.value)}
              placeholder="事業内容と今後の展開を入力..."
              rows={5}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="recruitBackground">募集背景</Label>
              <Input id="recruitBackground" value={recruitBackground} onChange={e => setRecruitBackground(e.target.value)} placeholder="例：増員募集" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="plannedHeadcount">募集予定人数・期間</Label>
              <Input id="plannedHeadcount" value={plannedHeadcount} onChange={e => setPlannedHeadcount(e.target.value)} placeholder="例：50人 / ６ヶ月" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>PRポイント</Label>
            <RichTextEditor key={`${fk}-pr`} defaultValue={prPoints} onChange={setPrPoints} placeholder="PRポイントを入力..." minHeight="150px" />
          </div>
          <div className="space-y-1.5">
            <Label>仕事内容</Label>
            <RichTextEditor key={`${fk}-detail`} defaultValue={jobDetail} onChange={setJobDetail} placeholder="仕事内容の詳細を入力..." minHeight="200px" />
          </div>
          <div className="space-y-1.5">
            <Label>現在の組織構成</Label>
            <Textarea
              value={orgStructure}
              onChange={e => setOrgStructure(e.target.value)}
              placeholder="組織構成を入力..."
              rows={3}
            />
          </div>
          <div className="space-y-1.5">
            <Label>給与・年収例</Label>
            <RichTextEditor key={`${fk}-sal`} defaultValue={salaryDetail} onChange={setSalaryDetail} placeholder="給与・年収例の詳細を入力..." minHeight="120px" />
          </div>
          <div className="space-y-1.5">
            <Label>勤務地・勤務時間</Label>
            <RichTextEditor key={`${fk}-work`} defaultValue={workTimeDetail} onChange={setWorkTimeDetail} placeholder="勤務地・勤務時間の詳細を入力..." minHeight="150px" />
          </div>
          <div className="space-y-1.5">
            <Label>休日休暇・福利厚生</Label>
            <RichTextEditor key={`${fk}-holiday`} defaultValue={holidayBenefits} onChange={setHolidayBenefits} placeholder="休日・福利厚生の詳細を入力..." minHeight="150px" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="smokingPolicy">受動喫煙対策</Label>
            <Input id="smokingPolicy" value={smokingPolicy} onChange={e => setSmokingPolicy(e.target.value)} placeholder="例：喫煙室あり" />
          </div>
        </SectionCard>

        {/* 選考情報 */}
        <SectionCard title="選考情報">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="hasCasualInterview">カジュアル面談の有無</Label>
              <select
                id="hasCasualInterview"
                value={hasCasualInterview}
                onChange={e => setHasCasualInterview(e.target.value)}
                className="h-10 w-full rounded-md border border-input bg-white px-3 text-sm"
              >
                <option value="">未選択</option>
                {PRESENCE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="hasInfoSession">会社説明会の有無</Label>
              <select
                id="hasInfoSession"
                value={hasInfoSession}
                onChange={e => setHasInfoSession(e.target.value)}
                className="h-10 w-full rounded-md border border-input bg-white px-3 text-sm"
              >
                <option value="">未選択</option>
                {PRESENCE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="hasAptitudeTest">適性テストの有無</Label>
              <select
                id="hasAptitudeTest"
                value={hasAptitudeTest}
                onChange={e => setHasAptitudeTest(e.target.value)}
                className="h-10 w-full rounded-md border border-input bg-white px-3 text-sm"
              >
                <option value="">未選択</option>
                {PRESENCE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="selectionFlow">選考フロー</Label>
            <Input id="selectionFlow" value={selectionFlow} onChange={e => setSelectionFlow(e.target.value)} placeholder="例：電話面談→面接→内定" />
          </div>
          <div className="space-y-1.5">
            <Label>補足情報</Label>
            <Textarea
              value={selectionNote}
              onChange={e => setSelectionNote(e.target.value)}
              placeholder="選考に関する補足情報を入力..."
              rows={3}
            />
          </div>
        </SectionCard>

        {/* 成約手数料 */}
        <SectionCard title="成約手数料">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="successFeeAmount">成果報酬金額（円）</Label>
              <Input id="successFeeAmount" type="number" min={0} value={successFeeAmount} onChange={e => setSuccessFeeAmount(e.target.value)} placeholder="例：500000" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="successFeePoint">成果地点</Label>
              <Input id="successFeePoint" value={successFeePoint} onChange={e => setSuccessFeePoint(e.target.value)} placeholder="例：入社" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="paymentTerm">支払いサイト</Label>
            <Input id="paymentTerm" value={paymentTerm} onChange={e => setPaymentTerm(e.target.value)} placeholder="例：被採用者入社日が属する月の翌月末支払い" />
          </div>
          <div className="space-y-1.5">
            <Label>返戻金の規定</Label>
            <Textarea
              value={refundPolicy}
              onChange={e => setRefundPolicy(e.target.value)}
              placeholder="返戻金に関する規定を入力..."
              rows={4}
            />
          </div>
          <div className="space-y-1.5">
            <Label>理論年収の考え方</Label>
            <Textarea
              value={theoreticalSalaryNote}
              onChange={e => setTheoreticalSalaryNote(e.target.value)}
              placeholder="理論年収の算出方法を入力..."
              rows={3}
            />
          </div>
        </SectionCard>

        {/* 求人提供元 */}
        <SectionCard title="求人提供元">
          <div className="space-y-1.5">
            <Label htmlFor="sourceAgencyName">有料職業紹介事業者名</Label>
            <Input id="sourceAgencyName" value={sourceAgencyName} onChange={e => setSourceAgencyName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sourceAgencyAddress">住所</Label>
            <Input id="sourceAgencyAddress" value={sourceAgencyAddress} onChange={e => setSourceAgencyAddress(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sourceAgencyLicenseNo">有料職業紹介許可番号</Label>
            <Input id="sourceAgencyLicenseNo" value={sourceAgencyLicenseNo} onChange={e => setSourceAgencyLicenseNo(e.target.value)} />
          </div>
        </SectionCard>

        <div className="flex gap-3 pb-8">
          <Button type="submit" disabled={loading}>
            {loading ? '保存中...' : '更新する'}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.push('/dashboard/ra/jobs')}>
            一覧へ戻る
          </Button>
        </div>
      </form>
    </div>
  )
}

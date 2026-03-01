'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ExternalLink, Pencil, Plus, Trash2, X } from 'lucide-react'
import { toast } from 'sonner'
import type {
  Candidate,
  Company,
  CompanyCandidateSelection,
  CompanyCommunication,
  HiringDifficulty,
  HiringType,
  Job,
  PublishStatus,
  RecruitingStatus,
} from '@/types/recruiting'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { RichTextEditor } from '@/components/ui/rich-text-editor'
import { MultiSelectCheckboxes } from '@/components/ui/multi-select-checkboxes'
import type { MultiSelectOption } from '@/components/ui/multi-select-checkboxes'

const INDUSTRY_OPTIONS: MultiSelectOption[] = [
  { value: 'メーカー', label: 'メーカー' },
  { value: 'サービス・インフラ', label: 'サービス・インフラ' },
  { value: '商社', label: '商社' },
  { value: 'ソフトウェア', label: 'ソフトウェア' },
  { value: '小売り', label: '小売り' },
  { value: '広告・出版・マスコミ', label: '広告・出版・マスコミ' },
  { value: '金融', label: '金融' },
  { value: '官公庁・公社・団体', label: '官公庁・公社・団体' },
]

const SUB_INDUSTRY_OPTIONS: MultiSelectOption[] = [
  // メーカー
  { value: '食品・農林・水産', label: '食品・農林・水産', group: 'メーカー' },
  { value: '建設・住宅・インテリア', label: '建設・住宅・インテリア', group: 'メーカー' },
  { value: '繊維・化学・薬品・化粧品', label: '繊維・化学・薬品・化粧品', group: 'メーカー' },
  { value: '鉄鋼・金属・鉱業', label: '鉄鋼・金属・鉱業', group: 'メーカー' },
  { value: '機械・プラント', label: '機械・プラント', group: 'メーカー' },
  { value: '電子・電気機器', label: '電子・電気機器', group: 'メーカー' },
  { value: '自動車・輸送用機器', label: '自動車・輸送用機器', group: 'メーカー' },
  { value: '精密・医療機器', label: '精密・医療機器', group: 'メーカー' },
  { value: '印刷・事務機器関連', label: '印刷・事務機器関連', group: 'メーカー' },
  { value: 'スポーツ・玩具', label: 'スポーツ・玩具', group: 'メーカー' },
  { value: 'その他メーカー', label: 'その他メーカー', group: 'メーカー' },
  // サービス・インフラ
  { value: '不動産', label: '不動産', group: 'サービス・インフラ' },
  { value: '鉄道・航空・運輸・物流', label: '鉄道・航空・運輸・物流', group: 'サービス・インフラ' },
  { value: '電力・ガス・エネルギー', label: '電力・ガス・エネルギー', group: 'サービス・インフラ' },
  { value: 'フードサービス', label: 'フードサービス', group: 'サービス・インフラ' },
  { value: 'ホテル・旅行', label: 'ホテル・旅行', group: 'サービス・インフラ' },
  { value: '医療・福祉', label: '医療・福祉', group: 'サービス・インフラ' },
  { value: 'アミューズメント・レジャー', label: 'アミューズメント・レジャー', group: 'サービス・インフラ' },
  { value: 'その他サービス', label: 'その他サービス', group: 'サービス・インフラ' },
  { value: 'コンサルティング・調査', label: 'コンサルティング・調査', group: 'サービス・インフラ' },
  { value: '人材サービス', label: '人材サービス', group: 'サービス・インフラ' },
  { value: '教育', label: '教育', group: 'サービス・インフラ' },
  // 商社
  { value: '総合商社', label: '総合商社', group: '商社' },
  { value: '専門商社', label: '専門商社', group: '商社' },
  // ソフトウェア
  { value: 'ソフトウェア', label: 'ソフトウェア', group: 'ソフトウェア' },
  { value: 'インターネット', label: 'インターネット', group: 'ソフトウェア' },
  { value: '通信', label: '通信', group: 'ソフトウェア' },
  // 小売り
  { value: '百貨店・スーパー', label: '百貨店・スーパー', group: '小売り' },
  { value: 'コンビニ', label: 'コンビニ', group: '小売り' },
  { value: '専門店', label: '専門店', group: '小売り' },
  // 広告・出版・マスコミ
  { value: '放送', label: '放送', group: '広告・出版・マスコミ' },
  { value: '新聞', label: '新聞', group: '広告・出版・マスコミ' },
  { value: '出版', label: '出版', group: '広告・出版・マスコミ' },
  { value: '広告', label: '広告', group: '広告・出版・マスコミ' },
  // 金融
  { value: '銀行・証券', label: '銀行・証券', group: '金融' },
  { value: 'クレジット', label: 'クレジット', group: '金融' },
  { value: '信販・リース', label: '信販・リース', group: '金融' },
  { value: 'その他金融', label: 'その他金融', group: '金融' },
  { value: '生保・損保', label: '生保・損保', group: '金融' },
  // 官公庁・公社・団体
  { value: '公社・団体', label: '公社・団体', group: '官公庁・公社・団体' },
  { value: '官公庁', label: '官公庁', group: '官公庁・公社・団体' },
]

type Props = {
  company: Company
  jobs: Job[]
  selections: CompanyCandidateSelection[]
  candidates: Candidate[]
  communications: CompanyCommunication[]
}

const stageLabel: Record<string, string> = {
  applied: '応募',
  document_pass: '書類通過',
  interview_1: '一次面接',
  interview_2: '二次面接',
  final: '最終面接',
  offer: 'オファー',
  hired: '採用',
  rejected: '不合格',
}

const statusLabel: Record<string, string> = {
  active: '選考中',
  hired: '採用',
  rejected: '不合格',
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-t border-border pt-5">
      <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {children}
      </p>
    </div>
  )
}

function HiringInfoSection({ label, html }: { label: string; html?: string }) {
  return (
    <section>
      <h3 className="mb-1 text-sm font-medium">{label}</h3>
      {html ? (
        <div
          className="rich-text-content text-sm text-muted-foreground"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : (
        <p className="text-sm text-muted-foreground/50">—</p>
      )}
    </section>
  )
}

export function RaCompanyEditForm({ company, jobs, selections, candidates, communications: initialCommunications }: Props) {
  const router = useRouter()

  // 基本情報
  const [companyNumber, setCompanyNumber] = useState(company.companyNumber ?? '')
  const [publishStatus, setPublishStatus] = useState<PublishStatus>(company.publishStatus ?? 'private')
  const [name, setName] = useState(company.name)
  const [industries, setIndustries] = useState<string[]>(company.industries ?? [])
  const [subIndustries, setSubIndustries] = useState<string[]>(company.subIndustries ?? [])
  const [officialWebsite, setOfficialWebsite] = useState(company.officialWebsite ?? '')

  // 募集情報
  const [recruitingJobTypes, setRecruitingJobTypes] = useState(company.recruitingJobTypes ?? '')
  const [workLocation, setWorkLocation] = useState(company.workLocation ?? '')
  const [hiringType, setHiringType] = useState<HiringType | ''>(company.hiringType ?? '')
  const [recruitingStatus, setRecruitingStatus] = useState<RecruitingStatus | ''>(company.recruitingStatus ?? '')
  const [hiringDifficulty, setHiringDifficulty] = useState<HiringDifficulty | ''>(company.hiringDifficulty ?? '')

  // 条件・規定
  const [successFee, setSuccessFee] = useState(company.successFee ?? '')
  const [documentStorageUrl, setDocumentStorageUrl] = useState(company.documentStorageUrl ?? '')
  const [refundPolicy, setRefundPolicy] = useState(company.refundPolicy ?? '')
  const [selectionFlow, setSelectionFlow] = useState(company.selectionFlow ?? '')

  // 社内メモ
  const [memo, setMemo] = useState(company.memo ?? '')
  const [saving, setSaving] = useState(false)

  // ─── 採用担当者からの連絡 ───
  const [commList, setCommList] = useState<CompanyCommunication[]>(initialCommunications)
  const [commModalOpen, setCommModalOpen] = useState(false)
  const [commFormKey, setCommFormKey] = useState(0)
  const [commForm, setCommForm] = useState<{
    id?: string
    contactedAt: string
    fromName: string
    content: string
  }>({ contactedAt: new Date().toISOString().slice(0, 10), fromName: '', content: '' })
  const [commSaving, setCommSaving] = useState(false)

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)

    const res = await fetch(`/api/companies?id=${company.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: name.trim(),
        industries: industries.length > 0 ? industries : [],
        subIndustries: subIndustries.length > 0 ? subIndustries : [],
        officialWebsite: officialWebsite || undefined,
        companyNumber: companyNumber || undefined,
        publishStatus,
        recruitingJobTypes: recruitingJobTypes || undefined,
        workLocation: workLocation || undefined,
        hiringType: hiringType || undefined,
        recruitingStatus: recruitingStatus || undefined,
        hiringDifficulty: hiringDifficulty || undefined,
        successFee: successFee || undefined,
        documentStorageUrl: documentStorageUrl || undefined,
        refundPolicy: refundPolicy || undefined,
        selectionFlow: selectionFlow || undefined,
        memo: memo || undefined,
      }),
    })

    if (res.ok) {
      toast.success('企業情報を更新しました')
      router.refresh()
    } else {
      const data = await res.json().catch(() => ({}))
      toast.error(data.error ?? '保存に失敗しました')
    }
    setSaving(false)
  }

  function openNewComm() {
    setCommForm({ contactedAt: new Date().toISOString().slice(0, 10), fromName: '', content: '' })
    setCommFormKey(k => k + 1)
    setCommModalOpen(true)
  }

  function openEditComm(c: CompanyCommunication) {
    setCommForm({ id: c.id, contactedAt: c.contactedAt, fromName: c.fromName ?? '', content: c.content })
    setCommFormKey(k => k + 1)
    setCommModalOpen(true)
  }

  async function handleCommSubmit(e: React.FormEvent) {
    e.preventDefault()
    setCommSaving(true)
    const method = commForm.id ? 'PUT' : 'POST'
    const url = commForm.id ? `/api/company-communications?id=${commForm.id}` : '/api/company-communications'
    const body = commForm.id
      ? { contactedAt: commForm.contactedAt, fromName: commForm.fromName || undefined, content: commForm.content }
      : { companyId: company.id, contactedAt: commForm.contactedAt, fromName: commForm.fromName || undefined, content: commForm.content }
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      toast.error(data.error ?? '保存に失敗しました')
      setCommSaving(false)
      return
    }
    const saved: CompanyCommunication = await res.json()
    if (commForm.id) {
      setCommList(prev => prev.map(c => c.id === saved.id ? saved : c))
    } else {
      setCommList(prev => [saved, ...prev])
    }
    setCommModalOpen(false)
    setCommSaving(false)
    toast.success(commForm.id ? '連絡を更新しました' : '連絡を追加しました')
  }

  async function handleCommDelete(id: string) {
    if (!confirm('この連絡を削除しますか？')) return
    const res = await fetch(`/api/company-communications?id=${id}`, { method: 'DELETE' })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      toast.error(data.error ?? '削除に失敗しました')
      return
    }
    setCommList(prev => prev.filter(c => c.id !== id))
    toast.success('削除しました')
  }

  const candidateMap = new Map(candidates.map(c => [c.id, c]))
  const jobMap = new Map(jobs.map(j => [j.id, j]))

  const hasHiringInfo =
    company.businessDescription || company.transferCase || company.employeeIntroduction

  return (
    <div className="mx-auto max-w-6xl p-4 md:p-8">
      <button
        type="button"
        onClick={() => router.back()}
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" />
        企業一覧へ戻る
      </button>

      <div className="mb-6 border-b border-border pb-4">
        <h1 className="text-2xl font-bold tracking-tight">{company.name}</h1>
        <p className="mt-1 text-sm text-muted-foreground">RA モード / 企業詳細・編集</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        {/* Left: RA editable fields */}
        <form onSubmit={handleSave}>
          <Card>
            <CardHeader>
              <CardTitle>企業情報（RA 管理）</CardTitle>
              <CardDescription>
                基本情報・募集条件・社内メモを編集できます
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">

              {/* ─── 基本情報 ─── */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="companyNumber">企業No.</Label>
                  <Input
                    id="companyNumber"
                    value={companyNumber}
                    onChange={e => setCompanyNumber(e.target.value)}
                    placeholder="例: C-001"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="publishStatus">公開ステータス</Label>
                  <select
                    id="publishStatus"
                    className="h-10 w-full rounded-md border border-input bg-white px-3 text-sm"
                    value={publishStatus}
                    onChange={e => setPublishStatus(e.target.value as PublishStatus)}
                  >
                    <option value="private">非公開</option>
                    <option value="ra_only">RA公開</option>
                    <option value="ca_ra">CA・RA公開</option>
                    <option value="published">外部公開</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="name">企業名 *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label>業界</Label>
                <MultiSelectCheckboxes
                  options={INDUSTRY_OPTIONS}
                  value={industries}
                  onChange={setIndustries}
                  placeholder="業界を選択（複数可）"
                />
              </div>

              <div className="space-y-1.5">
                <Label>業種</Label>
                <MultiSelectCheckboxes
                  options={SUB_INDUSTRY_OPTIONS}
                  value={subIndustries}
                  onChange={setSubIndustries}
                  placeholder="業種を選択（複数可）"
                  showGroups
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="officialWebsite">公式サイト</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="officialWebsite"
                    type="url"
                    value={officialWebsite}
                    onChange={e => setOfficialWebsite(e.target.value)}
                    placeholder="https://example.com"
                    className="flex-1"
                  />
                  {officialWebsite && (
                    <a
                      href={officialWebsite}
                      target="_blank"
                      rel="noreferrer"
                      className="shrink-0 text-muted-foreground hover:text-foreground"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </div>

              {/* ─── 募集情報 ─── */}
              <SectionHeading>募集情報</SectionHeading>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="recruitingJobTypes">募集職種</Label>
                  <Input
                    id="recruitingJobTypes"
                    value={recruitingJobTypes}
                    onChange={e => setRecruitingJobTypes(e.target.value)}
                    placeholder="例: エンジニア、営業"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="workLocation">勤務地</Label>
                  <Input
                    id="workLocation"
                    value={workLocation}
                    onChange={e => setWorkLocation(e.target.value)}
                    placeholder="例: 東京都渋谷区（リモート可）"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <Label htmlFor="hiringType">採用形態</Label>
                  <select
                    id="hiringType"
                    className="h-10 w-full rounded-md border border-input bg-white px-3 text-sm"
                    value={hiringType}
                    onChange={e => setHiringType(e.target.value as HiringType | '')}
                  >
                    <option value="">未設定</option>
                    <option value="new_grad">新卒</option>
                    <option value="mid_career">中途</option>
                    <option value="both">どちらも</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="recruitingStatus">募集状況</Label>
                  <select
                    id="recruitingStatus"
                    className="h-10 w-full rounded-md border border-input bg-white px-3 text-sm"
                    value={recruitingStatus}
                    onChange={e => setRecruitingStatus(e.target.value as RecruitingStatus | '')}
                  >
                    <option value="">未設定</option>
                    <option value="active">積極採用</option>
                    <option value="fulfilled">採用充足</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="hiringDifficulty">採用難易度</Label>
                  <select
                    id="hiringDifficulty"
                    className="h-10 w-full rounded-md border border-input bg-white px-3 text-sm"
                    value={hiringDifficulty}
                    onChange={e => setHiringDifficulty(e.target.value as HiringDifficulty | '')}
                  >
                    <option value="">未設定</option>
                    <option value="A">A（最難関）</option>
                    <option value="B">B（難しい）</option>
                    <option value="C">C（標準）</option>
                    <option value="D">D（容易）</option>
                  </select>
                </div>
              </div>

              {/* ─── 条件・規定 ─── */}
              <SectionHeading>条件・規定</SectionHeading>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="successFee">成果報酬</Label>
                  <Input
                    id="successFee"
                    value={successFee}
                    onChange={e => setSuccessFee(e.target.value)}
                    placeholder="例: 年収の30%"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="documentStorageUrl">各種資料格納先</Label>
                  <Input
                    id="documentStorageUrl"
                    value={documentStorageUrl}
                    onChange={e => setDocumentStorageUrl(e.target.value)}
                    placeholder="例: Google Drive URL、Notion リンク"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>返金規定</Label>
                <RichTextEditor
                  key={`${company.id}-refund`}
                  defaultValue={refundPolicy}
                  onChange={setRefundPolicy}
                  placeholder="返金条件・期間・割合などを入力..."
                  minHeight="100px"
                />
              </div>

              <div className="space-y-1.5">
                <Label>選考フロー</Label>
                <RichTextEditor
                  key={`${company.id}-flow`}
                  defaultValue={selectionFlow}
                  onChange={setSelectionFlow}
                  placeholder="例: 書類選考 → 一次面接（人事）→ 二次面接（現場）→ 最終（役員）"
                  minHeight="100px"
                />
              </div>

              {/* ─── 社内メモ ─── */}
              <SectionHeading>社内メモ</SectionHeading>

              <div className="space-y-1.5">
                <p className="text-xs text-muted-foreground">
                  社内共有用の情報・営業メモなどを自由に記録できます
                </p>
                <RichTextEditor
                  key={`${company.id}-memo`}
                  defaultValue={memo}
                  onChange={setMemo}
                  placeholder="企業の特徴・過去の選考状況・担当者の印象などを入力..."
                  minHeight="150px"
                />
              </div>

              <div className="pt-2">
                <Button type="submit" disabled={saving || !name.trim()}>
                  {saving ? '保存中...' : '保存する'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>

        {/* Right: Hiring mode info (read-only reference) */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>採用担当者からの情報</CardTitle>
              <CardDescription>
                採用モードで登録された企業プロフィール（参照用）
              </CardDescription>
            </CardHeader>
            <CardContent>
              {hasHiringInfo ? (
                <div className="space-y-5">
                  <HiringInfoSection label="事業内容" html={company.businessDescription} />
                  <HiringInfoSection label="転職事例" html={company.transferCase} />
                  <HiringInfoSection label="社員紹介" html={company.employeeIntroduction} />
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  採用モードからの企業プロフィールはまだ登録されていません。
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Jobs table */}
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
                <td className="px-4 py-3">
                  {job.salaryMin ?? '-'}
                  {job.salaryMax ? ` 〜 ${job.salaryMax}` : ''}
                </td>
                <td className="px-4 py-3">{job.status === 'open' ? '公開中' : '非公開'}</td>
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

      {/* Applicants / Selections table */}
      <div className="mt-6 rounded-md border bg-white">
        <div className="border-b px-4 py-3">
          <h2 className="font-medium">応募した候補者</h2>
        </div>
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b bg-muted/30 text-left text-muted-foreground">
              <th className="px-4 py-3">候補者名</th>
              <th className="px-4 py-3">求人</th>
              <th className="px-4 py-3">選考ステージ</th>
              <th className="px-4 py-3">ステータス</th>
            </tr>
          </thead>
          <tbody>
            {selections.map(sel => {
              const candidate = candidateMap.get(sel.candidateId)
              const job = jobMap.get(sel.jobId)
              return (
                <tr key={sel.id} className="border-b">
                  <td className="px-4 py-3 font-medium">
                    {candidate?.name ?? <span className="text-muted-foreground/50">-</span>}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {job?.title ?? <span className="text-muted-foreground/50">-</span>}
                  </td>
                  <td className="px-4 py-3">{stageLabel[sel.stage] ?? sel.stage}</td>
                  <td className="px-4 py-3">{statusLabel[sel.status] ?? sel.status}</td>
                </tr>
              )
            })}
            {selections.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                  応募した候補者はまだいません
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Communications section */}
      <div className="mt-6 rounded-md border bg-white">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="font-medium">採用担当者からの連絡</h2>
          <Button size="sm" variant="outline" onClick={openNewComm} className="gap-1.5">
            <Plus className="h-4 w-4" />
            追加
          </Button>
        </div>
        {commList.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-muted-foreground">
            採用担当者からの連絡はまだ登録されていません
          </p>
        ) : (
          <ul className="divide-y">
            {commList.map(comm => (
              <li key={comm.id} className="flex items-start gap-4 px-4 py-4">
                <div className="min-w-[90px] shrink-0 text-sm text-muted-foreground">{comm.contactedAt}</div>
                <div className="flex-1">
                  {comm.fromName && (
                    <p className="mb-1 text-xs font-medium text-muted-foreground">{comm.fromName}</p>
                  )}
                  <div
                    className="rich-text-content text-sm"
                    dangerouslySetInnerHTML={{ __html: comm.content }}
                  />
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    onClick={() => openEditComm(comm)}
                    className="rounded p-1 hover:bg-muted"
                    aria-label="編集"
                  >
                    <Pencil className="h-4 w-4 text-muted-foreground" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCommDelete(comm.id)}
                    className="rounded p-1 hover:bg-muted"
                    aria-label="削除"
                  >
                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Communication modal */}
      {commModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/30 pt-16 pb-8">
          <div className="w-full max-w-lg rounded-lg border border-border bg-white shadow-xl">
            <div className="flex items-center justify-between border-b px-6 py-4">
              <h2 className="text-base font-semibold">{commForm.id ? '連絡を編集' : '連絡を追加'}</h2>
              <button type="button" onClick={() => setCommModalOpen(false)} className="rounded p-1 hover:bg-muted">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleCommSubmit} className="space-y-4 px-6 py-5">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>連絡日 *</Label>
                  <Input
                    type="date"
                    value={commForm.contactedAt}
                    onChange={e => setCommForm(prev => ({ ...prev, contactedAt: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>担当者名</Label>
                  <Input
                    value={commForm.fromName}
                    onChange={e => setCommForm(prev => ({ ...prev, fromName: e.target.value }))}
                    placeholder="例: 田中 太郎"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>内容 *</Label>
                <RichTextEditor
                  key={commFormKey}
                  defaultValue={commForm.content}
                  onChange={v => setCommForm(prev => ({ ...prev, content: v }))}
                  placeholder="連絡内容を入力..."
                  minHeight="120px"
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={commSaving}>
                  {commSaving ? '保存中...' : commForm.id ? '更新する' : '追加する'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setCommModalOpen(false)}>
                  キャンセル
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

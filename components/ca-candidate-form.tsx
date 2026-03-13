'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ChevronLeft, Plus, Trash2 } from 'lucide-react'
import type { Agent, Candidate, WorkHistory } from '@/types/recruiting'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RichTextEditor } from '@/components/ui/rich-text-editor'

type WorkHistoryEntry = {
  companyName: string
  employmentType: string
  period: string
  industry: string
  jobType: string
  salary: string
}

type Props = {
  candidate?: Candidate
  agents?: Agent[]
  prefill?: Partial<Omit<Candidate, 'id' | 'createdAt' | 'updatedAt'>>
}

const EMPLOYMENT_TYPES = ['正社員', '契約社員', '派遣社員', 'パート・アルバイト', '業務委託', 'その他']
const GENDER_OPTIONS = ['男性', '女性', 'その他']

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border bg-white p-6 space-y-4">
      <h2 className="text-base font-semibold border-b border-border pb-2">{title}</h2>
      {children}
    </section>
  )
}

export function CaCandidateForm({ candidate, agents = [], prefill }: Props) {
  const router = useRouter()
  const isEdit = !!candidate
  const formKey = candidate?.id ?? 'new'

  // prefill は複製 / テンプレートから作成時に渡される
  const init = candidate ?? prefill ?? {}

  // 基本情報
  const [name, setName] = useState((init as Partial<Candidate>).name ?? '')
  const [nameKana, setNameKana] = useState((init as Partial<Candidate>).nameKana ?? '')
  const [email, setEmail] = useState((init as Partial<Candidate>).email ?? '')
  const [phone, setPhone] = useState((init as Partial<Candidate>).phone ?? '')
  const [gender, setGender] = useState((init as Partial<Candidate>).gender ?? '')
  const [birthDate, setBirthDate] = useState((init as Partial<Candidate>).birthDate ?? '')
  const [location, setLocation] = useState((init as Partial<Candidate>).location ?? '')

  // 経歴
  const [lastEducation, setLastEducation] = useState((init as Partial<Candidate>).lastEducation ?? '')
  const [graduatedSchool, setGraduatedSchool] = useState((init as Partial<Candidate>).graduatedSchool ?? '')
  const [experienceCount, setExperienceCount] = useState((init as Partial<Candidate>).experienceCount?.toString() ?? '')
  const [experienceJobTypes, setExperienceJobTypes] = useState((init as Partial<Candidate>).experienceJobTypes ?? '')
  const [experienceIndustries, setExperienceIndustries] = useState((init as Partial<Candidate>).experienceIndustries ?? '')
  const [currentSalary, setCurrentSalary] = useState((init as Partial<Candidate>).currentSalary?.toString() ?? '')

  // 就業履歴
  const [workHistories, setWorkHistories] = useState<WorkHistoryEntry[]>(
    ((init as Partial<Candidate>).workHistories ?? []).map((wh: WorkHistory) => ({
      companyName: wh.companyName ?? '',
      employmentType: wh.employmentType ?? '',
      period: wh.period ?? '',
      industry: wh.industry ?? '',
      jobType: wh.jobType ?? '',
      salary: wh.salary?.toString() ?? '',
    })),
  )

  // 希望条件
  const [desiredLocation, setDesiredLocation] = useState((init as Partial<Candidate>).desiredLocation ?? '')
  const [desiredSalary, setDesiredSalary] = useState((init as Partial<Candidate>).desiredSalary?.toString() ?? '')

  // 推薦用情報
  const [recommendationText, setRecommendationText] = useState((init as Partial<Candidate>).recommendationText ?? '')
  const [resumeUrl, setResumeUrl] = useState((init as Partial<Candidate>).resumeUrl ?? '')
  const [cvUrl, setCvUrl] = useState((init as Partial<Candidate>).cvUrl ?? '')

  // 自社管理用情報
  const [mainAgentId, setMainAgentId] = useState((init as Partial<Candidate>).mainAgentId ?? '')
  const [subAgentId, setSubAgentId] = useState((init as Partial<Candidate>).subAgentId ?? '')
  const [memo, setMemo] = useState((init as Partial<Candidate>).memo ?? '')

  const [loading, setLoading] = useState(false)

  function addWorkHistory() {
    setWorkHistories(prev => [
      ...prev,
      { companyName: '', employmentType: '正社員', period: '', industry: '', jobType: '', salary: '' },
    ])
  }

  function removeWorkHistory(index: number) {
    setWorkHistories(prev => prev.filter((_, i) => i !== index))
  }

  function updateWorkHistory(index: number, key: keyof WorkHistoryEntry, value: string) {
    setWorkHistories(prev => prev.map((item, i) => (i === index ? { ...item, [key]: value } : item)))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const payload = {
      name,
      nameKana: nameKana || undefined,
      email: email || undefined,
      phone: phone || undefined,
      gender: gender || undefined,
      birthDate: birthDate || undefined,
      location: location || undefined,
      lastEducation: lastEducation || undefined,
      graduatedSchool: graduatedSchool || undefined,
      experienceCount: experienceCount ? Number(experienceCount) : undefined,
      experienceJobTypes: experienceJobTypes || undefined,
      experienceIndustries: experienceIndustries || undefined,
      currentSalary: currentSalary ? Number(currentSalary) : undefined,
      workHistories: workHistories.map(wh => ({
        companyName: wh.companyName,
        employmentType: wh.employmentType || undefined,
        period: wh.period || undefined,
        industry: wh.industry || undefined,
        jobType: wh.jobType || undefined,
        salary: wh.salary ? Number(wh.salary) : undefined,
      })),
      desiredLocation: desiredLocation || undefined,
      desiredSalary: desiredSalary ? Number(desiredSalary) : undefined,
      recommendationText: recommendationText || undefined,
      resumeUrl: resumeUrl || undefined,
      cvUrl: cvUrl || undefined,
      mainAgentId: mainAgentId || undefined,
      subAgentId: subAgentId || undefined,
      memo: memo || undefined,
    }

    const url = isEdit ? `/api/candidates?id=${candidate!.id}` : '/api/candidates'
    const method = isEdit ? 'PUT' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (res.ok) {
      const saved = await res.json()
      toast.success(isEdit ? '候補者情報を更新しました' : '候補者を登録しました')
      router.push(`/dashboard/ca/candidates/${saved.id}`)
      router.refresh()
    } else {
      toast.error('保存に失敗しました')
    }

    setLoading(false)
  }

  async function handleDelete() {
    if (!candidate) return
    if (!confirm('この候補者を削除しますか？')) return

    const res = await fetch(`/api/candidates?id=${candidate.id}`, { method: 'DELETE' })
    if (res.ok) {
      toast.success('候補者を削除しました')
      router.push('/dashboard/ca/candidates')
      router.refresh()
      return
    }
    toast.error('削除に失敗しました')
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
        <h1 className="text-2xl font-bold tracking-tight">{isEdit ? '候補者詳細・編集' : '候補者登録'}</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 基本情報 */}
        <SectionCard title="基本情報">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="name">求職者名 *</Label>
              <Input id="name" value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="nameKana">求職者名（ふりがな）</Label>
              <Input
                id="nameKana"
                value={nameKana}
                onChange={e => setNameKana(e.target.value)}
                placeholder="例：やまだ たろう"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="email">メールアドレス</Label>
              <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">電話番号</Label>
              <Input id="phone" value={phone} onChange={e => setPhone(e.target.value)} />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="gender">性別</Label>
              <select
                id="gender"
                value={gender}
                onChange={e => setGender(e.target.value)}
                className="h-10 w-full rounded-md border border-input bg-white px-3 text-sm"
              >
                <option value="">未選択</option>
                {GENDER_OPTIONS.map(opt => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="birthDate">生年月日</Label>
              <Input id="birthDate" type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="location">居住地</Label>
            <Input
              id="location"
              value={location}
              onChange={e => setLocation(e.target.value)}
              placeholder="例：東京都渋谷区"
            />
          </div>
        </SectionCard>

        {/* 経歴 */}
        <SectionCard title="経歴">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="lastEducation">最終学歴</Label>
              <Input
                id="lastEducation"
                value={lastEducation}
                onChange={e => setLastEducation(e.target.value)}
                placeholder="例：大学院卒"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="graduatedSchool">卒業学校名</Label>
              <Input
                id="graduatedSchool"
                value={graduatedSchool}
                onChange={e => setGraduatedSchool(e.target.value)}
                placeholder="例：○○大学 ○○学部"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="experienceCount">経験社数</Label>
              <Input
                id="experienceCount"
                type="number"
                min={0}
                value={experienceCount}
                onChange={e => setExperienceCount(e.target.value)}
                placeholder="0"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="currentSalary">現在の年収（万円）</Label>
              <Input
                id="currentSalary"
                type="number"
                min={0}
                value={currentSalary}
                onChange={e => setCurrentSalary(e.target.value)}
                placeholder="例：500"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="experienceJobTypes">経験職種</Label>
              <Input
                id="experienceJobTypes"
                value={experienceJobTypes}
                onChange={e => setExperienceJobTypes(e.target.value)}
                placeholder="例：営業、マーケティング"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="experienceIndustries">経験業種</Label>
              <Input
                id="experienceIndustries"
                value={experienceIndustries}
                onChange={e => setExperienceIndustries(e.target.value)}
                placeholder="例：IT・通信、金融"
              />
            </div>
          </div>
        </SectionCard>

        {/* 就業履歴 */}
        <SectionCard title="就業履歴">
          {workHistories.length === 0 && (
            <p className="text-sm text-muted-foreground">就業履歴はまだ登録されていません。</p>
          )}

          {workHistories.map((wh, i) => (
            <div key={i} className="rounded-lg border border-border p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">就業履歴 {i + 1}</span>
                <button
                  type="button"
                  onClick={() => removeWorkHistory(i)}
                  className="text-destructive hover:text-destructive/80"
                  aria-label="削除"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-1.5">
                <Label>企業名</Label>
                <Input
                  value={wh.companyName}
                  onChange={e => updateWorkHistory(i, 'companyName', e.target.value)}
                  placeholder="例：株式会社○○"
                />
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>就業形態</Label>
                  <select
                    value={wh.employmentType}
                    onChange={e => updateWorkHistory(i, 'employmentType', e.target.value)}
                    className="h-10 w-full rounded-md border border-input bg-white px-3 text-sm"
                  >
                    <option value="">未選択</option>
                    {EMPLOYMENT_TYPES.map(opt => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label>在籍期間</Label>
                  <Input
                    value={wh.period}
                    onChange={e => updateWorkHistory(i, 'period', e.target.value)}
                    placeholder="例：2020年4月 〜 2023年3月"
                  />
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>経験業種</Label>
                  <Input
                    value={wh.industry}
                    onChange={e => updateWorkHistory(i, 'industry', e.target.value)}
                    placeholder="例：IT・通信"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>経験職種</Label>
                  <Input
                    value={wh.jobType}
                    onChange={e => updateWorkHistory(i, 'jobType', e.target.value)}
                    placeholder="例：営業"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>年収（万円）</Label>
                <Input
                  type="number"
                  min={0}
                  value={wh.salary}
                  onChange={e => updateWorkHistory(i, 'salary', e.target.value)}
                  placeholder="例：450"
                />
              </div>
            </div>
          ))}

          <Button type="button" variant="outline" size="sm" onClick={addWorkHistory} className="mt-1">
            <Plus className="h-4 w-4 mr-1" />
            就業履歴を追加
          </Button>
        </SectionCard>

        {/* 希望条件 */}
        <SectionCard title="希望条件">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="desiredLocation">希望勤務地</Label>
              <Input
                id="desiredLocation"
                value={desiredLocation}
                onChange={e => setDesiredLocation(e.target.value)}
                placeholder="例：東京都内"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="desiredSalary">希望年収（万円）</Label>
              <Input
                id="desiredSalary"
                type="number"
                min={0}
                value={desiredSalary}
                onChange={e => setDesiredSalary(e.target.value)}
                placeholder="例：600"
              />
            </div>
          </div>
        </SectionCard>

        {/* 推薦用情報 */}
        <SectionCard title="推薦用情報">
          <div className="space-y-1.5">
            <Label>推薦文</Label>
            <RichTextEditor
              key={`${formKey}-recommendation`}
              defaultValue={recommendationText}
              onChange={setRecommendationText}
              placeholder="推薦文を入力..."
              minHeight="150px"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="resumeUrl">履歴書（URL）</Label>
              <Input
                id="resumeUrl"
                value={resumeUrl}
                onChange={e => setResumeUrl(e.target.value)}
                placeholder="https://..."
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cvUrl">経歴書（URL）</Label>
              <Input
                id="cvUrl"
                value={cvUrl}
                onChange={e => setCvUrl(e.target.value)}
                placeholder="https://..."
              />
            </div>
          </div>
        </SectionCard>

        {/* 自社管理用情報 */}
        <SectionCard title="自社管理用情報">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="mainAgentId">メイン担当者</Label>
              {agents.length > 0 ? (
                <select
                  id="mainAgentId"
                  value={mainAgentId}
                  onChange={e => setMainAgentId(e.target.value)}
                  className="h-10 w-full rounded-md border border-input bg-white px-3 text-sm"
                >
                  <option value="">未選択</option>
                  {agents.map(agent => (
                    <option key={agent.id} value={agent.id}>
                      {agent.name}
                    </option>
                  ))}
                </select>
              ) : (
                <Input
                  id="mainAgentId"
                  value={mainAgentId}
                  onChange={e => setMainAgentId(e.target.value)}
                  placeholder="担当者名を入力"
                />
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="subAgentId">サブ担当者</Label>
              {agents.length > 0 ? (
                <select
                  id="subAgentId"
                  value={subAgentId}
                  onChange={e => setSubAgentId(e.target.value)}
                  className="h-10 w-full rounded-md border border-input bg-white px-3 text-sm"
                >
                  <option value="">未選択</option>
                  {agents.map(agent => (
                    <option key={agent.id} value={agent.id}>
                      {agent.name}
                    </option>
                  ))}
                </select>
              ) : (
                <Input
                  id="subAgentId"
                  value={subAgentId}
                  onChange={e => setSubAgentId(e.target.value)}
                  placeholder="担当者名を入力"
                />
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>メモ</Label>
            <RichTextEditor
              key={`${formKey}-memo`}
              defaultValue={memo}
              onChange={setMemo}
              placeholder="候補者に関するメモを入力..."
              minHeight="150px"
            />
          </div>
        </SectionCard>

        <div className="flex gap-3 pb-8">
          <Button type="submit" disabled={loading}>
            {loading ? '保存中...' : isEdit ? '更新する' : '登録する'}
          </Button>
          {isEdit && (
            <Button type="button" variant="destructive" onClick={handleDelete}>
              削除
            </Button>
          )}
          <Button type="button" variant="outline" onClick={() => router.push('/dashboard/ca/candidates')}>
            一覧へ戻る
          </Button>
        </div>
      </form>
    </div>
  )
}

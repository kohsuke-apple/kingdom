'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import type { Company } from '@/types/recruiting'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RichTextEditor } from '@/components/ui/rich-text-editor'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function HiringCompanyProfileForm({ companies }: { companies: Company[] }) {
  const defaultCompany = companies[0]
  const [selectedCompanyId, setSelectedCompanyId] = useState(defaultCompany?.id ?? '')
  const [saving, setSaving] = useState(false)

  const selected = companies.find(c => c.id === selectedCompanyId) ?? defaultCompany

  const [officialWebsite, setOfficialWebsite] = useState(selected?.officialWebsite ?? '')
  const [businessDescription, setBusinessDescription] = useState(selected?.businessDescription ?? '')
  const [transferCase, setTransferCase] = useState(selected?.transferCase ?? '')
  const [employeeIntroduction, setEmployeeIntroduction] = useState(selected?.employeeIntroduction ?? '')

  function handleSelectCompany(companyId: string) {
    setSelectedCompanyId(companyId)
    const company = companies.find(c => c.id === companyId)
    setOfficialWebsite(company?.officialWebsite ?? '')
    setBusinessDescription(company?.businessDescription ?? '')
    setTransferCase(company?.transferCase ?? '')
    setEmployeeIntroduction(company?.employeeIntroduction ?? '')
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedCompanyId) return
    setSaving(true)

    const res = await fetch(`/api/companies?id=${selectedCompanyId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        officialWebsite: officialWebsite || undefined,
        businessDescription: businessDescription || undefined,
        transferCase: transferCase || undefined,
        employeeIntroduction: employeeIntroduction || undefined,
      }),
    })

    if (!res.ok) {
      const data = await res.json().catch(() => ({ error: '保存に失敗しました' }))
      toast.error(data.error ?? '保存に失敗しました')
      setSaving(false)
      return
    }

    toast.success('会社プロフィールを更新しました')
    setSaving(false)
  }

  return (
    <div className="mx-auto max-w-4xl p-8">
      <div className="mb-8 border-b border-border pb-6">
        <h1 className="text-2xl font-bold tracking-tight">採用モード / 会社プロフィール設定</h1>
        <p className="mt-1 text-sm text-muted-foreground">公式HP・事業内容・転職事例・社員紹介を設定します。</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>会社プロフィール</CardTitle>
          <CardDescription>求人一覧から参照される会社情報を編集できます。</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-1.5">
              <Label>会社</Label>
              <select
                className="h-10 w-full rounded-md border border-input bg-white px-3 text-sm"
                value={selectedCompanyId}
                onChange={e => handleSelectCompany(e.target.value)}
              >
                {companies.map(company => (
                  <option key={company.id} value={company.id}>{company.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label>公式HP</Label>
              <Input
                type="url"
                value={officialWebsite}
                onChange={e => setOfficialWebsite(e.target.value)}
                placeholder="https://example.com"
              />
            </div>

            <div className="space-y-1.5">
              <Label>事業内容</Label>
              <RichTextEditor key={`${selectedCompanyId}-bd`} defaultValue={businessDescription} onChange={setBusinessDescription} placeholder="事業内容を入力..." minHeight="130px" />
            </div>

            <div className="space-y-1.5">
              <Label>転職事例</Label>
              <RichTextEditor key={`${selectedCompanyId}-tc`} defaultValue={transferCase} onChange={setTransferCase} placeholder="転職事例を入力..." minHeight="130px" />
            </div>

            <div className="space-y-1.5">
              <Label>社員紹介</Label>
              <RichTextEditor key={`${selectedCompanyId}-ei`} defaultValue={employeeIntroduction} onChange={setEmployeeIntroduction} placeholder="社員紹介を入力..." minHeight="130px" />
            </div>

            <Button type="submit" disabled={saving}>{saving ? '保存中...' : '保存する'}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

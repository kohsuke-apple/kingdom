'use client'

import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import type { Agent, Company } from '@/types/recruiting'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RichTextEditor } from '@/components/ui/rich-text-editor'

type Props = {
  companies: Company[]
  initialAgents: Agent[]
}

export function CompanySettingsManager({ companies, initialAgents }: Props) {
  const defaultCompany = useMemo(() => companies.find(c => c.isMyCompany) ?? companies[0], [companies])
  const [selectedCompanyId, setSelectedCompanyId] = useState(defaultCompany?.id ?? '')
  const [name, setName] = useState(defaultCompany?.name ?? '')
  const [industry, setIndustry] = useState(defaultCompany?.industry ?? '')
  const [location, setLocation] = useState(defaultCompany?.location ?? '')
  const [memo, setMemo] = useState(defaultCompany?.memo ?? '')
  const [agents, setAgents] = useState(initialAgents)

  const [agentName, setAgentName] = useState('')
  const [agentEmail, setAgentEmail] = useState('')
  const [agentRoleType, setAgentRoleType] = useState<'CA' | 'RA' | 'both'>('both')
  const [agentMemo, setAgentMemo] = useState('')
  const [agentFormKey, setAgentFormKey] = useState(0)
  const [saving, setSaving] = useState(false)

  async function reloadAgents(companyId: string) {
    const res = await fetch(`/api/agents?companyId=${companyId}`)
    if (!res.ok) return
    const data = (await res.json()) as Agent[]
    setAgents(data)
  }

  async function handleCompanyChange(companyId: string) {
    setSelectedCompanyId(companyId)
    const company = companies.find(c => c.id === companyId)
    setName(company?.name ?? '')
    setIndustry(company?.industry ?? '')
    setLocation(company?.location ?? '')
    setMemo(company?.memo ?? '')
    await reloadAgents(companyId)
  }

  async function handleSaveCompany() {
    setSaving(true)
    try {
      if (!selectedCompanyId) {
        const createRes = await fetch('/api/companies', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, industry, location, memo, isMyCompany: true }),
        })
        if (!createRes.ok) throw new Error('会社情報の作成に失敗しました')
        toast.success('会社情報を作成しました。ページを再読み込みします')
        window.location.reload()
        return
      }

      const res = await fetch(`/api/companies?id=${selectedCompanyId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, industry, location, memo }),
      })

      if (!res.ok) throw new Error('会社情報の更新に失敗しました')
      toast.success('会社情報を更新しました')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '保存に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  async function handleAddAgent() {
    if (!selectedCompanyId || !agentName.trim()) {
      toast.error('会社と担当者名を入力してください')
      return
    }

    const res = await fetch('/api/agents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        companyId: selectedCompanyId,
        name: agentName.trim(),
        email: agentEmail || undefined,
        roleType: agentRoleType,
        memo: agentMemo || undefined,
      }),
    })

    if (!res.ok) {
      toast.error('担当者の追加に失敗しました')
      return
    }

    setAgentName('')
    setAgentEmail('')
    setAgentRoleType('both')
    setAgentMemo('')
    setAgentFormKey(k => k + 1)
    await reloadAgents(selectedCompanyId)
    toast.success('担当者を追加しました')
  }

  async function handleDeleteAgent(id: string) {
    const res = await fetch(`/api/agents?id=${id}`, { method: 'DELETE' })
    if (!res.ok) {
      toast.error('担当者の削除に失敗しました')
      return
    }
    await reloadAgents(selectedCompanyId)
    toast.success('担当者を削除しました')
  }

  return (
    <div className="mx-auto max-w-5xl p-8">
      <div className="mb-8 border-b border-border pb-6">
        <h1 className="text-2xl font-bold tracking-tight">会社設定</h1>
        <p className="mt-1 text-sm text-muted-foreground">自社情報と担当者（CA/RA）を管理します。</p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>自社情報</CardTitle>
            <CardDescription>会社単位の設定を更新できます。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {companies.length > 0 && (
              <div className="space-y-1.5">
                <Label htmlFor="company">会社</Label>
                <select
                  id="company"
                  className="h-10 w-full rounded-md border border-input bg-white px-3 text-sm"
                  value={selectedCompanyId}
                  onChange={e => void handleCompanyChange(e.target.value)}
                >
                  {companies.map(company => (
                    <option key={company.id} value={company.id}>
                      {company.name}{company.isMyCompany ? '（自社）' : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="name">会社名 *</Label>
                <Input id="name" value={name} onChange={e => setName(e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="industry">業界</Label>
                <Input id="industry" value={industry} onChange={e => setIndustry(e.target.value)} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="location">所在地</Label>
              <Input id="location" value={location} onChange={e => setLocation(e.target.value)} />
            </div>

            <div className="space-y-1.5">
              <Label>メモ</Label>
              <RichTextEditor key={selectedCompanyId} defaultValue={memo} onChange={setMemo} placeholder="会社に関するメモを入力..." />
            </div>

            <Button onClick={handleSaveCompany} disabled={saving || !name.trim()}>
              {saving ? '保存中...' : '会社情報を保存'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>担当者管理</CardTitle>
            <CardDescription>自社のCA/RA担当者を管理します。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 rounded-md border p-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="agentName">担当者名 *</Label>
                <Input id="agentName" value={agentName} onChange={e => setAgentName(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="agentEmail">メール</Label>
                <Input id="agentEmail" type="email" value={agentEmail} onChange={e => setAgentEmail(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="agentRole">役割</Label>
                <select
                  id="agentRole"
                  className="h-10 w-full rounded-md border border-input bg-white px-3 text-sm"
                  value={agentRoleType}
                  onChange={e => setAgentRoleType(e.target.value as 'CA' | 'RA' | 'both')}
                >
                  <option value="CA">CA</option>
                  <option value="RA">RA</option>
                  <option value="both">both</option>
                </select>
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <Label>メモ</Label>
                <RichTextEditor key={agentFormKey} defaultValue={agentMemo} onChange={setAgentMemo} placeholder="担当者に関するメモを入力..." minHeight="80px" />
              </div>
              <div>
                <Button type="button" onClick={() => void handleAddAgent()} disabled={!selectedCompanyId}>
                  担当者を追加
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto rounded-md border">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b bg-muted/30 text-left text-muted-foreground">
                    <th className="px-4 py-3">名前</th>
                    <th className="px-4 py-3">メール</th>
                    <th className="px-4 py-3">役割</th>
                    <th className="px-4 py-3">メモ</th>
                    <th className="w-24 px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {agents.map(agent => (
                    <tr key={agent.id} className="border-b">
                      <td className="px-4 py-3 font-medium">{agent.name}</td>
                      <td className="px-4 py-3">{agent.email ?? '-'}</td>
                      <td className="px-4 py-3">{agent.roleType}</td>
                      <td className="px-4 py-3">{agent.memo ?? '-'}</td>
                      <td className="px-4 py-3 text-right">
                        <Button variant="ghost" size="sm" onClick={() => void handleDeleteAgent(agent.id)}>
                          削除
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {agents.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                        担当者がまだ登録されていません
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

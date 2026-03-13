"use client"

import React, { useMemo, useState } from 'react'
import { toast } from 'sonner'
import type { Agent, Company } from '@/types/recruiting'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type Props = {
  companies: Company[]
  initialAgents: Agent[]
}

export default function RaManagementManager({ companies, initialAgents }: Props) {
  const defaultCompany = useMemo(() => companies.find(c => c.isMyCompany) ?? companies[0], [companies])
  const [selectedCompanyId, setSelectedCompanyId] = useState(defaultCompany?.id ?? '')
  const [agents, setAgents] = useState<Agent[]>(
    (initialAgents ?? []).filter(a => a.roleType !== 'CA' && a.roleType !== 'RA'),
  )

  const [agentName, setAgentName] = useState('')
  const [agentEmail, setAgentEmail] = useState('')
  const [agentMemo, setAgentMemo] = useState('')
  const [agentFormKey, setAgentFormKey] = useState(0)
  const [selectedRole, setSelectedRole] = useState<Agent['roleType']>('EMPLOYEE')

  async function reloadAgents(companyId: string) {
    const res = await fetch(`/api/agents?companyId=${companyId}`)
    if (!res.ok) return
    const data = (await res.json()) as Agent[]
    // Exclude CA/RA here — this manager is for other internal members / contractors
    setAgents(data.filter(a => a.roleType !== 'CA' && a.roleType !== 'RA'))
  }

  async function handleCompanyChange(companyId: string) {
    setSelectedCompanyId(companyId)
    await reloadAgents(companyId)
  }

  async function handleAddAgent() {
    if (!selectedCompanyId || !agentName.trim()) {
      toast.error('会社とメンバー名を入力してください')
      return
    }

    const res = await fetch('/api/agents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        companyId: selectedCompanyId,
        name: agentName.trim(),
        email: agentEmail || undefined,
        roleType: selectedRole,
        memo: agentMemo || undefined,
      }),
    })

    if (!res.ok) {
      toast.error('担当者の追加に失敗しました')
      return
    }

    setAgentName('')
    setAgentEmail('')
    setAgentMemo('')
    setAgentFormKey(k => k + 1)
    await reloadAgents(selectedCompanyId)
    toast.success('メンバーを追加しました')
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
    <div className="mx-auto max-w-5xl p-4 md:p-8">
      <div className="mb-8 border-b border-border pb-6">
        <h1 className="text-2xl font-bold tracking-tight">メンバー管理</h1>
        <p className="mt-1 text-sm text-muted-foreground">CA/RA はそれぞれの管理ページから追加してください。ここでは事務サポート、事業部長、業務委託などの全メンバーを管理します。</p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>社員・メンバー管理（CA/RA除く）</CardTitle>
            <CardDescription>対象会社を選択してメンバー（社員・業務委託など）を追加・削除できます。</CardDescription>
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
                <Label htmlFor="role">役割</Label>
                <select
                  id="role"
                  className="h-10 w-full rounded-md border border-input bg-white px-3 text-sm"
                  value={selectedRole}
                  onChange={e => setSelectedRole(e.target.value as Agent['roleType'])}
                >
                  <option value="EMPLOYEE">社員</option>
                  <option value="MANAGER">事業部長</option>
                  <option value="CONTRACTOR">業務委託</option>
                  <option value="OTHER">その他</option>
                </select>
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <Label>メモ</Label>
                <Input key={agentFormKey} value={agentMemo} onChange={e => setAgentMemo(e.target.value)} />
              </div>
              <div>
                <Button type="button" onClick={() => void handleAddAgent()} disabled={!selectedCompanyId}>
                  メンバーを追加
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
                      <td className="px-4 py-3">{agent.roleType ?? '-'}</td>
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
                      <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                        RA 担当者がまだ登録されていません
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

"use client"

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent, CardAction } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { Agent, Candidate, CompanyCandidateSelection, CandidateJobStatus } from '@/types/recruiting'

export default function AgentsManagement({ roleFilter = 'CA', selectionScope = 'ca' }: { roleFilter?: 'CA' | 'RA' | 'all'; selectionScope?: 'ca' | 'ra' }) {
  const [agents, setAgents] = useState<Agent[]>([])
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [companies, setCompanies] = useState<{ id: string; name: string }[]>([])
  const [selections, setSelections] = useState<(CompanyCandidateSelection | CandidateJobStatus)[]>([])
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)

  // form state
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [career, setCareer] = useState('')
  const [mainArea, setMainArea] = useState<'sales' | 'engineer' | 'other'>('sales')
  const [contactTool, setContactTool] = useState('')
  const [royalPartnerCompanyId, setRoyalPartnerCompanyId] = useState('')
  const [period, setPeriod] = useState<'total' | 'year' | 'month'>('total')

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function fetchData() {
    setLoading(true)
    try {
      const [aRes, cRes, comps] = await Promise.all([
        fetch('/api/agents').then(r => r.json()),
        fetch('/api/candidates').then(r => r.json()),
        fetch('/api/companies').then(r => r.json()),
      ])
      setAgents(Array.isArray(aRes) ? aRes : [])
      setCandidates(Array.isArray(cRes) ? cRes : [])
      setCompanies(Array.isArray(comps) ? comps : [])
      const selRes = await fetch(`/api/selections?scope=${selectionScope}`).then(r => r.json())
      setSelections(Array.isArray(selRes) ? selRes : [])
    } finally {
      setLoading(false)
    }
  }

  function inPeriod(dateStr?: string) {
    if (!dateStr) return true
    const d = new Date(dateStr)
    const now = new Date()
    if (period === 'total') return true
    if (period === 'year') return d.getFullYear() === now.getFullYear()
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
  }

  function computeMetricsForAgent(agentId: string) {
    const agentCandidateIds = candidates.filter(c => c.mainAgentId === agentId || c.subAgentId === agentId).map(c => c.id)
    const relevant = selections.filter(s => {
      const time = 'createdAt' in s && s.createdAt ? s.createdAt : s.updatedAt
      return agentCandidateIds.includes(s.candidateId) && inPeriod(time)
    })

    const counts = { applied: 0, document_pass: 0, interview: 0, offer: 0, hired: 0 }
    for (const s of relevant) {
      if (s.stage === 'applied') counts.applied++
      if (s.stage === 'document_pass') counts.document_pass++
      if (s.stage === 'interview_1' || s.stage === 'interview_2') counts.interview++
      if (s.stage === 'offer') counts.offer++
      if (s.stage === 'hired') counts.hired++
    }

    const docPassRate = counts.applied > 0 ? Math.round((counts.document_pass / counts.applied) * 100) : 0
    const interviewRate = counts.applied > 0 ? Math.round((counts.interview / counts.applied) * 100) : 0
    const offerRate = counts.applied > 0 ? Math.round((counts.offer / counts.applied) * 100) : 0
    const hiredRate = counts.applied > 0 ? Math.round((counts.hired / counts.applied) * 100) : 0

    return {
      applied: counts.applied,
      document_pass: counts.document_pass,
      document_pass_rate: docPassRate,
      interview: counts.interview,
      interview_rate: interviewRate,
      offer: counts.offer,
      offer_rate: offerRate,
      hired: counts.hired,
      hired_rate: hiredRate,
    }
  }

  function countForAgent(agentId: string) {
    return candidates.filter(c => c.mainAgentId === agentId || c.subAgentId === agentId).length
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!name) return
    setLoading(true)
    try {
      const res = await fetch('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          phone,
          career,
          mainArea,
          contactTool,
          companyId: royalPartnerCompanyId || undefined,
          royalPartnerCompanyId: royalPartnerCompanyId || undefined,
          roleType: roleFilter === 'all' ? 'both' : roleFilter,
        }),
      })
      if (res.ok) {
        setName('')
        setEmail('')
        setPhone('')
        setCareer('')
        setMainArea('sales')
        setContactTool('')
        setRoyalPartnerCompanyId('')
        setModalOpen(false)
        await fetchData()
      } else {
        console.error('failed to create agent', await res.text())
      }
    } finally {
      setLoading(false)
    }
  }

  const visibleAgents = agents.filter(a => (roleFilter === 'all' ? true : a.roleType === roleFilter))

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>{roleFilter} 一覧と候補者数</CardTitle>
            <CardAction>
            <Button type="button" onClick={() => setModalOpen(true)}>{roleFilter}を追加</Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          {modalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
              <div className="rounded-lg bg-white p-6 w-full max-w-lg">
                <h3 className="mb-4 text-lg font-semibold">{roleFilter}を追加</h3>
                <form onSubmit={handleCreate} className="flex flex-col gap-4">
                  <div>
                    <Label htmlFor="agent-name">名前 *</Label>
                    <Input id="agent-name" className="mt-1" placeholder="例: 山田 太郎" value={name} onChange={e => setName(e.target.value)} required />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="agent-email">メール</Label>
                      <Input id="agent-email" type="email" className="mt-1" placeholder="例: taro@example.com" value={email} onChange={e => setEmail(e.target.value)} />
                    </div>
                    <div>
                      <Label htmlFor="agent-phone">電話番号</Label>
                      <Input id="agent-phone" className="mt-1" placeholder="例: 090-1234-5678" value={phone} onChange={e => setPhone(e.target.value)} />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="agent-mainarea">専門分野</Label>
                    <select id="agent-mainarea" className="h-10 w-full rounded-md border border-input bg-white px-3 text-sm mt-1" value={mainArea} onChange={e => setMainArea(e.target.value as 'sales' | 'engineer' | 'other')}>
                      <option value="sales">営業</option>
                      <option value="engineer">エンジニア</option>
                      <option value="other">その他</option>
                    </select>
                    <p className="text-xs text-muted-foreground mt-1">この担当者の得意領域を選んでください（候補者の絞り込みに使用します）。</p>
                  </div>

                  <div>
                    <Label htmlFor="agent-career">経歴（任意）</Label>
                    <Textarea id="agent-career" className="mt-1" placeholder="過去の職務概要や得意スキルを簡潔に記載" value={career} onChange={e => setCareer(e.target.value)} />
                  </div>

                  <div>
                    <Label htmlFor="agent-contact">連絡ツール（任意）</Label>
                    <Input id="agent-contact" className="mt-1" placeholder="例: Slack (username), LINE" value={contactTool} onChange={e => setContactTool(e.target.value)} />
                  </div>

                  <div>
                    <Label htmlFor="agent-company">ロイヤルパートナー企業（任意）</Label>
                    <select id="agent-company" className="h-10 w-full rounded-md border border-input bg-white px-3 text-sm mt-1" value={royalPartnerCompanyId} onChange={e => setRoyalPartnerCompanyId(e.target.value)}>
                      <option value="">選択しない</option>
                      {companies.map(c => (<option key={c.id} value={c.id}>{c.name}</option>))}
                    </select>
                  </div>

                  <div className="flex items-center justify-end gap-2">
                    <Button type="submit" disabled={loading}>{loading ? '追加中...' : '追加'}</Button>
                    <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>キャンセル</Button>
                  </div>
                </form>
              </div>
            </div>
          )}

          <div className="mb-4 flex items-center gap-3">
            <label className="text-sm">期間:</label>
            <select className="rounded border px-2 py-1" value={period} onChange={e => setPeriod(e.target.value as 'total' | 'year' | 'month')}>
              <option value="total">全期間</option>
              <option value="year">今年</option>
              <option value="month">今月</option>
            </select>
          </div>

          {loading && <div>読み込み中...</div>}
          {!loading && (
            <div className="flex flex-col gap-2">
              {visibleAgents.length === 0 && <div className="text-sm text-muted-foreground">対象のエージェントが見つかりません</div>}
              {visibleAgents.map(a => (
                <div key={a.id} className="flex items-center justify-between rounded border px-3 py-2">
                  <Link href={`/dashboard/ca/agents/${a.id}`} className="flex-1">
                    <div>
                      <div className="font-medium">{a.name} {a.mainArea && <span className="text-xs ml-2 text-muted-foreground">({a.mainArea})</span>}</div>
                      <div className="text-sm text-muted-foreground">{a.email && <span>{a.email}</span>}{a.phone && <span className="ml-3">{a.phone}</span>}</div>
                      {a.career && <div className="text-sm text-muted-foreground mt-1">{a.career}</div>}
                      <div className="mt-2 text-xs text-muted-foreground">
                        {(() => {
                          const m = computeMetricsForAgent(a.id)
                          return (
                            <div className="grid grid-cols-3 gap-2">
                              <div>推薦: <strong>{m.applied}</strong></div>
                              <div>書類通過: <strong>{m.document_pass}</strong></div>
                              <div>書類通過率: <strong>{m.document_pass_rate}%</strong></div>
                              <div>面接設定: <strong>{m.interview}</strong></div>
                              <div>面接設定率: <strong>{m.interview_rate}%</strong></div>
                              <div>内定: <strong>{m.offer}</strong></div>
                              <div>内定率: <strong>{m.offer_rate}%</strong></div>
                              <div>決定: <strong>{m.hired}</strong></div>
                              <div>決定率: <strong>{m.hired_rate}%</strong></div>
                            </div>
                          )
                        })()}
                      </div>
                    </div>
                  </Link>
                  <div className="text-sm">候補者: <span className="font-semibold">{countForAgent(a.id)}</span></div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

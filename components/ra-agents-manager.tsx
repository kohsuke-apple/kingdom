"use client"

import React, { useState } from 'react'
import { Agent } from '@/types/recruiting'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type Props = {
  initialAgents: Agent[]
}

export default function RaAgentsManager({ initialAgents }: Props) {
  const [agents, setAgents] = useState<Agent[]>(initialAgents)
  const [isOpen, setIsOpen] = useState(false)
  const [editing, setEditing] = useState<Agent | null>(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')

  function openNew() {
    setEditing(null)
    setName('')
    setEmail('')
    setIsOpen(true)
  }

  function openEdit(a: Agent) {
    setEditing(a)
    setName(a.name)
    setEmail(a.email ?? '')
    setIsOpen(true)
  }

  async function save() {
    try {
      if (editing) {
        const res = await fetch(`/api/agents?id=${editing.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email }),
        })
        if (!res.ok) throw new Error('Failed')
        const updated = await res.json()
        setAgents(prev => prev.map(p => (p.id === updated.id ? updated : p)))
      } else {
        const res = await fetch('/api/agents', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email }),
        })
        if (!res.ok) throw new Error('Failed')
        const created = await res.json()
        setAgents(prev => [created, ...prev])
      }
      setIsOpen(false)
    } catch (err) {
      console.error(err)
      alert('保存に失敗しました')
    }
  }

  async function remove(id: string) {
    if (!confirm('削除してよいですか？')) return
    try {
      const res = await fetch(`/api/agents?id=${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed')
      setAgents(prev => prev.filter(p => p.id !== id))
    } catch (err) {
      console.error(err)
      alert('削除に失敗しました')
    }
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">エージェント管理</h2>
        <Button onClick={openNew}>エージェントを追加</Button>
      </div>

      <div className="rounded-lg border bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/30 text-left text-muted-foreground">
              <th className="px-4 py-3">名前</th>
              <th className="px-4 py-3">メール</th>
              <th className="px-4 py-3">操作</th>
            </tr>
          </thead>
          <tbody>
            {agents.map(a => (
              <tr key={a.id} className="border-b last:border-0">
                <td className="px-4 py-3 font-medium">{a.name}</td>
                <td className="px-4 py-3">{a.email ?? '-'}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Button variant="ghost" onClick={() => openEdit(a)}>編集</Button>
                    <Button variant="destructive" onClick={() => remove(a.id)}>削除</Button>
                  </div>
                </td>
              </tr>
            ))}
            {agents.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">エージェントが登録されていません</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="rounded-lg bg-white p-6 w-full max-w-lg">
            <h3 className="mb-4 text-lg font-semibold">{editing ? 'エージェントを編集' : 'エージェントを追加'}</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground">名前</label>
                <Input value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">メール</label>
                <Input value={email} onChange={e => setEmail(e.target.value)} />
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setIsOpen(false)}>キャンセル</Button>
              <Button onClick={save}>{editing ? '更新' : '作成'}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

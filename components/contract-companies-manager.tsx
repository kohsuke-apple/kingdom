'use client'

import { useState, useMemo } from 'react'
import { toast } from 'sonner'
import {
  Plus, Pencil, Trash2, CheckSquare, Square, Calendar, Receipt,
  Search, X, ChevronRight, FileText, AlertCircle, Building2,
} from 'lucide-react'
import type { ContractCompany, ContractTodo, ContractInvoice, InvoiceStatus } from '@/types/recruiting'

type Props = {
  initialCompanies: ContractCompany[]
  initialTodos: ContractTodo[]
  initialInvoices: ContractInvoice[]
}

const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  draft: '下書き',
  sent: '送付済み',
  paid: '入金済み',
  overdue: '期限超過',
  cancelled: '取消',
}

const INVOICE_STATUS_COLORS: Record<InvoiceStatus, string> = {
  draft: 'bg-gray-100 text-gray-600',
  sent: 'bg-blue-100 text-blue-700',
  paid: 'bg-green-100 text-green-700',
  overdue: 'bg-red-100 text-red-700',
  cancelled: 'bg-gray-100 text-gray-400',
}

type CompanyForm = {
  name: string
  plan: string
  contractStartDate: string
  contractEndDate: string
  contactName: string
  contactEmail: string
  memo: string
}

type InvoiceForm = {
  invoiceNumber: string
  amount: string
  issuedDate: string
  dueDate: string
  status: InvoiceStatus
  memo: string
}

const emptyCompanyForm = (): CompanyForm => ({
  name: '', plan: '', contractStartDate: '', contractEndDate: '',
  contactName: '', contactEmail: '', memo: '',
})

const emptyInvoiceForm = (): InvoiceForm => ({
  invoiceNumber: '', amount: '', issuedDate: '', dueDate: '',
  status: 'draft', memo: '',
})

export function ContractCompaniesManager({ initialCompanies, initialTodos, initialInvoices }: Props) {
  const [companies, setCompanies] = useState<ContractCompany[]>(initialCompanies)
  const [todos, setTodos] = useState<ContractTodo[]>(initialTodos)
  const [invoices, setInvoices] = useState<ContractInvoice[]>(initialInvoices)

  const [selectedId, setSelectedId] = useState<string | null>(
    initialCompanies.length > 0 ? initialCompanies[0].id : null
  )
  const [activeTab, setActiveTab] = useState<'todos' | 'invoices'>('todos')
  const [search, setSearch] = useState('')

  // 企業フォーム
  const [companyModal, setCompanyModal] = useState(false)
  const [editingCompany, setEditingCompany] = useState<ContractCompany | null>(null)
  const [companyForm, setCompanyForm] = useState<CompanyForm>(emptyCompanyForm())
  const [companySaving, setCompanySaving] = useState(false)

  // TODOフォーム
  const [newTodoTitle, setNewTodoTitle] = useState('')
  const [newTodoDueDate, setNewTodoDueDate] = useState('')
  const [todoSaving, setTodoSaving] = useState(false)

  // 請求書フォーム
  const [invoiceModal, setInvoiceModal] = useState(false)
  const [editingInvoice, setEditingInvoice] = useState<ContractInvoice | null>(null)
  const [invoiceForm, setInvoiceForm] = useState<InvoiceForm>(emptyInvoiceForm())
  const [invoiceSaving, setInvoiceSaving] = useState(false)

  // ── Derived ──────────────────────────────────────────────────────────
  const filteredCompanies = useMemo(
    () => companies.filter(c => c.name.toLowerCase().includes(search.toLowerCase())),
    [companies, search]
  )

  const selectedCompany = companies.find(c => c.id === selectedId) ?? null

  const companyTodos = useMemo(
    () => todos.filter(t => t.contractCompanyId === selectedId),
    [todos, selectedId]
  )
  const companyInvoices = useMemo(
    () => invoices.filter(i => i.contractCompanyId === selectedId),
    [invoices, selectedId]
  )

  // ── 企業CRUD ────────────────────────────────────────────────────────
  function openNewCompany() {
    setEditingCompany(null)
    setCompanyForm(emptyCompanyForm())
    setCompanyModal(true)
  }

  function openEditCompany(c: ContractCompany) {
    setEditingCompany(c)
    setCompanyForm({
      name: c.name,
      plan: c.plan ?? '',
      contractStartDate: c.contractStartDate ?? '',
      contractEndDate: c.contractEndDate ?? '',
      contactName: c.contactName ?? '',
      contactEmail: c.contactEmail ?? '',
      memo: c.memo ?? '',
    })
    setCompanyModal(true)
  }

  async function saveCompany() {
    if (!companyForm.name.trim()) { toast.error('企業名は必須です'); return }
    setCompanySaving(true)
    try {
      const body = {
        name: companyForm.name.trim(),
        plan: companyForm.plan || undefined,
        contractStartDate: companyForm.contractStartDate || undefined,
        contractEndDate: companyForm.contractEndDate || undefined,
        contactName: companyForm.contactName || undefined,
        contactEmail: companyForm.contactEmail || undefined,
        memo: companyForm.memo || undefined,
      }
      if (editingCompany) {
        const res = await fetch(`/api/contract-companies?id=${editingCompany.id}`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
        })
        if (!res.ok) throw new Error()
        const updated: ContractCompany = await res.json()
        setCompanies(prev => prev.map(c => c.id === updated.id ? updated : c))
        toast.success('更新しました')
      } else {
        const res = await fetch('/api/contract-companies', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
        })
        if (!res.ok) throw new Error()
        const created: ContractCompany = await res.json()
        setCompanies(prev => [created, ...prev])
        setSelectedId(created.id)
        toast.success('追加しました')
      }
      setCompanyModal(false)
    } catch {
      toast.error('保存に失敗しました')
    } finally {
      setCompanySaving(false)
    }
  }

  async function deleteCompany(id: string) {
    if (!confirm('この企業とすべてのTODO・請求書を削除しますか？')) return
    try {
      const res = await fetch(`/api/contract-companies?id=${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      setCompanies(prev => prev.filter(c => c.id !== id))
      setTodos(prev => prev.filter(t => t.contractCompanyId !== id))
      setInvoices(prev => prev.filter(i => i.contractCompanyId !== id))
      if (selectedId === id) setSelectedId(companies.find(c => c.id !== id)?.id ?? null)
      toast.success('削除しました')
    } catch {
      toast.error('削除に失敗しました')
    }
  }

  // ── TODO CRUD ────────────────────────────────────────────────────────
  async function addTodo() {
    if (!newTodoTitle.trim() || !selectedId) return
    setTodoSaving(true)
    try {
      const res = await fetch('/api/contract-todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contractCompanyId: selectedId,
          title: newTodoTitle.trim(),
          dueDate: newTodoDueDate || undefined,
          isCompleted: false,
        }),
      })
      if (!res.ok) throw new Error()
      const todo: ContractTodo = await res.json()
      setTodos(prev => [...prev, todo])
      setNewTodoTitle('')
      setNewTodoDueDate('')
    } catch {
      toast.error('追加に失敗しました')
    } finally {
      setTodoSaving(false)
    }
  }

  async function toggleTodo(todo: ContractTodo) {
    try {
      const res = await fetch(`/api/contract-todos?id=${todo.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isCompleted: !todo.isCompleted }),
      })
      if (!res.ok) throw new Error()
      const updated: ContractTodo = await res.json()
      setTodos(prev => prev.map(t => t.id === updated.id ? updated : t))
    } catch {
      toast.error('更新に失敗しました')
    }
  }

  async function deleteTodo(id: string) {
    try {
      const res = await fetch(`/api/contract-todos?id=${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      setTodos(prev => prev.filter(t => t.id !== id))
    } catch {
      toast.error('削除に失敗しました')
    }
  }

  // ── 請求書CRUD ─────────────────────────────────────────────────────
  function openNewInvoice() {
    setEditingInvoice(null)
    setInvoiceForm(emptyInvoiceForm())
    setInvoiceModal(true)
  }

  function openEditInvoice(inv: ContractInvoice) {
    setEditingInvoice(inv)
    setInvoiceForm({
      invoiceNumber: inv.invoiceNumber ?? '',
      amount: inv.amount?.toString() ?? '',
      issuedDate: inv.issuedDate ?? '',
      dueDate: inv.dueDate ?? '',
      status: inv.status,
      memo: inv.memo ?? '',
    })
    setInvoiceModal(true)
  }

  async function saveInvoice() {
    if (!selectedId) return
    setInvoiceSaving(true)
    try {
      const body = {
        contractCompanyId: selectedId,
        invoiceNumber: invoiceForm.invoiceNumber || undefined,
        amount: invoiceForm.amount ? parseInt(invoiceForm.amount) : undefined,
        issuedDate: invoiceForm.issuedDate || undefined,
        dueDate: invoiceForm.dueDate || undefined,
        status: invoiceForm.status,
        memo: invoiceForm.memo || undefined,
      }
      if (editingInvoice) {
        const res = await fetch(`/api/contract-invoices?id=${editingInvoice.id}`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
        })
        if (!res.ok) throw new Error()
        const updated: ContractInvoice = await res.json()
        setInvoices(prev => prev.map(i => i.id === updated.id ? updated : i))
        toast.success('更新しました')
      } else {
        const res = await fetch('/api/contract-invoices', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
        })
        if (!res.ok) throw new Error()
        const created: ContractInvoice = await res.json()
        setInvoices(prev => [created, ...prev])
        toast.success('追加しました')
      }
      setInvoiceModal(false)
    } catch {
      toast.error('保存に失敗しました')
    } finally {
      setInvoiceSaving(false)
    }
  }

  async function deleteInvoice(id: string) {
    if (!confirm('この請求書を削除しますか？')) return
    try {
      const res = await fetch(`/api/contract-invoices?id=${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      setInvoices(prev => prev.filter(i => i.id !== id))
      toast.success('削除しました')
    } catch {
      toast.error('削除に失敗しました')
    }
  }

  // ── Render helpers ────────────────────────────────────────────────
  const pendingTodosCount = (companyId: string) =>
    todos.filter(t => t.contractCompanyId === companyId && !t.isCompleted).length

  const unpaidAmount = (companyId: string) =>
    invoices
      .filter(i => i.contractCompanyId === companyId && (i.status === 'sent' || i.status === 'overdue'))
      .reduce((sum, i) => sum + (i.amount ?? 0), 0)

  // ── UI ────────────────────────────────────────────────────────────
  return (
    <div className="flex h-full" style={{ minHeight: 'calc(100vh - 48px)' }}>

      {/* ── 左パネル: 企業リスト ────────────────────────────────── */}
      <div className="w-72 shrink-0 border-r border-border bg-white flex flex-col">
        {/* ヘッダー */}
        <div className="px-4 pt-5 pb-3 border-b border-border">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-sm font-bold text-foreground">契約企業管理</h1>
            <button
              onClick={openNewCompany}
              className="flex items-center gap-1 text-xs font-semibold text-white bg-foreground hover:bg-foreground/80 px-2.5 py-1.5 rounded-md transition-colors"
            >
              <Plus className="w-3 h-3" />
              追加
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="企業名で検索"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-sm border border-border rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-foreground"
            />
          </div>
        </div>

        {/* 企業リスト */}
        <div className="flex-1 overflow-y-auto">
          {filteredCompanies.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Building2 className="w-8 h-8 mb-2 opacity-30" />
              <p className="text-xs">企業がありません</p>
            </div>
          ) : (
            filteredCompanies.map(company => {
              const pending = pendingTodosCount(company.id)
              const unpaid = unpaidAmount(company.id)
              const isSelected = selectedId === company.id
              return (
                <button
                  key={company.id}
                  onClick={() => setSelectedId(company.id)}
                  className={`w-full text-left px-4 py-3 border-b border-border/60 transition-colors ${
                    isSelected ? 'bg-accent' : 'hover:bg-muted/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-foreground truncate pr-2">{company.name}</span>
                    {isSelected && <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />}
                  </div>
                  {company.plan && (
                    <span className="text-xs text-muted-foreground">{company.plan}</span>
                  )}
                  <div className="flex gap-2 mt-1.5 flex-wrap">
                    {pending > 0 && (
                      <span className="inline-flex items-center gap-1 text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-medium">
                        <CheckSquare className="w-3 h-3" />
                        TODO {pending}件
                      </span>
                    )}
                    {unpaid > 0 && (
                      <span className="inline-flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-medium">
                        <Receipt className="w-3 h-3" />
                        未収 ¥{unpaid.toLocaleString()}
                      </span>
                    )}
                  </div>
                </button>
              )
            })
          )}
        </div>
      </div>

      {/* ── 右パネル: 詳細 ─────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden bg-[#FAFAFA]">
        {!selectedCompany ? (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <Building2 className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p className="text-sm">企業を選択してください</p>
            </div>
          </div>
        ) : (
          <>
            {/* 企業ヘッダー */}
            <div className="bg-white border-b border-border px-6 py-4">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-bold text-foreground">{selectedCompany.name}</h2>
                  <div className="flex flex-wrap gap-3 mt-1 text-sm text-muted-foreground">
                    {selectedCompany.plan && <span>プラン: {selectedCompany.plan}</span>}
                    {selectedCompany.contractStartDate && (
                      <span>契約開始: {selectedCompany.contractStartDate}</span>
                    )}
                    {selectedCompany.contactName && (
                      <span>担当: {selectedCompany.contactName}</span>
                    )}
                    {selectedCompany.contactEmail && (
                      <a href={`mailto:${selectedCompany.contactEmail}`} className="hover:underline text-blue-600">
                        {selectedCompany.contactEmail}
                      </a>
                    )}
                  </div>
                  {selectedCompany.memo && (
                    <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2">{selectedCompany.memo}</p>
                  )}
                </div>
                <div className="flex gap-2 shrink-0 ml-4">
                  <button
                    onClick={() => openEditCompany(selectedCompany)}
                    className="flex items-center gap-1.5 text-xs font-medium border border-border px-2.5 py-1.5 rounded-md hover:bg-muted transition-colors"
                  >
                    <Pencil className="w-3 h-3" />
                    編集
                  </button>
                  <button
                    onClick={() => deleteCompany(selectedCompany.id)}
                    className="flex items-center gap-1.5 text-xs font-medium border border-red-200 text-red-600 px-2.5 py-1.5 rounded-md hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                    削除
                  </button>
                </div>
              </div>

              {/* タブ */}
              <div className="flex gap-0 mt-4 -mb-4 border-b-0">
                {(['todos', 'invoices'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${
                      activeTab === tab
                        ? 'border-foreground text-foreground'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {tab === 'todos' ? (
                      <span className="flex items-center gap-1.5">
                        <CheckSquare className="w-3.5 h-3.5" />
                        TODO
                        {companyTodos.filter(t => !t.isCompleted).length > 0 && (
                          <span className="ml-1 bg-amber-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                            {companyTodos.filter(t => !t.isCompleted).length}
                          </span>
                        )}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5">
                        <Receipt className="w-3.5 h-3.5" />
                        請求書
                        {companyInvoices.length > 0 && (
                          <span className="ml-1 bg-gray-400 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                            {companyInvoices.length}
                          </span>
                        )}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* タブコンテンツ */}
            <div className="flex-1 overflow-y-auto p-6">

              {/* ── TODOタブ ────────────────────────────────────── */}
              {activeTab === 'todos' && (
                <div className="max-w-2xl space-y-2">
                  {/* 新規追加フォーム */}
                  <div className="bg-white border border-border rounded-lg p-3 mb-4">
                    <p className="text-xs font-semibold text-muted-foreground mb-2">TODO を追加</p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="タスク内容を入力"
                        value={newTodoTitle}
                        onChange={e => setNewTodoTitle(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && addTodo()}
                        className="flex-1 text-sm border border-border rounded-md px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-foreground"
                      />
                      <input
                        type="date"
                        value={newTodoDueDate}
                        onChange={e => setNewTodoDueDate(e.target.value)}
                        className="text-sm border border-border rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-foreground w-36"
                      />
                      <button
                        onClick={addTodo}
                        disabled={!newTodoTitle.trim() || todoSaving}
                        className="flex items-center gap-1 text-xs font-semibold text-white bg-foreground px-3 py-1.5 rounded-md disabled:opacity-40 hover:bg-foreground/80 transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                        追加
                      </button>
                    </div>
                  </div>

                  {/* TODO一覧 */}
                  {companyTodos.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground">
                      <CheckSquare className="w-8 h-8 mx-auto mb-2 opacity-20" />
                      <p className="text-sm">TODOはありません</p>
                    </div>
                  ) : (
                    <>
                      {/* 未完了 */}
                      {companyTodos.filter(t => !t.isCompleted).map(todo => (
                        <TodoRow key={todo.id} todo={todo} onToggle={toggleTodo} onDelete={deleteTodo} />
                      ))}
                      {/* 完了済み */}
                      {companyTodos.filter(t => t.isCompleted).length > 0 && (
                        <>
                          <p className="text-xs text-muted-foreground font-semibold mt-4 mb-1 uppercase tracking-wider">完了済み</p>
                          {companyTodos.filter(t => t.isCompleted).map(todo => (
                            <TodoRow key={todo.id} todo={todo} onToggle={toggleTodo} onDelete={deleteTodo} />
                          ))}
                        </>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* ── 請求書タブ ───────────────────────────────────── */}
              {activeTab === 'invoices' && (
                <div className="max-w-3xl">
                  <div className="flex items-center justify-between mb-4">
                    {/* サマリー */}
                    <div className="flex gap-4 text-sm">
                      {(['sent', 'overdue', 'paid'] as InvoiceStatus[]).map(st => {
                        const items = companyInvoices.filter(i => i.status === st)
                        if (items.length === 0) return null
                        const total = items.reduce((s, i) => s + (i.amount ?? 0), 0)
                        return (
                          <div key={st} className={`px-3 py-1.5 rounded-md text-xs font-semibold ${INVOICE_STATUS_COLORS[st]}`}>
                            {INVOICE_STATUS_LABELS[st]} ¥{total.toLocaleString()} ({items.length}件)
                          </div>
                        )
                      })}
                    </div>
                    <button
                      onClick={openNewInvoice}
                      className="flex items-center gap-1 text-xs font-semibold text-white bg-foreground px-3 py-1.5 rounded-md hover:bg-foreground/80 transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                      請求書を追加
                    </button>
                  </div>

                  {companyInvoices.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground">
                      <Receipt className="w-8 h-8 mx-auto mb-2 opacity-20" />
                      <p className="text-sm">請求書はありません</p>
                    </div>
                  ) : (
                    <div className="bg-white border border-border rounded-lg overflow-hidden">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border bg-muted/30">
                            <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">請求書番号</th>
                            <th className="text-right px-4 py-2.5 text-xs font-semibold text-muted-foreground">金額</th>
                            <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">発行日</th>
                            <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">期限</th>
                            <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">ステータス</th>
                            <th className="px-4 py-2.5"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {companyInvoices.map(inv => (
                            <tr key={inv.id} className="border-b border-border/60 hover:bg-muted/20 transition-colors">
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-1.5">
                                  <FileText className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                                  <span className="font-medium">{inv.invoiceNumber || '—'}</span>
                                </div>
                                {inv.memo && <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-[150px]">{inv.memo}</p>}
                              </td>
                              <td className="px-4 py-3 text-right font-semibold tabular-nums">
                                {inv.amount != null ? `¥${inv.amount.toLocaleString()}` : '—'}
                              </td>
                              <td className="px-4 py-3 text-muted-foreground">{inv.issuedDate ?? '—'}</td>
                              <td className="px-4 py-3">
                                {inv.dueDate ? (
                                  <span className={`flex items-center gap-1 ${
                                    inv.status === 'overdue' ? 'text-red-600 font-semibold' : 'text-muted-foreground'
                                  }`}>
                                    {inv.status === 'overdue' && <AlertCircle className="w-3 h-3" />}
                                    {inv.dueDate}
                                  </span>
                                ) : '—'}
                              </td>
                              <td className="px-4 py-3">
                                <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${INVOICE_STATUS_COLORS[inv.status]}`}>
                                  {INVOICE_STATUS_LABELS[inv.status]}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex gap-1 justify-end">
                                  <button
                                    onClick={() => openEditInvoice(inv)}
                                    className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                                  >
                                    <Pencil className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => deleteInvoice(inv.id)}
                                    className="p-1 text-muted-foreground hover:text-red-600 transition-colors"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* ── 企業モーダル ──────────────────────────────────────────── */}
      {companyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="text-sm font-bold">{editingCompany ? '企業を編集' : '契約企業を追加'}</h2>
              <button onClick={() => setCompanyModal(false)}>
                <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
              </button>
            </div>
            <div className="px-6 py-4 space-y-4 max-h-[70vh] overflow-y-auto">
              <Field label="企業名 *">
                <input
                  type="text"
                  value={companyForm.name}
                  onChange={e => setCompanyForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full text-sm border border-border rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-foreground"
                  placeholder="例: 株式会社〇〇"
                />
              </Field>
              <Field label="プラン">
                <input
                  type="text"
                  value={companyForm.plan}
                  onChange={e => setCompanyForm(f => ({ ...f, plan: e.target.value }))}
                  className="w-full text-sm border border-border rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-foreground"
                  placeholder="例: 月額スタンダード"
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="契約開始日">
                  <input
                    type="date"
                    value={companyForm.contractStartDate}
                    onChange={e => setCompanyForm(f => ({ ...f, contractStartDate: e.target.value }))}
                    className="w-full text-sm border border-border rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-foreground"
                  />
                </Field>
                <Field label="契約終了日">
                  <input
                    type="date"
                    value={companyForm.contractEndDate}
                    onChange={e => setCompanyForm(f => ({ ...f, contractEndDate: e.target.value }))}
                    className="w-full text-sm border border-border rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-foreground"
                  />
                </Field>
              </div>
              <Field label="担当者名">
                <input
                  type="text"
                  value={companyForm.contactName}
                  onChange={e => setCompanyForm(f => ({ ...f, contactName: e.target.value }))}
                  className="w-full text-sm border border-border rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-foreground"
                />
              </Field>
              <Field label="担当者メール">
                <input
                  type="email"
                  value={companyForm.contactEmail}
                  onChange={e => setCompanyForm(f => ({ ...f, contactEmail: e.target.value }))}
                  className="w-full text-sm border border-border rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-foreground"
                />
              </Field>
              <Field label="メモ">
                <textarea
                  value={companyForm.memo}
                  onChange={e => setCompanyForm(f => ({ ...f, memo: e.target.value }))}
                  rows={3}
                  className="w-full text-sm border border-border rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-foreground resize-none"
                />
              </Field>
            </div>
            <div className="flex justify-end gap-2 px-6 py-4 border-t border-border">
              <button
                onClick={() => setCompanyModal(false)}
                className="text-sm px-4 py-2 border border-border rounded-md hover:bg-muted transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={saveCompany}
                disabled={companySaving}
                className="text-sm font-semibold px-4 py-2 bg-foreground text-background rounded-md hover:bg-foreground/80 disabled:opacity-50 transition-colors"
              >
                {companySaving ? '保存中…' : '保存'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 請求書モーダル ─────────────────────────────────────── */}
      {invoiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="text-sm font-bold">{editingInvoice ? '請求書を編集' : '請求書を追加'}</h2>
              <button onClick={() => setInvoiceModal(false)}>
                <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
              </button>
            </div>
            <div className="px-6 py-4 space-y-4 max-h-[70vh] overflow-y-auto">
              <Field label="請求書番号">
                <input
                  type="text"
                  value={invoiceForm.invoiceNumber}
                  onChange={e => setInvoiceForm(f => ({ ...f, invoiceNumber: e.target.value }))}
                  className="w-full text-sm border border-border rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-foreground"
                  placeholder="例: INV-2025-001"
                />
              </Field>
              <Field label="金額 (円)">
                <input
                  type="number"
                  value={invoiceForm.amount}
                  onChange={e => setInvoiceForm(f => ({ ...f, amount: e.target.value }))}
                  className="w-full text-sm border border-border rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-foreground"
                  placeholder="例: 50000"
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="発行日">
                  <input
                    type="date"
                    value={invoiceForm.issuedDate}
                    onChange={e => setInvoiceForm(f => ({ ...f, issuedDate: e.target.value }))}
                    className="w-full text-sm border border-border rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-foreground"
                  />
                </Field>
                <Field label="支払期限">
                  <input
                    type="date"
                    value={invoiceForm.dueDate}
                    onChange={e => setInvoiceForm(f => ({ ...f, dueDate: e.target.value }))}
                    className="w-full text-sm border border-border rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-foreground"
                  />
                </Field>
              </div>
              <Field label="ステータス">
                <select
                  value={invoiceForm.status}
                  onChange={e => setInvoiceForm(f => ({ ...f, status: e.target.value as InvoiceStatus }))}
                  className="w-full text-sm border border-border rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-foreground"
                >
                  {(Object.entries(INVOICE_STATUS_LABELS) as [InvoiceStatus, string][]).map(([val, label]) => (
                    <option key={val} value={val}>{label}</option>
                  ))}
                </select>
              </Field>
              <Field label="メモ">
                <textarea
                  value={invoiceForm.memo}
                  onChange={e => setInvoiceForm(f => ({ ...f, memo: e.target.value }))}
                  rows={2}
                  className="w-full text-sm border border-border rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-foreground resize-none"
                />
              </Field>
            </div>
            <div className="flex justify-end gap-2 px-6 py-4 border-t border-border">
              <button
                onClick={() => setInvoiceModal(false)}
                className="text-sm px-4 py-2 border border-border rounded-md hover:bg-muted transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={saveInvoice}
                disabled={invoiceSaving}
                className="text-sm font-semibold px-4 py-2 bg-foreground text-background rounded-md hover:bg-foreground/80 disabled:opacity-50 transition-colors"
              >
                {invoiceSaving ? '保存中…' : '保存'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── 小コンポーネント ─────────────────────────────────────────────────
function TodoRow({
  todo,
  onToggle,
  onDelete,
}: {
  todo: ContractTodo
  onToggle: (t: ContractTodo) => void
  onDelete: (id: string) => void
}) {
  const isOverdue = todo.dueDate && !todo.isCompleted && new Date(todo.dueDate) < new Date()

  return (
    <div className={`flex items-center gap-3 bg-white border border-border rounded-lg px-3 py-2.5 group ${
      todo.isCompleted ? 'opacity-50' : ''
    }`}>
      <button onClick={() => onToggle(todo)} className="shrink-0">
        {todo.isCompleted
          ? <CheckSquare className="w-4 h-4 text-green-600" />
          : <Square className="w-4 h-4 text-muted-foreground hover:text-foreground" />}
      </button>
      <span className={`flex-1 text-sm ${todo.isCompleted ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
        {todo.title}
      </span>
      {todo.dueDate && (
        <span className={`flex items-center gap-1 text-xs shrink-0 ${isOverdue ? 'text-red-600 font-semibold' : 'text-muted-foreground'}`}>
          {isOverdue && <AlertCircle className="w-3 h-3" />}
          <Calendar className="w-3 h-3" />
          {todo.dueDate}
        </span>
      )}
      <button
        onClick={() => onDelete(todo.id)}
        className="shrink-0 p-0.5 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-600 transition-all"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-muted-foreground mb-1">{label}</label>
      {children}
    </div>
  )
}

import { recruitingRepository } from '@/lib/recruiting-repository'
import { ContractCompaniesManager } from '@/components/contract-companies-manager'
import type { ContractCompany, ContractTodo, ContractInvoice } from '@/types/recruiting'

export const dynamic = 'force-dynamic'

export default async function ContractCompaniesPage() {
  let companies: ContractCompany[] = []
  let todos: ContractTodo[] = []
  let invoices: ContractInvoice[] = []
  try {
    ;[companies, todos, invoices] = await Promise.all([
      recruitingRepository.listContractCompanies(),
      recruitingRepository.listContractTodos(),
      recruitingRepository.listContractInvoices(),
    ])
  } catch {
    // Supabase未接続時はから状態でレンダー
  }

  return (
    <ContractCompaniesManager
      initialCompanies={companies}
      initialTodos={todos}
      initialInvoices={invoices}
    />
  )
}

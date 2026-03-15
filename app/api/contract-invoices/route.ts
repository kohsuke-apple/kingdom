import { NextRequest, NextResponse } from 'next/server'
import { recruitingRepository } from '@/lib/recruiting-repository'

export async function GET(request: NextRequest) {
  try {
    const companyId = request.nextUrl.searchParams.get('contractCompanyId') ?? undefined
    const invoices = await recruitingRepository.listContractInvoices(companyId)
    return NextResponse.json(invoices)
  } catch (error) {
    console.error('GET /api/contract-invoices error:', error)
    return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    if (!body.contractCompanyId) {
      return NextResponse.json({ error: 'contractCompanyId は必須です' }, { status: 400 })
    }
    const invoice = await recruitingRepository.createContractInvoice(body)
    return NextResponse.json(invoice, { status: 201 })
  } catch (error) {
    console.error('POST /api/contract-invoices error:', error)
    return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id が必要です' }, { status: 400 })
    const body = await request.json()
    const updated = await recruitingRepository.updateContractInvoice(id, body)
    if (!updated) return NextResponse.json({ error: '見つかりません' }, { status: 404 })
    return NextResponse.json(updated)
  } catch (error) {
    console.error('PUT /api/contract-invoices error:', error)
    return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id が必要です' }, { status: 400 })
    const deleted = await recruitingRepository.deleteContractInvoice(id)
    if (!deleted) return NextResponse.json({ error: '見つかりません' }, { status: 404 })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/contract-invoices error:', error)
    return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 })
  }
}

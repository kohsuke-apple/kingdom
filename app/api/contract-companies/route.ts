import { NextRequest, NextResponse } from 'next/server'
import { recruitingRepository } from '@/lib/recruiting-repository'

export async function GET() {
  try {
    const companies = await recruitingRepository.listContractCompanies()
    return NextResponse.json(companies)
  } catch (error) {
    console.error('GET /api/contract-companies error:', error)
    return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    if (!body.name?.trim()) {
      return NextResponse.json({ error: '企業名は必須です' }, { status: 400 })
    }
    const company = await recruitingRepository.createContractCompany(body)
    return NextResponse.json(company, { status: 201 })
  } catch (error) {
    console.error('POST /api/contract-companies error:', error)
    return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id が必要です' }, { status: 400 })
    const body = await request.json()
    const updated = await recruitingRepository.updateContractCompany(id, body)
    if (!updated) return NextResponse.json({ error: '見つかりません' }, { status: 404 })
    return NextResponse.json(updated)
  } catch (error) {
    console.error('PUT /api/contract-companies error:', error)
    return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id が必要です' }, { status: 400 })
    const deleted = await recruitingRepository.deleteContractCompany(id)
    if (!deleted) return NextResponse.json({ error: '見つかりません' }, { status: 404 })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/contract-companies error:', error)
    return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 })
  }
}

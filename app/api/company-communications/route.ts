import { NextRequest, NextResponse } from 'next/server'
import { recruitingRepository } from '@/lib/recruiting-repository'
import { companyCommunicationSchema } from '@/lib/recruiting-validations'

export async function GET(request: NextRequest) {
  try {
    const companyId = request.nextUrl.searchParams.get('companyId')
    if (!companyId) return NextResponse.json({ error: 'companyId が必要です' }, { status: 400 })
    const items = await recruitingRepository.listCompanyCommunications(companyId)
    return NextResponse.json(items)
  } catch (error) {
    console.error('GET /api/company-communications error:', error)
    return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = companyCommunicationSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'バリデーションエラー', details: parsed.error.flatten() }, { status: 400 })
    }
    const item = await recruitingRepository.createCompanyCommunication({
      companyId: parsed.data.companyId,
      contactedAt: parsed.data.contactedAt,
      fromName: parsed.data.fromName || undefined,
      content: parsed.data.content,
      createdBy: parsed.data.createdBy,
    })
    return NextResponse.json(item, { status: 201 })
  } catch (error) {
    console.error('POST /api/company-communications error:', error)
    return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id が必要です' }, { status: 400 })
    const body = await request.json()
    const parsed = companyCommunicationSchema.partial().safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'バリデーションエラー', details: parsed.error.flatten() }, { status: 400 })
    }
    const updated = await recruitingRepository.updateCompanyCommunication(id, {
      contactedAt: parsed.data.contactedAt,
      fromName: parsed.data.fromName || undefined,
      content: parsed.data.content,
    })
    if (!updated) return NextResponse.json({ error: '見つかりません' }, { status: 404 })
    return NextResponse.json(updated)
  } catch (error) {
    console.error('PUT /api/company-communications error:', error)
    return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id が必要です' }, { status: 400 })
    const deleted = await recruitingRepository.deleteCompanyCommunication(id)
    if (!deleted) return NextResponse.json({ error: '見つかりません' }, { status: 404 })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/company-communications error:', error)
    return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 })
  }
}

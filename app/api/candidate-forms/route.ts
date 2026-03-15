import { NextRequest, NextResponse } from 'next/server'
import { recruitingRepository } from '@/lib/recruiting-repository'

export async function GET(request: NextRequest) {
  try {
    const agentId = request.nextUrl.searchParams.get('agentId') ?? undefined
    const forms = await recruitingRepository.listCandidateForms(agentId)
    return NextResponse.json(forms)
  } catch (error) {
    console.error('GET /api/candidate-forms error:', error)
    return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const form = await recruitingRepository.createCandidateForm({
      agentId: body.agentId || undefined,
      label: body.label || undefined,
      expiresAt: body.expiresAt || undefined,
    })
    return NextResponse.json(form, { status: 201 })
  } catch (error) {
    console.error('POST /api/candidate-forms error:', error)
    return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id が必要です' }, { status: 400 })
    const deleted = await recruitingRepository.deleteCandidateForm(id)
    if (!deleted) return NextResponse.json({ error: '見つかりません' }, { status: 404 })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/candidate-forms error:', error)
    return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 })
  }
}

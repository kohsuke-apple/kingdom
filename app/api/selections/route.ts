import { NextRequest, NextResponse } from 'next/server'
import { recruitingRepository } from '@/lib/recruiting-repository'
import { candidateJobStatusSchema, selectionSchema } from '@/lib/recruiting-validations'

function getScope(request: NextRequest): 'ra' | 'ca' {
  const value = request.nextUrl.searchParams.get('scope')
  return value === 'ca' ? 'ca' : 'ra'
}

export async function GET(request: NextRequest) {
  try {
    const scope = getScope(request)
    const selections = await recruitingRepository.listSelections(scope)
    return NextResponse.json(selections)
  } catch (error) {
    console.error('GET /api/selections error:', error)
    return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const scope = getScope(request)
    const body = await request.json()

    if (scope === 'ca') {
      const parsed = candidateJobStatusSchema.safeParse(body)
      if (!parsed.success) {
        return NextResponse.json({ error: 'バリデーションエラー', details: parsed.error.flatten() }, { status: 400 })
      }

      const status = await recruitingRepository.createCandidateJobStatus({
        candidateId: parsed.data.candidateId,
        jobId: parsed.data.jobId,
        stage: parsed.data.stage,
        memo: parsed.data.memo || undefined,
        createdBy: parsed.data.createdBy,
      })
      return NextResponse.json(status, { status: 201 })
    }

    const parsed = selectionSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'バリデーションエラー', details: parsed.error.flatten() }, { status: 400 })
    }

    const selection = await recruitingRepository.createSelection({
      companyId: parsed.data.companyId,
      jobId: parsed.data.jobId,
      candidateId: parsed.data.candidateId,
      stage: parsed.data.stage,
      status: parsed.data.status,
      createdBy: parsed.data.createdBy,
    })

    return NextResponse.json(selection, { status: 201 })
  } catch (error) {
    console.error('POST /api/selections error:', error)
    return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const scope = getScope(request)
    const id = request.nextUrl.searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id が必要です' }, { status: 400 })

    const body = await request.json()

    if (scope === 'ca') {
      const parsed = candidateJobStatusSchema.partial().safeParse(body)
      if (!parsed.success) {
        return NextResponse.json({ error: 'バリデーションエラー', details: parsed.error.flatten() }, { status: 400 })
      }

      const updated = await recruitingRepository.updateCandidateJobStatus(id, {
        candidateId: parsed.data.candidateId,
        jobId: parsed.data.jobId,
        stage: parsed.data.stage,
        memo: parsed.data.memo || undefined,
      })

      if (!updated) return NextResponse.json({ error: '見つかりません' }, { status: 404 })
      return NextResponse.json(updated)
    }

    const parsed = selectionSchema.partial().safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'バリデーションエラー', details: parsed.error.flatten() }, { status: 400 })
    }

    const updated = await recruitingRepository.updateSelection(id, {
      companyId: parsed.data.companyId,
      jobId: parsed.data.jobId,
      candidateId: parsed.data.candidateId,
      stage: parsed.data.stage,
      status: parsed.data.status,
    })

    if (!updated) return NextResponse.json({ error: '見つかりません' }, { status: 404 })
    return NextResponse.json(updated)
  } catch (error) {
    console.error('PUT /api/selections error:', error)
    return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const scope = getScope(request)
    const id = request.nextUrl.searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id が必要です' }, { status: 400 })

    const deleted =
      scope === 'ca'
        ? await recruitingRepository.deleteCandidateJobStatus(id)
        : await recruitingRepository.deleteSelection(id)

    if (!deleted) return NextResponse.json({ error: '見つかりません' }, { status: 404 })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/selections error:', error)
    return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 })
  }
}

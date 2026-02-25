import { NextRequest, NextResponse } from 'next/server'
import { recruitingRepository } from '@/lib/recruiting-repository'
import { savedJobSchema } from '@/lib/recruiting-validations'

export async function GET() {
  try {
    const savedJobs = await recruitingRepository.listSavedJobs()
    return NextResponse.json(savedJobs)
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = savedJobSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }
    const { jobId, customCategory, candidateId } = parsed.data
    const savedJob = await recruitingRepository.createSavedJob({
      jobId,
      customCategory: customCategory ?? '未分類',
      candidateId: candidateId || undefined,
    })
    return NextResponse.json(savedJob, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })

    const body = await req.json()
    const customCategory = body.customCategory as string | undefined
    if (!customCategory || customCategory.trim() === '') {
      return NextResponse.json({ error: 'customCategory is required' }, { status: 400 })
    }
    const updated = await recruitingRepository.updateSavedJobCategory(id, customCategory.trim())
    if (!updated) return NextResponse.json({ error: 'not found' }, { status: 404 })
    return NextResponse.json(updated)
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })

    const deleted = await recruitingRepository.deleteSavedJob(id)
    if (!deleted) return NextResponse.json({ error: 'not found' }, { status: 404 })
    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}

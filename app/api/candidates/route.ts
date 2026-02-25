import { NextRequest, NextResponse } from 'next/server'
import { recruitingRepository } from '@/lib/recruiting-repository'
import { candidateSchema } from '@/lib/recruiting-validations'

export async function GET(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id')
    if (id) {
      const candidate = await recruitingRepository.getCandidate(id)
      if (!candidate) return NextResponse.json({ error: '見つかりません' }, { status: 404 })
      return NextResponse.json(candidate)
    }

    const candidates = await recruitingRepository.listCandidates()
    return NextResponse.json(candidates)
  } catch (error) {
    console.error('GET /api/candidates error:', error)
    return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const parsed = candidateSchema.safeParse(await request.json())
    if (!parsed.success) {
      return NextResponse.json({ error: 'バリデーションエラー', details: parsed.error.flatten() }, { status: 400 })
    }

    const data = parsed.data
    const candidate = await recruitingRepository.createCandidate({
      name: data.name,
      nameKana: data.nameKana || undefined,
      email: data.email || undefined,
      phone: data.phone || undefined,
      gender: data.gender || undefined,
      birthDate: data.birthDate || undefined,
      location: data.location || undefined,
      lastEducation: data.lastEducation || undefined,
      graduatedSchool: data.graduatedSchool || undefined,
      experienceCount: data.experienceCount,
      experienceJobTypes: data.experienceJobTypes || undefined,
      experienceIndustries: data.experienceIndustries || undefined,
      currentSalary: data.currentSalary,
      workHistories: data.workHistories,
      desiredLocation: data.desiredLocation || undefined,
      desiredSalary: data.desiredSalary,
      desiredJobType: data.desiredJobType || undefined,
      recommendationText: data.recommendationText || undefined,
      resumeUrl: data.resumeUrl || undefined,
      cvUrl: data.cvUrl || undefined,
      mainAgentId: data.mainAgentId || undefined,
      subAgentId: data.subAgentId || undefined,
      memo: data.memo || undefined,
      createdBy: data.createdBy,
    })

    return NextResponse.json(candidate, { status: 201 })
  } catch (error) {
    console.error('POST /api/candidates error:', error)
    return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id が必要です' }, { status: 400 })

    const parsed = candidateSchema.partial().safeParse(await request.json())
    if (!parsed.success) {
      return NextResponse.json({ error: 'バリデーションエラー', details: parsed.error.flatten() }, { status: 400 })
    }

    const data = parsed.data
    const candidate = await recruitingRepository.updateCandidate(id, {
      name: data.name,
      nameKana: data.nameKana === '' ? undefined : data.nameKana,
      email: data.email || undefined,
      phone: data.phone || undefined,
      gender: data.gender || undefined,
      birthDate: data.birthDate || undefined,
      location: data.location || undefined,
      lastEducation: data.lastEducation || undefined,
      graduatedSchool: data.graduatedSchool || undefined,
      experienceCount: data.experienceCount,
      experienceJobTypes: data.experienceJobTypes || undefined,
      experienceIndustries: data.experienceIndustries || undefined,
      currentSalary: data.currentSalary,
      workHistories: data.workHistories,
      desiredLocation: data.desiredLocation || undefined,
      desiredSalary: data.desiredSalary,
      desiredJobType: data.desiredJobType || undefined,
      recommendationText: data.recommendationText || undefined,
      resumeUrl: data.resumeUrl || undefined,
      cvUrl: data.cvUrl || undefined,
      mainAgentId: data.mainAgentId || undefined,
      subAgentId: data.subAgentId || undefined,
      memo: data.memo || undefined,
    })

    if (!candidate) return NextResponse.json({ error: '見つかりません' }, { status: 404 })
    return NextResponse.json(candidate)
  } catch (error) {
    console.error('PUT /api/candidates error:', error)
    return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id が必要です' }, { status: 400 })

    const deleted = await recruitingRepository.deleteCandidate(id)
    if (!deleted) return NextResponse.json({ error: '見つかりません' }, { status: 404 })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/candidates error:', error)
    return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 })
  }
}

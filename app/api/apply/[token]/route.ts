import { NextRequest, NextResponse } from 'next/server'
import { recruitingRepository } from '@/lib/recruiting-repository'

type Params = { params: Promise<{ token: string }> }

// フォーム情報取得（有効かどうかの確認用）
export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { token } = await params
    const form = await recruitingRepository.getCandidateFormByToken(token)
    if (!form) return NextResponse.json({ error: 'フォームが見つかりません' }, { status: 404 })
    if (form.status === 'submitted') return NextResponse.json({ error: 'このフォームはすでに回答済みです' }, { status: 410 })
    if (form.expiresAt && new Date(form.expiresAt) < new Date()) {
      return NextResponse.json({ error: 'このフォームの有効期限が切れています' }, { status: 410 })
    }
    return NextResponse.json({ valid: true, label: form.label })
  } catch (error) {
    console.error('GET /api/apply/[token] error:', error)
    return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 })
  }
}

// 求職者がフォームを送信
export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { token } = await params
    const form = await recruitingRepository.getCandidateFormByToken(token)
    if (!form) return NextResponse.json({ error: 'フォームが見つかりません' }, { status: 404 })
    if (form.status === 'submitted') return NextResponse.json({ error: 'すでに回答済みです' }, { status: 410 })
    if (form.expiresAt && new Date(form.expiresAt) < new Date()) {
      return NextResponse.json({ error: '有効期限が切れています' }, { status: 410 })
    }

    const body = await request.json()
    if (!body.name?.trim()) {
      return NextResponse.json({ error: '氏名は必須です' }, { status: 400 })
    }

    // 候補者レコードを作成
    const candidate = await recruitingRepository.createCandidate({
      name: body.name.trim(),
      nameKana: body.nameKana || undefined,
      email: body.email || undefined,
      phone: body.phone || undefined,
      gender: body.gender || undefined,
      birthDate: body.birthDate || undefined,
      location: body.location || undefined,
      lastEducation: body.lastEducation || undefined,
      graduatedSchool: body.graduatedSchool || undefined,
      experienceCount: body.experienceCount ? Number(body.experienceCount) : undefined,
      experienceJobTypes: body.experienceJobTypes || undefined,
      experienceIndustries: body.experienceIndustries || undefined,
      currentSalary: body.currentSalary ? Number(body.currentSalary) : undefined,
      workHistories: body.workHistories?.length ? body.workHistories : undefined,
      desiredLocation: body.desiredLocation || undefined,
      desiredJobType: body.desiredJobType || undefined,
      desiredSalary: body.desiredSalary ? Number(body.desiredSalary) : undefined,
      memo: body.selfPR || undefined,
      mainAgentId: form.agentId || undefined,
    })

    // フォームを提出済みにする
    await recruitingRepository.submitCandidateForm(token, candidate.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('POST /api/apply/[token] error:', error)
    return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 })
  }
}

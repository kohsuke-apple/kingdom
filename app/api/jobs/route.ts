import { NextRequest, NextResponse } from 'next/server'
import { recruitingRepository } from '@/lib/recruiting-repository'
import { jobSchema } from '@/lib/recruiting-validations'
import type { JobSourceMode } from '@/types/recruiting'

function parseNumber(value: string | null): number | undefined {
  if (!value) return undefined
  const n = Number(value)
  return Number.isFinite(n) ? n : undefined
}

/** リクエストヘッダーからアプリモードを取得（RA or HIRING のみ許可） */
function extractMode(request: NextRequest): JobSourceMode | null {
  const header = request.headers.get('x-app-mode')
  const query = request.nextUrl.searchParams.get('mode')
  const raw = header ?? query
  if (raw === 'RA' || raw === 'HIRING') return raw
  return null
}

export async function GET(request: NextRequest) {
  try {
    const params = request.nextUrl.searchParams
    const id = params.get('id')

    if (id) {
      const job = await recruitingRepository.getJob(id)
      if (!job) return NextResponse.json({ error: '見つかりません' }, { status: 404 })
      return NextResponse.json(job)
    }

    const hasSearch = ['salaryMin', 'salaryMax', 'jobType', 'companyId', 'status'].some(key => params.has(key))

    const jobs = await recruitingRepository.listJobs({
      salaryMin: parseNumber(params.get('salaryMin')),
      salaryMax: parseNumber(params.get('salaryMax')),
      jobType: params.get('jobType') || undefined,
      companyId: params.get('companyId') || undefined,
      status: (params.get('status') as 'open' | 'closed' | null) ?? (hasSearch ? 'open' : undefined),
    })

    return NextResponse.json(jobs)
  } catch (error) {
    console.error('GET /api/jobs error:', error)
    return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const mode = extractMode(request)
    if (!mode) {
      return NextResponse.json({ error: '求人の追加は RA または採用担当モードのみ可能です' }, { status: 403 })
    }

    const parsed = jobSchema.safeParse(await request.json())
    if (!parsed.success) {
      return NextResponse.json({ error: 'バリデーションエラー', details: parsed.error.flatten() }, { status: 400 })
    }

    const data = parsed.data
    const job = await recruitingRepository.createJob({
      companyId: data.companyId,
      title: data.title,
      jobType: data.jobType || undefined,
      salaryMin: data.salaryMin,
      salaryMax: data.salaryMax,
      status: data.status,
      description: data.description || undefined,
      sourceMode: mode,
      createdBy: data.createdBy,
    })

    return NextResponse.json(job, { status: 201 })
  } catch (error) {
    console.error('POST /api/jobs error:', error)
    return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const mode = extractMode(request)
    if (!mode) {
      return NextResponse.json({ error: '求人の編集は RA または採用担当モードのみ可能です' }, { status: 403 })
    }

    const id = request.nextUrl.searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id が必要です' }, { status: 400 })

    // RA モードは RA 作成の求人のみ編集可
    if (mode === 'RA') {
      const existing = await recruitingRepository.getJob(id)
      if (!existing) return NextResponse.json({ error: '見つかりません' }, { status: 404 })
      if (existing.sourceMode !== 'RA') {
        return NextResponse.json({ error: 'RA モードでは採用担当が作成した求人は編集できません' }, { status: 403 })
      }
    }

    const parsed = jobSchema.partial().safeParse(await request.json())
    if (!parsed.success) {
      return NextResponse.json({ error: 'バリデーションエラー', details: parsed.error.flatten() }, { status: 400 })
    }

    const d = parsed.data
    const job = await recruitingRepository.updateJob(id, {
      companyId: d.companyId,
      title: d.title,
      jobType: d.jobType || undefined,
      salaryMin: d.salaryMin,
      salaryMax: d.salaryMax,
      status: d.status,
      description: d.description || undefined,
      employmentType: d.employmentType || undefined,
      recruitType: d.recruitType || undefined,
      shareType: d.shareType || undefined,
      noReprint: d.noReprint,
      position: d.position || undefined,
      jobLocation: d.jobLocation || undefined,
      publishedAt: d.publishedAt || undefined,
      sourceCompanyName: d.sourceCompanyName || undefined,
      salaryText: d.salaryText || undefined,
      monthlySalaryMin: d.monthlySalaryMin,
      monthlySalaryMax: d.monthlySalaryMax,
      bonusCount: d.bonusCount,
      companyFoundedYear: d.companyFoundedYear || undefined,
      companyPhase: d.companyPhase || undefined,
      companyEmployeeCount: d.companyEmployeeCount || undefined,
      companyAddress: d.companyAddress || undefined,
      companyListingType: d.companyListingType || undefined,
      companyAvgAge: d.companyAvgAge || undefined,
      companyGenderRatio: d.companyGenderRatio || undefined,
      requiredConditions: d.requiredConditions || undefined,
      rejectionReasons: d.rejectionReasons || undefined,
      highPassConditions: d.highPassConditions || undefined,
      interviewRejectionReasons: d.interviewRejectionReasons || undefined,
      visionText: d.visionText || undefined,
      businessText: d.businessText || undefined,
      businessContent: d.businessContent || undefined,
      recruitBackground: d.recruitBackground || undefined,
      plannedHeadcount: d.plannedHeadcount || undefined,
      prPoints: d.prPoints || undefined,
      jobDetail: d.jobDetail || undefined,
      orgStructure: d.orgStructure || undefined,
      salaryDetail: d.salaryDetail || undefined,
      workTimeDetail: d.workTimeDetail || undefined,
      holidayBenefits: d.holidayBenefits || undefined,
      smokingPolicy: d.smokingPolicy || undefined,
      hasCasualInterview: d.hasCasualInterview || undefined,
      hasInfoSession: d.hasInfoSession || undefined,
      hasAptitudeTest: d.hasAptitudeTest || undefined,
      selectionFlow: d.selectionFlow || undefined,
      selectionNote: d.selectionNote || undefined,
      successFeeAmount: d.successFeeAmount,
      successFeePoint: d.successFeePoint || undefined,
      paymentTerm: d.paymentTerm || undefined,
      refundPolicy: d.refundPolicy || undefined,
      theoreticalSalaryNote: d.theoreticalSalaryNote || undefined,
      sourceAgencyName: d.sourceAgencyName || undefined,
      sourceAgencyAddress: d.sourceAgencyAddress || undefined,
      sourceAgencyLicenseNo: d.sourceAgencyLicenseNo || undefined,
    })

    if (!job) return NextResponse.json({ error: '見つかりません' }, { status: 404 })
    return NextResponse.json(job)
  } catch (error) {
    console.error('PUT /api/jobs error:', error)
    // Return error message in development for easier debugging
    const message = error instanceof Error ? error.message : 'サーバーエラー'
    return NextResponse.json({ error: 'サーバーエラー', message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const mode = extractMode(request)
    if (!mode) {
      return NextResponse.json({ error: '求人の削除は RA または採用担当モードのみ可能です' }, { status: 403 })
    }

    const id = request.nextUrl.searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id が必要です' }, { status: 400 })

    // RA モードは RA 作成の求人のみ削除可
    if (mode === 'RA') {
      const existing = await recruitingRepository.getJob(id)
      if (!existing) return NextResponse.json({ error: '見つかりません' }, { status: 404 })
      if (existing.sourceMode !== 'RA') {
        return NextResponse.json({ error: 'RA モードでは採用担当が作成した求人は削除できません' }, { status: 403 })
      }
    }

    const deleted = await recruitingRepository.deleteJob(id)
    if (!deleted) return NextResponse.json({ error: '見つかりません' }, { status: 404 })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/jobs error:', error)
    return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 })
  }
}

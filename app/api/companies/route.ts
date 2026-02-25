import { NextRequest, NextResponse } from 'next/server'
import { recruitingRepository } from '@/lib/recruiting-repository'
import { companySchema } from '@/lib/recruiting-validations'

export async function GET(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id')
    if (id) {
      const company = await recruitingRepository.getCompany(id)
      if (!company) return NextResponse.json({ error: '見つかりません' }, { status: 404 })
      return NextResponse.json(company)
    }

    const companies = await recruitingRepository.listCompanies()
    return NextResponse.json(companies)
  } catch (error) {
    console.error('GET /api/companies error:', error)
    return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const parsed = companySchema.safeParse(await request.json())
    if (!parsed.success) {
      return NextResponse.json({ error: 'バリデーションエラー', details: parsed.error.flatten() }, { status: 400 })
    }

    const data = parsed.data
    const company = await recruitingRepository.createCompany({
      name: data.name,
      industry: data.industry || undefined,
      location: data.location || undefined,
      memo: data.memo || undefined,
      officialWebsite: data.officialWebsite || undefined,
      businessDescription: data.businessDescription || undefined,
      transferCase: data.transferCase || undefined,
      employeeIntroduction: data.employeeIntroduction || undefined,
      createdBy: data.createdBy,
    })

    return NextResponse.json(company, { status: 201 })
  } catch (error) {
    console.error('POST /api/companies error:', error)
    return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id が必要です' }, { status: 400 })

    const parsed = companySchema.partial().safeParse(await request.json())
    if (!parsed.success) {
      return NextResponse.json({ error: 'バリデーションエラー', details: parsed.error.flatten() }, { status: 400 })
    }

    const company = await recruitingRepository.updateCompany(id, {
      name: parsed.data.name,
      industry: parsed.data.industry || undefined,
      location: parsed.data.location || undefined,
      memo: parsed.data.memo || undefined,
      officialWebsite: parsed.data.officialWebsite || undefined,
      businessDescription: parsed.data.businessDescription || undefined,
      transferCase: parsed.data.transferCase || undefined,
      employeeIntroduction: parsed.data.employeeIntroduction || undefined,
      companyNumber: parsed.data.companyNumber || undefined,
      publishStatus: parsed.data.publishStatus,
      recruitingJobTypes: parsed.data.recruitingJobTypes || undefined,
      hiringType: parsed.data.hiringType,
      successFee: parsed.data.successFee || undefined,
      recruitingStatus: parsed.data.recruitingStatus,
      hiringDifficulty: parsed.data.hiringDifficulty,
      refundPolicy: parsed.data.refundPolicy || undefined,
      documentStorageUrl: parsed.data.documentStorageUrl || undefined,
      workLocation: parsed.data.workLocation || undefined,
      selectionFlow: parsed.data.selectionFlow || undefined,
    })

    if (!company) return NextResponse.json({ error: '見つかりません' }, { status: 404 })
    return NextResponse.json(company)
  } catch (error) {
    console.error('PUT /api/companies error:', error)
    return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id が必要です' }, { status: 400 })

    const deleted = await recruitingRepository.deleteCompany(id)
    if (!deleted) return NextResponse.json({ error: '見つかりません' }, { status: 404 })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/companies error:', error)
    return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 })
  }
}

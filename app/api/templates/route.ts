import { NextRequest, NextResponse } from 'next/server'
import { recruitingRepository } from '@/lib/recruiting-repository'
import { caTemplateSchema, raTemplateSchema } from '@/lib/recruiting-validations'

function getMode(request: NextRequest): 'ra' | 'ca' {
  return request.nextUrl.searchParams.get('mode') === 'ca' ? 'ca' : 'ra'
}

export async function GET(request: NextRequest) {
  try {
    const mode = getMode(request)
    const templates = await recruitingRepository.listTemplates(mode)
    return NextResponse.json(templates)
  } catch (error) {
    console.error('GET /api/templates error:', error)
    return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const mode = getMode(request)
    const body = await request.json()
    const parsed = (mode === 'ra' ? raTemplateSchema : caTemplateSchema).safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: 'バリデーションエラー', details: parsed.error.flatten() }, { status: 400 })
    }

    const template = await recruitingRepository.createTemplate(mode, {
      title: parsed.data.title,
      content: parsed.data.content,
      category: parsed.data.category || undefined,
      createdBy: parsed.data.createdBy,
    })

    return NextResponse.json(template, { status: 201 })
  } catch (error) {
    console.error('POST /api/templates error:', error)
    return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const mode = getMode(request)
    const id = request.nextUrl.searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id が必要です' }, { status: 400 })

    const body = await request.json()
    const parsed = (mode === 'ra' ? raTemplateSchema : caTemplateSchema).partial().safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: 'バリデーションエラー', details: parsed.error.flatten() }, { status: 400 })
    }

    const template = await recruitingRepository.updateTemplate(mode, id, {
      title: parsed.data.title,
      content: parsed.data.content,
      category: parsed.data.category || undefined,
    })

    if (!template) return NextResponse.json({ error: '見つかりません' }, { status: 404 })
    return NextResponse.json(template)
  } catch (error) {
    console.error('PUT /api/templates error:', error)
    return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const mode = getMode(request)
    const id = request.nextUrl.searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id が必要です' }, { status: 400 })

    const deleted = await recruitingRepository.deleteTemplate(mode, id)
    if (!deleted) return NextResponse.json({ error: '見つかりません' }, { status: 404 })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/templates error:', error)
    return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 })
  }
}

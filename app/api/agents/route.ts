import { NextRequest, NextResponse } from 'next/server'
import { recruitingRepository } from '@/lib/recruiting-repository'
import { agentSchema } from '@/lib/recruiting-validations'

export async function GET(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id')
    const companyId = request.nextUrl.searchParams.get('companyId')

    if (id) {
      const agent = await recruitingRepository.getAgent(id)
      if (!agent) return NextResponse.json({ error: '見つかりません' }, { status: 404 })
      return NextResponse.json(agent)
    }

    const agents = await recruitingRepository.listAgents(companyId || undefined)
    return NextResponse.json(agents)
  } catch (error) {
    console.error('GET /api/agents error:', error)
    return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const parsed = agentSchema.safeParse(await request.json())
    if (!parsed.success) {
      return NextResponse.json({ error: 'バリデーションエラー', details: parsed.error.flatten() }, { status: 400 })
    }

    const data = parsed.data
    const agent = await recruitingRepository.createAgent({
      companyId: data.companyId || undefined,
      name: data.name,
      email: data.email || undefined,
      roleType: data.roleType,
      memo: data.memo || undefined,
      createdBy: data.createdBy,
    })

    return NextResponse.json(agent, { status: 201 })
  } catch (error) {
    console.error('POST /api/agents error:', error)
    return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id が必要です' }, { status: 400 })

    const parsed = agentSchema.partial().safeParse(await request.json())
    if (!parsed.success) {
      return NextResponse.json({ error: 'バリデーションエラー', details: parsed.error.flatten() }, { status: 400 })
    }

    const data = parsed.data
    const agent = await recruitingRepository.updateAgent(id, {
      companyId: data.companyId || undefined,
      name: data.name,
      email: data.email || undefined,
      roleType: data.roleType,
      memo: data.memo || undefined,
    })

    if (!agent) return NextResponse.json({ error: '見つかりません' }, { status: 404 })
    return NextResponse.json(agent)
  } catch (error) {
    console.error('PUT /api/agents error:', error)
    return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id が必要です' }, { status: 400 })

    const deleted = await recruitingRepository.deleteAgent(id)
    if (!deleted) return NextResponse.json({ error: '見つかりません' }, { status: 404 })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/agents error:', error)
    return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 })
  }
}

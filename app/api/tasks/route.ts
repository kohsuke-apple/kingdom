import { NextRequest, NextResponse } from 'next/server'
import { recruitingRepository } from '@/lib/recruiting-repository'
import { taskSchema } from '@/lib/recruiting-validations'

export async function GET() {
  try {
    const tasks = await recruitingRepository.listTasks()
    return NextResponse.json(tasks)
  } catch (error) {
    console.error('GET /api/tasks error:', error)
    return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const parsed = taskSchema.safeParse(await request.json())
    if (!parsed.success) {
      return NextResponse.json({ error: 'バリデーションエラー', details: parsed.error.flatten() }, { status: 400 })
    }

    const data = parsed.data
    const task = await recruitingRepository.createTask({
      title: data.title,
      description: data.description || undefined,
      dueDate: data.dueDate || undefined,
      relatedCompanyId: data.relatedCompanyId || undefined,
      relatedCandidateId: data.relatedCandidateId || undefined,
      assignedTo: data.assignedTo || undefined,
      status: data.status,
      createdBy: data.createdBy,
    })

    return NextResponse.json(task, { status: 201 })
  } catch (error) {
    console.error('POST /api/tasks error:', error)
    return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id が必要です' }, { status: 400 })

    const parsed = taskSchema.partial().safeParse(await request.json())
    if (!parsed.success) {
      return NextResponse.json({ error: 'バリデーションエラー', details: parsed.error.flatten() }, { status: 400 })
    }

    const updated = await recruitingRepository.updateTask(id, {
      title: parsed.data.title,
      description: parsed.data.description || undefined,
      dueDate: parsed.data.dueDate || undefined,
      relatedCompanyId: parsed.data.relatedCompanyId || undefined,
      relatedCandidateId: parsed.data.relatedCandidateId || undefined,
      assignedTo: parsed.data.assignedTo || undefined,
      status: parsed.data.status,
    })

    if (!updated) return NextResponse.json({ error: '見つかりません' }, { status: 404 })
    return NextResponse.json(updated)
  } catch (error) {
    console.error('PUT /api/tasks error:', error)
    return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id が必要です' }, { status: 400 })

    const deleted = await recruitingRepository.deleteTask(id)
    if (!deleted) return NextResponse.json({ error: '見つかりません' }, { status: 404 })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/tasks error:', error)
    return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 })
  }
}

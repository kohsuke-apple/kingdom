import { NextRequest, NextResponse } from 'next/server'
import { personRepository } from '@/lib/repository'
import { personSchema } from '@/lib/validations'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const person = await personRepository.findById(id)
    if (!person) {
      return NextResponse.json({ error: '見つかりません' }, { status: 404 })
    }
    return NextResponse.json(person)
  } catch (error) {
    console.error('GET /api/people/[id] error:', error)
    return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const parsed = personSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'バリデーションエラー', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const data = parsed.data
    const person = await personRepository.update(id, {
      name: data.name,
      kana: data.kana || undefined,
      birthDate: data.birthDate || undefined,
      relationship: data.relationship || undefined,
      phone: data.phone || undefined,
      email: data.email || undefined,
      address: data.address || undefined,
      workplace: data.workplace || undefined,
      sns: data.sns,
      notes: data.notes || undefined,
      tags: data.tags,
    })

    if (!person) {
      return NextResponse.json({ error: '見つかりません' }, { status: 404 })
    }

    return NextResponse.json(person)
  } catch (error) {
    console.error('PUT /api/people/[id] error:', error)
    return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const deleted = await personRepository.delete(id)
    if (!deleted) {
      return NextResponse.json({ error: '見つかりません' }, { status: 404 })
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/people/[id] error:', error)
    return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 })
  }
}

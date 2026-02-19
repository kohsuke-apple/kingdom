import { NextRequest, NextResponse } from 'next/server'
import { personRepository } from '@/lib/repository'
import { personSchema } from '@/lib/validations'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const tag = searchParams.get('tag')
    const sort = searchParams.get('sort')
    const month = searchParams.get('month')

    let people

    if (query) {
      people = await personRepository.search(query)
    } else if (tag) {
      const all = await personRepository.findAll()
      people = all.filter(p =>
        p.tags?.some(t => t.toLowerCase() === tag.toLowerCase())
      )
    } else if (month) {
      people = await personRepository.findBirthdayInMonth(parseInt(month))
    } else {
      people = await personRepository.findAll()
    }

    if (sort === 'birthday') {
      people = people.sort((a, b) => {
        if (!a.birthDate) return 1
        if (!b.birthDate) return -1
        const aKey = `${a.birthDate.substring(5, 7)}${a.birthDate.substring(8, 10)}`
        const bKey = `${b.birthDate.substring(5, 7)}${b.birthDate.substring(8, 10)}`
        return aKey.localeCompare(bKey)
      })
    }

    return NextResponse.json(people)
  } catch (error) {
    console.error('GET /api/people error:', error)
    return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = personSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'バリデーションエラー', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const data = parsed.data
    const person = await personRepository.create({
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

    return NextResponse.json(person, { status: 201 })
  } catch (error) {
    console.error('POST /api/people error:', error)
    return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 })
  }
}

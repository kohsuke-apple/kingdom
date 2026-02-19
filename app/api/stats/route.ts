import { NextResponse } from 'next/server'
import { personRepository } from '@/lib/repository'

export async function GET() {
  try {
    const now = new Date()
    const currentMonth = now.getMonth() + 1

    const [total, birthdayThisMonth, recentlyAdded, tagStats] = await Promise.all([
      personRepository.count(),
      personRepository.findBirthdayInMonth(currentMonth),
      personRepository.findRecent(5),
      personRepository.getAllTags(),
    ])

    return NextResponse.json({ total, birthdayThisMonth, recentlyAdded, tagStats })
  } catch (error) {
    console.error('GET /api/stats error:', error)
    return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 })
  }
}

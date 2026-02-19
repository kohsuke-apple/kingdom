import { supabase } from './supabase'
import type { Person, PersonInput } from '@/types/person'

// Supabase から返る行の型
type PersonRow = {
  id: string
  name: string
  kana: string | null
  birth_date: string | null
  relationship: string | null
  phone: string | null
  email: string | null
  address: string | null
  workplace: string | null
  sns: string[] | null
  notes: string | null
  tags: string[] | null
  created_at: string
  updated_at: string
}

function rowToPerson(row: PersonRow): Person {
  return {
    id: row.id,
    name: row.name,
    kana: row.kana ?? undefined,
    birthDate: row.birth_date ?? undefined,
    relationship: row.relationship ?? undefined,
    phone: row.phone ?? undefined,
    email: row.email ?? undefined,
    address: row.address ?? undefined,
    workplace: row.workplace ?? undefined,
    sns: row.sns ?? undefined,
    notes: row.notes ?? undefined,
    tags: row.tags ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export const personRepository = {
  async findAll(): Promise<Person[]> {
    const { data, error } = await supabase
      .from('people')
      .select('*')
      .order('name', { ascending: true })
    if (error) throw new Error(error.message)
    return (data as PersonRow[]).map(rowToPerson)
  },

  async findById(id: string): Promise<Person | null> {
    const { data, error } = await supabase
      .from('people')
      .select('*')
      .eq('id', id)
      .maybeSingle()
    if (error) throw new Error(error.message)
    return data ? rowToPerson(data as PersonRow) : null
  },

  async search(query: string): Promise<Person[]> {
    const { data, error } = await supabase
      .from('people')
      .select('*')
      .or(`name.ilike.%${query}%,kana.ilike.%${query}%,relationship.ilike.%${query}%`)
      .order('name', { ascending: true })
    if (error) throw new Error(error.message)
    return (data as PersonRow[]).map(rowToPerson)
  },

  async findByTag(tag: string): Promise<Person[]> {
    const { data, error } = await supabase
      .from('people')
      .select('*')
      .contains('tags', [tag])
      .order('name', { ascending: true })
    if (error) throw new Error(error.message)
    return (data as PersonRow[]).map(rowToPerson)
  },

  async findBirthdayInMonth(month: number): Promise<Person[]> {
    // birth_date が設定されている全件取得後、月でフィルター（小規模DBのため）
    const { data, error } = await supabase
      .from('people')
      .select('*')
      .not('birth_date', 'is', null)
    if (error) throw new Error(error.message)
    const monthStr = String(month).padStart(2, '0')
    return (data as PersonRow[])
      .filter(row => row.birth_date?.substring(5, 7) === monthStr)
      .sort((a, b) => {
        const aDay = a.birth_date?.substring(8, 10) ?? ''
        const bDay = b.birth_date?.substring(8, 10) ?? ''
        return aDay.localeCompare(bDay)
      })
      .map(rowToPerson)
  },

  async findRecent(limit: number = 5): Promise<Person[]> {
    const { data, error } = await supabase
      .from('people')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)
    if (error) throw new Error(error.message)
    return (data as PersonRow[]).map(rowToPerson)
  },

  async getAllTags(): Promise<{ tag: string; count: number }[]> {
    const { data, error } = await supabase
      .from('people')
      .select('tags')
      .not('tags', 'is', null)
    if (error) throw new Error(error.message)
    const tagMap = new Map<string, number>()
    for (const row of data as { tags: string[] | null }[]) {
      if (!row.tags) continue
      for (const tag of row.tags) {
        tagMap.set(tag, (tagMap.get(tag) ?? 0) + 1)
      }
    }
    return Array.from(tagMap.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
  },

  async count(): Promise<number> {
    const { count, error } = await supabase
      .from('people')
      .select('*', { count: 'exact', head: true })
    if (error) throw new Error(error.message)
    return count ?? 0
  },

  async create(input: PersonInput): Promise<Person> {
    const now = new Date().toISOString()
    const { data, error } = await supabase
      .from('people')
      .insert({
        name: input.name,
        kana: input.kana ?? null,
        birth_date: input.birthDate ?? null,
        relationship: input.relationship ?? null,
        phone: input.phone ?? null,
        email: input.email ?? null,
        address: input.address ?? null,
        workplace: input.workplace ?? null,
        sns: input.sns ?? null,
        notes: input.notes ?? null,
        tags: input.tags ?? null,
        created_at: now,
        updated_at: now,
      })
      .select()
      .single()
    if (error) throw new Error(error.message)
    return rowToPerson(data as PersonRow)
  },

  async update(id: string, input: Partial<PersonInput>): Promise<Person | null> {
    const existing = await this.findById(id)
    if (!existing) return null

    const now = new Date().toISOString()
    const { data, error } = await supabase
      .from('people')
      .update({
        name: input.name ?? existing.name,
        kana: input.kana !== undefined ? (input.kana ?? null) : (existing.kana ?? null),
        birth_date: input.birthDate !== undefined ? (input.birthDate ?? null) : (existing.birthDate ?? null),
        relationship: input.relationship !== undefined ? (input.relationship ?? null) : (existing.relationship ?? null),
        phone: input.phone !== undefined ? (input.phone ?? null) : (existing.phone ?? null),
        email: input.email !== undefined ? (input.email ?? null) : (existing.email ?? null),
        address: input.address !== undefined ? (input.address ?? null) : (existing.address ?? null),
        workplace: input.workplace !== undefined ? (input.workplace ?? null) : (existing.workplace ?? null),
        sns: input.sns !== undefined ? (input.sns ?? null) : (existing.sns ?? null),
        notes: input.notes !== undefined ? (input.notes ?? null) : (existing.notes ?? null),
        tags: input.tags !== undefined ? (input.tags ?? null) : (existing.tags ?? null),
        updated_at: now,
      })
      .eq('id', id)
      .select()
      .single()
    if (error) throw new Error(error.message)
    return rowToPerson(data as PersonRow)
  },

  async delete(id: string): Promise<boolean> {
    const { error, count } = await supabase
      .from('people')
      .delete({ count: 'exact' })
      .eq('id', id)
    if (error) throw new Error(error.message)
    return (count ?? 0) > 0
  },
}

export type Person = {
  id: string
  name: string
  kana?: string
  birthDate?: string
  relationship?: string
  phone?: string
  email?: string
  address?: string
  workplace?: string
  sns?: string[]
  notes?: string
  tags?: string[]
  createdAt: string
  updatedAt: string
}

export type PersonInput = Omit<Person, 'id' | 'createdAt' | 'updatedAt'>

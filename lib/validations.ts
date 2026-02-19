import { z } from 'zod'

export const personSchema = z.object({
  name: z.string().min(1, '名前は必須です').max(100),
  kana: z.string().max(100).optional().or(z.literal('')),
  birthDate: z.string().optional().or(z.literal('')),
  relationship: z.string().max(100).optional().or(z.literal('')),
  phone: z.string().max(20).optional().or(z.literal('')),
  email: z.string().email('メールアドレスの形式が正しくありません').optional().or(z.literal('')),
  address: z.string().max(500).optional().or(z.literal('')),
  workplace: z.string().max(200).optional().or(z.literal('')),
  sns: z.array(z.string()).optional(),
  notes: z.string().max(2000).optional().or(z.literal('')),
  tags: z.array(z.string()).optional(),
})

export type PersonFormData = z.infer<typeof personSchema>

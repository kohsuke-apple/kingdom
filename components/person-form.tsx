'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Person } from '@/types/person'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { X, Plus, ChevronLeft } from 'lucide-react'
import { toast } from 'sonner'

type Props = {
  person?: Person
}

type SectionProps = {
  title: string
  children: React.ReactNode
}

function Section({ title, children }: SectionProps) {
  return (
    <div className="bg-white border border-border">
      <div className="px-6 py-3.5 border-b border-border bg-muted/30">
        <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          {title}
        </h3>
      </div>
      <div className="p-6 space-y-4">{children}</div>
    </div>
  )
}

export function PersonForm({ person }: Props) {
  const router = useRouter()
  const isEdit = !!person

  const [name, setName] = useState(person?.name ?? '')
  const [kana, setKana] = useState(person?.kana ?? '')
  const [birthDate, setBirthDate] = useState(person?.birthDate ?? '')
  const [relationship, setRelationship] = useState(person?.relationship ?? '')
  const [phone, setPhone] = useState(person?.phone ?? '')
  const [email, setEmail] = useState(person?.email ?? '')
  const [address, setAddress] = useState(person?.address ?? '')
  const [workplace, setWorkplace] = useState(person?.workplace ?? '')
  const [sns, setSns] = useState<string[]>(person?.sns ?? [])
  const [snsInput, setSnsInput] = useState('')
  const [notes, setNotes] = useState(person?.notes ?? '')
  const [tags, setTags] = useState<string[]>(person?.tags ?? [])
  const [tagInput, setTagInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  function addTag() {
    const t = tagInput.trim()
    if (t && !tags.includes(t)) setTags([...tags, t])
    setTagInput('')
  }

  function removeTag(tag: string) {
    setTags(tags.filter(t => t !== tag))
  }

  function addSns() {
    const s = snsInput.trim()
    if (s && !sns.includes(s)) setSns([...sns, s])
    setSnsInput('')
  }

  function removeSns(s: string) {
    setSns(sns.filter(item => item !== s))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setErrors({})

    const body = {
      name,
      kana: kana || undefined,
      birthDate: birthDate || undefined,
      relationship: relationship || undefined,
      phone: phone || undefined,
      email: email || undefined,
      address: address || undefined,
      workplace: workplace || undefined,
      sns: sns.length > 0 ? sns : undefined,
      notes: notes || undefined,
      tags: tags.length > 0 ? tags : undefined,
    }

    const url = isEdit ? `/api/people/${person!.id}` : '/api/people'
    const method = isEdit ? 'PUT' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (res.ok) {
      const data = await res.json()
      toast.success(isEdit ? '更新しました' : '登録しました')
      router.push(`/people/${data.id}`)
      router.refresh()
    } else {
      const data = await res.json()
      if (data.details?.fieldErrors) {
        const fe: Record<string, string> = {}
        for (const [k, v] of Object.entries(data.details.fieldErrors)) {
          fe[k] = (v as string[])[0]
        }
        setErrors(fe)
      }
      toast.error(isEdit ? '更新に失敗しました' : '登録に失敗しました')
    }

    setLoading(false)
  }

  return (
    <div className="p-8 max-w-2xl">
      {/* パンくず */}
      <div className="mb-6">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          戻る
        </button>
      </div>

      <div className="mb-8 pb-6 border-b border-border">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          {isEdit ? '人物を編集' : '人物を新規追加'}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Section title="基本情報">
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-xs uppercase tracking-wide">
              名前 <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="山田 太郎"
              required
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="kana" className="text-xs uppercase tracking-wide">
              かな / ふりがな
            </Label>
            <Input
              id="kana"
              value={kana}
              onChange={e => setKana(e.target.value)}
              placeholder="やまだ たろう"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="birthDate" className="text-xs uppercase tracking-wide">
                誕生日
              </Label>
              <Input
                id="birthDate"
                type="date"
                value={birthDate}
                onChange={e => setBirthDate(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="relationship" className="text-xs uppercase tracking-wide">
                関係・続柄
              </Label>
              <Input
                id="relationship"
                value={relationship}
                onChange={e => setRelationship(e.target.value)}
                placeholder="友人、同僚、家族"
              />
            </div>
          </div>
        </Section>

        <Section title="連絡先">
          <div className="space-y-1.5">
            <Label htmlFor="phone" className="text-xs uppercase tracking-wide">電話番号</Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="090-0000-0000"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs uppercase tracking-wide">メールアドレス</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="example@mail.com"
            />
            {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="address" className="text-xs uppercase tracking-wide">住所</Label>
            <Input
              id="address"
              value={address}
              onChange={e => setAddress(e.target.value)}
              placeholder="東京都..."
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="workplace" className="text-xs uppercase tracking-wide">職場・所属</Label>
            <Input
              id="workplace"
              value={workplace}
              onChange={e => setWorkplace(e.target.value)}
              placeholder="株式会社..."
            />
          </div>
        </Section>

        <Section title="SNS">
          <div className="flex gap-2">
            <Input
              value={snsInput}
              onChange={e => setSnsInput(e.target.value)}
              placeholder="@username や URL"
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addSns()
                }
              }}
            />
            <Button type="button" variant="outline" size="sm" onClick={addSns}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {sns.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {sns.map(s => (
                <Badge key={s} variant="secondary" className="gap-1.5">
                  {s}
                  <button type="button" onClick={() => removeSns(s)}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </Section>

        <Section title="タグ">
          <div className="flex gap-2">
            <Input
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              placeholder="タグを入力して Enter"
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addTag()
                }
              }}
            />
            <Button type="button" variant="outline" size="sm" onClick={addTag}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map(tag => (
                <Badge key={tag} variant="secondary" className="gap-1.5">
                  {tag}
                  <button type="button" onClick={() => removeTag(tag)}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </Section>

        <Section title="メモ">
          <Textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="自由記入欄..."
            rows={5}
          />
        </Section>

        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={loading} className="flex-1">
            {loading ? '保存中...' : isEdit ? '更新する' : '登録する'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={loading}
          >
            キャンセル
          </Button>
        </div>
      </form>
    </div>
  )
}

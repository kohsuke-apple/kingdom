'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { Person } from '@/types/person'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Edit, Trash2, ChevronLeft } from 'lucide-react'
import { toast } from 'sonner'

type Props = {
  person: Person
}

type InfoRowProps = {
  label: string
  value?: string | string[]
}

function InfoRow({ label, value }: InfoRowProps) {
  if (!value || (Array.isArray(value) && value.length === 0)) return null
  return (
    <div className="flex py-3 border-b border-border last:border-0">
      <dt className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground w-28 shrink-0 pt-0.5">
        {label}
      </dt>
      <dd className="text-sm text-foreground">
        {Array.isArray(value) ? value.join(' / ') : value}
      </dd>
    </div>
  )
}

export function PersonDetail({ person }: Props) {
  const router = useRouter()

  async function handleDelete() {
    if (!confirm(`「${person.name}」を削除しますか？`)) return

    const res = await fetch(`/api/people/${person.id}`, { method: 'DELETE' })
    if (res.ok) {
      toast.success('削除しました')
      router.push('/people')
      router.refresh()
    } else {
      toast.error('削除に失敗しました')
    }
  }

  return (
    <div className="p-8 max-w-2xl">
      {/* パンくず */}
      <div className="mb-6">
        <Link
          href="/people"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          一覧へ戻る
        </Link>
      </div>

      {/* ヘッダー */}
      <div className="bg-white border border-border">
        <div className="px-6 py-6 border-b border-border">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight">
                {person.name}
              </h1>
              {person.kana && (
                <p className="text-sm text-muted-foreground mt-1">{person.kana}</p>
              )}
              {(person.relationship || (person.tags && person.tags.length > 0)) && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {person.relationship && (
                    <Badge variant="secondary">{person.relationship}</Badge>
                  )}
                  {person.tags?.map(tag => (
                    <Badge key={tag} variant="outline">{tag}</Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-2 shrink-0">
              <Link href={`/people/${person.id}/edit`}>
                <Button variant="outline" size="sm" className="gap-2">
                  <Edit className="h-4 w-4" />
                  編集
                </Button>
              </Link>
              <Button
                variant="destructive"
                size="sm"
                className="gap-2"
                onClick={handleDelete}
              >
                <Trash2 className="h-4 w-4" />
                削除
              </Button>
            </div>
          </div>
        </div>

        {/* 情報一覧 */}
        <div className="px-6 py-2">
          <dl>
            <InfoRow label="誕生日" value={person.birthDate} />
            <InfoRow label="電話番号" value={person.phone} />
            <InfoRow label="メール" value={person.email} />
            <InfoRow label="住所" value={person.address} />
            <InfoRow label="職場・所属" value={person.workplace} />
            <InfoRow label="SNS" value={person.sns} />
          </dl>
        </div>

        {/* メモ */}
        {person.notes && (
          <div className="px-6 pb-6 border-t border-border pt-4">
            <p className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground mb-2">
              メモ
            </p>
            <div className="bg-muted p-4 text-sm text-foreground whitespace-pre-wrap leading-relaxed">
              {person.notes}
            </div>
          </div>
        )}

        {/* メタ情報 */}
        <div className="px-6 py-3 border-t border-border bg-muted/30">
          <div className="flex gap-6 text-[11px] text-muted-foreground">
            <span>登録: {new Date(person.createdAt).toLocaleString('ja-JP')}</span>
            <span>更新: {new Date(person.updatedAt).toLocaleString('ja-JP')}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

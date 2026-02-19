'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import type { Person } from '@/types/person'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Search, Plus, ArrowUpDown, X } from 'lucide-react'

type Props = {
  people: Person[]
  allTags: { tag: string; count: number }[]
  currentQuery?: string
  currentTag?: string
  currentSort?: string
}

export function PeopleList({ people, allTags, currentQuery, currentTag, currentSort }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const [searchValue, setSearchValue] = useState(currentQuery ?? '')

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams()
    if (searchValue) params.set('q', searchValue)
    if (currentSort) params.set('sort', currentSort)
    router.push(`${pathname}?${params.toString()}`)
  }

  function handleTagFilter(tag: string) {
    const params = new URLSearchParams()
    if (currentTag !== tag) params.set('tag', tag)
    if (currentSort) params.set('sort', currentSort)
    router.push(`${pathname}?${params.toString()}`)
  }

  function toggleSort() {
    const params = new URLSearchParams()
    if (currentQuery) params.set('q', currentQuery)
    if (currentTag) params.set('tag', currentTag)
    if (currentSort !== 'birthday') params.set('sort', 'birthday')
    router.push(`${pathname}?${params.toString()}`)
  }

  function clearFilters() {
    setSearchValue('')
    router.push(pathname)
  }

  const hasFilter = currentQuery || currentTag || currentSort

  return (
    <div className="p-8 max-w-5xl">
      {/* ページヘッダー */}
      <div className="mb-8 pb-6 border-b border-border flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">人物一覧</h2>
          <p className="text-sm text-muted-foreground mt-1">{people.length} 件</p>
        </div>
        <Link href="/people/new">
          <Button size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            新規追加
          </Button>
        </Link>
      </div>

      {/* 検索・フィルター */}
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="名前・かな・関係で検索"
              value={searchValue}
              onChange={e => setSearchValue(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button type="submit" variant="secondary">検索</Button>
        </form>
        <Button
          variant={currentSort === 'birthday' ? 'default' : 'outline'}
          size="sm"
          onClick={toggleSort}
          className="gap-2 shrink-0"
        >
          <ArrowUpDown className="h-4 w-4" />
          誕生日順
        </Button>
        {hasFilter && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1 shrink-0">
            <X className="h-4 w-4" />
            クリア
          </Button>
        )}
      </div>

      {/* タグフィルター */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {allTags.slice(0, 20).map(({ tag }) => (
            <Badge
              key={tag}
              variant={currentTag === tag ? 'default' : 'outline'}
              className="cursor-pointer text-xs"
              onClick={() => handleTagFilter(tag)}
            >
              {tag}
            </Badge>
          ))}
        </div>
      )}

      {/* フィルター状態表示 */}
      {(currentQuery || currentTag) && (
        <p className="text-xs text-muted-foreground mb-4">
          {currentQuery && <span>「{currentQuery}」で検索</span>}
          {currentQuery && currentTag && <span> · </span>}
          {currentTag && <span>タグ「{currentTag}」でフィルター</span>}
        </p>
      )}

      {/* 一覧 */}
      {people.length === 0 ? (
        <div className="bg-white border border-border py-16 text-center">
          <p className="text-sm text-muted-foreground mb-4">該当する人物がいません</p>
          <Link href="/people/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              新規追加
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-px bg-border">
          {people.map(person => (
            <Link key={person.id} href={`/people/${person.id}`}>
              <div className="bg-white p-5 h-full hover:bg-muted/40 transition-colors cursor-pointer group">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                      {person.name}
                    </p>
                    {person.kana && (
                      <p className="text-xs text-muted-foreground mt-0.5">{person.kana}</p>
                    )}
                  </div>
                  {person.relationship && (
                    <Badge variant="outline" className="text-xs shrink-0 ml-2">
                      {person.relationship}
                    </Badge>
                  )}
                </div>

                {(person.birthDate || person.workplace || person.phone) && (
                  <dl className="mt-2 space-y-0.5 text-xs text-muted-foreground">
                    {person.birthDate && (
                      <div className="flex gap-2">
                        <dt className="w-12 shrink-0 text-[10px] uppercase tracking-wide">生年月日</dt>
                        <dd>{person.birthDate}</dd>
                      </div>
                    )}
                    {person.workplace && (
                      <div className="flex gap-2">
                        <dt className="w-12 shrink-0 text-[10px] uppercase tracking-wide">所属</dt>
                        <dd className="truncate">{person.workplace}</dd>
                      </div>
                    )}
                    {person.phone && (
                      <div className="flex gap-2">
                        <dt className="w-12 shrink-0 text-[10px] uppercase tracking-wide">電話</dt>
                        <dd>{person.phone}</dd>
                      </div>
                    )}
                  </dl>
                )}

                {person.tags && person.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {person.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

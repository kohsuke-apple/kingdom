'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useMode } from '@/components/mode-context'
import { cn } from '@/lib/utils'

export function ModeSwitcher() {
  const { mode, setMode } = useMode()
  const pathname = usePathname()

  return (
    <div className="flex flex-col gap-4 border-b border-border bg-white px-6 py-4">
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant={mode === 'CA' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setMode('CA')}
        >
          CAモード
        </Button>
        <Button
          type="button"
          variant={mode === 'RA' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setMode('RA')}
        >
          RAモード
        </Button>
      </div>
      <div className="flex flex-wrap gap-2 text-sm">
        {[
          { href: '/dashboard/ra/home', label: 'RA Home' },
          { href: '/dashboard/ra/companies', label: '企業' },
          { href: '/dashboard/ra/jobs', label: '求人' },
          { href: '/dashboard/ra/selections', label: '選考' },
          { href: '/dashboard/ra/agents', label: 'エージェント' },
          { href: '/dashboard/ra/templates', label: 'テンプレート' },
          { href: '/dashboard/ra/tasks', label: 'タスク' },
          { href: '/dashboard/ca/home', label: 'CA Home' },
          { href: '/dashboard/ca/candidates', label: '候補者' },
          { href: '/dashboard/ca/jobs-search', label: '求人検索' },
          { href: '/dashboard/ca/saved', label: '保存求人' },
          { href: '/dashboard/ca/selections', label: '進捗' },
          { href: '/dashboard/ca/templates', label: 'CAテンプレート' },
        ].map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'rounded-md border px-2.5 py-1.5 transition-colors',
              pathname === item.href
                ? 'bg-muted text-foreground'
                : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
            )}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  )
}

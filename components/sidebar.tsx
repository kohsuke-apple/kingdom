'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, UserPlus } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/', label: 'ダッシュボード', icon: LayoutDashboard },
  { href: '/people', label: '人物一覧', icon: Users },
  { href: '/people/new', label: '新規追加', icon: UserPlus },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-56 border-r border-border bg-white flex-shrink-0 flex flex-col">
      {/* ロゴ */}
      <div className="px-6 py-5 border-b border-border">
        <div className="text-xs font-bold tracking-[0.18em] uppercase text-foreground">
          Kingdom
        </div>
        <div className="text-[11px] text-muted-foreground mt-0.5 tracking-wide">
          Personal Records
        </div>
      </div>

      {/* ナビゲーション */}
      <nav className="flex-1 py-3">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 px-5 py-2.5 text-sm border-l-2 transition-colors',
              pathname === href
                ? 'border-l-foreground bg-muted text-foreground font-medium'
                : 'border-l-transparent text-muted-foreground hover:text-foreground hover:bg-muted/60'
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span>{label}</span>
          </Link>
        ))}
      </nav>

      {/* フッター */}
      <div className="px-5 py-4 border-t border-border">
        <p className="text-[10px] text-muted-foreground uppercase tracking-[0.15em]">
          Private Access Only
        </p>
      </div>
    </aside>
  )
}

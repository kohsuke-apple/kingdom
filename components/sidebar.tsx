"use client"

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Building2, BriefcaseBusiness, ClipboardList, FileText, ListChecks, Settings, Users, UserCog, Bookmark, X, ChevronDown, Check, BookOpen, Handshake } from 'lucide-react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { useMode } from '@/components/mode-context'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import type { Mode } from '@/components/mode-context'

const modeOptions: { value: Mode; label: string }[] = [
  { value: 'ALL',    label: '全体' },
  { value: 'RA',     label: 'RA' },
  { value: 'CA',     label: 'CA' },
  { value: 'EXT_CA', label: '外部CA' },
  { value: 'HIRING', label: '採用担当' },
]

const modeHomeMap: Record<Mode, string> = {
  ALL: '/dashboard',
  RA: '/dashboard/ra/home',
  CA: '/dashboard/ca/home',
  HIRING: '/dashboard/hiring/home',
  EXT_CA: '/dashboard/ext-ca/home',
}

const allNavItems = [
  { href: '/dashboard', label: '全体ダッシュボード', icon: LayoutDashboard },
  { href: '/dashboard/all/ca', label: 'CA管理', icon: Users },
  { href: '/dashboard/all/ra', label: 'RA管理', icon: Users },
  { href: '/dashboard/selections', label: '選考管理', icon: ClipboardList },
  { href: '/dashboard/all/management', label: 'メンバー管理', icon: Users },
  { href: '/dashboard/all/contract-companies', label: '契約企業管理', icon: Handshake },
  { href: '/dashboard/company-settings', label: '会社設定', icon: Settings },
]

const raNavItems = [
  { href: '/dashboard/ra/home', label: 'RAホーム', icon: LayoutDashboard },
  { href: '/dashboard/ra/companies', label: '企業管理', icon: Building2 },
  { href: '/dashboard/ra/jobs', label: '求人管理', icon: BriefcaseBusiness },
  { href: '/dashboard/selections', label: '選考管理', icon: ClipboardList },
  { href: '/dashboard/ra/templates', label: 'テンプレート', icon: FileText },
  { href: '/dashboard/ra/tasks', label: 'タスク', icon: ListChecks },
]

const caNavItems = [
  { href: '/dashboard/ca/home', label: 'CAホーム', icon: LayoutDashboard },
  { href: '/dashboard/ca/candidates', label: '候補者管理', icon: Users },
  { href: '/dashboard/ca/forms', label: '求職者フォーム', icon: FileText },
  { href: '/dashboard/ca/jobs-search', label: '求人検索', icon: BriefcaseBusiness },
  { href: '/dashboard/ca/saved', label: '保存求人', icon: Bookmark },
  { href: '/dashboard/ca/selections', label: '選考管理', icon: ClipboardList },
  { href: '/dashboard/ca/templates', label: 'テンプレート', icon: FileText },
]

const extCaNavItems = [
  { href: '/dashboard/ext-ca/home', label: '外部CAホーム', icon: LayoutDashboard },
  { href: '/dashboard/ext-ca/jobs', label: '求人一覧 (閲覧)', icon: BriefcaseBusiness },
  { href: '/dashboard/ext-ca/candidates', label: '候補者 (自分の候補者のみ)', icon: Users },
]

const hiringNavItems = [
  { href: '/dashboard/hiring/home', label: '採用担当ホーム', icon: LayoutDashboard },
  { href: '/dashboard/hiring/jobs', label: '求人追加・編集', icon: UserCog },
  { href: '/dashboard/hiring/company-profile', label: '会社プロフィール', icon: Building2 },
]

export function Sidebar({ mobileOpen = false, onClose }: { mobileOpen?: boolean; onClose?: () => void }) {
  const pathname = usePathname()
  const router = useRouter()
  const { mode, setMode } = useMode()
  const modeNavItems =
    mode === 'ALL' ? allNavItems : mode === 'RA' ? raNavItems : mode === 'CA' ? caNavItems : mode === 'EXT_CA' ? extCaNavItems : hiringNavItems
  const modeLabel = modeOptions.find(o => o.value === mode)?.label ?? mode

  function handleModeChange(nextMode: typeof mode) {
    setMode(nextMode)
    router.push(modeHomeMap[nextMode])
    onClose?.()
  }

  return (
    <aside className={cn(
      'border-r border-border bg-white flex-shrink-0 flex flex-col z-50',
      // デスクトップ: 常時表示
      'hidden md:flex md:w-56',
      // モバイル: mobileOpen のときだけ固定表示
      mobileOpen && 'flex fixed inset-y-0 left-0 w-72',
    )}>
      {/* ロゴ */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <div className="flex items-center gap-3">
          <Image src="/logo.svg" alt="dealerAGENT" width={96} height={24} className="h-6 w-auto" unoptimized />

        </div>
        {mobileOpen && (
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 hover:bg-muted md:hidden"
            aria-label="メニューを閉じる"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="border-b border-border px-4 py-3">
        <p className="mb-1.5 text-[10px] uppercase tracking-[0.15em] text-muted-foreground">Mode</p>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full justify-between font-medium"
            >
              {modeLabel}
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-48">
            {modeOptions.map(opt => (
              <DropdownMenuItem
                key={opt.value}
                onSelect={() => handleModeChange(opt.value)}
                className="flex items-center justify-between"
              >
                {opt.label}
                {mode === opt.value && <Check className="h-3.5 w-3.5" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <nav className="flex-1 py-3">
        {modeNavItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            onClick={onClose}
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
      <div className="px-5 py-4 border-t border-border space-y-3">
        <Link
          href="/docs"
          className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <BookOpen className="h-3.5 w-3.5 shrink-0" />
          ドキュメント
        </Link>
        <p className="text-[10px] text-muted-foreground uppercase tracking-[0.15em]">
          Private Access Only
        </p>
      </div>
    </aside>
  )
}

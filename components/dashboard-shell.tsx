'use client'

import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { Sidebar } from './sidebar'

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden">
      {/* モバイルオーバーレイ */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* サイドバー */}
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      {/* メインエリア */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* モバイルヘッダー */}
        <header className="flex h-12 shrink-0 items-center border-b border-border bg-white px-4 md:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="rounded p-1.5 hover:bg-muted"
            aria-label="メニューを開く"
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="ml-3 text-sm font-bold tracking-[0.18em] uppercase">Kingdom</span>
        </header>

        <main className="flex-1 overflow-y-auto bg-[#FAFAFA]">
          {children}
        </main>
      </div>
    </div>
  )
}

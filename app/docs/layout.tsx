import Link from 'next/link'
import { getDocNavigation } from '@/lib/docs'
import { DocsSidebar } from '@/components/docs-sidebar'

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  const navigation = getDocNavigation()

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: 'var(--font-geist-sans, system-ui, sans-serif)' }}>
      {/* Header */}
      <header className="sticky top-0 z-30 h-14 bg-white border-b border-gray-100 flex items-center px-4 gap-4">
        <Link
          href="/"
          className="flex items-center gap-2 shrink-0"
        >
          <div
            className="w-7 h-7 bg-blue-600 flex items-center justify-center"
            style={{ borderRadius: '5px' }}
          >
            <span className="text-white font-black text-xs">D</span>
          </div>
          <span className="font-bold text-gray-900 text-sm">dealerAGENT</span>
        </Link>

        <div className="h-4 w-px bg-gray-200" />
        <span className="text-sm text-gray-500 font-medium">ドキュメント</span>

        <div className="flex-1" />

        <Link
          href="/dashboard"
          className="text-sm font-semibold text-white px-3 py-1.5 bg-blue-600 hover:bg-blue-700 transition-colors"
          style={{ borderRadius: '5px' }}
        >
          ダッシュボードへ
        </Link>
      </header>

      <div className="flex">
        <DocsSidebar navigation={navigation} />

        {/* Content area — only this re-renders on navigation */}
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>
    </div>
  )
}

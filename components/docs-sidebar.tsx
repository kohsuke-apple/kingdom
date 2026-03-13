'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Menu, X, ChevronRight } from 'lucide-react'
import type { DocSection } from '@/lib/docs'

type Props = {
  navigation: DocSection[]
}

type SidebarContentProps = {
  navigation: DocSection[]
  currentSlug: string
  onItemClick?: () => void
}

function SidebarContent({ navigation, currentSlug, onItemClick }: SidebarContentProps) {
  return (
    <nav className="py-6 px-4">
      {navigation.map((section) => (
        <div key={section.title} className="mb-6">
          <div className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 px-2">
            {section.title}
          </div>
          <ul className="space-y-0.5">
            {section.items.map((item) => {
              const isActive = currentSlug === item.slug
              return (
                <li key={item.slug}>
                  <Link
                    href={`/docs/${item.slug}`}
                    onClick={() => onItemClick?.()}
                    className={[
                      'flex items-center gap-1.5 px-2 py-1.5 text-sm transition-colors',
                      isActive
                        ? 'text-blue-600 font-semibold bg-blue-50'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50',
                    ].join(' ')}
                    style={{ borderRadius: '4px' }}
                  >
                    {isActive && <ChevronRight className="w-3 h-3 shrink-0" />}
                    {item.title}
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </nav>
  )
}

export function DocsSidebar({ navigation }: Props) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const currentSlug = pathname.replace('/docs/', '').replace('/docs', '')

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="md:hidden fixed bottom-5 right-5 z-50 w-12 h-12 bg-blue-600 text-white shadow-lg flex items-center justify-center"
        style={{ borderRadius: '50%' }}
        onClick={() => setMobileOpen((v) => !v)}
        aria-label="メニューを開く"
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <div
        className={[
          'md:hidden fixed top-0 left-0 z-40 h-full w-64 bg-white shadow-xl transition-transform duration-200',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
      >
        <div className="h-14 flex items-center px-4 border-b border-gray-100">
          <span className="font-bold text-gray-900 text-sm">dealerAGENT ドキュメント</span>
        </div>
        <div className="overflow-y-auto h-[calc(100%-56px)]">
          <SidebarContent navigation={navigation} currentSlug={currentSlug} onItemClick={() => setMobileOpen(false)} />
        </div>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden md:block w-56 shrink-0 border-r border-gray-100 overflow-y-auto sticky top-14 h-[calc(100vh-56px)]">
        <SidebarContent navigation={navigation} currentSlug={currentSlug} />
      </aside>
    </>
  )
}

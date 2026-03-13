// ──────────────────────────────────────────────────────────────────────────
// ドキュメント取得の抽象レイヤー
//
// CMS移行時はこのファイルの実装のみを変更する。
// 呼び出し元（app/docs/）は変更不要。
//
// 移行例:
//   Sanity  → client.fetch('*[_type == "doc" && slug.current == $slug]', { slug })
//   Notion  → notion.databases.query({ ... })
//   その他  → fetch(`${CMS_API}/docs/${slug}`)
// ──────────────────────────────────────────────────────────────────────────

import { DOC_PAGES, DOC_NAVIGATION, type DocPage, type DocSection } from './docs-content'

export type { DocPage, DocSection }

export function getAllDocs(): DocPage[] {
  return DOC_PAGES
}

export function getDocBySlug(slug: string): DocPage | undefined {
  return DOC_PAGES.find((doc) => doc.slug === slug)
}

export function getDocNavigation(): DocSection[] {
  return DOC_NAVIGATION
}

/** 前後ページを取得（Previous / Next ナビ用） */
export function getAdjacentDocs(slug: string): {
  prev: { slug: string; title: string } | null
  next: { slug: string; title: string } | null
} {
  const flat = DOC_NAVIGATION.flatMap((section) => section.items)
  const index = flat.findIndex((item) => item.slug === slug)
  return {
    prev: index > 0 ? flat[index - 1] : null,
    next: index < flat.length - 1 ? flat[index + 1] : null,
  }
}

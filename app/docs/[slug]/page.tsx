import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getDocBySlug, getAllDocs, getAdjacentDocs } from '@/lib/docs'
import { ArrowLeft, ArrowRight } from 'lucide-react'

type Props = {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return getAllDocs().map((doc) => ({ slug: doc.slug }))
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const doc = getDocBySlug(slug)
  if (!doc) return {}
  return {
    title: `${doc.title} — dealerAGENT ドキュメント`,
    description: doc.description,
  }
}

export default async function DocPage({ params }: Props) {
  const { slug } = await params
  const doc = getDocBySlug(slug)
  if (!doc) notFound()

  const { prev, next } = getAdjacentDocs(slug)

  return (
    <article className="max-w-3xl mx-auto px-6 py-10">
      {/* Page header */}
      <div className="mb-8 pb-6 border-b border-gray-100">
        <h1 className="text-3xl font-black text-gray-900 mb-2">{doc.title}</h1>
        <p className="text-gray-500">{doc.description}</p>
      </div>

      {/* Body */}
      <div
        className="doc-body"
        dangerouslySetInnerHTML={{ __html: doc.body }}
      />

      {/* Prev / Next */}
      <div className="mt-14 pt-6 border-t border-gray-100 grid grid-cols-2 gap-4">
        <div>
          {prev && (
            <Link
              href={`/docs/${prev.slug}`}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              <div>
                <div className="text-xs text-gray-400 mb-0.5">前のページ</div>
                <div className="font-semibold">{prev.title}</div>
              </div>
            </Link>
          )}
        </div>
        <div className="text-right">
          {next && (
            <Link
              href={`/docs/${next.slug}`}
              className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 transition-colors group"
            >
              <div>
                <div className="text-xs text-gray-400 mb-0.5">次のページ</div>
                <div className="font-semibold">{next.title}</div>
              </div>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          )}
        </div>
      </div>
    </article>
  )
}

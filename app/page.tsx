import Link from 'next/link'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import {
  Users,
  Briefcase,
  Building2,
  CheckCircle2,
  ArrowRight,
  Zap,
  ChevronRight,
} from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  // 管理者 (role === 'master') は /dashboard へリダイレクト
  try {
    const hdrs = await headers()
    const authorization = hdrs.get('authorization')
    if (authorization && authorization.startsWith('Bearer ')) {
      const token = authorization.slice('Bearer '.length).trim()
      if (token) {
        const userRes = await supabase.auth.getUser(token)
        const user = userRes.data.user
        if (user) {
          const { data: profileRow } = await supabase
            .from('user_profiles')
            .select('role, is_active')
            .eq('user_id', user.id)
            .maybeSingle()
          if (profileRow && profileRow.is_active && profileRow.role === 'master') {
            redirect('/dashboard')
          }
        }
      }
    }
  } catch (e) {
    console.error('auth check failed', e)
  }

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: 'var(--font-geist-sans, system-ui, sans-serif)' }}>

      {/* ── STICKY HEADER ── */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
        <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 flex items-center justify-center" style={{ borderRadius: '6px' }}>
              <span className="text-white font-black text-sm">D</span>
            </div>
            <span className="font-bold text-gray-900 text-lg tracking-tight">dealerAGENT</span>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">機能</a>
            <a href="#faq" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">よくある質問</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="text-sm text-gray-700 hover:text-gray-900 font-medium transition-colors px-3 py-1.5"
            >
              ログイン
            </Link>
            <Link
              href="/dashboard"
              className="text-sm font-semibold text-white px-4 py-2 bg-blue-600 hover:bg-blue-700 transition-colors"
              style={{ borderRadius: '6px' }}
            >
              無料デモを体験
            </Link>
          </div>
        </div>
      </header>

      {/* ── HERO ── */}
      <section
        className="relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #0a1628 0%, #0d1f3e 50%, #0f2755 100%)',
          minHeight: '560px',
        }}
      >
        {/* Dot grid pattern */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: 'radial-gradient(circle, #4b83f0 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />
        {/* Gradient orb */}
        <div
          className="absolute top-[-100px] right-[-100px] w-[500px] h-[500px] rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #3b82f6 0%, transparent 70%)' }}
        />

        <div className="relative mx-auto max-w-6xl px-6 py-24 md:py-32">
          <div className="max-w-3xl">
            <div
              className="inline-flex items-center gap-2 text-blue-300 text-sm font-medium mb-6 px-3 py-1.5"
              style={{ background: 'rgba(59, 130, 246, 0.15)', borderRadius: '4px', border: '1px solid rgba(59, 130, 246, 0.3)' }}
            >
              <Zap className="w-3.5 h-3.5" />
              採用エージェント管理プラットフォーム
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight mb-6">
              CA/RAの成果を
              <br />
              <span style={{ color: '#60a5fa' }}>最大化する</span>管理基盤
            </h1>

            <p className="text-lg md:text-xl text-blue-100/80 mb-10 leading-relaxed max-w-2xl">
              応募から内定・決定まで、採用プロセス全体を可視化。<br />
              KPIダッシュボードで個人・チームの成果をリアルタイムに把握し、
              採用成功率を劇的に向上させます。
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center gap-2 text-base font-bold text-white px-8 py-4 bg-blue-600 hover:bg-blue-500 transition-all shadow-lg hover:shadow-blue-500/30"
                style={{ borderRadius: '6px' }}
              >
                無料デモを体験する
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#features"
                className="inline-flex items-center justify-center gap-2 text-base font-semibold px-8 py-4 border transition-all"
                style={{
                  borderRadius: '6px',
                  color: 'rgba(255,255,255,0.85)',
                  borderColor: 'rgba(255,255,255,0.25)',
                  background: 'rgba(255,255,255,0.05)',
                }}
              >
                機能を見る
                <ChevronRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-16">
            <div className="inline-block text-blue-600 text-sm font-bold uppercase tracking-widest mb-3">Features</div>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">
              採用成功を支える<br />3つのコア機能
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              CA・RAそれぞれの業務フローに最適化された機能で、チーム全体の生産性を向上させます
            </p>
          </div>

          <div className="space-y-20">
            {/* Feature 1 */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 text-blue-600 font-bold text-sm mb-4">
                  <div className="w-6 h-6 bg-blue-600 text-white flex items-center justify-center text-xs font-black" style={{ borderRadius: '4px' }}>01</div>
                  プロセス可視化
                </div>
                <h3 className="text-2xl md:text-3xl font-black text-gray-900 mb-4">
                  応募〜決定まで<br />全ステータスを一元管理
                </h3>
                <p className="text-gray-500 leading-relaxed mb-6">
                  候補者ごとの選考状況を一覧で把握。書類通過・面接・内定・決定・辞退まで、すべてのステータスをリアルタイムで追跡できます。ボトルネックを即座に特定し、適切なフォローが可能です。
                </p>
                <ul className="space-y-3">
                  {['カンバン型ステータス管理', '候補者ごとの選考履歴', '担当CA/RAのアサイン管理'].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div
                className="aspect-[4/3] flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)', borderRadius: '12px' }}
              >
                <div className="w-full max-w-xs px-6">
                  {/* Pipeline mockup */}
                  <div className="bg-white shadow-lg p-4" style={{ borderRadius: '8px' }}>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-bold text-gray-700">選考パイプライン</span>
                      <span className="text-xs text-blue-500 font-semibold">今月</span>
                    </div>
                    {[
                      { label: '書類選考', color: '#3b82f6', pct: 100 },
                      { label: '一次面接', color: '#6366f1', pct: 65 },
                      { label: '最終面接', color: '#8b5cf6', pct: 35 },
                      { label: '内定', color: '#10b981', pct: 20 },
                    ].map(({ label, color, pct }) => (
                      <div key={label} className="mb-3">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-600">{label}</span>
                        </div>
                        <div className="h-2 bg-gray-100" style={{ borderRadius: '2px' }}>
                          <div className="h-full" style={{ width: `${pct}%`, background: color, borderRadius: '2px' }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1">
                <div
                  className="aspect-[4/3] flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', borderRadius: '12px' }}
                >
                  <div className="w-full max-w-xs px-6">
                    {/* KPI mockup */}
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: '今月の決定', color: '#10b981' },
                        { label: '書類通過率', color: '#3b82f6' },
                        { label: '内定承諾率', color: '#6366f1' },
                        { label: '平均選考日数', color: '#f59e0b' },
                      ].map(({ label, color }) => (
                        <div key={label} className="bg-white shadow-md p-3" style={{ borderRadius: '8px' }}>
                          <div className="text-xs text-gray-500 mb-2">{label}</div>
                          <div className="h-6 w-3/4" style={{ background: `${color}20`, borderRadius: '4px' }} />
                          <div className="h-1.5 w-1/3 mt-2" style={{ background: `${color}40`, borderRadius: '2px' }} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="order-1 md:order-2">
                <div className="inline-flex items-center gap-2 text-blue-600 font-bold text-sm mb-4">
                  <div className="w-6 h-6 bg-blue-600 text-white flex items-center justify-center text-xs font-black" style={{ borderRadius: '4px' }}>02</div>
                  KPIダッシュボード
                </div>
                <h3 className="text-2xl md:text-3xl font-black text-gray-900 mb-4">
                  個人・チームの成果を<br />数字で把握・改善
                </h3>
                <p className="text-gray-500 leading-relaxed mb-6">
                  エージェントごとの決定数・書類通過率・内定承諾率などのKPIを自動集計。マネージャーはチーム全体の状況を俯瞰し、課題のあるメンバーへの適切なサポートが可能になります。
                </p>
                <ul className="space-y-3">
                  {['個人KPI自動集計・比較', 'チーム全体のパフォーマンス可視化', '月次・週次レポート出力'].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 text-blue-600 font-bold text-sm mb-4">
                  <div className="w-6 h-6 bg-blue-600 text-white flex items-center justify-center text-xs font-black" style={{ borderRadius: '4px' }}>03</div>
                  情報一元管理
                </div>
                <h3 className="text-2xl md:text-3xl font-black text-gray-900 mb-4">
                  求人・候補者・企業を<br />ひとつのプラットフォームで
                </h3>
                <p className="text-gray-500 leading-relaxed mb-6">
                  バラバラに管理していた求人票・候補者情報・企業プロフィールをすべて統合。スプレッドシートや複数のツールへの分散を解消し、情報の鮮度と精度を高めます。
                </p>
                <ul className="space-y-3">
                  {['求人・候補者・企業のDB統合', 'CA/RA双方向の情報共有', 'リッチテキスト対応の詳細記録'].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div
                className="aspect-[4/3] flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #faf5ff 0%, #ede9fe 100%)', borderRadius: '12px' }}
              >
                <div className="w-full max-w-xs px-6 space-y-3">
                  {[
                    { icon: Users, label: '候補者DB', color: '#6366f1' },
                    { icon: Briefcase, label: '求人DB', color: '#3b82f6' },
                    { icon: Building2, label: '企業DB', color: '#8b5cf6' },
                  ].map(({ icon: Icon, label, color }) => (
                    <div key={label} className="bg-white shadow-md flex items-center gap-3 p-3" style={{ borderRadius: '8px' }}>
                      <div className="w-9 h-9 flex items-center justify-center shrink-0" style={{ background: `${color}15`, borderRadius: '6px' }}>
                        <Icon className="w-5 h-5" style={{ color }} />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-bold text-gray-700">{label}</div>
                        <div className="h-1.5 w-2/3 mt-1.5" style={{ background: `${color}30`, borderRadius: '2px' }} />
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-300" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="py-20 md:py-28 bg-gray-50">
        <div className="mx-auto max-w-3xl px-6">
          <div className="text-center mb-14">
            <div className="inline-block text-blue-600 text-sm font-bold uppercase tracking-widest mb-3">FAQ</div>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900">
              よくある質問
            </h2>
          </div>

          <div className="space-y-4">
            {[
              {
                q: '導入にどのくらいの期間がかかりますか？',
                a: '最短1営業日でご利用開始いただけます。初期設定のサポートも無料で提供しておりますので、ITに慣れていない方でも安心です。',
              },
              {
                q: '既存のデータを移行できますか？',
                a: 'Excelやスプレッドシートからのインポート機能を標準搭載しています。過去の候補者情報・企業情報をまとめて移行可能です。',
              },
              {
                q: '料金プランはどうなっていますか？',
                a: 'ユーザー数に応じたサブスクリプションプランをご用意しています。まずは無料デモでご確認いただき、ご要望に合わせたプランをご提案します。',
              },
              {
                q: 'セキュリティ面での対策はありますか？',
                a: 'データはすべて暗号化の上、国内データセンターに保管されます。アクセス制御・ロール管理・監査ログにも対応し、個人情報保護に万全の体制で臨んでいます。',
              },
            ].map(({ q, a }) => (
              <div
                key={q}
                className="p-6 bg-white"
                style={{ border: '1px solid #e5e7eb', borderRadius: '8px' }}
              >
                <div className="flex gap-3">
                  <div className="w-6 h-6 bg-blue-600 text-white flex items-center justify-center text-xs font-black shrink-0 mt-0.5" style={{ borderRadius: '4px' }}>
                    Q
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 mb-2">{q}</div>
                    <div className="text-sm text-gray-500 leading-relaxed">{a}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER CTA ── */}
      <section
        className="py-20 md:py-24 text-center"
        style={{ background: 'linear-gradient(135deg, #1e40af 0%, #1d4ed8 50%, #2563eb 100%)' }}
      >
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
            今すぐ採用成果を<br />最大化しましょう
          </h2>
          <p className="text-blue-100/80 text-lg mb-10">
            まずは無料デモで dealerAGENT の全機能をご体験ください
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 text-base font-bold text-blue-700 bg-white px-8 py-4 hover:bg-blue-50 transition-colors shadow-lg"
              style={{ borderRadius: '6px' }}
            >
              無料デモを体験する
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 text-base font-semibold text-white border border-white/30 px-8 py-4 hover:bg-white/10 transition-colors"
              style={{ borderRadius: '6px' }}
            >
              お問い合わせ
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 bg-blue-600 flex items-center justify-center" style={{ borderRadius: '5px' }}>
                  <span className="text-white font-black text-xs">D</span>
                </div>
                <span className="font-bold text-white text-base">dealerAGENT</span>
              </div>
              <p className="text-sm text-gray-500 max-w-xs">
                採用エージェント管理プラットフォーム。CA/RAの成果を最大化します。
              </p>
            </div>
            <nav className="flex flex-wrap gap-6 text-sm">
              <a href="#features" className="hover:text-white transition-colors">機能</a>
              <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
              <Link href="/dashboard" className="hover:text-white transition-colors">ログイン</Link>
            </nav>
          </div>
          <div className="border-t border-gray-800 mt-10 pt-6 text-xs text-gray-600 text-center">
            © {new Date().getFullYear()} dealerAGENT. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}

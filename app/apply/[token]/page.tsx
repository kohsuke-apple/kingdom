'use client'

import { useState, useEffect } from 'react'
import { ChevronRight, ChevronLeft, Plus, Trash2, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'

type WorkHistory = {
  companyName: string
  period: string
  jobType: string
  industry: string
}

type FormData = {
  // 基本情報
  name: string
  nameKana: string
  gender: string
  birthDate: string
  phone: string
  email: string
  location: string
  // 学歴・経歴
  lastEducation: string
  graduatedSchool: string
  experienceCount: string
  experienceJobTypes: string
  experienceIndustries: string
  currentSalary: string
  workHistories: WorkHistory[]
  // 希望条件
  desiredLocation: string
  desiredJobType: string
  desiredSalary: string
  selfPR: string
}

const SECTIONS = ['基本情報', '経歴・就業履歴', '希望条件・自己PR'] as const
type SectionIdx = 0 | 1 | 2

export default function ApplyPage({ params }: { params: Promise<{ token: string }> }) {
  const [token, setToken] = useState('')
  const [status, setStatus] = useState<'loading' | 'valid' | 'error' | 'submitted'>('loading')
  const [errorMsg, setErrorMsg] = useState('')
  const [section, setSection] = useState<SectionIdx>(0)
  const [submitting, setSubmitting] = useState(false)

  const [form, setForm] = useState<FormData>({
    name: '', nameKana: '', gender: '', birthDate: '',
    phone: '', email: '', location: '',
    lastEducation: '', graduatedSchool: '',
    experienceCount: '', experienceJobTypes: '', experienceIndustries: '', currentSalary: '',
    workHistories: [],
    desiredLocation: '', desiredJobType: '', desiredSalary: '', selfPR: '',
  })

  useEffect(() => {
    params.then(p => {
      setToken(p.token)
      fetch(`/api/apply/${p.token}`)
        .then(r => r.json())
        .then(d => {
          if (d.valid) setStatus('valid')
          else { setStatus('error'); setErrorMsg(d.error ?? 'フォームが無効です') }
        })
        .catch(() => { setStatus('error'); setErrorMsg('フォームの読み込みに失敗しました') })
    })
  }, [params])

  function set(key: keyof FormData, value: string) {
    setForm(f => ({ ...f, [key]: value }))
  }

  function addWorkHistory() {
    setForm(f => ({ ...f, workHistories: [...f.workHistories, { companyName: '', period: '', jobType: '', industry: '' }] }))
  }
  function removeWorkHistory(i: number) {
    setForm(f => ({ ...f, workHistories: f.workHistories.filter((_, idx) => idx !== i) }))
  }
  function setWorkHistory(i: number, key: keyof WorkHistory, val: string) {
    setForm(f => {
      const wh = [...f.workHistories]
      wh[i] = { ...wh[i], [key]: val }
      return { ...f, workHistories: wh }
    })
  }

  function canNext(): boolean {
    if (section === 0) return !!form.name.trim()
    return true
  }

  async function handleSubmit() {
    if (!form.name.trim()) return
    setSubmitting(true)
    try {
      const res = await fetch(`/api/apply/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form }),
      })
      if (res.ok) {
        setStatus('submitted')
      } else {
        const d = await res.json()
        setErrorMsg(d.error ?? '送信に失敗しました')
        setStatus('error')
      }
    } catch {
      setErrorMsg('送信に失敗しました。時間をおいて再試行してください。')
      setStatus('error')
    } finally {
      setSubmitting(false)
    }
  }

  // ── ローディング ────────────────────────────────────────────────────
  if (status === 'loading') {
    return (
      <Shell>
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-500">
          <Loader2 className="w-8 h-8 animate-spin" />
          <p className="text-sm">読み込み中…</p>
        </div>
      </Shell>
    )
  }

  // ── エラー ──────────────────────────────────────────────────────────
  if (status === 'error') {
    return (
      <Shell>
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <AlertCircle className="w-12 h-12 text-red-400" />
          <p className="text-lg font-bold text-gray-800">フォームを開けません</p>
          <p className="text-sm text-gray-500">{errorMsg}</p>
        </div>
      </Shell>
    )
  }

  // ── 送信完了 ────────────────────────────────────────────────────────
  if (status === 'submitted') {
    return (
      <Shell>
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <CheckCircle2 className="w-14 h-14 text-green-500" />
          <p className="text-xl font-bold text-gray-900">ご回答ありがとうございます</p>
          <p className="text-sm text-gray-500 text-center">
            入力いただいた情報を担当者が確認いたします。<br />
            今後の連絡はメールまたはお電話でご案内します。
          </p>
        </div>
      </Shell>
    )
  }

  // ── フォーム ────────────────────────────────────────────────────────
  return (
    <Shell>
      {/* ステッパー */}
      <div className="flex items-center gap-0 mb-8">
        {SECTIONS.map((label, i) => (
          <div key={label} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${
                i < section ? 'bg-blue-600 border-blue-600 text-white'
                : i === section ? 'border-blue-600 text-blue-600 bg-white'
                : 'border-gray-200 text-gray-400 bg-white'
              }`}>
                {i < section ? '✓' : i + 1}
              </div>
              <span className={`text-[10px] mt-1 font-medium whitespace-nowrap ${i === section ? 'text-blue-600' : 'text-gray-400'}`}>
                {label}
              </span>
            </div>
            {i < SECTIONS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-2 mb-4 ${i < section ? 'bg-blue-600' : 'bg-gray-200'}`} />
            )}
          </div>
        ))}
      </div>

      {/* セクション 0: 基本情報 */}
      {section === 0 && (
        <div className="space-y-4">
          <Field label="氏名 *">
            <input value={form.name} onChange={e => set('name', e.target.value)}
              className={input()} placeholder="例: 山田 太郎" />
          </Field>
          <Field label="ふりがな">
            <input value={form.nameKana} onChange={e => set('nameKana', e.target.value)}
              className={input()} placeholder="例: やまだ たろう" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="性別">
              <select value={form.gender} onChange={e => set('gender', e.target.value)} className={input()}>
                <option value="">選択してください</option>
                <option value="male">男性</option>
                <option value="female">女性</option>
                <option value="other">その他</option>
              </select>
            </Field>
            <Field label="生年月日">
              <input type="date" value={form.birthDate} onChange={e => set('birthDate', e.target.value)} className={input()} />
            </Field>
          </div>
          <Field label="電話番号">
            <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)}
              className={input()} placeholder="例: 090-1234-5678" />
          </Field>
          <Field label="メールアドレス">
            <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
              className={input()} placeholder="例: taro@example.com" />
          </Field>
          <Field label="現在の居住地">
            <input value={form.location} onChange={e => set('location', e.target.value)}
              className={input()} placeholder="例: 東京都渋谷区" />
          </Field>
        </div>
      )}

      {/* セクション 1: 経歴・就業履歴 */}
      {section === 1 && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <Field label="最終学歴">
              <select value={form.lastEducation} onChange={e => set('lastEducation', e.target.value)} className={input()}>
                <option value="">選択</option>
                {['中学卒', '高校卒', '専門学校卒', '短大卒', '大学卒', '大学院卒'].map(v => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </Field>
            <Field label="卒業校">
              <input value={form.graduatedSchool} onChange={e => set('graduatedSchool', e.target.value)}
                className={input()} placeholder="例: ○○大学" />
            </Field>
          </div>
          <Field label="社会人経験年数">
            <select value={form.experienceCount} onChange={e => set('experienceCount', e.target.value)} className={input()}>
              <option value="">選択</option>
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'].map(v => (
                <option key={v} value={v}>{v}年</option>
              ))}
              <option value="11">11年以上</option>
            </select>
          </Field>
          <Field label="経験業種">
            <input value={form.experienceIndustries} onChange={e => set('experienceIndustries', e.target.value)}
              className={input()} placeholder="例: IT・通信、金融" />
          </Field>
          <Field label="経験職種">
            <input value={form.experienceJobTypes} onChange={e => set('experienceJobTypes', e.target.value)}
              className={input()} placeholder="例: 営業、エンジニア" />
          </Field>
          <Field label="現在の年収（万円）">
            <input type="number" value={form.currentSalary} onChange={e => set('currentSalary', e.target.value)}
              className={input()} placeholder="例: 450" />
          </Field>

          {/* 就業履歴 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-gray-700">就業履歴</label>
              <button onClick={addWorkHistory}
                className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors">
                <Plus className="w-3.5 h-3.5" /> 追加
              </button>
            </div>
            {form.workHistories.length === 0 && (
              <p className="text-xs text-gray-400 py-2">「追加」ボタンで就業履歴を入力できます</p>
            )}
            {form.workHistories.map((wh, i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-3 mb-3 bg-gray-50">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-gray-500">履歴 {i + 1}</span>
                  <button onClick={() => removeWorkHistory(i)}>
                    <Trash2 className="w-3.5 h-3.5 text-gray-400 hover:text-red-500 transition-colors" />
                  </button>
                </div>
                <div className="space-y-2">
                  <input value={wh.companyName} onChange={e => setWorkHistory(i, 'companyName', e.target.value)}
                    className={input()} placeholder="会社名" />
                  <input value={wh.period} onChange={e => setWorkHistory(i, 'period', e.target.value)}
                    className={input()} placeholder="在籍期間（例: 2020年4月〜2023年3月）" />
                  <input value={wh.industry} onChange={e => setWorkHistory(i, 'industry', e.target.value)}
                    className={input()} placeholder="業種（例: IT・通信）" />
                  <input value={wh.jobType} onChange={e => setWorkHistory(i, 'jobType', e.target.value)}
                    className={input()} placeholder="職種・業務内容（例: Webエンジニア）" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* セクション 2: 希望条件 */}
      {section === 2 && (
        <div className="space-y-4">
          <Field label="希望勤務地">
            <input value={form.desiredLocation} onChange={e => set('desiredLocation', e.target.value)}
              className={input()} placeholder="例: 東京都内、リモート可" />
          </Field>
          <Field label="希望職種">
            <input value={form.desiredJobType} onChange={e => set('desiredJobType', e.target.value)}
              className={input()} placeholder="例: 営業、Webエンジニア" />
          </Field>
          <Field label="希望年収（万円）">
            <input type="number" value={form.desiredSalary} onChange={e => set('desiredSalary', e.target.value)}
              className={input()} placeholder="例: 500" />
          </Field>
          <Field label="自己PR・その他ご要望">
            <textarea value={form.selfPR} onChange={e => set('selfPR', e.target.value)}
              rows={5} className={`${input()} resize-none`}
              placeholder="転職の動機・強み・希望条件など、自由にご記入ください" />
          </Field>
        </div>
      )}

      {/* ナビゲーションボタン */}
      <div className="flex gap-3 mt-8">
        {section > 0 && (
          <button
            onClick={() => setSection(s => (s - 1) as SectionIdx)}
            className="flex items-center gap-1.5 px-5 py-3 border border-gray-200 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            戻る
          </button>
        )}
        {section < 2 ? (
          <button
            onClick={() => { if (canNext()) setSection(s => (s + 1) as SectionIdx) }}
            disabled={!canNext()}
            className="flex-1 flex items-center justify-center gap-1.5 px-5 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-lg text-sm font-bold transition-colors"
          >
            次へ
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={submitting || !form.name.trim()}
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-lg text-sm font-bold transition-colors"
          >
            {submitting ? <><Loader2 className="w-4 h-4 animate-spin" />送信中…</> : '送信する'}
          </button>
        )}
      </div>

      <p className="text-center text-xs text-gray-400 mt-4">
        入力いただいた情報は担当エージェントのみが閲覧します
      </p>
    </Shell>
  )
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: 'var(--font-geist-sans, system-ui, sans-serif)' }}>
      {/* ヘッダー */}
      <div className="bg-white border-b border-gray-100 px-4 py-4 flex items-center gap-2">
        <div className="w-7 h-7 bg-blue-600 flex items-center justify-center rounded-md">
          <span className="text-white font-black text-xs">D</span>
        </div>
        <span className="font-bold text-gray-900 text-sm">dealerAGENT</span>
        <span className="text-gray-300 mx-1">|</span>
        <span className="text-sm text-gray-500">経歴登録フォーム</span>
      </div>

      <div className="max-w-lg mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
          {children}
        </div>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
      {children}
    </div>
  )
}

function input() {
  return 'w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white placeholder:text-gray-300'
}

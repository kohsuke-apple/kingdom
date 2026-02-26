'use client'

import { useRef, useState } from 'react'
import { ImagePlus, Loader2, Trash2, Upload } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { useMode } from './mode-context'

interface Props {
  jobId: string
  initialUrl?: string
}

export function JobThumbnailEditor({ jobId, initialUrl }: Props) {
  const [currentUrl, setCurrentUrl] = useState<string | undefined>(initialUrl)
  const [preview, setPreview] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const { mode } = useMode()

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null
    setFile(f)
    if (f) {
      const reader = new FileReader()
      reader.onload = ev => setPreview(ev.target?.result as string)
      reader.readAsDataURL(f)
    } else {
      setPreview(null)
    }
  }

  async function handleSave() {
    if (!file) return
    setUploading(true)

    // 1. Storage にアップロード
    const fd = new FormData()
    fd.append('file', file)
    const uploadRes = await fetch('/api/jobs/thumbnail', { method: 'POST', body: fd })
    if (!uploadRes.ok) {
      const err = await uploadRes.json().catch(() => ({})) as { error?: string }
      toast.error(err.error ?? 'アップロードに失敗しました')
      setUploading(false)
      return
    }
    const { url } = await uploadRes.json() as { url: string }

    // 2. 求人レコードを更新
    const patchRes = await fetch(`/api/jobs?id=${jobId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ thumbnailUrl: url }),
    })
    if (!patchRes.ok) {
      const err = await patchRes.json().catch(() => ({})) as { error?: string }
      toast.error(err.error ?? '保存に失敗しました')
      setUploading(false)
      return
    }

    setCurrentUrl(url)
    setPreview(null)
    setFile(null)
    if (inputRef.current) inputRef.current.value = ''
    toast.success('サムネイルを更新しました')
    setUploading(false)
  }

  async function handleDelete() {
    if (!confirm('サムネイル画像を削除しますか？')) return
    setUploading(true)
    const res = await fetch(`/api/jobs?id=${jobId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ thumbnailUrl: null }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({})) as { error?: string }
      toast.error(err.error ?? '削除に失敗しました')
      setUploading(false)
      return
    }
    setCurrentUrl(undefined)
    setPreview(null)
    setFile(null)
    if (inputRef.current) inputRef.current.value = ''
    toast.success('サムネイルを削除しました')
    setUploading(false)
  }

  const displayUrl = preview ?? currentUrl

  const isEditable = mode === 'RA'

  return (
    <div className="space-y-3">
      {/* プレビューエリア */}
      <div
        className={`relative flex h-44 w-full ${isEditable ? 'cursor-pointer' : ''} items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-input bg-muted/30 transition-colors ${isEditable ? 'hover:bg-muted/50' : ''}`}
        onClick={() => { if (isEditable) inputRef.current?.click() }}
      >
        {displayUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={displayUrl} alt="サムネイル" className="h-full w-full object-cover" />
        ) : (
          <div className="flex flex-col items-center gap-1.5 text-muted-foreground">
            <ImagePlus className="h-8 w-8" />
            <span className="text-xs">クリックして画像を選択</span>
          </div>
        )}
        {/* ホバーオーバーレイ */}
        {displayUrl && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity">
            <Upload className="h-7 w-7 text-white" />
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="sr-only"
          onChange={handleFileChange}
          disabled={!isEditable}
        />
      </div>

      {/* アクションボタン */}
      <div className="flex items-center gap-2">
        {isEditable && preview ? (
          <>
            <Button
              size="sm"
              disabled={uploading}
              onClick={() => void handleSave()}
              className="gap-1.5"
            >
              {uploading ? (
                <><Loader2 className="h-3.5 w-3.5 animate-spin" />保存中...</>
              ) : (
                <><Upload className="h-3.5 w-3.5" />保存する</>
              )}
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={uploading}
              onClick={() => {
                setFile(null)
                setPreview(null)
                if (inputRef.current) inputRef.current.value = ''
              }}
            >
              キャンセル
            </Button>
          </>
        ) : isEditable ? (
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5"
            onClick={() => inputRef.current?.click()}
          >
            <Upload className="h-3.5 w-3.5" />
            画像を変更
          </Button>
        ) : null }
        {currentUrl && !preview && isEditable && (
          <Button
            size="sm"
            variant="ghost"
            className="gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive"
            disabled={uploading}
            onClick={() => void handleDelete()}
          >
            <Trash2 className="h-3.5 w-3.5" />
            削除
          </Button>
        )}
      </div>
      <p className="text-[11px] text-muted-foreground">JPEG / PNG / WebP / GIF、5 MB 以下</p>
    </div>
  )
}

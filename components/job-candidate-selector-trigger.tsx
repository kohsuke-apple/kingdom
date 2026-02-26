"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMode } from './mode-context'
import { CandidateSelector } from './candidate-selector'

export function JobCandidateSelectorTrigger({ jobId, companyId }: { jobId: string; companyId?: string }) {
  const { mode } = useMode()
  const [open, setOpen] = useState(false)
  const router = useRouter()

  if (mode !== 'CA') return null

  return (
    <>
      <button
        type="button"
        className="inline-flex items-center gap-2 rounded-md bg-sky-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-sky-700"
        onClick={() => setOpen(true)}
      >
        求職者を選択
      </button>

      {open && (
        <CandidateSelector
          jobId={jobId}
          companyId={companyId ?? ''}
          onClose={() => setOpen(false)}
          onApplied={() => {
            setOpen(false)
            router.refresh()
          }}
        />
      )}
    </>
  )
}

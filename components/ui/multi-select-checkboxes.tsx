'use client'

import { useRef, useState, useEffect } from 'react'
import { ChevronDown, X } from 'lucide-react'

export type MultiSelectOption = {
  value: string
  label: string
  group?: string
}

type Props = {
  options: MultiSelectOption[]
  value: string[]
  onChange: (values: string[]) => void
  placeholder?: string
  showGroups?: boolean
}

export function MultiSelectCheckboxes({
  options,
  value,
  onChange,
  placeholder = '選択してください',
  showGroups = false,
}: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function toggle(v: string) {
    if (value.includes(v)) {
      onChange(value.filter(x => x !== v))
    } else {
      onChange([...value, v])
    }
  }

  function remove(v: string, e: React.MouseEvent) {
    e.stopPropagation()
    onChange(value.filter(x => x !== v))
  }

  const selectedLabels = value.map(v => options.find(o => o.value === v)?.label ?? v)

  // Build grouped list when showGroups is true
  const groups = showGroups
    ? Array.from(new Set(options.map(o => o.group ?? ''))).filter(Boolean)
    : []

  return (
    <div ref={ref} className="relative">
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex min-h-10 w-full flex-wrap items-center gap-1.5 rounded-md border border-input bg-white px-3 py-2 text-sm hover:bg-muted/30"
      >
        {value.length === 0 ? (
          <span className="text-muted-foreground">{placeholder}</span>
        ) : (
          selectedLabels.map((label, i) => (
            <span
              key={value[i]}
              className="flex items-center gap-0.5 rounded bg-muted px-1.5 py-0.5 text-xs font-medium"
            >
              {label}
              <span
                role="button"
                tabIndex={0}
                onClick={e => remove(value[i], e)}
                onKeyDown={e => e.key === 'Enter' && remove(value[i], e as unknown as React.MouseEvent)}
                className="ml-0.5 cursor-pointer text-muted-foreground hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </span>
            </span>
          ))
        )}
        <ChevronDown className="ml-auto h-4 w-4 shrink-0 text-muted-foreground" />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 max-h-64 w-full overflow-y-auto rounded-md border border-border bg-white shadow-lg">
          {showGroups && groups.length > 0 ? (
            groups.map(group => {
              const groupOptions = options.filter(o => o.group === group)
              return (
                <div key={group}>
                  <div className="sticky top-0 bg-muted/50 px-3 py-1.5 text-xs font-semibold text-muted-foreground">
                    {group}
                  </div>
                  {groupOptions.map(opt => (
                    <label
                      key={opt.value}
                      className="flex cursor-pointer items-center gap-2 px-3 py-2 text-sm hover:bg-muted/40"
                    >
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-input accent-primary"
                        checked={value.includes(opt.value)}
                        onChange={() => toggle(opt.value)}
                      />
                      {opt.label}
                    </label>
                  ))}
                </div>
              )
            })
          ) : (
            options.map(opt => (
              <label
                key={opt.value}
                className="flex cursor-pointer items-center gap-2 px-3 py-2 text-sm hover:bg-muted/40"
              >
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-input accent-primary"
                  checked={value.includes(opt.value)}
                  onChange={() => toggle(opt.value)}
                />
                {opt.label}
              </label>
            ))
          )}
        </div>
      )}
    </div>
  )
}

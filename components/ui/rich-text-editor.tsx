'use client'

import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin'
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin'
import { ListPlugin } from '@lexical/react/LexicalListPlugin'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html'
import { HeadingNode, QuoteNode } from '@lexical/rich-text'
import { ListItemNode, ListNode } from '@lexical/list'
import { $getRoot, $insertNodes, type EditorState, type LexicalEditor } from 'lexical'
import { FORMAT_TEXT_COMMAND } from 'lexical'
import { INSERT_ORDERED_LIST_COMMAND, INSERT_UNORDERED_LIST_COMMAND } from '@lexical/list'
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary'
import { List, ListOrdered } from 'lucide-react'
import { cn } from '@/lib/utils'

function Toolbar() {
  const [editor] = useLexicalComposerContext()

  return (
    <div className="flex items-center gap-0.5 border-b border-input bg-muted/30 px-2 py-1.5">
      <button
        type="button"
        onMouseDown={e => {
          e.preventDefault()
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')
        }}
        className="rounded px-2 py-1 text-xs font-bold hover:bg-muted"
        title="太字 (Ctrl+B)"
      >
        B
      </button>
      <button
        type="button"
        onMouseDown={e => {
          e.preventDefault()
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')
        }}
        className="rounded px-2 py-1 text-xs italic hover:bg-muted"
        title="斜体 (Ctrl+I)"
      >
        I
      </button>
      <div className="mx-1 h-3.5 w-px bg-border" />
      <button
        type="button"
        onMouseDown={e => {
          e.preventDefault()
          editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)
        }}
        className="rounded p-1 hover:bg-muted"
        title="箇条書き"
      >
        <List className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        onMouseDown={e => {
          e.preventDefault()
          editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)
        }}
        className="rounded p-1 hover:bg-muted"
        title="番号付きリスト"
      >
        <ListOrdered className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}

type Props = {
  defaultValue?: string
  onChange?: (html: string) => void
  placeholder?: string
  className?: string
  minHeight?: string
}

export function RichTextEditor({
  defaultValue = '',
  onChange,
  placeholder = '入力してください...',
  className,
  minHeight = '120px',
}: Props) {
  const initialConfig = {
    namespace: 'RichTextEditor',
    nodes: [HeadingNode, QuoteNode, ListNode, ListItemNode],
    onError: (error: Error) => console.error(error),
    editorState: defaultValue
      ? (editor: LexicalEditor) => {
          const dom = new DOMParser().parseFromString(defaultValue, 'text/html')
          const nodes = $generateNodesFromDOM(editor, dom)
          $getRoot().select()
          $insertNodes(nodes)
        }
      : undefined,
  }

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div className={cn('rounded-md border border-input bg-white text-sm', className)}>
        <Toolbar />
        <div className="relative">
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                className="rich-text-content outline-none px-3 py-2"
                style={{ minHeight }}
              />
            }
            placeholder={
              <div className="pointer-events-none absolute left-3 top-2 select-none text-muted-foreground">
                {placeholder}
              </div>
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
          <HistoryPlugin />
          <ListPlugin />
          {onChange && (
            <OnChangePlugin
              ignoreSelectionChange
              onChange={(_editorState: EditorState, editor: LexicalEditor) => {
                editor.read(() => {
                  const html = $generateHtmlFromNodes(editor, null)
                  onChange(html)
                })
              }}
            />
          )}
        </div>
      </div>
    </LexicalComposer>
  )
}

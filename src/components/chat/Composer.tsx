import type { KeyboardEvent } from 'react'
import type { ChatMode } from '../../types/chat'

interface ComposerProps {
  value: string
  onChange: (value: string) => void
  onSend: () => void
  isSending: boolean
  mode: ChatMode
  onModeChange: (mode: ChatMode) => void
}

export function Composer({ value, onChange, onSend, isSending, mode, onModeChange }: ComposerProps) {
  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSend()
    }
  }

  return (
    <div className="composer">
      <div className="composer-mode-toggle" role="radiogroup" aria-label="Response mode">
        <button
          type="button"
          role="radio"
          aria-checked={mode === 'stream'}
          className={mode === 'stream' ? 'active' : ''}
          onClick={() => onModeChange('stream')}
        >
          Stream
        </button>
        <button
          type="button"
          role="radio"
          aria-checked={mode === 'invoke'}
          className={mode === 'invoke' ? 'active' : ''}
          onClick={() => onModeChange('invoke')}
        >
          Invoke
        </button>
      </div>
      <div className="composer-bar">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Message Waypoint…"
          rows={1}
        />
        <button className="composer-send-btn" onClick={onSend} disabled={!value.trim() || isSending} aria-label="Send">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  )
}

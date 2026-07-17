import type { KeyboardEvent } from 'react'

interface ComposerProps {
  value: string
  onChange: (value: string) => void
  onSend: () => void
  isSending: boolean
}

export function Composer({ value, onChange, onSend, isSending }: ComposerProps) {
  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSend()
    }
  }

  return (
    <div className="composer">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type a message..."
        rows={1}
      />
      <button onClick={onSend} disabled={!value.trim() || isSending}>
        Send
      </button>
    </div>
  )
}

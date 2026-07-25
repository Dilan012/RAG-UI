import { useState } from 'react'

interface TextInputProps {
  onSubmit: (text: string) => void
  isSubmitting: boolean
}

export function TextInput({ onSubmit, isSubmitting }: TextInputProps) {
  const [text, setText] = useState('')

  function handleSubmit() {
    const trimmed = text.trim()
    if (!trimmed || isSubmitting) return
    onSubmit(trimmed)
    setText('')
  }

  return (
    <div className="text-input-form">
      <textarea
        className="text-input-textarea"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste or type text to add to the knowledge base…"
        rows={4}
      />
      <button
        className="text-input-submit-btn"
        onClick={handleSubmit}
        disabled={!text.trim() || isSubmitting}
      >
        {isSubmitting ? 'Adding…' : 'Add text'}
      </button>
    </div>
  )
}

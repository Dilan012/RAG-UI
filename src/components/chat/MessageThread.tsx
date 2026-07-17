import type { RefObject } from 'react'
import type { ChatMessage } from '../../types/chat'

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

interface MessageThreadProps {
  title: string
  messages: ChatMessage[]
  isSending: boolean
  endRef: RefObject<HTMLDivElement | null>
}

export function MessageThread({ title, messages, isSending, endRef }: MessageThreadProps) {
  return (
    <>
      <div className="chat-header">{title || 'New chat'}</div>
      <div className="messages">
        {messages.length === 0 && <div className="empty-state">Ask anything to start the conversation.</div>}
        {messages.map((m) => (
          <div key={m.id} className={`message-row ${m.role}`}>
            <div className="message-bubble">
              <div className="message-content">{m.content}</div>
              <div className="message-time">{formatTime(m.createdAt)}</div>
            </div>
          </div>
        ))}
        {isSending && (
          <div className="message-row assistant">
            <div className="message-bubble typing">
              <span className="dot" />
              <span className="dot" />
              <span className="dot" />
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>
    </>
  )
}

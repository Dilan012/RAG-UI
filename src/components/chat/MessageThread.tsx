import type { RefObject } from 'react'
import { BrandLogo } from '../common/BrandLogo'
import type { ChatMessage } from '../../types/chat'

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

interface MessageThreadProps {
  title: string
  messages: ChatMessage[]
  endRef: RefObject<HTMLDivElement | null>
}

export function MessageThread({ title, messages, endRef }: MessageThreadProps) {
  return (
    <>
      <div className="chat-header">
        <span className="chat-header-title">{title || 'New chat'}</span>
      </div>
      <div className="messages">
        {messages.length === 0 && (
          <div className="empty-state">
            <BrandLogo size={36} showWordmark={false} />
            <p>Ask anything to start the conversation.</p>
          </div>
        )}
        {messages.map((m) =>
          m.role === 'assistant' ? (
            <div key={m.id} className="message-row assistant">
              <div className="message-avatar assistant-avatar">
                <BrandLogo size={16} showWordmark={false} />
              </div>
              <div className="message-body">
                <div className="message-sender">Waypoint</div>
                {/* Empty content means the reply is still streaming in — the
                    placeholder from assistantMessageStarted hasn't received its
                    first chunk yet, so show a typing indicator in its place. */}
                {m.content ? (
                  <>
                    <div className="message-content">{m.content}</div>
                    <div className="message-time">{formatTime(m.createdAt)}</div>
                  </>
                ) : (
                  <div className="typing-indicator">
                    <span className="dot" />
                    <span className="dot" />
                    <span className="dot" />
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div key={m.id} className="message-row user">
              <div className="message-bubble">
                <div className="message-content">{m.content}</div>
                <div className="message-time">{formatTime(m.createdAt)}</div>
              </div>
            </div>
          ),
        )}
        <div ref={endRef} />
      </div>
    </>
  )
}

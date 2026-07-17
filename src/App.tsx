import { useEffect, useMemo, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import './App.css'
import type { ChatMessage, Conversation } from './types'

function makeId() {
  return Math.random().toString(36).slice(2, 10)
}

function createConversation(title = 'New chat'): Conversation {
  return {
    id: makeId(),
    title,
    messages: [],
    updatedAt: Date.now(),
  }
}

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function App() {
  const [conversations, setConversations] = useState<Conversation[]>(() => [
    createConversation('Welcome'),
  ])
  const [activeId, setActiveId] = useState<string>(() => conversations[0].id)
  const [draft, setDraft] = useState('')
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const activeConversation = useMemo(
    () => conversations.find((c) => c.id === activeId) ?? null,
    [conversations, activeId],
  )

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [activeConversation?.messages.length])

  function handleNewConversation() {
    const conversation = createConversation()
    setConversations((prev) => [conversation, ...prev])
    setActiveId(conversation.id)
    setDraft('')
  }

  function handleDeleteConversation(id: string) {
    setConversations((prev) => {
      const next = prev.filter((c) => c.id !== id)
      if (id === activeId && next.length > 0) {
        setActiveId(next[0].id)
      }
      return next
    })
  }

  async function handleSend() {
    const text = draft.trim()
    if (!text || !activeConversation || isSending) return

    const userMessage: ChatMessage = {
      id: makeId(),
      role: 'user',
      content: text,
      createdAt: Date.now(),
    }

    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConversation.id
          ? {
              ...c,
              title: c.messages.length === 0 ? text.slice(0, 40) : c.title,
              messages: [...c.messages, userMessage],
              updatedAt: Date.now(),
            }
          : c,
      ),
    )
    setDraft('')
    setIsSending(true)

    try {
      // TODO: replace with a real call to the RAG backend, e.g.
      // const res = await fetch('/chat', { method: 'POST', body: JSON.stringify({ message: text }) })
      const reply = await new Promise<string>((resolve) =>
        setTimeout(() => resolve(`This is a placeholder response to: "${text}"`), 700),
      )

      const assistantMessage: ChatMessage = {
        id: makeId(),
        role: 'assistant',
        content: reply,
        createdAt: Date.now(),
      }

      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeConversation.id
            ? { ...c, messages: [...c.messages, assistantMessage], updatedAt: Date.now() }
            : c,
        ),
      )
    } finally {
      setIsSending(false)
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const sortedConversations = useMemo(
    () => [...conversations].sort((a, b) => b.updatedAt - a.updatedAt),
    [conversations],
  )

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sidebar-header">
          <span className="brand">RAG Chat</span>
          <button className="new-chat-btn" onClick={handleNewConversation}>
            + New
          </button>
        </div>
        <div className="conversation-list">
          {sortedConversations.map((c) => (
            <div
              key={c.id}
              className={`conversation-item ${c.id === activeId ? 'active' : ''}`}
              onClick={() => setActiveId(c.id)}
            >
              <div className="conversation-title">{c.title || 'New chat'}</div>
              <button
                className="delete-btn"
                onClick={(e) => {
                  e.stopPropagation()
                  handleDeleteConversation(c.id)
                }}
                aria-label="Delete conversation"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </aside>

      <main className="chat-panel">
        {activeConversation ? (
          <>
            <div className="chat-header">{activeConversation.title || 'New chat'}</div>
            <div className="messages">
              {activeConversation.messages.length === 0 && (
                <div className="empty-state">Ask anything to start the conversation.</div>
              )}
              {activeConversation.messages.map((m) => (
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
              <div ref={messagesEndRef} />
            </div>
            <div className="composer">
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                rows={1}
              />
              <button onClick={handleSend} disabled={!draft.trim() || isSending}>
                Send
              </button>
            </div>
          </>
        ) : (
          <div className="empty-state">Select or create a conversation</div>
        )}
      </main>
    </div>
  )
}

export default App

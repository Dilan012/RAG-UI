import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sidebar } from '../components/chat/Sidebar'
import { MessageThread } from '../components/chat/MessageThread'
import { Composer } from '../components/chat/Composer'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { logout } from '../store/auth/auth-slice'
import type { ChatMessage, Conversation } from '../types/chat'

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

export function ChatPage() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const user = useAppSelector((state) => state.auth.user)

  const [conversations, setConversations] = useState<Conversation[]>(() => [createConversation('Welcome')])
  const [activeId, setActiveId] = useState<string>(() => conversations[0]!.id)
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
        setActiveId(next[0]!.id)
      }
      return next
    })
  }

  function handleLogout() {
    dispatch(logout())
    navigate('/login')
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
      // TODO: replace with a real call to the RAG backend's /chat endpoint via apiClient
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

  const sortedConversations = useMemo(
    () => [...conversations].sort((a, b) => b.updatedAt - a.updatedAt),
    [conversations],
  )

  return (
    <div className="app">
      <Sidebar
        conversations={sortedConversations}
        activeId={activeId}
        onSelect={setActiveId}
        onNew={handleNewConversation}
        onDelete={handleDeleteConversation}
        userName={user?.name}
        onLogout={handleLogout}
      />

      <main className="chat-panel">
        {activeConversation ? (
          <>
            <MessageThread
              title={activeConversation.title}
              messages={activeConversation.messages}
              isSending={isSending}
              endRef={messagesEndRef}
            />
            <Composer value={draft} onChange={setDraft} onSend={handleSend} isSending={isSending} />
          </>
        ) : (
          <div className="empty-state">Select or create a conversation</div>
        )}
      </main>
    </div>
  )
}

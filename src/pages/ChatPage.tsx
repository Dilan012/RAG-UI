import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sidebar } from '../components/chat/Sidebar'
import { MessageThread } from '../components/chat/MessageThread'
import { Composer } from '../components/chat/Composer'
import { useAppDispatch, useAppSelector, useApiRequest } from '../store/hooks'
import { logout } from '../store/auth/auth-slice'
import {
  conversationCreated,
  conversationDeleted,
  conversationSelected,
  sendChatMessage,
  userMessageSent,
} from '../store/chat/chat-slice'

export function ChatPage() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const user = useAppSelector((state) => state.auth.user)
  const conversations = useAppSelector((state) => state.chat.conversations)
  const activeId = useAppSelector((state) => state.chat.activeId)
  const { send, loading: isSending } = useApiRequest(sendChatMessage)

  const [draft, setDraft] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const activeConversation = useMemo(
    () => conversations.find((c) => c.id === activeId) ?? null,
    [conversations, activeId],
  )

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [activeConversation?.messages.length])

  function handleNewConversation() {
    dispatch(conversationCreated())
    setDraft('')
  }

  function handleDeleteConversation(id: string) {
    dispatch(conversationDeleted(id))
  }

  function handleLogout() {
    dispatch(logout())
    navigate('/login')
  }

  async function handleSend() {
    const text = draft.trim()
    if (!text || !activeConversation || isSending || !user) return

    dispatch(userMessageSent({ conversationId: activeConversation.id, content: text }))
    setDraft('')

    try {
      await send({ conversationId: activeConversation.id, message: text })
    } catch {
      // failure is already turned into an assistant bubble by chat-slice's rejected case
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
        onSelect={(id) => dispatch(conversationSelected(id))}
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

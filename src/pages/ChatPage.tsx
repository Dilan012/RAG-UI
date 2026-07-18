import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sidebar } from '../components/chat/Sidebar'
import { MessageThread } from '../components/chat/MessageThread'
import { Composer } from '../components/chat/Composer'
import { useAppDispatch, useAppSelector, useApiRequest } from '../store/hooks'
import { logout } from '../store/auth/auth-slice'
import {
  conversationSelected,
  createConversation,
  deleteConversation,
  fetchConversations,
  fetchMessages,
  renameConversation,
  sendChatMessage,
  userMessageSent,
} from '../store/chat/chat-slice'

export function ChatPage() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const user = useAppSelector((state) => state.auth.user)
  const conversations = useAppSelector((state) => state.chat.conversations)
  const activeId = useAppSelector((state) => state.chat.activeId)
  const messagesByConversationId = useAppSelector((state) => state.chat.messagesByConversationId)

  const { send: sendMessage, loading: isSending } = useApiRequest(sendChatMessage)
  const { send: loadConversations } = useApiRequest(fetchConversations)
  const { send: loadMessages } = useApiRequest(fetchMessages)
  const { send: addConversation } = useApiRequest(createConversation)
  const { send: editConversation } = useApiRequest(renameConversation)
  const { send: removeConversation } = useApiRequest(deleteConversation)

  const [draft, setDraft] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const activeConversation = useMemo(
    () => conversations.find((c) => c.id === activeId) ?? null,
    [conversations, activeId],
  )
  const messages = activeId ? (messagesByConversationId[activeId] ?? []) : []

  useEffect(() => {
    loadConversations(undefined).catch(() => {
      // error surfaced via the failed request; nothing else to do here
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (activeId) {
      loadMessages(activeId).catch(() => {
        // error is non-fatal; the thread just stays empty
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  async function handleNewConversation() {
    try {
      await addConversation('New chat')
      setDraft('')
    } catch {
      // error already captured by useApiRequest
    }
  }

  function handleRenameConversation(id: string, currentName: string) {
    const name = window.prompt('Rename conversation', currentName)?.trim()
    if (!name || name === currentName) return
    editConversation({ id, name }).catch(() => {
      // error already captured by useApiRequest
    })
  }

  function handleDeleteConversation(id: string) {
    removeConversation(id).catch(() => {
      // error already captured by useApiRequest
    })
  }

  function handleLogout() {
    dispatch(logout())
    navigate('/login')
  }

  async function handleSend() {
    const text = draft.trim()
    if (!text || !activeConversation || isSending) return

    dispatch(userMessageSent({ conversationId: activeConversation.id, content: text }))
    setDraft('')

    try {
      await sendMessage({ conversationId: activeConversation.id, message: text })
    } catch {
      // failure is already turned into an assistant bubble by chat-slice's rejected case
    }
  }

  const sortedConversations = useMemo(
    () => [...conversations].sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt)),
    [conversations],
  )

  return (
    <div className="app">
      <Sidebar
        conversations={sortedConversations}
        activeId={activeId}
        onSelect={(id) => dispatch(conversationSelected(id))}
        onNew={handleNewConversation}
        onRename={handleRenameConversation}
        onDelete={handleDeleteConversation}
        userName={user?.name}
        onLogout={handleLogout}
      />

      <main className="chat-panel">
        {activeConversation ? (
          <>
            <MessageThread
              title={activeConversation.name}
              messages={messages}
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

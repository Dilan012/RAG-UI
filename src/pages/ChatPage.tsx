import { useEffect, useMemo, useRef, useState } from 'react'
import { MessageThread } from '../components/chat/MessageThread'
import { Composer } from '../components/chat/Composer'
import { useAppDispatch, useAppSelector, useApiRequest } from '../store/hooks'
import { fetchMessages, sendChatMessage, userMessageSent } from '../store/chat/chat-slice'

export function ChatPage() {
  const dispatch = useAppDispatch()
  const conversations = useAppSelector((state) => state.chat.conversations)
  const activeId = useAppSelector((state) => state.chat.activeId)
  const messagesByConversationId = useAppSelector((state) => state.chat.messagesByConversationId)

  const { send: sendMessage, loading: isSending } = useApiRequest(sendChatMessage)
  const { send: loadMessages } = useApiRequest(fetchMessages)

  const [draft, setDraft] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const activeConversation = useMemo(
    () => conversations.find((c) => c.id === activeId) ?? null,
    [conversations, activeId],
  )
  const messages = activeId ? (messagesByConversationId[activeId] ?? []) : []

  useEffect(() => {
    if (activeId) {
      loadMessages(activeId).catch(() => {
        // error is non-fatal; the thread just stays empty
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId])

  // Depends on total content length, not just message count, so the view keeps
  // following along as a streamed reply grows in place rather than only jumping
  // once per new message.
  const totalContentLength = messages.reduce((sum, m) => sum + m.content.length, 0)
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length, totalContentLength])

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

  if (!activeConversation) {
    return <div className="empty-state">Select or create a conversation</div>
  }

  return (
    <>
      <MessageThread title={activeConversation.name} messages={messages} endRef={messagesEndRef} />
      <Composer value={draft} onChange={setDraft} onSend={handleSend} isSending={isSending} />
    </>
  )
}

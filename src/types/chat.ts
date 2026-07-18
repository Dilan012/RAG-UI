export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: number
}

export interface MessageSummary {
  id: string
  conversationId: string | null
  role: 'user' | 'assistant'
  content: string
  createdAt: string
}

export interface ChatPayload {
  message: string
  conversationId?: string
}

export interface ChatReply {
  reply: string
}

export interface SendChatMessagePayload {
  conversationId: string
  message: string
}

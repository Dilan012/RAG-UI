export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: number
}

export interface Conversation {
  id: string
  title: string
  messages: ChatMessage[]
  updatedAt: number
}

export interface ChatPayload {
  message: string
}

export interface ChatReply {
  reply: string
}

export interface SendChatMessagePayload {
  conversationId: string
  message: string
}

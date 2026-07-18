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
  customerId: string
  message: string
}

export interface ChatReply {
  reply: string
}

export interface SendChatMessagePayload {
  conversationId: string
  customerId: string
  message: string
}

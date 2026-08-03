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

export interface ChatStreamResult {
  reply: string
  failed: boolean
}

export type ChatMode = 'stream' | 'invoke'

export interface SendChatMessagePayload {
  conversationId: string
  message: string
  mode: ChatMode
}

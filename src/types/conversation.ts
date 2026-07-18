export interface ConversationSummary {
  id: string
  userId: string
  name: string
  createdAt: string
  updatedAt: string
}

export interface CreateConversationPayload {
  name: string
}

export interface UpdateConversationPayload {
  id: string
  name: string
}

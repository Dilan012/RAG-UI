import { apiClient } from './axios-client'
import type { ApiSuccessResponse } from '../types/api'
import type { MessageSummary } from '../types/chat'

export const messageApi = {
  list(conversationId: string) {
    return apiClient
      .get<ApiSuccessResponse<MessageSummary[]>>('/messages', { params: { conversationId } })
      .then((res) => res.data.data)
  },
}

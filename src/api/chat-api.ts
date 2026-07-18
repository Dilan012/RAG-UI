import { apiClient } from './axios-client'
import type { ApiSuccessResponse } from '../types/api'
import type { ChatPayload, ChatReply } from '../types/chat'

export const chatApi = {
  sendMessage(payload: ChatPayload) {
    return apiClient.post<ApiSuccessResponse<ChatReply>>('/chat', payload).then((res) => res.data.data)
  },
}

import { apiClient } from './axios-client'
import type { ApiSuccessResponse } from '../types/api'
import type { ConversationSummary, CreateConversationPayload, UpdateConversationPayload } from '../types/conversation'

export const conversationApi = {
  list() {
    return apiClient.get<ApiSuccessResponse<ConversationSummary[]>>('/conversations').then((res) => res.data.data)
  },
  create(payload: CreateConversationPayload) {
    return apiClient
      .post<ApiSuccessResponse<ConversationSummary>>('/conversations', payload)
      .then((res) => res.data.data)
  },
  update({ id, name }: UpdateConversationPayload) {
    return apiClient
      .put<ApiSuccessResponse<ConversationSummary>>(`/conversations/${id}`, { name })
      .then((res) => res.data.data)
  },
  remove(id: string) {
    return apiClient
      .delete<ApiSuccessResponse<{ id: string }>>(`/conversations/${id}`)
      .then((res) => res.data.data)
  },
}

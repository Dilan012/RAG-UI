import { apiClient } from './axios-client'
import type { ApiSuccessResponse } from '../types/api'
import type { GmailStatus } from '../types/connectors'

export const gmailApi = {
  getStatus() {
    return apiClient
      .get<ApiSuccessResponse<GmailStatus>>('/integrations/gmail/status')
      .then((res) => res.data.data)
  },
  getAuthUrl() {
    return apiClient
      .get<ApiSuccessResponse<{ authUrl: string }>>('/integrations/gmail/connect')
      .then((res) => res.data.data)
  },
  disconnect() {
    return apiClient
      .delete<ApiSuccessResponse<{ disconnected: true }>>('/integrations/gmail')
      .then((res) => res.data.data)
  },
}

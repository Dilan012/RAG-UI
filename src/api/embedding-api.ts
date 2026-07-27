import { apiClient } from './axios-client'
import type { ApiSuccessResponse } from '../types/api'
import type { KnowledgeBaseDocument } from '../types/knowledge-base'

export const embeddingApi = {
  list() {
    return apiClient
      .get<ApiSuccessResponse<KnowledgeBaseDocument[]>>('/embeddings')
      .then((res) => res.data.data)
  },
  ingestFile(file: File) {
    const formData = new FormData()
    formData.append('file', file)

    return apiClient
      .post<ApiSuccessResponse<KnowledgeBaseDocument>>('/embeddings/ingest', formData, {
        // Let axios/the browser set the multipart Content-Type with its boundary —
        // the client's default 'application/json' header would otherwise override it.
        headers: { 'Content-Type': undefined },
      })
      .then((res) => res.data.data)
  },
  ingestText(text: string) {
    return apiClient
      .post<ApiSuccessResponse<KnowledgeBaseDocument>>('/embeddings/ingest', { text })
      .then((res) => res.data.data)
  },
}
